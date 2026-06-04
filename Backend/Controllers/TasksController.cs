using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR; // 🔥 ADDED FOR SIGNALR
using Backend.Hubs;              // 🔥 ADDED FOR TASKHUB

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly ILogger<TasksController> _logger;
        private readonly IHubContext<TaskHub> _hubContext; // 🔥 Added SignalR Hub Context

        // Updated Constructor to Inject SignalR Hub
        public TasksController(ApiDbContext context, ILogger<TasksController> logger, IHubContext<TaskHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext; // Assigning Hub Context
        }

        // =========================================
        // GET ALL TASKS (SOFT-DELETE FILTERED)
        // =========================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            _logger.LogInformation("FETCH_ATTEMPT: User {UserId} with Role {Role} requested tasks list.", userIdClaim, role);

            var query = _context.Tasks.Where(t => !t.IsDeleted).AsQueryable();

            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("FETCH_FAILED: Unauthorized token mapping attempt for user.");
                    return Unauthorized(new { message = "Invalid token" });
                }

                query = query.Where(t => t.UserId == userId);
            }

            var tasks = await query.ToListAsync();
            _logger.LogInformation("FETCH_SUCCESS: Successfully returned {Count} tasks to User {UserId}", tasks.Count, userIdClaim);
            
            return Ok(tasks);
        }

        // =========================================
        // DASHBOARD STATS (SOFT-DELETE FILTERED)
        // =========================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

            if (task == null)
            {
                _logger.LogWarning("VIEW_FAILED: Task ID {TaskId} not found or inactive. Requested by User {UserId}", id, userIdClaim);
                return NotFound(new { message = "Task not found" });
            }

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

            if (role != "Admin")
            {
                task.UserId = loggedInUserId; 
                task.Category = "General";    
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == task.UserId);

            if (user == null)
            {
                _logger.LogWarning("CREATION_FAILED: Invalid target UserId {TargetId} provided by User {UserId}", task.UserId, userIdClaim);
                return BadRequest(new { message = "Invalid UserId" });
            }

            task.AssignedTo = user.Username;
            task.IsDeleted = false; 
            task.CreatedBy = role == "Admin" ? "Admin" : "User";

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("USER_ACTIVITY: Task ID {TaskId} ('{Title}') successfully created by User {UserId} ({Role}). Assigned to {Assignee}", 
                task.Id, task.Title, userIdClaim, role, task.AssignedTo);

            // 🔥 SIGNALR REAL-TIME BROADCAST FOR CREATION
            // Baki tamam open tabs ko inform karein ke naya task create ho gaya hai
            await _hubContext.Clients.All.SendAsync("ReceiveTaskCreated", task);

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // ===================================================
        // UPDATE TASK (FIXED: PERMIT STATUS SHIFT FOR USERS)
        // ===================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, TaskItem updatedTask)
        {
            var existingTask = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (existingTask == null)
            {
                _logger.LogWarning("UPDATE_FAILED: Attempted update on missing/deleted Task ID {TaskId} by User {UserId}", id, userIdClaim);
                return NotFound(new { message = "Task not found" });
            }

            // USER security boundary verification
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                if (existingTask.UserId != userId)
                {
                    _logger.LogWarning("SECURITY_ALERT: Unauthorized modification attempt! User {UserId} tried to access Task ID {TaskId} owned by User {OwnerId}", 
                        userId, id, existingTask.UserId);
                    return Forbid();
                }

                // ===================================================
                // 🛠️ SMART POLICY OVERRIDE FOR DRAG & DROP SHIFT
                // ===================================================
                if (existingTask.CreatedBy == "Admin")
                {
                    // Agar user sirf STATUS badal raha hai (Kanban Board Action)
                    if (existingTask.Title != updatedTask.Title || 
                        existingTask.Description != updatedTask.Description ||
                        existingTask.Priority != updatedTask.Priority ||
                        existingTask.DueDate != updatedTask.DueDate)
                    {
                        _logger.LogWarning("POLICY_VIOLATION: User {UserId} tried to modify Admin protected text attributes on Task ID {TaskId}.", userId, id);
                        return BadRequest(new { message = "Action Denied: You can only update the status of Admin-assigned tasks." });
                    }
                }
            }

            // Data Mapping
            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Status = updatedTask.Status; // Yeh hamesha chalega!
            existingTask.Priority = updatedTask.Priority;
            existingTask.DueDate = updatedTask.DueDate;

            if (role == "Admin")
            {
                existingTask.Category = updatedTask.Category;

                if (updatedTask.UserId > 0 && updatedTask.UserId != existingTask.UserId)
                {
                    var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == updatedTask.UserId);
                    if (targetUser != null)
                    {
                        _logger.LogInformation("TASK_REASSIGNED: Admin {AdminId} reassigned Task ID {TaskId} from {OldUser} to {NewUser}", 
                            userIdClaim, id, existingTask.AssignedTo, targetUser.Username);
                        
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

            await _context.SaveChangesAsync();
            _logger.LogInformation("TASK_UPDATED: Task ID {TaskId} successfully saved by User {UserId} ({Role})", id, userIdClaim, role);

            // 🔥 SIGNALR REAL-TIME BROADCAST FOR STATUS / CONTENT CHANGE
            // Jaise hi save ho, pure environment ko update bhej dein (Dono IDs aur statuses sync rakhega)
            await _hubContext.Clients.All.SendAsync("ReceiveStatusUpdate", id.ToString(), existingTask.Status, existingTask);

            return Ok(new { message = "Task updated successfully" });
        }

        // ==========================================================
        // DELETE TASK (SOFT DELETE - OWNER & ORIGIN RESTRICTED)
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (task == null || task.IsDeleted)
            {
                _logger.LogWarning("DELETE_FAILED: Attempted delete on missing/deleted Task ID {TaskId} by User {UserId}", id, userIdClaim);
                return NotFound(new { message = "Task not found" });
            }

            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                if (task.UserId != userId)
                {
                    _logger.LogWarning("SECURITY_ALERT: Unauthorized delete attempt! User {UserId} tried to delete Task ID {TaskId} owned by User {OwnerId}", 
                        userId, id, task.UserId);
                    return Forbid();
                }

                if (task.CreatedBy == "Admin")
                {
                    _logger.LogWarning("POLICY_VIOLATION: User {UserId} tried to delete Admin-assigned Task ID {TaskId}. Request Blocked.", userId, id);
                    return BadRequest(new { message = "Action Denied: You cannot delete tasks assigned to you by the Admin." });
                }
            }

            task.IsDeleted = true; 
            _context.Entry(task).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            _logger.LogWarning("TASK_DELETED: Task ID {TaskId} has been soft-deleted by User {UserId} ({Role}).", id, userIdClaim, role);

            // 🔥 SIGNALR REAL-TIME BROADCAST FOR DELETION
            // Baki screen se live delete karne ke liye update bhejein
            await _hubContext.Clients.All.SendAsync("ReceiveTaskDeleted", id.ToString());

            return Ok(new { message = "Task deleted successfully" });
        }
    }
}