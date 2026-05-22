using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options)
            : base(options)
        {
        }

        // =========================
        // TABLES
        // =========================
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<User> Users { get; set; }

        // =========================
        // MODEL CONFIGURATION
        // =========================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================
            // TASK -> USER RELATIONSHIP
            // =========================
            modelBuilder.Entity<TaskItem>()
                .HasOne<User>()              // each task belongs to one user
                .WithMany()                  // user can have many tasks
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // =========================
            // USER EMAIL UNIQUE
            // =========================
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // =========================
            // TASK VALIDATION
            // =========================
            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Description)
                .HasMaxLength(1000);

            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Status)
                .HasMaxLength(50);

            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Priority)
                .HasMaxLength(50);
        }
    }
}