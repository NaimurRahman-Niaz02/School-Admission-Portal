# Multi-stage Dockerfile for Hashmat Uddin High School Online Admission Backend API (.NET 10)

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY src/Hsus.Admission.Api/Hsus.Admission.Api.csproj src/Hsus.Admission.Api/
RUN dotnet restore src/Hsus.Admission.Api/Hsus.Admission.Api.csproj

# Copy source code and publish for net10.0
COPY src/Hsus.Admission.Api/ src/Hsus.Admission.Api/
RUN dotnet publish src/Hsus.Admission.Api/Hsus.Admission.Api.csproj -c Release -f net10.0 -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Configure default listening URL
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Hsus.Admission.Api.dll"]
