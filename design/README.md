# Hashmat Uddin High School — Online Admission Portal

A complete, modern, responsive frontend prototype for a private school's online admission portal built strictly using **HTML5, CSS3, and Vanilla JavaScript (ES6+)**.

No frontend frameworks (React, Vue, Angular, Next.js), CSS libraries (Bootstrap, Tailwind), or build tools were used. The application relies entirely on browser-native APIs and `localStorage` to simulate a full educational admission lifecycle.

---

## 1. Product Routes & Architecture

The application implements a hash-based client-side router (`#/`):

### Public Student Portal
| Page | Route | Description |
|---|---|---|
| **Homepage** | `#/` | School introduction, Session 27 highlight with live schedule countdown ticker, admission overview, 4-step process, guidelines, and direct class navigation. *Strictly no Apply or Reserve button.* |
| **Admission Information** | `#/admission-info` | Comprehensive institutional admission guidelines, eligibility criteria, shift hours, official fee schedule (৳1,500 &ndash; ৳1,800), and rules. |
| **Class Selection** | `#/admissions/classes` | Real-time seat availability matrix filtered by Class (6&ndash;10) and Shift (Morning/Day). Noticeable badges for Grade, Shift, and Discipline Group (Science, Arts, Commerce). Shows Total & Available seats. |
| **Public Class Details** | `#/admissions/classes/{classId}` | Dedicated class details page with real-time seat breakdown (Total, Available, Held, Admitted), live admission schedule countdown clock, admission fee, shift timings, and seat reservation action. |
| **My Applications** | `#/my-applications` | Real-time tracking of active reservations and complete chronological history of previous admissions isolated per 17-digit student birth registration number. |
| **Application Details** | `#/applications/{holdId}` | Individual reservation hub: 10-minute live countdown timer, prominent class details (Class, Shift, Group, Admission Fee, Session), simulated fee confirmation, and cancellation. |

### Private Authority / Administration Portal
*Strictly hidden from public navigation, footers, and links.*

| Page | Route | Description |
|---|---|---|
| **Authority Verification Gate** | Any `#/authority/*` (when locked) | **Password-only verification gate** protecting the admin experience (`Passcode: admin2026` or `admin123`). |
| **Authority Landing Hub** | `#/authority/admission-management` | Central operational landing page with school capacity utilization, enrollment stats, quick module cards, and live section snapshots. |
| **Create Admission Class** | `#/authority/create-class` | Dedicated class creation page with Grade (6–10), Shift (Morning/Day), Discipline Group (Science/Commerce/Arts for 9 & 10), Session (Session 27), Seat Quota, **Admission Fee (৳ BDT)**, and **Admission Start & End Datetimes**. |
| **Admission Statistics** | `#/authority/statistics` | Dedicated statistics page featuring KPI audit metrics, shift quota distributions (Morning vs Day), grade level breakdowns, simulated revenue calculations, and master section quotas. |
| **Classes & Sections Working Table** | `#/authority/classes` | Section setup and master management table for Class 6–10 across Morning/Day shifts. |
| **Class Details & Student Rosters** | `#/authority/classes/{classId}` | Comprehensive class metrics with **interactive Admitted and Reserved student tables** that open detailed student admission profile popups upon clicking any student row. |

---

## 2. Key Business Rules Implemented

1. **Brand Identity & Navigation Structure:**
   - Institution: **Hashmat Uddin High School**.
   - Public navbar contains: Logo & School Name, Home, Admission, **Admission Information** (`#/admission-info`), My Applications, and a styled Student ID pill with an icon-driven **Change ID** button.
   - Public footer contains school info, contacts, and public links, with **zero admin links or hints**.

2. **Homepage Enhancements (Session 27):**
   - Hero section prominently highlights **Session 27 Admission** with a live dynamic admission schedule countdown ticker.
   - Highlights **First-Come, First-Served Seats**.
   - Redesigned minimal Academic Classes section with concise information and direct navigation to `#/admissions/classes`.
   - Overview and step-by-step sections streamlined without redundant tags or subtitles.

3. **Public Class Selection & Dedicated Class Pages:**
   - Filters by **Class** (Class 6 to 10) and **Shift** (Morning and Day).
   - Class cards display prominent attribute badges for Class, Shift, and Discipline Group (Science, Arts, Commerce for Class 9 & 10), and a clean two-column seat quota (Total Seats & Available Seats).
   - Selecting a class navigates to `#/admissions/classes/{classId}`, which displays all counts (Total, Available, Held, Admitted), admission fee, shift schedule, live admission time clock, and the "Reserve a Seat in This Class" action.

