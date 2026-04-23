using System;

namespace Backend.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // Requirements: Priority aur Status
        public string Priority { get; set; } = "Low"; // Low, Medium, High
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
        
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Requirement: Task assigned to a user
        public string? AssignedTo { get; set; } 
    }
}