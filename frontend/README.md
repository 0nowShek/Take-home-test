# Call Me Reminder - Frontend

Modern, production-grade reminder application frontend built with Next.js 14, TypeScript, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

**Note:** The frontend connects to the backend at `http://localhost:8000` by default. If your backend runs on a different port, update the API_URL in `src/lib/api-client.ts`.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx             # Dashboard (home page)
│   │   ├── create/              # Create reminder page
│   │   │   └── page.tsx
│   │   ├── edit/[id]/           # Edit reminder page
│   │   │   └── page.tsx
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── quick-reschedule-modal.tsx
│   │   ├── theme-toggle.tsx
│   │   └── countdown-badge.tsx
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── api-client.ts        # API communication layer
│   │   └── utils.ts             # Shared utilities
│   │
│   └── hooks/                   # Custom React hooks
│       ├── use-toast.ts
│       └── use-countdown.ts
│
├── public/                      # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 🎨 Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **React 18** - UI library with latest features

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Beautiful icon library

### State & Data
- **React Hooks** - State management
- **Native Fetch** - API communication
- **Optimistic Updates** - Instant UI feedback

### Developer Experience
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Strict Mode** - Maximum type safety

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Utilities
npm run clean        # Remove .next and node_modules
```

---

## 🎯 Key Features

### 1. Dashboard (Home Page)
**Location:** `src/app/page.tsx`

Features:
- Grid layout with responsive columns (1-3 based on screen size)
- Real-time search across title and message
- Status filtering (All, Scheduled, Completed, Failed)
- Live countdown badges that update every 60 seconds
- Quick actions (Reschedule, Edit, Delete, Retry)
- Beautiful empty states
- Dark mode support

**Components Used:**
- `Card` - Reminder containers
- `Badge` - Status indicators
- `Button` - Actions
- `Input` - Search field
- `QuickRescheduleModal` - Time adjustment
- `CountdownBadge` - Live timer

### 2. Create Reminder
**Location:** `src/app/create/page.tsx`

Features:
- Multi-step form with visual progress
- Real-time inline validation
- Phone number auto-formatting
- Timezone auto-detection
- Live preview sidebar
- Character counter
- Relative time display
- Loading states

**Validation Rules:**
- Title: 3-100 characters
- Message: 10-500 characters
- Phone: US format (10-11 digits)
- DateTime: Must be in future
- All fields required

### 3. Edit Reminder
**Location:** `src/app/edit/[id]/page.tsx`

Features:
- Pre-populated form with existing data
- Selective field editing
- Status checking (only scheduled can be edited)
- Smart rescheduling (updates backend scheduler)
- Same validation as create
- Auto-redirect after save

**Restrictions:**
- Cannot edit completed reminders
- Cannot edit failed reminders
- Redirects with helpful toast messages

---

## 🎨 Design System

### Color Palette

**Light Mode:**
```css
--primary: 210 100% 50%        /* Sky blue */
--success: 142 71% 45%         /* Emerald */
--warning: 38 92% 50%          /* Amber */
--destructive: 0 84% 60%       /* Red */
--muted: 210 40% 96%           /* Light gray */
--foreground: 222 47% 11%      /* Dark text */
```

**Dark Mode:**
```css
--background: 222 47% 11%      /* Dark slate */
--card: 217 33% 17%            /* Elevated surface */
--primary: 210 100% 50%        /* Sky blue */
--success: 142 71% 45%         /* Emerald */
--warning: 38 92% 50%          /* Amber */
--destructive: 0 84% 60%       /* Red */
--foreground: 213 31% 91%      /* Light text */
```

### Typography
```css
Font Family: Inter (system fallback)
Sizes: 12px | 14px | 16px | 20px | 24px | 32px
Weights: 400 (regular) | 600 (semibold) | 700 (bold)
Line Heights: 1.5 (body) | 1.2 (headings)
```

### Spacing Scale
```css
4px  → space-1   (0.25rem)
8px  → space-2   (0.5rem)
12px → space-3   (0.75rem)
16px → space-4   (1rem)
24px → space-6   (1.5rem)
32px → space-8   (2rem)
48px → space-12  (3rem)
64px → space-16  (4rem)
```

### Component Variants

**Button:**
- `default` - Primary action
- `outline` - Secondary action
- `ghost` - Tertiary action
- `destructive` - Dangerous action

**Badge:**
- `success` - Scheduled/Completed
- `warning` - Pending
- `destructive` - Failed
- `default` - Neutral

**Card:**
- Standard elevation
- Hover state (scale + shadow)
- Border on light, subtle on dark

---

## 🔌 API Integration

### API Client
**Location:** `src/lib/api-client.ts`

Centralized API communication with type safety:

```typescript
// Base URL for API (hardcoded for local development)
const API_URL = "http://localhost:8000"

