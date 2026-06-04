using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Controllers; 
using Backend.Data;        
using Backend.Models;      
using Backend.Hubs; // 👈 Make sure TaskHub namespace is added here
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR; // 👈 Required for IHubContext mapping
using Moq;
using Serilog; 
using Xunit;
using Xunit.Abstractions; 

namespace Backend.Tests
{
    public class TasksControllerTests : IDisposable
    {
        private readonly ITestOutputHelper _output; 
        private readonly Mock<IHubContext<TaskHub>> _mockHubContext; // 👈 Mock definition added

        public TasksControllerTests(ITestOutputHelper output)
        {
            _output = output;

            // 🎯 SignalR Architecture Mock Infrastructure Pipeline Setup
            _mockHubContext = new Mock<IHubContext<TaskHub>>();
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();

            // Setup continuous routing so SignalR client trigger invocations do not throw null references
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

            // 🎯 Absolute Root Path Setup: Direct 'Backend.Tests' project directory ko dhoondna
            string baseDir = AppContext.BaseDirectory;
            string targetDir = baseDir;

            // Jab tak hume "Backend.Tests" directory ya main root na mile, piche navigate karein
            while (!targetDir.EndsWith("Backend.Tests") && Directory.GetParent(targetDir) != null)
            {
                targetDir = Directory.GetParent(targetDir)!.FullName;
            }

            // Agar out-of-bounds execution ho toh safe fallback warna exact target workspace folder
            string logDirectory = targetDir.EndsWith("Backend.Tests") ? targetDir : baseDir;
            string logFilePath = Path.Combine(logDirectory, "test_execution.log");

            // 📝 Global Serilog Logger with Instant Force Flush Configuration
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.File(
                    path: logFilePath,
                    rollingInterval: RollingInterval.Infinite,
                    buffered: false, // 👈 Cache memory bypassed: Instant logging feature active
                    flushToDiskInterval: TimeSpan.Zero, // 👈 Instantly physical file par text dump karega
                    outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                .CreateLogger();
        }

        // 📝 Custom Helper: Console UI aur physical file dono ko sync mein log feed bhejta hai
        private void WriteLog(string message)
        {
            _output.WriteLine(message); 
            Log.Information(message);   
        }

        private ApiDbContext GetDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApiDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            return new ApiDbContext(options);
        }

        private ILogger<TasksController> GetLogger()
        {
            var loggerFactory = new LoggerFactory().AddSerilog();
            return loggerFactory.CreateLogger<TasksController>();
        }

