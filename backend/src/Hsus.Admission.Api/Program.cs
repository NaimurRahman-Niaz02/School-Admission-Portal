using Hsus.Admission.Api.Configuration;
using Hsus.Admission.Api.Data;
using Hsus.Admission.Api.Middleware;
using Hsus.Admission.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure AdmissionOptions from configuration and environment variables (HOLD_DURATION_SECONDS, SEED_DEMO_DATA)
builder.Services.Configure<AdmissionOptions>(options =>
{
    builder.Configuration.GetSection(AdmissionOptions.SectionName).Bind(options);

    var holdDurationEnv = builder.Configuration["HOLD_DURATION_SECONDS"];
    if (!string.IsNullOrWhiteSpace(holdDurationEnv) && int.TryParse(holdDurationEnv, out int parsedHoldDuration) && parsedHoldDuration > 0)
    {
        options.HoldDurationSeconds = parsedHoldDuration;
    }

    var expIntervalEnv = builder.Configuration["EXPIRATION_CHECK_INTERVAL_SECONDS"];
    if (!string.IsNullOrWhiteSpace(expIntervalEnv) && int.TryParse(expIntervalEnv, out int parsedInterval) && parsedInterval > 0)
    {
        options.ExpirationCheckIntervalSeconds = parsedInterval;
    }

    var seedEnv = builder.Configuration["SEED_DEMO_DATA"];
    if (!string.IsNullOrWhiteSpace(seedEnv) && bool.TryParse(seedEnv, out bool parsedSeed))
    {
        options.SeedDemoData = parsedSeed;
    }
});

// 2. Resolve PostgreSQL Connection String from Environment Variables or Configuration
string connectionString = ResolveConnectionString(builder.Configuration);

builder.Services.AddDbContext<AdmissionDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// 3. Register Application Services & Background Expiration Worker
builder.Services.AddScoped<IAdmissionService, AdmissionService>();
builder.Services.AddHostedService<HoldExpirationBackgroundService>();

// 4. Configure Controllers & Consistent ProblemDetails Model Validation Responses
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .Where(m => !string.IsNullOrWhiteSpace(m))
                .ToList();

            var detail = errors.Count > 0
                ? string.Join(" ", errors)
                : "One or more validation errors occurred.";

            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Bad Request",
                Detail = detail,
                Instance = context.HttpContext.Request.Path
            };
            problem.Extensions["message"] = detail;

            return new BadRequestObjectResult(problem)
            {
                ContentTypes = { "application/problem+json" }
            };
        };
    });

// 5. Configure CORS for Frontend Development and Docker Origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Student-Id");
    });
});

// 6. Configure Swagger / OpenAPI (Available at /swagger in both Development and Docker environments)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hashmat Uddin High School (HSUS) Online Admission API",
        Version = "v1",
        Description = "RESTful API for first-come, first-served school seat reservation, confirmation, and class management."
    });
});

var app = builder.Build();

// 7. Apply EF Core Migrations and Idempotent Seed Data on Startup
await DatabaseInitializer.InitializeAsync(app.Services);

// 8. Middleware Pipeline
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseCors("FrontendCorsPolicy");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HSUS Online Admission API v1");
    c.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();

static string ResolveConnectionString(IConfiguration configuration)
{
    var explicitConn = configuration.GetConnectionString("DefaultConnection")
                       ?? configuration["DATABASE_CONNECTION_STRING"];

    var pgHost = configuration["POSTGRES_HOST"] ?? configuration["DB_HOST"];
    var pgPort = configuration["POSTGRES_PORT"] ?? configuration["DB_PORT"] ?? "5432";
    var pgDb = configuration["POSTGRES_DB"] ?? configuration["DB_NAME"];
    var pgUser = configuration["POSTGRES_USER"] ?? configuration["DB_USER"];
    var pgPass = configuration["POSTGRES_PASSWORD"] ?? configuration["DB_PASSWORD"];

    if (!string.IsNullOrWhiteSpace(pgHost) &&
        !string.IsNullOrWhiteSpace(pgDb) &&
        !string.IsNullOrWhiteSpace(pgUser))
    {
        return $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass};Include Error Detail=true";
    }

    if (!string.IsNullOrWhiteSpace(explicitConn))
    {
        return explicitConn;
    }

    return "Host=localhost;Port=5432;Database=hsus_admission;Username=hsus_user;Password=hsus_password;Include Error Detail=true";
}

public partial class Program { }

