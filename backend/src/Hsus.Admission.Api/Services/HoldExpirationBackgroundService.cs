using Hsus.Admission.Api.Configuration;
using Microsoft.Extensions.Options;

namespace Hsus.Admission.Api.Services;

public class HoldExpirationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<AdmissionOptions> _optionsMonitor;
    private readonly ILogger<HoldExpirationBackgroundService> _logger;

    public HoldExpirationBackgroundService(
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<AdmissionOptions> optionsMonitor,
        ILogger<HoldExpirationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _optionsMonitor = optionsMonitor;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HoldExpirationBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            int intervalSeconds = Math.Max(1, _optionsMonitor.CurrentValue.ExpirationCheckIntervalSeconds);

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(intervalSeconds), stoppingToken);

                using var scope = _scopeFactory.CreateScope();
                var admissionService = scope.ServiceProvider.GetRequiredService<IAdmissionService>();
                await admissionService.ExpireOverdueHoldsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while scanning for expired seat holds.");
            }
        }

        _logger.LogInformation("HoldExpirationBackgroundService stopped.");
    }
}