        private void SetupControllerUser(TasksController controller, string userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        // ==========================================================
        // TEST 1: REGULAR USER GET TASKS
        // ==========================================================
        [Fact]
        public async Task GetTasks_RegularUser_ReturnsOnlyOwnTasks()
        {
            WriteLog("[INFO] ---- STARTING TEST 1: GetTasks_RegularUser_ReturnsOnlyOwnTasks ----");
            var dbName = Guid.NewGuid().ToString(); 
            
            using (var context = GetDbContext(dbName))
            {
                context.Tasks.AddRange(new List<TaskItem>
                {
                    new TaskItem { Id = 1, Title = "User 1 Task", UserId = 1, Status = "Pending", Priority = "Medium", Category = "General", AssignedTo = "User1", IsDeleted = false },
                    new TaskItem { Id = 2, Title = "User 2 Task", UserId = 2, Status = "Pending", Priority = "High", Category = "General", AssignedTo = "User2", IsDeleted = false }
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded 2 tasks (User 1 and User 2) into temporary DB.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "1", "User"); 

                WriteLog("[INFO] Requesting tasks as a Regular User (ID: 1)...");
                var result = await controller.GetTasks();

                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var tasks = Assert.IsAssignableFrom<IEnumerable<TaskItem>>(okResult.Value);
                
                Assert.Single(tasks); 
                WriteLog("[SUCCESS] Regular user successfully isolated. Received only 1 own task.");
            }
            WriteLog("[INFO] ---- TEST 1 COMPLETED SUCCESSFULLY ----\n");
        }

        // ==========================================================
        // TEST 2: ADMIN USER GET ALL TASKS
        // ==========================================================
        [Fact]
        public async Task GetTasks_AdminUser_ReturnsAllTasks()
        {
            WriteLog("[INFO] ---- STARTING TEST 2: GetTasks_AdminUser_ReturnsAllTasks ----");
            var dbName = Guid.NewGuid().ToString();

            using (var context = GetDbContext(dbName))
            {
                context.Tasks.AddRange(new List<TaskItem>
                {
                    new TaskItem { Id = 3, Title = "User 1 Assignment", UserId = 1, Status = "Pending", Priority = "Low", Category = "General", AssignedTo = "User1", IsDeleted = false },
                    new TaskItem { Id = 4, Title = "User 2 Assignment", UserId = 2, Status = "Completed", Priority = "High", Category = "General", AssignedTo = "User2", IsDeleted = false }
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded 2 cross-user tasks into temporary DB.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "999", "Admin"); 

                WriteLog("[INFO] Requesting tasks as an Admin User...");
                var result = await controller.GetTasks();

                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var tasks = Assert.IsAssignableFrom<IEnumerable<TaskItem>>(okResult.Value);
                
                var taskList = Assert.IsType<List<TaskItem>>(tasks);
                Assert.Equal(2, taskList.Count);
                
                WriteLog("[SUCCESS] Role authorization passed: Admin successfully retrieved all system tasks.");
            }
            WriteLog("[INFO] ---- TEST 2 COMPLETED SUCCESSFULLY ----\n");
        }

        // ==========================================================
        // TEST 3: DASHBOARD STATS FOR REGULAR USER
        // ==========================================================
        [Fact]
        public async Task GetDashboardStats_RegularUser_ReturnsOnlyOwnStats()
        {
            WriteLog("[INFO] ---- STARTING TEST 3: GetDashboardStats_RegularUser_ReturnsOnlyOwnStats ----");
            var dbName = Guid.NewGuid().ToString();

            using (var context = GetDbContext(dbName))
            {
                context.Tasks.AddRange(new List<TaskItem>
                {
                    new TaskItem { Id = 5, Title = "User 1 Task A", UserId = 1, Status = "Pending", Priority = "Low", Category = "General", AssignedTo = "User1", IsDeleted = false },
                    new TaskItem { Id = 6, Title = "User 1 Task B", UserId = 1, Status = "Completed", Priority = "High", Category = "General", AssignedTo = "User1", IsDeleted = false },
                    new TaskItem { Id = 7, Title = "User 2 Task C", UserId = 2, Status = "Pending", Priority = "High", Category = "General", AssignedTo = "User2", IsDeleted = false }
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded 3 tasks (2 for User 1, 1 for User 2) with mixed statuses.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "1", "User");

                WriteLog("[INFO] Requesting dashboard statistics for User ID '1'...");
                var result = await controller.GetDashboardStats();

                var okResult = Assert.IsType<OkObjectResult>(result);
                var statsObject = okResult.Value;
                
                Assert.NotNull(statsObject);
                WriteLog("[INFO] Verifying dashboard metric calculations via reflection...");
                
                var pending = statsObject.GetType().GetProperty("Pending")?.GetValue(statsObject, null);
                var completed = statsObject.GetType().GetProperty("Completed")?.GetValue(statsObject, null);
                var inProgress = statsObject.GetType().GetProperty("InProgress")?.GetValue(statsObject, null);
                var total = statsObject.GetType().GetProperty("Total")?.GetValue(statsObject, null);

                Assert.Equal(1, pending);
                Assert.Equal(1, completed);
                Assert.Equal(0, inProgress);
                Assert.Equal(2, total);

                WriteLog("[SUCCESS] Dashboard boundary verified: Metrics correctly isolated for regular user scope.");
            }
            WriteLog("[INFO] ---- TEST 3 COMPLETED SUCCESSFULLY ----\n");
        }

        // ==========================================================
        // TEST 4: SOFT DELETE FILTER VERIFICATION
        // ==========================================================
        [Fact]
        public async Task GetTasks_ActiveAndDeletedTasks_ExcludesSoftDeletedRecords()
        {
            WriteLog("[INFO] ---- STARTING TEST 4: GetTasks_ActiveAndDeletedTasks_ExcludesSoftDeletedRecords ----");
            var dbName = Guid.NewGuid().ToString();

            using (var context = GetDbContext(dbName))
            {
                context.Tasks.AddRange(new List<TaskItem>
                {
                    new TaskItem { Id = 10, Title = "Active Task", UserId = 1, IsDeleted = false, Status = "Pending", Priority = "Medium", Category = "General", AssignedTo = "User1" },
                    new TaskItem { Id = 11, Title = "Soft Deleted Task", UserId = 1, IsDeleted = true, Status = "Pending", Priority = "Low", Category = "General", AssignedTo = "User1" }
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded 2 tasks (1 Active, 1 Soft-Deleted) into temporary DB.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "1", "User");

                WriteLog("[INFO] Requesting active tasks for User ID '1'...");
                var result = await controller.GetTasks();

                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var tasks = Assert.IsAssignableFrom<IEnumerable<TaskItem>>(okResult.Value).ToList();

                Assert.Single(tasks);
                Assert.Equal(10, tasks[0].Id); 
                
                WriteLog("[SUCCESS] Data Access Filter passed: System successfully filtered out soft-deleted records.");
            }
            WriteLog("[INFO] ---- TEST 4 COMPLETED SUCCESSFULLY ----\n");
        }

        // ==========================================================
        // TEST 5: SECURITY POLICY VIOLATION ON PUT
        // ==========================================================
        [Fact]
        public async Task PutTask_UserModifiesAdminAssignedTask_ReturnsBadRequest()
        {
            WriteLog("[INFO] ---- STARTING TEST 5: PutTask_UserModifiesAdminAssignedTask_ReturnsBadRequest ----");
            var dbName = Guid.NewGuid().ToString();

            using (var context = GetDbContext(dbName))
            {
                context.Tasks.Add(new TaskItem 
                { 
                    Id = 20, 
                    Title = "Core Infrastructure Config", 
                    UserId = 1, 
                    CreatedBy = "Admin", 
                    IsDeleted = false,
                    Status = "InProgress",
                    Priority = "High",
                    Category = "Technical",
                    AssignedTo = "User1"
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded an Admin-originated protected task allocated to User 1.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "1", "User"); 

                var updatedTaskData = new TaskItem 
                { 
                    Id = 20,
                    Title = "Malicious Title Change Attempt", 
                    Status = "Completed" 
                };

                WriteLog("[INFO] Attempting illegal PUT request on Admin-protected task context...");
                var result = await controller.PutTask(20, updatedTaskData);

                Assert.IsType<BadRequestObjectResult>(result);
                WriteLog("[SUCCESS] Security Boundary verified: User modification on Admin task explicitly blocked.");
            }
            WriteLog("[INFO] ---- TEST 5 COMPLETED SUCCESSFULLY ----\n");
        }

        // ==========================================================
        // TEST 6: AUTOMATIC NAME RESOLUTION ON POST
        // ==========================================================
        [Fact]
        public async Task PostTask_AdminCreatesTask_AutomaticallyResolvesAssignedToUsername()
        {
            WriteLog("[INFO] ---- STARTING TEST 6: PostTask_AdminCreatesTask_AutomaticallyResolvesAssignedToUsername ----");
            var dbName = Guid.NewGuid().ToString();

            using (var context = GetDbContext(dbName))
            {
                context.Users.Add(new User 
                { 
                    Id = 5, 
                    Username = "MiralDeveloper", 
                    Email = "miral@taskpro.com", 
                    Password = "HashedPassword", 
                    Role = "User" 
                });
                await context.SaveChangesAsync();
                WriteLog("[INFO] Seeded target recipient user 'MiralDeveloper' (ID: 5) into DB schema.");
            }

            using (var context = GetDbContext(dbName))
            {
                // 🛠️ FIXED: Added _mockHubContext.Object parameter
                var controller = new TasksController(context, GetLogger(), _mockHubContext.Object);
                SetupControllerUser(controller, "999", "Admin"); 

                var payload = new TaskItem
                {
                    Title = "Deploy Production Hotfix",
                    UserId = 5, 
                    Priority = "Critical"
                };

                WriteLog("[INFO] Admin executing PostTask creation mapping for Target User ID 5... ");
                var result = await controller.PostTask(payload);

                var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
                var createdTask = Assert.IsType<TaskItem>(createdResult.Value);

                Assert.Equal("MiralDeveloper", createdTask.AssignedTo); 
                Assert.Equal("Admin", createdTask.CreatedBy);

                WriteLog($"[SUCCESS] Data Layer Integration passed: AssignedTo automatically resolved to '{createdTask.AssignedTo}'.");
            }
            WriteLog("[INFO] ---- TEST 6 COMPLETED SUCCESSFULLY ----\n");
        }

        // 🧹 Test lifecycle closure: Thread resource aur diagnostic file lock ko close karna
        public void Dispose()
        {
            Log.CloseAndFlush();
        }
    }
}