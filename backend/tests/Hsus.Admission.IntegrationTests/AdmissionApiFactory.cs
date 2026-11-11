using Hsus.Admission.Api.Configuration;
using Hsus.Admission.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Hsus.Admission.IntegrationTests;

public class AdmissionApiFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;
    private readonly int _holdDurationSeconds;
    private readonly bool _seedDemoData;

    public AdmissionApiFactory(
        string connectionString,
        int holdDurationSeconds = 600,
        bool seedDemoData = false)
    {
        _connectionString = connectionString;
        _holdDurationSeconds = holdDurationSeconds;
        _seedDemoData = seedDemoData;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AdmissionDbContext>>();
            services.AddDbContext<AdmissionDbContext>(options =>
            {
                options.UseNpgsql(_connectionString);
            });

            services.Configure<AdmissionOptions>(opts =>
            {
                opts.HoldDurationSeconds = _holdDurationSeconds;
                opts.ExpirationCheckIntervalSeconds = 1;
                opts.SeedDemoData = _seedDemoData;
            });
        });
    }
}