// Get all reminders with optional filters
const reminders = await getReminders({ 
  status: 'scheduled',
  limit: 100 
})

// Get single reminder
const reminder = await getReminder(id)

// Create reminder
const newReminder = await createReminder({
  title: "Meeting",
  message: "Team standup at 10 AM",
  phone_number: "+14155552671",
  scheduled_time: "2026-01-02T10:00:00",
  timezone: "America/New_York"
})

// Update reminder
const updated = await updateReminder(id, {
  title: "Updated Meeting",
  scheduled_time: "2026-01-02T11:00:00"
})

// Delete reminder
await deleteReminder(id)
```

**Features:**
- TypeScript types for all requests/responses
- Automatic JSON serialization
- Error handling with helpful messages
- Base URL configuration via env vars

### Type Definitions
```typescript
interface Reminder {
  id: number
  title: string
  message: string
  phone_number: string
  scheduled_time: string
  timezone: string
  status: "scheduled" | "completed" | "failed"
  created_at: string
  updated_at: string
  call_sid?: string | null
  error_message?: string | null
}

interface ReminderCreate {
  title: string
  message: string
  phone_number: string
  scheduled_time: string
  timezone: string
}

interface ReminderUpdate {
  title?: string
  message?: string
  phone_number?: string
  scheduled_time?: string
  timezone?: string
  status?: "scheduled" | "completed" | "failed"
}
```

---

## 🎣 Custom Hooks

### useCountdown
**Location:** `src/hooks/use-countdown.ts`

Provides live countdown with auto-refresh:

```typescript
const countdown = useCountdown(reminder.scheduled_time)
// Returns: "in 2h 30m" | "in 5 min" | "overdue"
```

Features:
- Updates every 60 seconds
- Auto-cleanup on unmount
- Handles timezone correctly
- Memoized for performance

### useToast
**Location:** `src/hooks/use-toast.ts`

Toast notification system:

```typescript
const { toast } = useToast()

toast({
  title: "Success!",
  description: "Reminder created",
  variant: "success"
})
```

Variants:
- `success` - Green theme
- `destructive` - Red theme
- `warning` - Amber theme
- `default` - Neutral theme

### Responsive Design
```typescript
// Mobile first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

### Dark Mode
```typescript
// Use dark: prefix
<div className="bg-white dark:bg-slate-900">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```


---

## 🐛 Troubleshooting

### Common Issues

**Issue:** API requests fail
```
Solution: Check that backend is running on http://localhost:8000
Update API_URL in src/lib/api-client.ts if needed
Verify CORS is enabled in backend
```

**Issue:** Dark mode not working
```
Solution: Check browser localStorage
Clear cache and hard reload
Ensure theme-toggle component is mounted
```

**Issue:** Phone validation too strict
```
Solution: Input accepts 10 or 11 digits in any format
Backend formats to E.164 automatically
Check console for validation errors
```

**Issue:** Countdown not updating
```
Solution: Check useCountdown hook
Ensure component isn't memoized incorrectly
Verify 60s interval is running
```

---

## 📝 Code Style

### TypeScript
- Use strict mode
- Explicit return types for functions
- Interface over type for objects
- Avoid `any` - use `unknown` if needed

### React
- Functional components only
- Hooks at top level
- Custom hooks for reusable logic
- Props destructuring preferred

### Naming
- PascalCase for components
- camelCase for functions/variables
- SCREAMING_SNAKE_CASE for constants
- Descriptive names (no abbreviations)

### Comments
- JSDoc for public functions
- Inline for complex logic
- No commented-out code in commits
- Explain "why" not "what"

---

## 🔐 Security

### API Configuration
- Backend URL hardcoded for local development
- For production, use environment-based configuration
- Update `API_URL` in `src/lib/api-client.ts` for deployment
