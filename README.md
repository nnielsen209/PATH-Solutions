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
