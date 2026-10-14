# Calisthenix — Level Up Your Discipline

A gamified habit tracker built with **React + TypeScript + Vite**.

Turn daily routines into RPG-style quests. Earn XP, build streaks, level up, and track your progress with analytics.

## Features

- **Quest Board** — Create habits as quests with difficulty tiers (Easy / Medium / Hard / Epic)
- **XP & Leveling** — Progressive XP curve, ranks from Novice → Immortal
- **Streak System** — Consecutive completions grant bonus XP (up to +100%)
- **Analytics** — 14-day activity chart, XP by difficulty, category breakdown, completion rate
- **Local Persistence** — All data saved in `localStorage` (no backend/account needed)
- **Dark Fantasy UI** — Purple-themed immersive interface with level-up celebrations

## Quick Start

```bash
cd habit-rpg
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  App.tsx              # Main app + tabs
  types.ts             # Types, XP formulas, ranks
  hooks/useGame.ts     # State, localStorage, complete/add/delete logic
  components/
    Header.tsx         # Level, XP bar, title
    QuestCard.tsx      # Individual quest UI
    AddQuestModal.tsx  # Create new quest
    Analytics.tsx      # Charts & stats
  App.css              # Full dark theme
```

## How XP Works

| Difficulty | Base XP |
|------------|---------|
| Easy       | 10      |
| Medium     | 25      |
| Hard       | 50      |
| Epic       | 100     |

Streak bonus: +10% per consecutive day (capped at +100%).

Level formula: each level requires `100 × level^1.4` XP.

## License

MIT — free to use and modify.
