using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using System.Security.Claims;
using DotNetEnv;

DotNetEnv.Env.Load();

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/tasklog-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate:
        "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting TaskPro Web API...");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    // =========================
    // DATABASE
    // =========================
    string connectionString =
        Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") ?? "";

    builder.Services.AddDbContext<ApiDbContext>(options =>
        options.UseSqlServer(connectionString));

    // =========================
    // JWT AUTH
    // =========================
    var secretKey =
        Environment.GetEnvironmentVariable("JWT_KEY")
        ?? "A_Very_Long_And_Secure_Secret_Key_123456";

    var key = Encoding.ASCII.GetBytes(secretKey);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),

            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,

            // 🔥 FINAL FIX (IMPORTANT)
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

    // =========================
    // CORS
    // =========================
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp",
            policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
    });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // =========================
    // GLOBAL ERROR HANDLER
    // =========================
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var errorFeature = context.Features.Get<IExceptionHandlerPathFeature>();

            if (errorFeature != null)
            {
                Log.Error(errorFeature.Error, "Unhandled Exception");
            }

            await context.Response.WriteAsJsonAsync(new
            {
                message = "Internal Server Error",
                detailed = app.Environment.IsDevelopment()
                    ? errorFeature?.Error.Message
                    : null
            });
        });
    });

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("AllowReactApp");
    app.UseSerilogRequestLogging();
    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // =========================
    // ADMIN SEED
    // =========================
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApiDbContext>();

        string adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@taskpro.com";
        string adminPass = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Admin@123";

        var existingAdmin = context.Users.FirstOrDefault(u => u.Email == adminEmail);

        if (existingAdmin == null)
        {
            context.Users.Add(new User
            {
                Username = "AdminMiral",
                Email = adminEmail,
                Password = BCrypt.Net.BCrypt.HashPassword(adminPass),
                Role = "Admin"
            });

            context.SaveChanges();

            Log.Information("Admin created successfully");
        }
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}