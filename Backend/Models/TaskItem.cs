namespace Backend.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed

        public string Priority { get; set; } = "Medium"; // Low, Medium, High

        public string Category { get; set; } = "General";

        public DateTime DueDate { get; set; } = DateTime.Now.AddDays(1);

        // ✅ IMPORTANT: THIS MUST EXIST
        public int UserId { get; set; }

        public string AssignedTo { get; set; } = string.Empty;
    }
}