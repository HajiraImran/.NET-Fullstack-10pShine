using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(ApiDbContext context, ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =========================================
        // GET ALL TASKS (SOFT-DELETE FILTERED)
        // =========================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔍 FILTER: Only fetch active tasks (Exclude Soft-Deleted Tasks)
            var query = _context.Tasks.Where(t => !t.IsDeleted).AsQueryable();

            // USER → only own tasks
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid token" });

                query = query.Where(t => t.UserId == userId);
            }

            return Ok(await query.ToListAsync());
        }

        // =========================================
        // DASHBOARD STATS (SOFT-DELETE FILTERED)
        // =========================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔍 FILTER: Exclude soft-deleted tasks from statistics
            var query = _context.Tasks.Where(t => !t.IsDeleted).AsQueryable();

            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                query = query.Where(t => t.UserId == userId);
            }

            return Ok(new
            {
                Pending = await query.CountAsync(t => t.Status == "Pending"),
                InProgress = await query.CountAsync(t => t.Status == "InProgress"),
                Completed = await query.CountAsync(t => t.Status == "Completed"),
                Total = await query.CountAsync()
            });
        }

        // =========================================
        // GET SINGLE TASK
        // =========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            // 🔍 Check active tasks only
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            return Ok(task);
        }

        // =========================================
        // CREATE TASK (ADMIN OR REGULAR USER)
        // =========================================
        [HttpPost]
        public async Task<ActionResult<TaskItem>> PostTask(TaskItem task)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int loggedInUserId))
                return Unauthorized(new { message = "Invalid token" });

            // 1. SECURITY CHECK: Regular User settings forced
            if (role != "Admin")
            {
                task.UserId = loggedInUserId; 
                task.Category = "General";    
            }

            // 2. USER VALIDATION: Check assigned user existence
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == task.UserId);

            if (user == null)
                return BadRequest(new { message = "Invalid UserId" });

            task.AssignedTo = user.Username;
            task.IsDeleted = false; // Default explicitly set to active
            
            // ✨ SAVE ORIGIN: Trace who actually initiated this task creation
            task.CreatedBy = role == "Admin" ? "Admin" : "User";

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Task created and assigned to {User} by {Role}. Origin: {Origin}", user.Username, role, task.CreatedBy);

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // =========================================
        // UPDATE TASK (OWNER & ORIGIN RESTRICTED)
        // =========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, TaskItem updatedTask)
        {
            var existingTask = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

            if (existingTask == null)
                return NotFound(new { message = "Task not found" });

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // USER security boundary verification
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                // Check 1: User can only update their own assigned tasks
                if (existingTask.UserId != userId)
                    return Forbid();

                // Check 2: 🛑 CRITICAL REQ! If the task was assigned by Admin, the User cannot edit it.
                if (existingTask.CreatedBy == "Admin")
                {
                    return BadRequest(new { message = "Action Denied: You cannot modify tasks assigned to you by the Admin." });
                }
            }

            // Common mutable fields
            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Status = updatedTask.Status;
            existingTask.Priority = updatedTask.Priority;
            existingTask.DueDate = updatedTask.DueDate;

            // =========================================
            // ROLE BASED PRIVILEGES FOR ADMIN
            // =========================================
            if (role == "Admin")
            {
                // Admin can modify category freely
                existingTask.Category = updatedTask.Category;

                // Admin reassignment flow safe check
                if (updatedTask.UserId > 0 && updatedTask.UserId != existingTask.UserId)
                {
                    var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == updatedTask.UserId);
                    if (targetUser != null)
                    {
                        existingTask.UserId = targetUser.Id;
                        existingTask.AssignedTo = targetUser.Username;
                    }
                    else
                    {
                        return BadRequest(new { message = "Assigned User not found in database" });
                    }
                }
                else if (!string.IsNullOrEmpty(updatedTask.AssignedTo))
                {
                    existingTask.AssignedTo = updatedTask.AssignedTo;
                }
            }
            else
            {
                _logger.LogWarning("User {UserId} attempted to alter task configuration parameters.", userIdClaim);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Task updated successfully" });
        }

        // ==========================================================
        // DELETE TASK (SOFT DELETE - OWNER & ORIGIN RESTRICTED)
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null || task.IsDeleted)
                return NotFound(new { message = "Task not found" });

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // USER security boundary verification
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                // Check 1: User can only delete their own assigned tasks
                if (task.UserId != userId)
                    return Forbid();

                // Check 2: 🛑 CRITICAL REQ! If the task was assigned by Admin, the User cannot delete it.
                if (task.CreatedBy == "Admin")
                {
                    return BadRequest(new { message = "Action Denied: You cannot delete tasks assigned to you by the Admin." });
                }
            }

            // ✨ SOFT DELETE CORE LOGIC: Row is retained, visibility flag toggled to true
            task.IsDeleted = true; 

            _context.Entry(task).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Task ID {TaskId} successfully soft-deleted by {Role}.", id, role);

            return Ok(new { message = "Task deleted successfully" });
        }
    }
}