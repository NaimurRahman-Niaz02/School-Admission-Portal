# System Architecture Decisions & Technical Assumptions

**Project**: Hashmat Uddin High School Online Admission System (HSUS)  
**Technology**: React 19 + C# .NET 10 Web API + PostgreSQL 16 + Docker Compose

---

## 1. Student Identity Specification
- **Identifier**: Official Bangladeshi Birth Registration Number (BRN) or Candidate National ID.
- **Format**: Exactly 17 numerical digits (e.g., `20081234567890123`).
- **Database Enforcement**: PostgreSQL table `students` primary key `BirthRegistrationNumber` with check constraint:
  ```sql
  CONSTRAINT "CK_Students_BirthRegistrationNumber_17Digits" CHECK ("BirthRegistrationNumber" ~ '^[0-9]{17}$')
  ```
- **Transmission**: Required in the HTTP request header `X-Student-Id` for all student-scoped operations (`POST /classes/{id}/holds`, `GET /holds/{id}`, `POST /holds/{id}/confirm`, `DELETE /holds/{id}`, `GET /me/holds`). Requests missing or containing non-17-digit IDs are rejected immediately with HTTP 400 Bad Request.

---

## 2. Global Single-Admission Constraint
- **Rule**: A student may hold or be confirmed in at most ONE class/shift at any given time across the entire school.
- **Enforcement**:
  1. **Application Logic**: Explicit check within a PostgreSQL serial transaction holding row locks on the student and class.
  2. **Database Partial Unique Index**:
     ```sql
     CREATE UNIQUE INDEX "IX_AdmissionHolds_StudentId_ActiveOrConfirmed" 
     ON admission_holds ("StudentId") 
     WHERE "Status" IN ('HELD', 'CONFIRMED');
     ```
  3. **Concurrency Safety**: If two concurrent requests arrive simultaneously for the same student (e.g. Test 19), the row-level lock and partial unique index ensure strictly one succeeds (HTTP 201 Created) while the other receives HTTP 409 Conflict.

---

## 3. Concurrency Protection & Row-Level Locking Order
- **Threat Model**: A high-demand class with limited seats (e.g., 5 seats) receives 25+ simultaneous reservation requests within milliseconds.
- **Strategy**: Pessimistic database row-level locking via PostgreSQL `SELECT ... FOR UPDATE`.
- **Lock Ordering (Deadlock Prevention)**:
  1. Lock `students` row first: `SELECT * FROM students WHERE "BirthRegistrationNumber" = @id FOR UPDATE;`
  2. Lock `admission_classes` row second: `SELECT * FROM admission_classes WHERE "Id" = @classId FOR UPDATE;`
  3. Calculate live available seats:
     $$\text{availableSeats} = \text{TotalSeats} - (\text{heldSeats} + \text{confirmedSeats})$$
  4. If $\text{availableSeats} \le 0$, abort transaction and return HTTP 409 Conflict.
  5. Insert `admission_holds` record and commit transaction.
- **Result**: Zero over-allocation under concurrent bursts. Tested and verified with 25 concurrent threads on 5 seats.

---

## 4. Temporary Hold Expiration & Background Worker
- **Duration**: 600 seconds (10 minutes) default, configurable via `HOLD_DURATION_SECONDS`.
- **Two-Tier Expiration Handling**:
  1. **Asynchronous Background Worker**: `HoldExpirationBackgroundService` runs periodically (every 5 seconds, configurable via `EXPIRATION_CHECK_INTERVAL_SECONDS`) executing batch status updates:
     ```sql
     UPDATE admission_holds 
     SET "Status" = 'EXPIRED', "ExpiredAt" = NOW() 
     WHERE "Status" = 'HELD' AND "ExpiresAt" <= NOW();
     ```
  2. **Lazy On-Demand Check**: Every query checking hold validity or calculating seats verifies `ExpiresAt <= DateTime.UtcNow`. Expired holds are never counted as active seats.
- **Confirmation Protection**: Once a hold reaches `EXPIRED` or `CANCELLED`, confirmation attempts return HTTP 409 Conflict.

---

## 5. Class Section Identification & Canonical Naming
- **Contract Compatibility**: Supports both official `{ "name": "...", "totalSeats": 120 }` payloads and detailed structured payloads (`grade`, `shift`, `group`, `session`, `totalSeats`, `fee`).
- **Duplicate Prevention**: Classes within the same academic session must have unique names and unique combinations of `(Grade, Shift, Group, AcademicSession)`. Duplicate creation returns HTTP 409 Conflict.
- **Higher Grade Disciplines**: Class 9 and Class 10 require a discipline group (`Science`, `Commerce`, or `Arts`). Classes 6, 7, and 8 default to `General`.

---

## 6. Authority Authentication Prototype
- The frontend gate uses administrative passcodes (`admin2026`, `admin123`, `greenwood2026`) for client-side prototype demonstration.
- Public navigation and footers strictly exclude authority links.
- For production deployment, a dedicated JWT or OAuth2 identity provider (such as ASP.NET Core Identity with OpenID Connect) should be layered onto authority endpoints.

