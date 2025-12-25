# 5S Cho Bản Thân

Personal 5S Life Management System - Helping individuals apply the 5S methodology to their daily life for clarity, lightness, and sustainability.

**Rõ ràng - Nhẹ nhàng - Bền vững**

## What is This?

This web app helps people apply 5S principles to their personal life, not just physical spaces. It covers:

- **Mindset** - Mental clarity, thoughts, emotions
- **Time** - Time and energy management
- **Work** - Personal work and projects
- **Health** - Physical well-being
- **Relationships** - Social connections
- **Finance** - Personal finances
- **Space** - Living and working environment

## The 5S Framework

1. **S1 - Sàng lọc (Sort)**: Keep what matters, remove what doesn't
2. **S2 - Sắp xếp (Set in Order)**: Organize priorities, assign fixed positions
3. **S3 - Sạch sẽ (Shine)**: Review regularly, clean up what feels heavy
4. **S4 - Tiêu chuẩn (Standardize)**: Create simple personal rules
5. **S5 - Tâm thế (Sustain)**: Maintain discipline gently and sustainably

## Key Features

### Onboarding
- Users choose ONE life area to start with
- No overwhelm - focus on one thing at a time
- Clear guidance on where to begin

### Dashboard
- Notion-style layout with left sidebar
- Clean, minimal design (no purple gradients!)
- Today's focus and quick access to 5S steps

### 5S Flow
- Complete workflow for each life area
- Interactive checklists and organizers
- Gentle progress tracking

### Daily Mode
- 1-3 simple actions per day
- No pressure - skip if needed
- Sustainable daily practice

### Weekly Review
- Light reflection (5-10 minutes)
- Three simple questions
- No scoring or ranking

## Technology Stack

- **Frontend**: React 18 with Vite
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **State**: Local state + Supabase
- **Storage**: Session-based (no login required initially)

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- Supabase account

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Schema

The database includes:

- `life_areas` - 7 predefined life areas
- `user_sessions` - Session tracking (no auth required)
- `s1_filter_items` - S1 sort items
- `s2_organize_items` - S2 organize items
- `s3_clean_reflections` - S3 cleaning reflections
- `s4_standards` - S4 personal standards
- `s5_sustain_reminders` - S5 sustainability reminders
- `daily_actions` - Daily suggested actions
- `weekly_reviews` - Weekly reflections

All tables have Row Level Security (RLS) enabled.

## Design Philosophy

- **Calm and Clean**: Soft blues, greens, neutral tones (NO purple!)
- **No Gamification**: No streaks, points, or competitive elements
- **No Guilt**: Can skip actions without negative feedback
- **Sustainable**: Built for long-term daily use (years)
- **Notion-inspired**: Familiar, clean, professional layout

## User Flow

1. **First Visit**: Onboarding to choose focus area
2. **Dashboard**: See overview and today's actions
3. **5S Steps**: Work through S1-S5 at own pace
4. **Daily Mode**: Simple daily practice screen
5. **Weekly Review**: Light reflection once per week

## Key UX Principles

- Start from inside (mindset) to outside (environment)
- One thing at a time - no overwhelming users
- Gentle language - no "you failed" messaging
- Calm tone - encouraging but not hyped
- Suitable for long-term use

## Project Structure

```
/src
  /components        # React components
    - Onboarding.jsx
    - Dashboard.jsx
    - Sidebar.jsx
    - S1Filter.jsx
    - S2Organize.jsx
    - S3Clean.jsx
    - S4Standardize.jsx
    - S5Sustain.jsx
    - DailyMode.jsx
    - WeeklyReview.jsx
  /lib              # Utility functions
    - supabase.js
    - session.js
  - App.jsx         # Main app component
  - main.jsx        # Entry point
```

## Contributing

This is a personal productivity tool focused on gentle, sustainable self-improvement. Contributions should align with the core philosophy of clarity, lightness, and sustainability.

## License

MIT

---

Made with care for those seeking a clearer, lighter, more sustainable life.
