# HSUS Online Admission System — Backend Service

High-performance, production-ready RESTful API for Hashmat Uddin High School's Online Admission System built with **C# (.NET 10)**, **Entity Framework Core**, and **PostgreSQL 16**.

---

## Architectural Highlights

- **Clean Layered Architecture**: Controllers, Services, Entities, Data (EF Core DbContext + Migrations), DTOs, Background Workers, and Middleware.
- **PostgreSQL Row-Level Concurrency Control**: Strict pessimistic locking (`SELECT ... FOR UPDATE`) prevents over-allocation during concurrent seat reservation bursts.
- **Global Single-Admission Rule**: Students (identified by unique 17-digit birth registration numbers) are restricted to at most one active `HELD` or `CONFIRMED` admission across all classes, enforced by application logic and PostgreSQL partial unique indexes (`IX_AdmissionHolds_StudentId_ActiveOrConfirmed`).
- **Automated Hold Expiration**: 10-minute temporary seat hold reservation window automatically expired by an asynchronous background worker (`HoldExpirationBackgroundService`) and lazy real-time checks, instantly returning abandoned seats to the available pool.
- **RESTful Endpoints & Swagger / OpenAPI**: Full OpenAPI documentation at `/swagger` with RFC 7807 `ProblemDetails` error formatting.

---

## Project Structure

```
backend/
├── Hsus.Admission.sln
├── Dockerfile
├── src/
│   └── Hsus.Admission.Api/
│       ├── Configuration/
│       │   └── AdmissionOptions.cs
│       ├── Controllers/
│       │   ├── ClassesController.cs         # POST /classes, GET /classes, GET /classes/{id}, POST /classes/{id}/holds
│       │   ├── HoldsController.cs           # GET /holds/{id}, POST /holds/{id}/confirm, DELETE /holds/{id}
│       │   ├── StudentHoldsController.cs    # GET /me/holds (X-Student-Id)
│       │   └── TimelineController.cs        # GET /timeline, PUT /timeline
│       ├── Data/
│       │   ├── AdmissionDbContext.cs        # EF Core mappings, check constraints, partial unique indexes
│       │   ├── DatabaseInitializer.cs       # Migration runner + idempotent demo seed data
│       │   └── Migrations/                  # EF Core Code-First migrations
│       ├── DTOs/
│       │   ├── ClassDtos.cs
│       │   ├── HoldDtos.cs
│       │   └── TimelineDtos.cs
│       ├── Entities/
│       │   ├── AdmissionClass.cs
│       │   ├── AdmissionHold.cs
│       │   ├── HoldStatus.cs
│       │   └── Student.cs
│       ├── Exceptions/
│       │   └── DomainExceptions.cs
│       ├── Middleware/
│       │   └── GlobalExceptionHandlerMiddleware.cs
│       ├── Services/
│       │   ├── AdmissionService.cs          # Core business logic & PostgreSQL row-level locks
│       │   ├── IAdmissionService.cs
│       │   └── HoldExpirationBackgroundService.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
└── tests/
    └── Hsus.Admission.IntegrationTests/
        ├── AdmissionApiFactory.cs           # WebApplicationFactory test server
        ├── AdmissionApiTests.cs             # Tests 1-17, 20
        ├── ConcurrencyTests.cs              # Tests 18-19 (25 concurrent bursts & duplicate requests)
        └── PostgreSqlCollection.cs          # Sequential xUnit collection fixture
```

---

## API Endpoints Reference

| Method | Endpoint | Description | Auth / Headers |
|---|---|---|---|
| `GET` | `/classes` | List all admission classes with real-time seat statistics | Public |
| `POST` | `/classes` | Create a new admission class | Public / Admin (`{ "name": "...", "totalSeats": 120 }`) |
| `GET` | `/classes/{classId}` | Get details and seat stats for a specific class | Public |
| `POST` | `/classes/{classId}/holds` | Reserve a temporary seat hold (10 min) | Requires `X-Student-Id` header (17 digits) |
| `GET` | `/holds/{holdId}` | Get seat hold details and remaining seconds | Requires `X-Student-Id` header (Student Isolation) |
| `POST` | `/holds/{holdId}/confirm` | Confirm hold and complete admission | Requires `X-Student-Id` header |
| `DELETE` | `/holds/{holdId}` | Cancel hold and immediately release seat | Requires `X-Student-Id` header |
| `GET` | `/me/holds` | List all holds (active & history) for a student | Requires `X-Student-Id` header |
| `GET` | `/timeline` | Get global admission session timeline | Public |
| `PUT` | `/timeline` | Update admission session timeline | Public / Admin |
| `GET` | `/health` | Service health status | Public |
| `GET` | `/swagger` | Interactive Swagger UI / OpenAPI specification | Public |

---

## Seat Calculation & State Machine

Every class dynamically computes:
- $\text{TotalSeats} = \text{AvailableSeats} + \text{HeldSeats} + \text{ConfirmedSeats}$
- $\text{AvailableSeats} = \text{TotalSeats} - (\text{HeldSeats} + \text{ConfirmedSeats})$

Hold States:
1. `HELD`: Active reservation held for 600 seconds (10 minutes). Decrements `availableSeats`, increments `heldSeats`.
2. `CONFIRMED`: Admission fee paid / confirmed. Increments `confirmedSeats`, decrements `heldSeats`. Permanently locks admission for this student.
3. `EXPIRED`: Hold duration elapsed without confirmation. Seat automatically returned to available pool.
4. `CANCELLED`: Student cancelled hold prior to confirmation. Seat immediately restored to available pool.

---

## Running Automated Integration Tests

The test suite runs against a live PostgreSQL 16 instance and verifies 20 scenarios, including heavy concurrent loads:

```bash
# Ensure PostgreSQL is running on port 5432
# (e.g. docker run --name hsus_test_postgres -e POSTGRES_USER=hsus_user -e POSTGRES_PASSWORD=hsus_password -e POSTGRES_DB=hsus_admission_test -p 5432:5432 -d postgres:16-alpine)

dotnet test backend/tests/Hsus.Admission.IntegrationTests/Hsus.Admission.IntegrationTests.csproj
```

