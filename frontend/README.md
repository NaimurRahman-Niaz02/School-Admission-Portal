# Hashmat Uddin High School — Online Admission System (React)

Official Online Admission Portal and Authority Administration Platform for **Hashmat Uddin High School** (Session 27, Academic Year 2026–2027), located in Nagua, Sadar, Kishoreganj - 2300, Dhaka Division.

This repository is a faithful, component-driven React migration of the school's vanilla website located in `design/`. It strictly preserves all original layouts, typography, color palettes, micro-interactions, responsive breakpoints, and business logic without any redesign or template abstraction.

---

## Table of Contents

1. [Features & Architecture](#features--architecture)
2. [Route Architecture (All 11 Documented Pages)](#route-architecture)
3. [Quick Start & Setup](#quick-start--setup)
4. [Environment Configuration](#environment-configuration)
5. [Dual-Mode API Operation](#dual-mode-api-operation)
6. [Business Logic & Institutional Rules](#business-logic--institutional-rules)
7. [Authority Administration Portal](#authority-administration-portal)
8. [Automated Verification & Test Suites](#automated-verification--test-suites)
9. [Responsive Viewport & Print Specifications](#responsive-viewport--print-specifications)

---

## Features & Architecture

- **React 19 & Vite 8**: Modern, high-performance client build with fast HMR and zero bundle bloat.
- **Strict Visual Fidelity**: Reuses the institutional color tokens, CSS primitives, and typography directly from `design/css/`.
- **Global Single-Admission Rule**: Strictly enforces a 1-seat maximum per candidate across all grades and sections.
- **17-Digit Birth Registration Verification**: Strict regex validation (`^\d{17}$`) ensuring candidates cannot register with malformed or random IDs.
- **First-Come, First-Served Seat Holds**: Real-time 10-minute reservation ticker with automatic release on expiration.
- **Printable Admission Slip**: Official enrollment certificate with verification QR placeholder disclaimer and Headmaster seal block.
- **Isolated Authority Portal**: Hidden behind a confidential verification gate (inaccessible from public navigation or footer).
- **Interactive Multi-Mode Analytics**: Vertical bar charts grouped by Class Grade, Shift, or Curriculum Group, with estimated revenue forecasting.

---

## Route Architecture

All 11 documented pages are active and accessible via direct URLs and browser refreshes:

### Public Student Portal
| Route | Page Component | Purpose |
| :--- | :--- | :--- |
| `/` | `HomePage` | School landing page, admission announcement, live clock, seat matrix highlight, process steps, campus overview |
| `/admission-info` | `AdmissionInfoPage` | Eligibility requirements, shift hours, curriculum fees schedule, offline help desk |
| `/admissions/classes` | `ClassSelectionPage` | Real-time seat matrix grid, multi-parameter filtering, search, 5-second polling, restriction alerts |
| `/admissions/classes/:classId` | `PublicClassDetailsPage` | Section specifications, quota counters, 17-digit birth ID reservation form, countdown |
| `/my-applications` | `MyApplicationsPage` | Student identity card, active reservation status, payment CTA, historical logs |
| `/applications/:holdId` | `ApplicationDetailsPage` | Application status hub, payment modal, cancellation modal, official printable admission slip |

### Authority Administration Portal
| Route | Page Component | Purpose |
| :--- | :--- | :--- |
| `#/authority/*` or `/authority` | `AuthorityVerificationGate` | Confidential administration gate with session-based passcode verification |
| `/authority/admission-management` | `AuthorityDashboardPage` | Session 2027 dashboard, live schedule clock, 5 KPI counters, schedule configuration modal |
| `/authority/create-class` | `AuthorityCreateClassPage` | 2-column class creator, dynamic group rules (Classes 6-8: General; Classes 9-10: Science/Commerce/Arts), duplicate section guard |
| `/authority/statistics` | `AuthorityStatisticsPage` | Interactive 3-mode vertical bar chart, estimated revenue metric, section performance cards |
| `/authority/classes/:classId` | `AuthorityClassDetailsPage` | Class occupancy gauge, enrolled candidate roster, reserved holds with live countdown, student detail modal |

---

## Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation & Local Development
```bash
# Navigate to the frontend directory
cd frontend

# Install project dependencies
npm install

# Start the Vite development server (port 5173 by default)
npm run dev
```

### Production Build & Linting
```bash
# Run ESLint to verify code quality and React 19 compliance
npm run lint

# Compile and optimize production distribution into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Configuration

Copy the provided `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_USE_MOCK_API` | `true` | Toggle between standalone mock API (`true`) and real backend REST API (`false`). |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL when `VITE_USE_MOCK_API=false`. Empty string for reverse proxy. |

---

## Dual-Mode API Operation

### 1. Standalone Mock API Mode (`VITE_USE_MOCK_API=true`)
- Default mode for immediate offline demonstration and testing.
- Backed by an in-browser simulated backend (`localStorage`) supporting seat reservation locks, live 10-minute hold counters, payment confirmation, cancellations, and student rosters.
- Pre-seeded with 6 institutional classes spanning Class 6 through Class 10 across Morning and Day shifts.

### 2. Live REST Backend Mode (`VITE_USE_MOCK_API=false`)
Connects to the official assessment REST API contract:
- `POST /classes` — Payload strictly formatted as `{ "name": "...", "totalSeats": 120 }`.
- `GET /classes` — Returns all classes with total, confirmed, and held seats.
- `GET /classes/{id}` — Returns single class details and capacity statistics.
- `POST /classes/{id}/holds` — Reserves a seat with the candidate's 17-digit ID via `X-Student-Id` header and request body.
- `GET /holds/{id}` — Retrieves active or historical hold status.
- `POST /holds/{id}/confirm` — Confirms seat reservation and locks candidate into the class.
- `DELETE /holds/{id}` — Cancels reservation and returns seat to the available quota.
- `GET /me/holds` — Returns all applications matching the active `X-Student-Id` header.

*Note on Roster Endpoints*: Because the official assessment backend specification does not expose student roster query endpoints, `AuthorityClassDetailsPage` automatically detects real API mode and renders an informative institutional banner while accurately presenting live class-level seat metrics from `GET /classes/{id}` without fabricating synthetic candidate records.

---

## Business Logic & Institutional Rules

### 1. Global Single-Admission Rule
Every candidate identified by their 17-digit Birth Registration Number is restricted to **at most one active application**:
- **HELD State**: An active hold blocks any new reservation across all classes and shifts.
- **CONFIRMED State**: A paid admission permanently locks the candidate's seat and permanently blocks any new application.
- **CANCELLED State**: If a candidate cancels their hold, the seat is returned to the pool, and the candidate is immediately freed to apply elsewhere.
- **EXPIRED State**: If the 10-minute countdown reaches zero without payment, the hold automatically expires, the seat returns to the pool, and the candidate can apply again.

### 2. 17-Digit Birth Registration ID Validation
- Strictly enforced on all forms and services via regex `^\d{17}$`.
- Random or malformed student IDs are strictly rejected with helpful error feedback.
- Student ID switching immediately switches application context and isolates candidate data.

### 3. Automatic 5-Second Polling
- Class Selection, Class Details, Dashboard, and Statistics poll live data every 5 seconds without triggering full page reloads, ensuring real-time seat availability updates across concurrent applicants.

---

## Authority Administration Portal

### Verification Gate Access
- **URL**: Navigate to `/authority` or `#/authority/admission-management`.
- **Security Notice**: This prototype gate protects administrative routes from casual public access. In production, this must be backed by secure HTTP-only cookies, OAuth 2.0 / JWT, and backend RBAC.
- **Authorized Passcodes**:
  - `admin2026` (Primary administrative passcode)
  - `admin123`
  - `greenwood2026`

### Revenue Calculation Principle
Estimated revenue displayed in the Authority Portal is strictly calculated as:
$$\text{Estimated Revenue} = \text{Confirmed Seats} \times \text{Class Fee}$$
It is explicitly labeled as an **Estimate based on Confirmed Seats**, never misrepresented as actual cash receipts.

---

## Automated Verification & Test Suites

The application includes an exhaustive automated test suite with **88 assertions across 5 verification scripts**:

```bash
# Run all automated test suites
cd frontend
node test-part2-verification.mjs && \
node test-part2-dom-verification.mjs && \
node test-part3-verification.mjs && \
node test-part3-dom-verification.mjs && \
node test-part4-e2e-integration.mjs
```

### Test Suite Breakdown:
1. `test-part2-verification.mjs` (17 tests): Student validation, seat math, reservation lifecycle, single-admission rules, payment confirmation, cancellation, expiration, multi-student isolation.
2. `test-part2-dom-verification.mjs` (13 tests): Component inspections for `ClassCard`, `ClassSelectionPage`, `PublicClassDetailsPage`, `MyApplicationsPage`, `ApplicationDetailsPage`, modals.
3. `test-part3-verification.mjs` (14 tests): Passcode gate, dashboard KPIs, schedule overrides, dynamic discipline rules, duplicate section guard, statistics revenue math, roster fetching.
4. `test-part3-dom-verification.mjs` (9 tests): Authority verification gate structure, dashboard layout, create class form, 3-mode vertical bar chart, roster table, navbar/footer link isolation.
5. `test-part4-e2e-integration.mjs` (35 tests): Full end-to-end integration covering all 11 routes, end-to-end student journey, end-to-end authority journey, security guards, responsive stylesheet rules, print stylesheet, and API payload compliance.

---

## Responsive Viewport & Print Specifications

The design system incorporates fluid, mobile-first responsive stylesheets (`responsive.css`) thoroughly tested across:
- **320px & 375px** (Mobile devices): Grids collapse cleanly to single columns, `.table-responsive` enables smooth horizontal table scrolling without page-width blowout, buttons expand to full touch targets.
- **768px** (Tablets): Off-canvas mobile navigation drawer, stacked action buttons, optimized metrics cards.
- **1024px** (Laptops): 2-column overview grids, responsive sidebar collapses.
- **1366px & 1920px** (Desktop & Ultra-wide): Container width capped at `--container-max: 1200px` with centered alignment.
- **Print Mode (`@media print`)**: Hides headers, navigation, footers, breadcrumbs, action buttons, and toasts; formats the official Admission Slip with high-contrast borders and Headmaster seal block for document archiving.
