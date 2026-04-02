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

### Version 1.0 - Code Milestone 1

#### Authentication System
- **Login & Registration** - Full email/password authentication via Supabase Auth (CURRENTLY DISABLED FOR EASE OF USE)
- **Role-Based Routing** - Automatic navigation to role-specific dashboards after login
- **Session Persistence** - Sessions stored securely (Expo Secure Store on mobile, localStorage on web)
- **Password Reset** - Email-based password recovery functionality - WILL BE ADDED (CURRENTLY DISABLED FOR EASE OF USE)
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
- **Add Activity Modal** - Create activities with name, date picker (60-day range), time picker (7 AM - 5 PM, 30-min intervals), duration selector (30 min - 3 hours), and optional program/badge association WILL BE CHANGED TO PERIODS INSTEAD OF 7am - 5 pm excluding the need for duration selector

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
- **Reports Screen** - Framework in place, report generation logic in progress
- **Progress Review** - Screen ready, badge progress workflow in progress
- **Recent Activity** - Dashboard sections prepared but not yet connected to real-time data

---

### Version 1.1 - Code Milestone 2

#### CamperScreen Implementation
- **Admin View** - Full camper management with add/edit capabilities
- **Counselor View** - Read-only access to view assigned campers
- **Leader View** - View campers within their troop scope
- **Dev View** - Full permissions for testing
- Displays camper avatars with initials, names, and troop information
- Integrated with Supabase `scout` table with troop associations
- Desktop-responsive design with proper breakpoints

#### Programs Screen - Full Implementation
- **Hierarchical Navigation** - Department → Program → Requirements expansion
- **Lazy Loading** - Programs fetched when department expanded, requirements when program expanded
- **Eagle Badge Identification** - Star indicator for Eagle-required badges
- **Requirement Hierarchy** - Main requirements with sub-requirements (e.g., 1, 2a, 2b)
- Program descriptions and requirement counts displayed
- Filters out DEV and ADMIN departments from display

#### Merit Badge Database Population
All camp departments now fully populated with merit badges:
- **Trades Department** - 14 badges (Automotive Maintenance, Chess, Crime Prevention, Cycling, Electricity, Electronics, Farm Mechanics, Fingerprinting, Golf, Painting, Plumbing, Radio, Welding, Woodworking)
- **Nature Department** - 12 badges (Archaeology, Astronomy, Chemistry, Environmental Science, Fish and Wildlife Management, Forestry, Geology, Nature, Oceanography, Soil and Water Conservation, Sustainability, Weather, Space Exploration)
- **Eagle Department** - Eagle-required merit badges
- **Scoutcraft Department** - Camping, Exploration, Orienteering, Search and Rescue, Signs/Signals/Codes, Wilderness Survival
- **Handicraft Department** - Art, Leatherwork, Metalwork, Pottery, Woodcarving
- **Innovation Scouting Department** - Drafting merit badge

#### Schedule System Updates
- **Period-Based Scheduling** - Replaced time-based system with camp period slots
- **Duration by Periods** - Activities span 1-3 periods instead of hourly durations
- **Period Picker** - Dropdown selection from Supabase period data
- **12-Hour Time Format** - Period times displayed with AM/PM

#### Style Organization
Dedicated style files created for maintainability:
- `ActivityModalStyles.ts` - Modal overlay, container, form fields, dropdowns
- `SettingsStyles.ts` - Settings layout, password change section, form styling
- `UsersStyles.ts` - Role cards, user avatars, color coding by role
- `ProgramsStyles.ts` - Hierarchical expansion, department/program/requirement cards

#### Users Screen Enhancement
- **Role-Based Sections** - Admins, Area Directors, Counselors, Leaders grouped separately
- **Color-Coded Avatars** - Visual distinction by user role
- **User Count Badges** - Shows count per role section
- **Counselor-Specific View** - Counselors see only fellow counselors

---

### Version 1.2 - Code Milestone 3

#### Schedule Grid View
- **Department × Period Grid** - Activities displayed in grid format with departments as rows and periods as columns
- **Department Color Coding** - Each department has a distinct color (Aquatics: blue, Nature: green, Scoutcraft: orange, etc.)
- **Multi-Period Activities** - Activities spanning multiple periods show "continued" indicators in subsequent cells
- **Synchronized Scrolling** - Horizontal scroll syncs across header and all department rows
- **View Toggle** - Switch between grid view and list view on Schedule screen
- **Unassigned Section** - Activities without department assignments displayed separately

#### Activity Cards
- **Clickable Cards** - Tap any activity to open attendance modal
- **Department Borders** - Left border color matches department
- **Badge Display** - Shows associated merit badge name if linked
- **Duration Badge** - Visual indicator for multi-period activities
- **Delete Button** - Admin/Dev can delete activities directly from grid

#### Attendance Modal
- **Full Camper List** - Displays all scouts from the scout table
- **Weekday Checkboxes** - Mon-Fri attendance tracking per camper
- **Attendance Tally** - Shows X/5 completion count per camper
- **Role-Based Editing** - Counselors can toggle attendance; other roles view-only
- **Optimistic Updates** - Immediate UI feedback with database sync
- **Sorted Display** - Campers sorted alphabetically by last name, then first name

#### Leader Management
- **Add Leader Modal** - Create new troop leaders with:
  - First name, last name
  - Troop selection dropdown
  - Phone number (optional)
  - Email address (optional)
- **Leader Role** - Added LEADER to UserRole type system
- **Leader Tab Navigation** - Dedicated navigation for leader users

#### Leader Schedule Screen
- **View-Only Access** - Leaders can view schedule but cannot modify
- **Grid View Support** - Same grid layout as admin schedule
- **View-Only Banner** - Clear indicator that changes require staff contact

#### Campers Screen Updates
- **Troop Grouping** - Campers and leaders grouped by troop number
- **Leader Display** - Shows troop leaders with shield badge indicator
- **Contact Info** - Leader email/phone displayed when available
- **Add Buttons** - Separate "Add Leader" and "Add Camper" buttons for admins

#### New Components & Hooks
- `ScheduleGrid/` - Component folder with grid, cell, and card components
- `AttendanceModal.tsx` - Attendance tracking modal
- `AddLeaderModal.tsx` - Leader creation modal
- `useScheduleGridData.ts` - Custom hook for fetching and organizing grid data
- `departmentColors.ts` - Department color constant mappings
- `ScheduleGridStyles.ts` - Dedicated styles for grid components

#### Type System Updates
- **CamperAttendance** - Type for attendance records with weekday booleans
- **ActivityAttendance** - Base attendance type matching database schema
- **LeaderTabParamList** - Navigation types for leader role
- **LEADER Role** - Added to UserRole union type