4. **Authority Portal Access Control & Verification:**
   - Direct access to any `#/authority/*` route requires a password verification step.
   - Password: `admin2026` (or `admin123`).
   - Verified session is stored in `sessionStorage` with a "Lock Session" action in the authority header.
   - Unverified users never see admin controls or data tables.

5. **Dedicated Admin Pages:**
   - **Landing Page Hub** (`#/authority/admission-management`): Capacity overview, quick module links, and live section snapshots.
   - **Create Class** (`#/authority/create-class`): Grade (6–10), Shift, Group (Science, Arts, Commerce), Session, Seat Capacity, Admission Fee (৳ BDT), and Admission Start/End datetimes.
   - **Admission Statistics** (`#/authority/statistics`): KPI cards, Shift Quota Distribution, Grade Quota Breakdown, and simulated revenue audit.

6. **Academic Structure & Section Constraints:**
   - School classes: **Class 6, Class 7, Class 8, Class 9, Class 10**.
   - Shifts: **Morning Shift** (07:30 AM &ndash; 12:00 PM) and **Day Shift** (12:30 PM &ndash; 05:00 PM).
   - Discipline Groups:
     - **Class 6, 7, 8**: General curriculum.
     - **Class 9, 10**: Specialized disciplines: **Science**, **Commerce (Business Studies)**, and **Arts (Humanities)**.
   - **Session-Based Allocation**: Classes are assigned to an academic session (e.g. `Session 27`).
   - **Unique Section Constraint**: Admin cannot create two classes for the same class/shift/group in the same session (e.g. `Class 8 - Morning` can have at most one section in Session 27).

7. **Class Rosters & Student Admission Profile Popups:**
   - Clicking on any class in the admin panel opens its dedicated details page.
   - Displays lists of **Admitted (Confirmed)** and **Reserved (Held)** students.
   - Clicking on any student row opens an official **Student Admission Profile modal** with their 17-digit birth registration number, application code, fee status, timestamps, and section specs.

8. **Strict Global Student Admission Restriction:**
   - A student can have at most **one active HELD reservation** or **one CONFIRMED admission** across the entire school (all classes and shifts).
   - If a student has an active reservation, other class selections are blocked until cancelled.
   - Once confirmed, all further applications are permanently blocked.
   - Expired and cancelled applications remain in history and do not block a new reservation.

9. **17-Digit Student Birth Registration Number:**
   - Validated to contain strictly 17 numeric digits.
   - Masked in the navbar and public interface (`2008 •••• •••• 5678`) to protect student privacy.
   - Can be remembered in `localStorage` or session-only.
   - Application histories are completely isolated by student ID; switching student IDs loads only that student's records.

10. **Time-Limited Temporary Seat Hold & Fee Confirmation:**
    - Reserving a seat holds it for **10 minutes** (600 seconds).
    - Authoritative countdown uses the absolute `expiresAt` timestamp in `localStorage`.
    - Under the countdown, prominent class details (Class, Shift, Group, Fee, Session) are displayed.
    - Upon expiration, hold status automatically transitions to `EXPIRED`, the seat is released back to the open pool, and payment is immediately disabled.
    - Fee confirmation modal confirms the admission without extra simulation disclaimers.

11. **Live Quota Synchronization:**
    - Classes and seat metrics update silently in the background every 5 seconds without showing sync timestamps on the UI.
    - Formula: `availableSeats = max(0, totalSeats - heldSeats - confirmedSeats)`.

---

## 3. Project File Structure

```text
├── index.html                  # Single-page application root shell
├── css/
│   ├── styles.css              # Design tokens, CSS reset, typography, and base primitives
│   ├── components.css          # Modals, toasts, cards, navbar, countdown, and admission slips
│   └── responsive.css          # Responsive layouts (desktop, tablet, mobile down to 320px)
├── js/
│   ├── utils.js                # String escaping, 17-digit validation, ID masking, SVGs, and dates
│   ├── store.js                # LocalStorage persistence, seed data, and hold expiration logic
│   ├── mockApi.js              # Asynchronous simulated backend service with HTTP-style errors
│   ├── state.js                # Centralized reactive state store and event pub/sub
│   ├── components.js           # Shared dialogs, toast notifications, class cards, and headers
│   ├── pages.js                # Renderers for Home, Info, Classes, Details, Applications, and Admin
│   ├── router.js               # Hash router and layout switcher
│   └── app.js                  # Application bootstrapper and background expiration runner
└── README.md                   # Complete architectural documentation
```

