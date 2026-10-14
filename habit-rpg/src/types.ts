export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;
  streak: number;
  bestStreak: number;
  isDaily?: boolean;
  isRecurring?: boolean;
}

export interface PlayerStats {
  totalXP: number;
  level: number;
  title: string;
  lastActiveDate: string;
}

export interface GameSettings {
  autoDailyQuests: boolean;
  dailyQuestCount: number;
}

export interface AppData {
  quests: Quest[];
  player: PlayerStats;
  settings: GameSettings;
  lastDailyDate: string;
}

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#4ade80',
  medium: '#60a5fa',
  hard: '#f97316',
  epic: '#a855f7',
};

export const RANK_TITLES = [
  { minLevel: 1, title: 'Novice' },
  { minLevel: 3, title: 'Apprentice' },
  { minLevel: 5, title: 'Adventurer' },
  { minLevel: 8, title: 'Warrior' },
  { minLevel: 12, title: 'Knight' },
  { minLevel: 16, title: 'Champion' },
  { minLevel: 20, title: 'Master' },
  { minLevel: 25, title: 'Hero' },
  { minLevel: 30, title: 'Legend' },
  { minLevel: 40, title: 'Mythic' },
  { minLevel: 50, title: 'Immortal' },
];

export interface CharacterTier {
  tier: number;
  minLevel: number;
  name: string;
  image: string;
  description: string;
  gear: {
    weapon: string;
    armor: string;
    helm: string;
    aura: string;
  };
}

export const CHARACTER_TIERS: CharacterTier[] = [
  {
    tier: 1,
    minLevel: 1,
    name: 'Calisthenics Novice Trainee',
    image: '/heroes/bar_hero_tier1.jpg',
    description: 'Disciplined ascetic athlete building core foundation and grip strength on the ground.',
    gear: {
      weapon: 'Ascetic Bar Grip',
      armor: 'Charcoal Shorts & Left Sleeve',
      helm: 'Minimalist Focus',
      aura: 'Discipline Spark',
    },
  },
  {
    tier: 2,
    minLevel: 3,
    name: 'Disciplined Bar Athlete',
    image: '/heroes/bar_hero_tier2.jpg',
    description: 'Chiseled physique equipped with dual cyan circuit sleeves and training wrist wraps.',
    gear: {
      weapon: 'Cyan Calisthenics Grips',
      armor: 'Dual Cyan Circuit Sleeves',
      helm: 'Awakened Concentration',
      aura: 'Cyan Energy Resonance',
    },
  },
  {
    tier: 3,
    minLevel: 5,
    name: 'Thunder Lat Berserker',
    image: '/heroes/bar_hero_tier3.jpg',
    description: 'Explosive bar power with glowing purple bio-runic tattoos and tactical harness.',
    gear: {
      weapon: 'Lightning Fist Wraps',
      armor: 'Tactical Weighted Vest Harness',
      helm: 'Berserker Mind',
      aura: 'Purple Bio-Lightning Arcs',
    },
  },
  {
    tier: 4,
    minLevel: 8,
    name: 'Shadow Flame Master',
    image: '/heroes/bar_hero_tier4.jpg',
    description: 'Awakened monarch physique radiating dark purple shadow flames and tribal runes.',
    gear: {
      weapon: 'Shadow Flame Gauntlets',
      armor: 'Tribal Shadow Flame Inscription',
      helm: 'Shadow Monarch Crown',
      aura: 'Dark Violet Shadow Flames',
    },
  },
  {
    tier: 5,
    minLevel: 16,
    name: 'Celestial God of Discipline',
    image: '/heroes/bar_hero_tier5.jpg',
    description: 'Ascended beyond human limits with celestial halo and cosmic archangel starlight wings.',
    gear: {
      weapon: 'Divine Ascension Palms',
      armor: 'Radiant Celestial Core',
      helm: 'Supernova Halo',
      aura: 'Starlight Archangel Wings',
    },
  },
];

