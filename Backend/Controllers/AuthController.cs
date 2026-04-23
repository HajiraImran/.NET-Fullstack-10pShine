using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public AuthController(ApiDbContext context)
        {
            _context = context;
        }

        // 1. REGISTER (Signup)
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Check agar email pehle se hai
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email pehle se maujood hai!");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Account ban gaya hai! Ab aap login kar sakte hain." });
        }

        // 2. LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Email == loginDto.Email && u.Password == loginDto.Password);

            if (user == null)
                return Unauthorized("Ghalat Email ya Password!");

            return Ok(new { 
                id = user.Id, 
                username = user.Username, 
                role = user.Role, 
                message = "Login Successful!" 
            });
        }
    }
}