---

## 4. Testing All Scenarios

Run any standard local web server in the project directory:

```bash
# Using Python:
python3 -m http.server 8080

# Using Node.js (npx):
npx serve -l 8080
```

Open `http://localhost:8080` in any modern web browser.

### Test Duration Fast-Forward (`?holdSeconds=30`)
To test expiration quickly without waiting 10 minutes, pass `holdSeconds=30` in the URL:
- `http://localhost:8080/#/admissions/classes?holdSeconds=30`
- Or `http://localhost:8080/?holdSeconds=30#/admissions/classes`

---

### Scenario Verification Guide

1. **Scenario 1: Normal Admission Flow**
   - Go to Homepage (`#/`). Note there is no Apply button.
   - Notice the **Session 27 Admission** badge, live schedule countdown ticker, and "First-Come First-Served Seats" highlight.
   - Click "Explore Admission Classes".
   - Notice filters for Class (6&ndash;10) and Shift (Morning/Day). Cards display Grade, Shift, Group, Total Seats, and Available Seats.
   - Click "Select This Class" &rarr; navigates to dedicated Public Class Details page (`#/admissions/classes/{classId}`).
   - View seat quota breakdown (Total, Available, Held, Admitted), admission fee (৳1,500), schedule clock, and click "Reserve a Seat in This Class".
   - Enter a 17-digit student ID (e.g., `20081234567890123`).
   - Confirm reservation. Note the hold is created and redirects to `#/applications/{holdId}`.
   - Notice the prominent class details badges (Class, Shift, Group, Admission Fee, Session) under the countdown.
   - Click "Pay Admission Fee" and confirm payment in the clean modal.
   - Status changes to `CONFIRMED` with an official printable admission slip.

2. **Scenario 2: Single Reservation Across All Shifts & Classes**
   - With an active reservation in Class 6 — Morning, navigate to `#/admissions/classes`.
   - The top banner warns that an active reservation exists.
   - Click another class (e.g. Class 7 — Morning) &rarr; the details page warns that an active hold is already open in another class and disables conflicting reservation.
   - Click "Cancel Reservation" on your active hold.
   - You can now reserve another class (e.g., Class 6 — Day).

3. **Scenario 3: Expiration Handling**
   - Open with `?holdSeconds=30`.
   - Reserve a class and watch the countdown timer reach `00:00`.
   - Status transitions to `EXPIRED`, payment is disabled, and the seat is returned to the open pool.
   - The student can now reserve another class.

4. **Scenario 4: Multi-Student Separation**
   - Identify as Student A (`20081234567890001`) and create an application.
   - Click the styled "Change" button in the navbar, enter Student B (`20081234567890002`).
   - Student B sees an empty application list and can apply independently.
   - Switching back to Student A restores Student A's application.

5. **Scenario 5: Admission Information Page**
   - Click the "Admission Information" tab in the navbar (`#/admission-info`).
   - Review institutional timeline, shift schedules, official fee schedule table (Class 6–10, ৳1,500 – ৳1,800), and candidate guidelines.

6. **Scenario 6: Authority Password Verification & Landing Hub**
   - Navigate directly to `#/authority/admission-management`.
   - The password verification screen appears.
   - Enter `admin2026` (or `admin123`) to unlock.
   - The **Authority Landing Page Hub** opens, displaying overall enrollment capacity, session metrics, quick module cards, and live section snapshots.

7. **Scenario 7: Dedicated Create Class Page**
   - From the Authority Hub, navigate to **Create Class** (`#/authority/create-class`).
   - Select `Class 9`: notice the **Discipline Group** dropdown activates with `Science`, `Commerce`, `Arts`.
   - Set **Admission Fee** (e.g., `৳1,800`) and **Admission Start & End Datetimes**.
   - Notice that submitting an already existing section for Session 27 is rejected with a clear conflict alert.

8. **Scenario 8: Dedicated Admission Statistics Page**
   - From the Authority Hub, navigate to **Admission Statistics** (`#/authority/statistics`).
   - View total sections, capacity, confirmed admissions, active holds, vacancies, simulated fee revenue, Shift Quota Distribution, and Grade Quota Breakdown.

9. **Scenario 9: Class Details & Student Admission Popups**
   - Click on any class row (e.g., `Class 6 - Morning`).
   - The Class Details page opens with Admitted and Reserved student tables.
   - Click on any student row: an official **Student Admission Profile modal** pops up showing their full 17-digit ID, application code, fee status, and timestamps.