export function getCharacterTier(level: number): CharacterTier {
  let currentTier = CHARACTER_TIERS[0];
  for (const t of CHARACTER_TIERS) {
    if (level >= t.minLevel) {
      currentTier = t;
    }
  }
  return currentTier;
}

export function getNextCharacterTier(level: number): CharacterTier | null {
  for (const t of CHARACTER_TIERS) {
    if (level < t.minLevel) {
      return t;
    }
  }
  return null;
}

export interface HeroStats {
  str: number;
  wis: number;
  vit: number;
  dex: number;
  power: number;
}

export function calculateHeroStats(player: PlayerStats, quests: Quest[]): HeroStats {
  let bodyCount = 0;
  let mindCount = 0;
  let healthCount = 0;
  let workCount = 0;

  for (const q of quests) {
    const completions = q.completedDates.length;
    if (q.category === 'Body') bodyCount += completions;
    else if (q.category === 'Mind' || q.category === 'Learning') mindCount += completions;
    else if (q.category === 'Health') healthCount += completions;
    else workCount += completions;
  }

  const base = Math.floor(player.level * 2);
  const str = 10 + base + bodyCount * 2;
  const wis = 10 + base + mindCount * 2;
  const vit = 10 + base + healthCount * 2;
  const dex = 10 + base + workCount * 2;
  const power = str + wis + vit + dex + player.level * 25 + Math.floor(player.totalXP / 10);

  return { str, wis, vit, dex, power };
}

export function getTitleForLevel(level: number): string {
  let title = 'Novice';
  for (const rank of RANK_TITLES) {
    if (level >= rank.minLevel) title = rank.title;
  }
  return title;
}

export function xpForLevel(level: number): number {
  // Progressive: 100 * level^1.5 roughly
  return Math.floor(100 * Math.pow(level, 1.4));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

export function xpProgress(totalXP: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  let spent = 0;
  for (let i = 1; i < level; i++) {
    spent += xpForLevel(i);
  }
  const current = totalXP - spent;
  const needed = xpForLevel(level);
  return {
    current,
    needed,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  };
}

/**
 * Formats a Date object to YYYY-MM-DD in the user's LOCAL timezone.
 * Using toISOString().slice(0, 10) causes UTC date drift for timezones outside GMT (e.g. IST +5:30).
 */
export function toLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toLocalDateISO(new Date());
}

export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDateISO(d);
}

export interface DailyQuestTemplate {
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
}

export const DAILY_QUEST_POOL: DailyQuestTemplate[] = [
  {
    title: 'Hydration Potion (2L Water)',
    description: 'Replenish your mana by drinking at least 2 liters of water today.',
    difficulty: 'easy',
    category: 'Health',
  },
  {
    title: '15-Minute Mind Meditation',
    description: 'Step away from all screens and sit in stillness to center focus.',
    difficulty: 'easy',
    category: 'Mind',
  },
  {
    title: 'Study 20 Pages of Lore',
    description: 'Read at least 20 pages of a book to expand your knowledge stats.',
    difficulty: 'medium',
    category: 'Learning',
  },
  {
    title: 'Deep Work Sprint (60m)',
    description: 'Enter hyperfocus mode on your highest priority quest with zero distractions.',
    difficulty: 'hard',
    category: 'Work',
  },
  {
    title: 'Physical Conditioning (30m)',
    description: 'Engage in cardio, strength training, or a vigorous outdoor power walk.',
    difficulty: 'medium',
    category: 'Body',
  },
  {
    title: 'Sanctuary Reset (Desk Purge)',
    description: 'Clear and organize your physical workspace and desktop folders for maximum clarity.',
    difficulty: 'easy',
    category: 'Work',
  },
  {
    title: 'Pure Fuel Nutrition',
    description: 'Consume zero processed junk food and eat clean, nourishing meals today.',
    difficulty: 'medium',
    category: 'Health',
  },
  {
    title: 'Gratitude Chronicle',
    description: 'Write down 3 specific things you are genuinely grateful for before sleep.',
    difficulty: 'easy',
    category: 'Mind',
  },
  {
    title: 'Nightly Battle Plan',
    description: 'Review today’s wins and map out your top 3 objectives for tomorrow.',
    difficulty: 'easy',
    category: 'Work',
  },
  {
    title: 'Full Body Mobility Ritual',
    description: 'Complete 10 minutes of hip openers, spinal stretches, and posture reset.',
    difficulty: 'easy',
    category: 'Body',
  },
  {
    title: 'Master a New Concept',
    description: 'Watch a deep-dive tutorial or code a mini-prototype in an unfamiliar domain.',
    difficulty: 'hard',
    category: 'Learning',
  },
  {
    title: 'Heroic 10,000 Steps Expedition',
    description: 'Traverse the realm to hit at least 10,000 steps today.',
    difficulty: 'epic',
    category: 'Body',
  },
  {
    title: 'Digital Sunset Fast',
    description: 'Keep all phone and computer screens off for the last hour before sleep.',
    difficulty: 'medium',
    category: 'Mind',
  },
  {
    title: 'Guild Fellowship Check-In',
    description: 'Reach out to a friend, colleague, or family member to check in and uplift them.',
    difficulty: 'easy',
    category: 'Social',
  },
  {
    title: 'Creative Spark Session (25m)',
    description: 'Write, design, sketch, or create for at least 25 uninterrupted minutes.',
    difficulty: 'medium',
    category: 'Creative',
  },
  {
    title: 'Iron Core Discipline Challenge',
    description: 'Perform 100 pushups or 3 minutes of total planks throughout the day.',
    difficulty: 'hard',
    category: 'Body',
  },
];

