import { useState, useEffect, useCallback } from 'react';
import type {
  NutritionState,
  DietPreference,
  FitnessGoal,
  MacroNutrients,
  MealCategory,
  MealItem,
  ConsumedFoodItem,
} from '../types';
import { getDefaultMacros, todayISO, formatCurrentTime } from '../types';
import { generateDailyMealPlan, pickRandomMeal } from '../data/mealPool';

const NUTRITION_STORAGE_KEY = 'habit-rpg-nutrition-v1';

function createInitialState(): NutritionState {
  const initialPref: DietPreference = 'non-veg';
  const initialGoal: FitnessGoal = 'muscle_gain';
  return {
    dietPreference: initialPref,
    fitnessGoal: initialGoal,
    targetMacros: getDefaultMacros(initialGoal),
    targetWaterMl: 3000,
    consumedWaterMl: 750,
    activePlan: generateDailyMealPlan(initialPref),
    eatenMealIds: [],
    customFoods: [],
    planDate: todayISO(),
    proteinGoalAchievedDates: [],
  };
}

function loadNutritionState(): NutritionState {
  try {
    const raw = localStorage.getItem(NUTRITION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NutritionState;
      if (parsed && parsed.activePlan && parsed.targetMacros) {
        // Daily rollover check
        const today = todayISO();
        if (parsed.planDate !== today) {
          return {
            ...parsed,
            planDate: today,
            consumedWaterMl: 0,
            eatenMealIds: [],
            customFoods: [],
            activePlan: generateDailyMealPlan(parsed.dietPreference || 'non-veg'),
          };
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load nutrition state:', err);
  }
  return createInitialState();
}

export function useNutrition(onRewardXP?: (xp: number, reason: string) => void) {
  const [state, setState] = useState<NutritionState>(loadNutritionState);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save nutrition state:', err);
    }
  }, [state]);

  // Compute total consumed macros from checked plan meals + custom logged items
  const consumedMacros: MacroNutrients = state.activePlan
    ? (() => {
        const planMeals = [
          state.activePlan.breakfast,
          state.activePlan.lunch,
          state.activePlan.snack,
          state.activePlan.dinner,
        ];

        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;

        // Sum eaten plan meals
        for (const meal of planMeals) {
          if (state.eatenMealIds.includes(meal.id)) {
            calories += meal.macros.calories;
            protein += meal.macros.protein;
            carbs += meal.macros.carbs;
            fat += meal.macros.fat;
          }
        }

        // Sum custom logged foods
        for (const item of state.customFoods) {
          calories += item.macros.calories;
          protein += item.macros.protein;
          carbs += item.macros.carbs;
          fat += item.macros.fat;
        }

        return { calories, protein, carbs, fat };
      })()
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Helper to check and grant protein bonus
  const evaluateProteinBonus = useCallback((st: NutritionState): NutritionState => {
    const today = todayISO();
    if (st.proteinGoalAchievedDates.includes(today) || st.targetMacros.protein <= 0) {
      return st;
    }

    let totalPro = 0;
    const { breakfast, lunch, snack, dinner } = st.activePlan;
    for (const m of [breakfast, lunch, snack, dinner]) {
      if (m && st.eatenMealIds.includes(m.id)) {
        totalPro += m.macros.protein;
      }
    }
    for (const item of st.customFoods) {
      totalPro += item.macros.protein;
    }

    if (totalPro >= st.targetMacros.protein) {
      if (onRewardXP) {
        onRewardXP(50, '🥩 Daily Protein Target Achieved! Anabolic discipline rewarded!');
      }
      return {
        ...st,
        proteinGoalAchievedDates: [...st.proteinGoalAchievedDates, today],
      };
    }
    return st;
  }, [onRewardXP]);

  // Actions
  const setDietPreference = useCallback((pref: DietPreference) => {
    setState((prev) => ({
      ...prev,
      dietPreference: pref,
      activePlan: generateDailyMealPlan(pref),
      eatenMealIds: [], // reset plan meal checks on diet switch
    }));
  }, []);

  const setFitnessGoal = useCallback((goal: FitnessGoal) => {
    setState((prev) => {
      const macros = getDefaultMacros(goal);
      return {
        ...prev,
        fitnessGoal: goal,
        targetMacros: macros,
      };
    });
  }, []);

  const setTargetMacros = useCallback((macros: MacroNutrients) => {
    setState((prev) => ({ ...prev, targetMacros: macros }));
  }, []);

  const toggleEatPlanMeal = useCallback((meal: MealItem) => {
    setState((prev) => {
      const isEaten = prev.eatenMealIds.includes(meal.id);
      const newEaten = isEaten
        ? prev.eatenMealIds.filter((id) => id !== meal.id)
        : [...prev.eatenMealIds, meal.id];
      return evaluateProteinBonus({ ...prev, eatenMealIds: newEaten });
    });
  }, [evaluateProteinBonus]);

  const shufflePlanMeal = useCallback((category: MealCategory) => {
    setState((prev) => {
      const currentMeal = prev.activePlan[category];
      const newMeal = pickRandomMeal(category, prev.dietPreference, currentMeal?.id);
      // Remove previous from eaten list if present
      const newEaten = prev.eatenMealIds.filter((id) => id !== currentMeal?.id);
      return {
        ...prev,
        activePlan: {
          ...prev.activePlan,
          [category]: newMeal,
        },
        eatenMealIds: newEaten,
      };
    });
  }, []);

  const selectPlanMeal = useCallback((category: MealCategory, meal: MealItem) => {
    setState((prev) => {
      const currentMeal = prev.activePlan[category];
      const newEaten = prev.eatenMealIds.filter((id) => id !== currentMeal?.id);
      return {
        ...prev,
        activePlan: {
          ...prev.activePlan,
          [category]: meal,
        },
        eatenMealIds: newEaten,
      };
    });
  }, []);

  const rollNewDailyPlan = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePlan: generateDailyMealPlan(prev.dietPreference),
      eatenMealIds: [],
    }));
  }, []);

  const logCustomFood = useCallback(
    (name: string, category: MealCategory | 'custom', macros: MacroNutrients, portion?: string) => {
      const newFood: ConsumedFoodItem = {
        id: 'food-' + crypto.randomUUID(),
        name,
        category,
        portion: portion || '1 Serving',
        macros,
        loggedAt: formatCurrentTime(),
      };
      setState((prev) =>
        evaluateProteinBonus({
          ...prev,
          customFoods: [newFood, ...prev.customFoods],
        })
      );
    },
    [evaluateProteinBonus]
  );

  const deleteCustomFood = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customFoods: prev.customFoods.filter((f) => f.id !== id),
    }));
  }, []);

  const addWater = useCallback((ml: number) => {
    setState((prev) => ({
      ...prev,
      consumedWaterMl: Math.max(0, prev.consumedWaterMl + ml),
    }));
  }, []);

  const resetWater = useCallback(() => {
    setState((prev) => ({ ...prev, consumedWaterMl: 0 }));
  }, []);

  const resetTodayLog = useCallback(() => {
    if (confirm('Reset today’s eaten meals, custom food log, and water tracker?')) {
      setState((prev) => ({
        ...prev,
        consumedWaterMl: 0,
        eatenMealIds: [],
        customFoods: [],
      }));
    }
  }, []);

  const replaceNutrition = useCallback((newState: NutritionState) => {
    setState(newState);
    try {
      localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.error('Failed to sync replaced nutrition state:', err);
    }
  }, []);

  return {
    nutrition: state,
    consumedMacros,
    setDietPreference,
    setFitnessGoal,
    setTargetMacros,
    toggleEatPlanMeal,
    shufflePlanMeal,
    selectPlanMeal,
    rollNewDailyPlan,
    logCustomFood,
    deleteCustomFood,
    addWater,
    resetWater,
    resetTodayLog,
    replaceNutrition,
  };
}
