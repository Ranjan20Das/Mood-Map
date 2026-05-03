# MoodMap 🧠✨

> A calming, AI-powered Progressive Web App for tracking and improving your emotional well-being.

MoodMap helps you understand your emotional patterns through intelligent mood tracking, beautiful visualizations, and personalized AI-driven insights — all wrapped in a minimalist, mobile-first experience that works offline.

**Live app:** https://mood-map-its.lovable.app

---

## ✨ What MoodMap Can Do

### 📝 Mood Logging
- **Quick mood entry** on a 1–10 scale with expressive emoji feedback
- **Journal entries** — capture thoughts in text alongside each mood
- **Voice-to-text journaling** using the Web Speech API
- **Tag system** — label entries with contextual triggers (work, sleep, family, exercise, etc.)
- **Floating Action Button** for one-tap logging from anywhere in the app
- **Edit & delete** past entries from the History view

### 🤖 AI Insights (powered by GPT-5-mini via Lovable AI Gateway)
- **On-demand emotion analysis** — tap the ✨ button on any journal entry to extract:
  - Detected emotions
  - Sentiment score (-1 to +1)
  - Underlying themes
  - A short, supportive summary
- **Personalized recommendations** based on your last 14 days of entries:
  - Suggested activities tailored to your patterns
  - AI-curated music vibes (text descriptions)
  - Self-care prompts
- **Bad-day detection** — automatic alerts when negative trends are detected, with gentle coping tips

### 📊 Analytics & Visualizations
- **GitHub-style mood heatmap** showing patterns over months
- **Trend charts** — weekly, monthly, 90-day, and all-time views
- **Stats overview** — average mood, highest/lowest, trend direction, total entries
- **Day-of-week breakdown** — discover which days affect you most
- **Top tags / triggers** — see what shows up most in good and bad periods
- **Mood category distribution** (great / good / okay / low / bad)

### 📚 Self-Care Library
- Curated wellness tips and exercises
- Searchable content
- Crisis resources for difficult moments

### 👤 Profile & Settings
- Custom display name, avatar, and bio
- Theme preferences (light / dark / system)
- Daily reminder time and toggle
- Notification permissions
- Week-start day preference (Sun/Mon)
- Default tag presets
- **Data export** — download your full history as CSV or JSON

### 📡 Offline-First & PWA
- **Installable** on mobile and desktop with native app shortcuts ("Log Mood", "Analytics")
- **Works offline** — entries are queued in IndexedDB and synced automatically when back online
- **Real-time sync** across devices via Supabase Realtime
- **Online/offline indicator** with pending entry count
- **Maskable icons** and proper manifest for native-feel install experience

### 🔐 Authentication & Security
- Email/password sign-up and sign-in
- Forgot password flow with reset link
- Onboarding walkthrough for new users
- **Row-Level Security (RLS)** on all user data — your entries are visible only to you
- Secure session management via Supabase Auth

### ♿ Accessibility (WCAG 2.1)
- Skip-to-main-content link
- Semantic landmarks and ARIA labels throughout
- Keyboard-navigable bottom tab bar with `aria-current` states
- 44px minimum touch targets
- Proper color contrast in both light and dark mode
- Screen-reader-friendly progress bars and tab lists

---

## 🧭 App Structure

### Routes
| Route | Purpose |
|---|---|
| `/welcome` | Landing page with tagline and CTA |
| `/auth` | Sign in / sign up / forgot password |
| `/reset-password` | Password recovery |
| `/onboarding` | First-time setup flow |
| `/` (Dashboard) | Quick log, heatmap preview, recent entries, tips |
| `/entry` | Full mood logging (slider, journal, voice, tags) |
| `/heatmap` | Calendar visualization with filters |
| `/analytics` | Charts, trends, and insights |
| `/recommendations` | AI-generated activities + music vibes |
| `/selfcare` | Self-care tips library |
| `/history` | Searchable list of past entries |
| `/profile` | Settings, preferences, data export |

### Navigation
- **Bottom tab bar** (mobile-first): Dashboard · Entry · Analytics · For You · Profile
- **Hamburger menu**: History · Self-Care · Settings
- **Floating Action Button**: Quick mood entry from anywhere

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + TypeScript (strict mode)
- TanStack Start v1 (SSR + file-based routing)
- Vite 7
- Tailwind CSS v4 with semantic design tokens (oklch)
- shadcn/ui component library
- Framer Motion for animations
- Recharts for analytics visualizations

**Backend (Lovable Cloud / Supabase)**
- PostgreSQL with Row-Level Security
- Supabase Auth (email/password)
- Supabase Realtime for cross-device sync
- Supabase Storage (for voice notes)
- Edge Functions (Deno) for AI orchestration

**AI**
- Lovable AI Gateway → `openai/gpt-5-mini`
- Structured tool-calling for reliable JSON output
- Edge functions: `analyze-mood`, `generate-recommendations`

**Offline & PWA**
- IndexedDB sync queue (`idb`)
- Service worker + manifest with maskable icons + app shortcuts
- `beforeinstallprompt` UX with 14-day dismissal cooldown

**Testing**
- Deno test suites for edge functions (auth, AI gateway mocking, DB persistence)

---

## 🎨 Design System

- **Primary:** Indigo `#6366F1`
- **Secondary:** Emerald `#10B981`
- **Accent:** Amber `#F59E0B`
- **Background:** Slate `#F8FAFC` (light) / deep slate (dark)
- **Headings:** Poppins
- **Body:** Inter
- Calming, minimalist aesthetic with full dark-mode support

All colors live as semantic tokens in `src/styles.css` — components never hardcode colors.

---

## 🗄️ Data Model

| Table | Purpose |
|---|---|
| `profiles` | Display name, avatar, bio |
| `mood_entries` | Mood (1–10), journal, tags, voice URL, date + AI metadata (emotions, sentiment, themes, summary) |
| `user_preferences` | Theme, reminders, notifications, language, default tags |
| `ai_recommendations` | Cached recommendations and bad-day alerts |
| `user_roles` | Role-based access (admin / user) — stored separately for security |

---

## 🚀 Getting Started

```bash
bun install
bun run dev
```

Lovable Cloud (Supabase) is pre-wired — no env setup needed for the database. The AI Gateway uses the bundled `LOVABLE_API_KEY`.

---

## 📦 Project Structure

```
src/
├── routes/              # File-based routing (TanStack Start)
│   ├── _app/            # Authenticated layout + child routes
│   ├── auth.tsx
│   ├── welcome.tsx
│   └── onboarding.tsx
├── components/
│   ├── analytics/       # Charts & overview cards
│   ├── layout/          # Tab bar, FAB, hamburger, PWA prompt
│   ├── mood/            # Scale, recorder, tag selector, recent entries
│   └── ui/              # shadcn primitives
├── hooks/               # useMoodEntries, useAI, useAnalytics, useOnlineStatus...
├── contexts/            # AuthContext
├── lib/                 # offline-queue, utils
├── integrations/        # Supabase client + types
└── styles.css           # Design tokens
supabase/
└── functions/           # analyze-mood, generate-recommendations (+ tests)
```

---

## 🗺️ Roadmap

- ✅ Phase 1–8 complete: Foundations · Auth · Mood logging · Analytics · Offline · AI · Polish
- 🔜 Vitest unit tests for hooks and components
- 🔜 Spotify embedded playlists alongside AI vibe suggestions
- 🔜 Auto-analyze entries on save
- 🔜 Weekly AI summary card on Analytics

---

Built with 💙 made by Ranjan Das
