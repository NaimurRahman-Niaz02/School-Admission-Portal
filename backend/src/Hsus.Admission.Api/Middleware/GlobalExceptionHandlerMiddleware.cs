using System.Text.Json;
using Hsus.Admission.Api.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Hsus.Admission.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning("Domain exception ({StatusCode} {Title}): {Message}",
                ex.StatusCode, ex.Title, ex.Message);

            await WriteProblemDetailsAsync(
                context,
                ex.StatusCode,
                ex.Title,
                ex.Message);
        }
        catch (BadHttpRequestException ex)
        {
            _logger.LogWarning("Malformed HTTP request: {Message}", ex.Message);

            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "Invalid request payload or parameters.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled server exception occurred while processing {Method} {Path}.",
                context.Request.Method, context.Request.Path);

            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                $"An unexpected error occurred: {ex.Message} -> {ex.InnerException?.Message}");
        }
    }

    private static async Task WriteProblemDetailsAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        // Include 'message' extension for seamless compatibility with existing frontend error handler
        problem.Extensions["message"] = detail;

        var json = JsonSerializer.Serialize(problem, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}

