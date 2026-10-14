import { useState, useEffect, useCallback } from 'react';
import type { AppData, Quest, Difficulty, PlayerStats } from '../types';
import {
  DIFFICULTY_XP,
  getLevelFromXP,
  getTitleForLevel,
  todayISO,
  yesterdayISO,
  pickRandomDailyQuests,
} from '../types';

const STORAGE_KEY = 'habit-rpg-v1';

const DEFAULT_DATA: AppData = {
  quests: [
    {
      id: 'q1',
      title: 'Morning Meditation',
      description: 'Sit in silence for 10 minutes and center your mind.',
      difficulty: 'easy',
      category: 'Mind',
      completedDates: [],
      createdAt: todayISO(),
      streak: 0,
      bestStreak: 0,
      isDaily: false,
      isRecurring: true,
    },
    {
      id: 'q2',
      title: 'Deep Work Session',
      description: 'Focus on your most important task for 90 minutes.',
      difficulty: 'hard',
      category: 'Work',
      completedDates: [],
      createdAt: todayISO(),
      streak: 0,
      bestStreak: 0,
      isDaily: false,
      isRecurring: true,
    },
    {
      id: 'q3',
      title: 'Strength Training',
      description: 'Complete your workout routine.',
      difficulty: 'medium',
      category: 'Body',
      completedDates: [],
      createdAt: todayISO(),
      streak: 0,
      bestStreak: 0,
      isDaily: false,
      isRecurring: true,
    },
    {
      id: 'daily-q1',
      title: 'Hydration Potion (2L Water)',
      description: 'Replenish your mana by drinking at least 2 liters of pure water today.',
      difficulty: 'easy',
      category: 'Health',
      completedDates: [],
      createdAt: todayISO(),
      streak: 0,
      bestStreak: 0,
      isDaily: true,
      isRecurring: false,
    },
    {
      id: 'daily-q2',
      title: 'Study 20 Pages of Lore',
      description: 'Read at least 20 pages of a book to expand your knowledge stats.',
      difficulty: 'medium',
      category: 'Learning',
      completedDates: [],
      createdAt: todayISO(),
      streak: 0,
      bestStreak: 0,
      isDaily: true,
      isRecurring: false,
    },
  ],
  player: {
    totalXP: 0,
    level: 1,
    title: 'Novice',
    lastActiveDate: todayISO(),
  },
  settings: {
    autoDailyQuests: true,
    dailyQuestCount: 2,
  },
  lastDailyDate: todayISO(),
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      if (parsed && Array.isArray(parsed.quests) && parsed.player) {
        // Recalculate level/title on load
        parsed.player.level = getLevelFromXP(parsed.player.totalXP || 0);
        parsed.player.title = getTitleForLevel(parsed.player.level);

        const settings = {
          autoDailyQuests: parsed.settings?.autoDailyQuests ?? true,
          dailyQuestCount: parsed.settings?.dailyQuestCount ?? 2,
        };

        const today = todayISO();
        const yesterday = yesterdayISO();
        const lastDailyDate =
          parsed.lastDailyDate || parsed.player.lastActiveDate || today;

        let quests: Quest[] = parsed.quests.map((q) => ({
          ...q,
          isDaily: q.isDaily ?? false,
          isRecurring: q.isRecurring ?? true,
        }));

        // Reset streak on rollover if user missed yesterday
        if (lastDailyDate !== today) {
          quests = quests.map((q) => {
            const completedYesterday = q.completedDates.includes(yesterday);
            const completedToday = q.completedDates.includes(today);
            return {
              ...q,
              streak: completedToday || completedYesterday ? q.streak : 0,
            };
          });
        }

        // Auto-generate today's daily bounties if none exist yet and autoDaily is enabled
        const dailyForToday = quests.filter((q) => q.isDaily && q.createdAt === today);
        if (settings.autoDailyQuests && dailyForToday.length === 0) {
          const freshDailies = pickRandomDailyQuests(
            settings.dailyQuestCount,
            quests.map((q) => q.title)
          );
          quests = [...quests, ...freshDailies];
        }

        return {
          quests,
          player: parsed.player as PlayerStats,
          settings,
          lastDailyDate: today,
        };
      }
    }
  } catch {
    // ignore
  }
  return structuredClone(DEFAULT_DATA);
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useGame() {
  const [data, setData] = useState<AppData>(loadData);
  const [justLeveled, setJustLeveled] = useState(false);
  const [dailyNotice, setDailyNotice] = useState<string | null>(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Daily upkeep: checks for new day, resets broken streaks, auto-generates fresh daily bounties
  const performDailyUpkeep = useCallback((forceRoll: boolean = false) => {
    const today = todayISO();
    const yesterday = yesterdayISO();

    setData((prev) => {
      const isNewDay = prev.lastDailyDate !== today;
      const existingDailyToday = prev.quests.filter(
        (q) => q.isDaily && q.createdAt === today
      );
      const shouldGenerateDailies =
        prev.settings.autoDailyQuests && existingDailyToday.length === 0;

      if (!isNewDay && !forceRoll && !shouldGenerateDailies) {
        return prev;
      }

      // 1. Recalculate active streaks on rollover
      // If a quest wasn't completed today or yesterday, active streak drops to 0 (bestStreak preserved)
      const updatedQuests = prev.quests.map((q) => {
        const completedYesterday = q.completedDates.includes(yesterday);
        const completedToday = q.completedDates.includes(today);
        let currentStreak = q.streak;
        if (!completedToday && !completedYesterday) {
          currentStreak = 0;
        }
        return {
          ...q,
          streak: currentStreak,
        };
      });

      // 2. Automated daily quests injection
      let finalQuests = updatedQuests;
      let addedCount = 0;

      if (prev.settings.autoDailyQuests || forceRoll) {
        // Daily bounties active today
        const existingDailyToday = updatedQuests.filter(
          (q) => q.isDaily && q.createdAt === today
        );

        const needed = forceRoll
          ? prev.settings.dailyQuestCount
          : Math.max(0, prev.settings.dailyQuestCount - existingDailyToday.length);

        if (needed > 0) {
          const newDailies = pickRandomDailyQuests(
            needed,
            finalQuests.map((q) => q.title)
          );
          finalQuests = [...finalQuests, ...newDailies];
          addedCount = newDailies.length;
        }
      }

      if (isNewDay || addedCount > 0) {
        setDailyNotice(
          addedCount > 0
            ? `🌅 A new day has dawned! ${addedCount} fresh daily bounty quest${addedCount > 1 ? 's' : ''} added automatically.`
            : `🌅 A new day has dawned! Your quest board and habits have updated for today.`
        );
      }

      return {
        ...prev,
        quests: finalQuests,
        lastDailyDate: today,
        player: {
          ...prev.player,
          lastActiveDate: today,
        },
      };
    });
  }, []);

  // Run periodic daily upkeep and check on visibility change
  useEffect(() => {
    const interval = setInterval(() => {
      performDailyUpkeep(false);
    }, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performDailyUpkeep(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [performDailyUpkeep]);

  const addQuest = useCallback(
    (
      title: string,
      description: string,
      difficulty: Difficulty,
      category: string,
      isDaily: boolean = false,
      isRecurring: boolean = true
    ) => {
      const newQuest: Quest = {
        id: crypto.randomUUID(),
        title,
        description,
        difficulty,
        category,
        completedDates: [],
        createdAt: todayISO(),
        streak: 0,
        bestStreak: 0,
        isDaily,
        isRecurring,
      };
      setData((prev) => ({
        ...prev,
        quests: [...prev.quests, newQuest],
      }));
    },
    []
  );

  const rollDailyQuests = useCallback((count?: number) => {
    setData((prev) => {
      const numToPick = count ?? prev.settings.dailyQuestCount;
      const newDailies = pickRandomDailyQuests(
        numToPick,
        prev.quests.map((q) => q.title)
      );
      setDailyNotice(`⚔️ Summoned ${newDailies.length} fresh daily bounties!`);
      return {
        ...prev,
        quests: [...prev.quests, ...newDailies],
      };
    });
  }, []);

  const toggleAutoDaily = useCallback(() => {
    setData((prev) => {
      const nextState = !prev.settings.autoDailyQuests;
      setDailyNotice(
        nextState
          ? '⚡ Auto-Daily Quests enabled: Fresh daily bounties will be added every morning.'
          : '💤 Auto-Daily Quests paused.'
      );
      return {
        ...prev,
        settings: {
          ...prev.settings,
          autoDailyQuests: nextState,
        },
      };
    });
  }, []);

  const setDailyQuestCount = useCallback((count: number) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        dailyQuestCount: Math.max(1, Math.min(5, count)),
      },
    }));
  }, []);

  const clearCompletedDailyQuests = useCallback(() => {
    const today = todayISO();
    setData((prev) => ({
      ...prev,
      quests: prev.quests.filter(
        (q) => !(q.isDaily && q.completedDates.includes(today))
      ),
    }));
  }, []);

  const dismissDailyNotice = useCallback(() => {
    setDailyNotice(null);
  }, []);

  const deleteQuest = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      quests: prev.quests.filter((q) => q.id !== id),
    }));
  }, []);

  const completeQuest = useCallback((id: string) => {
    const today = todayISO();
    setData((prev) => {
      const quest = prev.quests.find((q) => q.id === id);
      if (!quest || quest.completedDates.includes(today)) {
        return prev;
      }

      const yesterday = yesterdayISO();
      const wasYesterday = quest.completedDates.includes(yesterday);
      const prevStreak = quest.streak;
      const newStreak = wasYesterday ? prevStreak + 1 : 1;
      const bestStreak = Math.max(quest.bestStreak, newStreak);

      const quests = prev.quests.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          completedDates: [...q.completedDates, today],
          streak: newStreak,
          bestStreak,
        };
      });

      const baseXP = DIFFICULTY_XP[quest.difficulty];
      const streakBonus = Math.min(prevStreak * 0.1, 1);
      const earnedXP = Math.round(baseXP * (1 + streakBonus));

      const newTotalXP = prev.player.totalXP + earnedXP;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > prev.player.level;

      if (leveledUp) {
        setTimeout(() => {
          setJustLeveled(true);
          setTimeout(() => setJustLeveled(false), 3500);
        }, 0);
      }

      return {
        quests,
        player: {
          totalXP: newTotalXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          lastActiveDate: today,
        },
        settings: prev.settings,
        lastDailyDate: prev.lastDailyDate,
      };
    });
  }, []);

  const uncompleteQuest = useCallback((id: string) => {
    const today = todayISO();
    setData((prev) => {
      const quest = prev.quests.find((q) => q.id === id);
      if (!quest || !quest.completedDates.includes(today)) return prev;

      const baseXP = DIFFICULTY_XP[quest.difficulty];
      const earnedXP = baseXP;

      const quests = prev.quests.map((q) => {
        if (q.id !== id) return q;
        const dates = q.completedDates.filter((d) => d !== today);
        let streak = 0;
        if (dates.length > 0) {
          const sorted = [...dates].sort().reverse();
          streak = 1;
          for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diff = (prevDate.getTime() - curr.getTime()) / 86400000;
            if (diff === 1) streak++;
            else break;
          }
        }
        return { ...q, completedDates: dates, streak };
      });

      const newTotalXP = Math.max(0, prev.player.totalXP - earnedXP);
      const newLevel = getLevelFromXP(newTotalXP);

      return {
        quests,
        player: {
          totalXP: newTotalXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          lastActiveDate: prev.player.lastActiveDate,
        },
        settings: prev.settings,
        lastDailyDate: prev.lastDailyDate,
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    if (confirm('Reset all progress and quests? This cannot be undone.')) {
      const fresh = structuredClone(DEFAULT_DATA);
      setData(fresh);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const rewardDirectXP = useCallback((amount: number, reason?: string) => {
    const today = todayISO();
    setData((prev) => {
      const newTotalXP = prev.player.totalXP + amount;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > prev.player.level;

      if (leveledUp) {
        setTimeout(() => {
          setJustLeveled(true);
          setTimeout(() => setJustLeveled(false), 3500);
        }, 0);
      }

      if (reason) {
        setDailyNotice(reason);
      }

      return {
        ...prev,
        player: {
          totalXP: newTotalXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          lastActiveDate: today,
        },
      };
    });
  }, []);

  const replaceData = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  return {
    appData: data,
    quests: data.quests,
    player: data.player,
    settings: data.settings,
    lastDailyDate: data.lastDailyDate,
    dailyNotice,
    dismissDailyNotice,
    addQuest,
    deleteQuest,
    completeQuest,
    uncompleteQuest,
    rewardDirectXP,
    resetAll,
    replaceData,
    justLeveled,
    rollDailyQuests,
    toggleAutoDaily,
    setDailyQuestCount,
    clearCompletedDailyQuests,
    performDailyUpkeep,
  };
}
