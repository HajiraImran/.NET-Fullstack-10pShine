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

        // =========================
        // GET ALL TASKS
        // =========================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var query = _context.Tasks.AsQueryable();

            // USER → only own tasks
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid token" });

                query = query.Where(t => t.UserId == userId);
            }

            return Ok(await query.ToListAsync());
        }

        // =========================
        // DASHBOARD STATS
        // =========================
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var query = _context.Tasks.AsQueryable();

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

        // =========================
        // GET SINGLE TASK
        // =========================
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            return Ok(task);
        }

        // =========================
        // CREATE TASK (ADMIN ONLY)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<TaskItem>> PostTask(TaskItem task)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == task.UserId);

            if (user == null)
                return BadRequest(new { message = "Invalid UserId" });

            task.AssignedTo = user.Username;

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Task assigned to {User}", user.Username);

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // =========================
        // UPDATE TASK
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, TaskItem updatedTask)
        {
            var existingTask = await _context.Tasks.FindAsync(id);

            if (existingTask == null)
                return NotFound(new { message = "Task not found" });

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // USER can only update own task
            if (role != "Admin")
            {
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized();

                if (existingTask.UserId != userId)
                    return Forbid();
            }

            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Status = updatedTask.Status;
            existingTask.Priority = updatedTask.Priority;
            existingTask.Category = updatedTask.Category;
            existingTask.DueDate = updatedTask.DueDate;

            // ADMIN can reassign
            if (role == "Admin")
            {
                existingTask.UserId = updatedTask.UserId;
                existingTask.AssignedTo = updatedTask.AssignedTo;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Task updated successfully" });
        }

        // =========================
        // DELETE TASK (ADMIN ONLY)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "Task not found" });

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task deleted successfully" });
        }
    }
}