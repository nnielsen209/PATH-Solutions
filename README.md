# PATHSOLUTIONS

This project aims to develop a digital achievement tracking system for Camp Geiger to replace the manual paper-based process. The system will empower camp counselors with mobile tools for real-time attendance logging, merit badge requirement tracking, and partial completion recording, while providing camp administrators with web-based dashboards for reporting and operations management. The solution addresses challenges including: hundreds of daily participant check-ins, prerequisite validation (age, rank, prior skills like Swimming for Rowing), and schedule conflicts across compressed camp weeks. By streamlining tracking and reducing paperwork, the system enables staff to focus on mentoring, safety, and enhancing the overall participant experience while ensuring compliance with Scouting America standards.

## Tech Stack

- **Frontend:** React Native + Expo (web, iOS, Android from one codebase)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials from [supabase.com](https://supabase.com)

4. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- **Web:** Press `w` in terminal or run `npm run web`
- **iOS:** Press `i` in terminal or run `npm run ios`
- **Android:** Press `a` in terminal or run `npm run android`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers (Auth, etc.)
├── hooks/          # Custom React hooks
├── services/       # API services (Supabase client)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── constants/      # App constants
```

## User Roles

| Role | Access |
|------|--------|
| Admin | Web dashboard - manage users, badges, schedules, reports |
| Area Director | Web dashboard/Mobile App - (manage users, badges, schedules, reports) In area |
| Counselor | Mobile app - attendance, badge progress tracking |
| Dev | Full admin access plus developer testing features |

---

## Release Notes

### Version 1.0 - Current Working Features

#### Authentication System
- **Login & Registration** - Full email/password authentication via Supabase Auth
- **Role-Based Routing** - Automatic navigation to role-specific dashboards after login
- **Session Persistence** - Sessions stored securely (Expo Secure Store on mobile, localStorage on web)
- **Password Reset** - Email-based password recovery functionality
- **Password Change** - In-app password change with current password verification
- **Logout** - Available from all dashboard headers

#### User Roles & Permissions
Five distinct user roles with tailored experiences:
- **Admin** - Full system access with user management, scheduling, and reports
- **Area Director** - Scoped admin access for their area (counselors and scouts only)
- **Counselor** - Mobile-focused interface for attendance and progress tracking
- **Dev** - Admin capabilities plus developer testing features (activity deletion)
- **Scout** - Participant role (future expansion)

#### Admin Dashboard
- **Dashboard Home** - Time-based greeting, stat cards (Total Users, Counselors, Active Sessions), quick action buttons
- **Users Screen** - View all users grouped by role with color-coded badges, real-time data from Supabase
- **Scout Management** - Add scouts via modal with troop selection, view scouts with troop information
- **Schedule Screen** - View all activities with date/time/duration, create new activities via modal, delete activities (dev only)
- **Programs Screen** - Structure in place for merit badge program management
- **Reports Screen** - UI framework ready for report generation
- **Settings Screen** - Change password functionality with validation

#### Counselor Dashboard
- **Dashboard Home** - Personalized greeting, stat cards (My Activities, Today's Attendance, Progress to Review)
- **Quick Action Buttons** - Navigate to key features
- **My Activities** - Screen for viewing counselor-led activities
- **Attendance** - Screen structure for taking attendance
- **Progress** - Screen structure for badge progress review
- **Profile** - Counselor profile information

#### Area Director Dashboard
- Same navigation as Admin with content filtered to their area
- Can view and manage counselors and scouts
- Access to scheduling and reports within their scope

#### Developer Dashboard
- Purple gradient header to distinguish from admin
- Full admin capabilities
- Activity deletion enabled for testing
- All quick actions available

#### Modals & Forms
- **Add Scout Modal** - Create scouts with first name, last name, and troop selection (dropdown with all troops fetched from database)
- **Add Activity Modal** - Create activities with name, date picker (60-day range), time picker (7 AM - 5 PM, 30-min intervals), duration selector (30 min - 3 hours), and optional program/badge association

#### Responsive Design
- **Mobile (< 768px)** - Bottom tab navigation with icons and labels
- **Desktop (≥ 768px)** - Sidebar navigation with selected route highlighting
- Safe area handling for notched devices
- Adaptive spacing and card-based layouts

#### Database Integration
- Real-time data fetching from Supabase PostgreSQL
- **Working Queries:**
  - Fetch all users by role
  - Fetch scouts with troop relations
  - Fetch all troops
  - Fetch all merit badges/programs
  - Fetch activities with program associations
- **Working Inserts:**
  - Create new scouts
  - Create new activities
- **Working Deletes:**
  - Delete activities (dev role only)

#### UI/UX Features
- Gradient headers with role-specific colors (Admin: blue, Dev: purple, Counselor: green)
- Loading states on all data operations
- Error messaging with retry buttons
- Profile avatars with user initials
- Activity list with formatted dates, times, and durations
- Empty state messaging when no data

### Known Limitations / In Progress
- **Programs Screen** - UI ready, list population not yet implemented
- **Reports Screen** - Framework in place, report generation logic pending
- **Attendance Marking** - Screen ready, attendance recording logic pending
- **Progress Review** - Screen ready, badge progress workflow pending
- **Recent Activity** - Dashboard sections prepared but not yet connected to real-time data
- **Camp Settings** - Placeholder for future camp configuration options
