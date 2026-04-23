using Microsoft.EntityFrameworkCore;
using Backend.Models; // Ye line honi chahiye

namespace Backend.Data
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        public DbSet<TaskItem> Tasks { get; set; }
        
        // YE LINE ADD KAREN (Isi ki wajah se 3 errors aa rahe hain)
        public DbSet<User> Users { get; set; } 
    }
}