export function pickRandomDailyQuests(
  count: number,
  existingTitles: string[]
): Quest[] {
  const existingSet = new Set(existingTitles.map((t) => t.toLowerCase().trim()));
  const available = DAILY_QUEST_POOL.filter(
    (item) => !existingSet.has(item.title.toLowerCase().trim())
  );

  const pool = (available.length >= count ? available : DAILY_QUEST_POOL)
    .slice()
    .sort(() => Math.random() - 0.5);

  const selected = pool.slice(0, count);
  const today = todayISO();

  return selected.map((template) => ({
    id: 'daily-' + crypto.randomUUID(),
    title: template.title,
    description: template.description,
    difficulty: template.difficulty,
    category: template.category,
    completedDates: [],
    createdAt: today,
    streak: 0,
    bestStreak: 0,
    isDaily: true,
    isRecurring: false,
  }));
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
  };
}

// ===== DIET & MACRO TRACKING TYPES =====
export type DietPreference = 'veg' | 'non-veg';
export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'maintenance';
export type MealCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MacroNutrients {
  calories: number; // kcal
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
}

export interface MealItem {
  id: string;
  name: string;
  category: MealCategory;
  dietType: DietPreference;
  portion: string;
  macros: MacroNutrients;
  ingredients: string[];
  description: string;
}

export interface DailyMealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  snack: MealItem;
  dinner: MealItem;
}

export interface ConsumedFoodItem {
  id: string;
  name: string;
  category: MealCategory | 'custom';
  portion?: string;
  macros: MacroNutrients;
  loggedAt: string;
  fromPlanMealId?: string;
}

export interface NutritionState {
  dietPreference: DietPreference;
  fitnessGoal: FitnessGoal;
  targetMacros: MacroNutrients;
  targetWaterMl: number;
  consumedWaterMl: number;
  activePlan: DailyMealPlan;
  eatenMealIds: string[];
  customFoods: ConsumedFoodItem[];
  planDate: string;
  proteinGoalAchievedDates: string[];
}

export function getDefaultMacros(goal: FitnessGoal): MacroNutrients {
  switch (goal) {
    case 'muscle_gain':
      return { calories: 2500, protein: 165, carbs: 280, fat: 80 };
    case 'fat_loss':
      return { calories: 1950, protein: 170, carbs: 160, fat: 60 };
    case 'maintenance':
    default:
      return { calories: 2250, protein: 150, carbs: 240, fat: 70 };
  }
}

export function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

