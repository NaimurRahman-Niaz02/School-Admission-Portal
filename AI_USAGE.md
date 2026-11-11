# AI Usage and Assistance Transparency

**Project**: Hashmat Uddin High School Online Admission System (HSUS)  
**Date**: November 2026

---

## Overview

In accordance with assignment guidelines, this document transparently describes how AI assistance was leveraged during the development of the Hashmat Uddin High School Online Admission System.

---

## 1. AI Tools Utilized
- **Google Antigravity / Gemini 2.5 Coding Assistant**: Used for pair-programming, architectural planning, boilerplate scaffolding, automated integration test synthesis, and database migration design.

---

## 2. Areas Where AI Provided Assistance
1. **Frontend Architecture Migration (Parts 1–4)**:
   - Scaffolding the React 19 + React Router architecture based on original HTML/CSS design files in `design/`.
   - Preserving visual fidelity, color tokens, responsive CSS breakpoints, SVG icons, and typography.
   - Creating comprehensive browser DOM and integration verification test suites.

2. **Backend API Scaffolding (.NET 8 + EF Core 8)**:
   - Generating standard repository and controller boilerplate for RESTful endpoints (`/classes`, `/holds`, `/me/holds`, `/timeline`).
   - Defining Entity Framework Core entity classes and model configurations (`OnModelCreating`).
   - Constructing ProblemDetails exception mapping middleware for RFC 7807 compliance.

3. **Database Concurrency & Locking Strategy**:
   - Designing the deadlock-free lock acquisition order (`students` then `admission_classes`) using PostgreSQL raw SQL row locks (`FOR UPDATE`).
   - Implementing partial unique indexes in EF Core (`IX_AdmissionHolds_StudentId_ActiveOrConfirmed`).

4. **Integration Testing**:
   - Writing the 20 automated integration test scenarios in `Hsus.Admission.IntegrationTests`, including multi-threaded concurrency bursts (`Task.WhenAll` with 25 concurrent client requests).
   - Diagnosing and resolving cross-version runtime compatibility between .NET 10 host SDK and .NET 8 test host.

---

## 3. Human Review & Engineering Decisions
- Every line of generated code, entity model, database migration, and test assertion was reviewed, executed, and verified against the real PostgreSQL container.
- Manual design fidelity audits were conducted across 6 responsive breakpoints (320px, 375px, 768px, 1024px, 1366px, 1920px).
- The REST API contract was strictly verified against the official assessment PDF specification.

