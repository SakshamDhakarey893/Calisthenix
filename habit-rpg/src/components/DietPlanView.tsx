import { useState, useMemo } from 'react';
import type {
  FitnessGoal,
  MealCategory,
  MealItem,
} from '../types';
import { useNutrition } from '../hooks/useNutrition';
import { getMealRecipeGuide, MEAL_POOL } from '../data/mealPool';

interface Props {
  onRewardXP?: (xp: number, reason: string) => void;
  nutritionManager?: ReturnType<typeof useNutrition>;
}

export function DietPlanView({ onRewardXP, nutritionManager }: Props) {
  const internal = useNutrition(onRewardXP);
  const activeManager = nutritionManager || internal;

  const {
    nutrition,
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
  } = activeManager;

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showMacroSettings, setShowMacroSettings] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<MealItem | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [copyToast, setCopyToast] = useState(false);

  // Meal swap & search state
  const [swappingCategory, setSwappingCategory] = useState<MealCategory | null>(null);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [recipeModalQuery, setRecipeModalQuery] = useState('');

  // Water ripple effect state
  const [waterRippleAmount, setWaterRippleAmount] = useState<number | null>(null);
  const [showWaterRipple, setShowWaterRipple] = useState(false);

  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('250');
  const [customProtein, setCustomProtein] = useState('20');
  const [customCarbs, setCustomCarbs] = useState('25');
  const [customFat, setCustomFat] = useState('8');
  const [customCategory, setCustomCategory] = useState<MealCategory | 'custom'>('custom');

  // Custom targets form
  const [editCal, setEditCal] = useState(String(nutrition.targetMacros.calories));
  const [editPro, setEditPro] = useState(String(nutrition.targetMacros.protein));
  const [editCarb, setEditCarb] = useState(String(nutrition.targetMacros.carbs));
  const [editFat, setEditFat] = useState(String(nutrition.targetMacros.fat));

  const handleCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    logCustomFood(
      customName.trim(),
      customCategory,
      {
        calories: Math.max(0, parseInt(customCalories, 10) || 0),
        protein: Math.max(0, parseInt(customProtein, 10) || 0),
        carbs: Math.max(0, parseInt(customCarbs, 10) || 0),
        fat: Math.max(0, parseInt(customFat, 10) || 0),
      }
    );

    setCustomName('');
    setShowCustomModal(false);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetMacros({
      calories: Math.max(500, parseInt(editCal, 10) || 2000),
      protein: Math.max(10, parseInt(editPro, 10) || 120),
      carbs: Math.max(10, parseInt(editCarb, 10) || 200),
      fat: Math.max(5, parseInt(editFat, 10) || 60),
    });
    setShowMacroSettings(false);
  };

  const handleAddWaterWithRipple = (amount: number) => {
    addWater(amount);
    setWaterRippleAmount(amount);
    setShowWaterRipple(true);
    setTimeout(() => setShowWaterRipple(false), 1200);
  };

  const handleCopyGroceryList = (meal: MealItem) => {
    const guide = getMealRecipeGuide(meal);
    const text = [
      `🛒 Calisthenix Nutrition - ${meal.name}`,
      `Portion: ${meal.portion}`,
      `Category: ${meal.category.toUpperCase()} (${meal.dietType.toUpperCase()})`,
      `Macros: ${meal.macros.calories} kcal | ${meal.macros.protein}g Protein | ${meal.macros.carbs}g Carbs | ${meal.macros.fat}g Fat`,
      '',
      'Ingredients Checklist:',
      ...meal.ingredients.map((ing) => `- [ ] ${ing}`),
      '',
      `Chef Athletic Tip: ${guide.chefTip}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const mealsList: { key: MealCategory; label: string; icon: string; item: MealItem }[] = [
    { key: 'breakfast', label: 'Breakfast / Morning Fuel', icon: '🌅', item: nutrition.activePlan.breakfast },
    { key: 'lunch', label: 'Lunch / Midday Power', icon: '☀️', item: nutrition.activePlan.lunch },
    { key: 'snack', label: 'Pre/Post Workout Snack', icon: '⚡', item: nutrition.activePlan.snack },
    { key: 'dinner', label: 'Dinner / Night Recovery', icon: '🌙', item: nutrition.activePlan.dinner },
  ];

  const proteinPercent = Math.min(100, Math.round((consumedMacros.protein / (nutrition.targetMacros.protein || 1)) * 100));
  const calPercent = Math.min(100, Math.round((consumedMacros.calories / (nutrition.targetMacros.calories || 1)) * 100));
  const carbPercent = Math.min(100, Math.round((consumedMacros.carbs / (nutrition.targetMacros.carbs || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((consumedMacros.fat / (nutrition.targetMacros.fat || 1)) * 100));

  const waterPercent = Math.min(100, Math.round((nutrition.consumedWaterMl / (nutrition.targetWaterMl || 1)) * 100));

  // Filtered swap meals by diet preference and keyword (name or ingredients)
  const availableSwapMeals = useMemo(() => {
    if (!swappingCategory) return [];
    const query = mealSearchQuery.trim().toLowerCase();
    return MEAL_POOL.filter((meal) => {
      const matchesDiet = meal.dietType === nutrition.dietPreference;
      const matchesCategory = meal.category === swappingCategory;
      if (!matchesDiet || !matchesCategory) return false;
      if (!query) return true;
      const matchesName = meal.name.toLowerCase().includes(query);
      const matchesIng = meal.ingredients.some((ing) => ing.toLowerCase().includes(query));
      return matchesName || matchesIng;
    });
  }, [swappingCategory, mealSearchQuery, nutrition.dietPreference]);

  // Quick recipe switcher in recipe modal
  const recipeModalMatches = useMemo(() => {
    const q = recipeModalQuery.trim().toLowerCase();
    if (!q) return [];
    return MEAL_POOL.filter(
      (m) =>
        m.dietType === nutrition.dietPreference &&
        (m.name.toLowerCase().includes(q) || m.ingredients.some((i) => i.toLowerCase().includes(q)))
    );
  }, [recipeModalQuery, nutrition.dietPreference]);

  return (
    <div className="diet-nutrition-view">
      {/* Top Banner & Dietary Preference Selector */}
      <section className="diet-header-card">
        <div className="diet-title-row">
          <div>
            <div className="diet-badge-tag">🥗 ALCHEMICAL FUEL SYSTEM</div>
            <h2 className="diet-main-title">Daily Nutrition &amp; Macro Lab</h2>
            <p className="diet-subtitle">
              Discipline starts with what fuels your body. Track your protein, carbs, fats, and hydration daily.
            </p>
          </div>

          <div className="diet-pref-toggle" role="group" aria-label="Dietary preference toggle">
            <button
              type="button"
              className={`diet-toggle-btn veg ${nutrition.dietPreference === 'veg' ? 'active' : ''}`}
              onClick={() => setDietPreference('veg')}
              title="Switch to 100% Vegetarian high-protein nutrition plan"
            >
              <span className="pref-icon">🌱</span>
              <span className="pref-label">Vegetarian</span>
            </button>

            <button
              type="button"
              className={`diet-toggle-btn non-veg ${nutrition.dietPreference === 'non-veg' ? 'active' : ''}`}
              onClick={() => setDietPreference('non-veg')}
              title="Switch to High-Protein Non-Vegetarian nutrition plan"
            >
              <span className="pref-icon">🍗</span>
              <span className="pref-label">Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Goal Selector Chips */}
        <div className="goal-selector-bar">
          <span className="goal-bar-label">Current Fitness Goal:</span>
          <div className="goal-chips">
            {(
              [
                { id: 'muscle_gain', label: '💪 Muscle Building / Bulk', sub: 'High protein + moderate surplus' },
                { id: 'fat_loss', label: '🔥 Fat Loss / Shred', sub: 'High protein + caloric deficit' },
                { id: 'maintenance', label: '🛡️ Athletic Performance', sub: 'Balanced calisthenics maintenance' },
              ] as { id: FitnessGoal; label: string; sub: string }[]
            ).map((g) => (
              <button
                key={g.id}
                type="button"
                className={`goal-chip ${nutrition.fitnessGoal === g.id ? 'active' : ''}`}
                onClick={() => setFitnessGoal(g.id)}
                title={g.sub}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-action edit-targets-btn"
            onClick={() => setShowMacroSettings(!showMacroSettings)}
          >
            ⚙️ {showMacroSettings ? 'Close Targets' : 'Custom Macro Targets'}
          </button>
        </div>

        {/* Custom Targets Editor Drawer */}
        {showMacroSettings && (
          <form className="custom-targets-drawer" onSubmit={handleSaveTargets}>
            <div className="targets-grid">
              <label>
                <span>Target Calories (kcal)</span>
                <input
                  type="number"
                  value={editCal}
                  onChange={(e) => setEditCal(e.target.value)}
                  min="800"
                  max="6000"
                  required
                />
              </label>

              <label>
                <span>Protein Goal (g)</span>
                <input
                  type="number"
                  value={editPro}
                  onChange={(e) => setEditPro(e.target.value)}
                  min="20"
                  max="400"
                  required
                />
              </label>

              <label>
                <span>Carbohydrates (g)</span>
                <input
                  type="number"
                  value={editCarb}
                  onChange={(e) => setEditCarb(e.target.value)}
                  min="10"
                  max="700"
                  required
                />
              </label>

              <label>
                <span>Healthy Fats (g)</span>
                <input
                  type="number"
                  value={editFat}
                  onChange={(e) => setEditFat(e.target.value)}
                  min="10"
                  max="250"
                  required
                />
              </label>
            </div>
            <div className="targets-actions">
              <button type="submit" className="btn-primary">
                Save Custom Macro Targets
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Live Macro Gauges Dashboard with Goal Celebration Pulses */}
      <section className="macro-dashboard-grid">
        {/* Calories Card */}
        <div className={`macro-card calories-card ${calPercent >= 100 ? 'goal-celebrate' : ''}`}>
          <div className="macro-card-header">
            <span className="macro-icon">🔥</span>
            <span className="macro-title">Calories</span>
            <span className="macro-percent">{calPercent}%</span>
          </div>
          <div className="macro-numbers">
            <span className="current-val">{consumedMacros.calories.toLocaleString()}</span>
            <span className="target-val">/ {nutrition.targetMacros.calories.toLocaleString()} kcal</span>
          </div>
          <div className="macro-progress-track">
            <div className="macro-progress-fill cal-fill" style={{ width: `${calPercent}%` }} />
          </div>
          <span className="macro-remaining">
            {calPercent >= 100
              ? '✨ Daily Energy Target Met!'
              : `${Math.max(0, nutrition.targetMacros.calories - consumedMacros.calories)} kcal remaining`}
          </span>
        </div>

        {/* Protein Card (Hero Priority with Celebration Glow) */}
        <div className={`macro-card protein-card highlight ${proteinPercent >= 100 ? 'goal-celebrate' : ''}`}>
          <div className="macro-card-header">
            <span className="macro-icon">🥩</span>
            <span className="macro-title">Protein (Hero Stat)</span>
            <span className="macro-percent">{proteinPercent}%</span>
          </div>
          <div className="macro-numbers">
            <span className="current-val highlight-blue">{consumedMacros.protein}g</span>
            <span className="target-val">/ {nutrition.targetMacros.protein}g</span>
          </div>
          <div className="macro-progress-track">
            <div className="macro-progress-fill pro-fill" style={{ width: `${proteinPercent}%` }} />
          </div>
          <div className="macro-bonus-badge">
            {proteinPercent >= 100
              ? '👑 PROTEIN TARGET CONQUERED! (+50 XP Claimed)'
              : `${nutrition.targetMacros.protein - consumedMacros.protein}g needed for +50 XP bonus`}
          </div>
        </div>

        {/* Carbs Card */}
        <div className={`macro-card carbs-card ${carbPercent >= 100 ? 'goal-celebrate' : ''}`}>
          <div className="macro-card-header">
            <span className="macro-icon">🍚</span>
            <span className="macro-title">Carbohydrates</span>
            <span className="macro-percent">{carbPercent}%</span>
          </div>
          <div className="macro-numbers">
            <span className="current-val">{consumedMacros.carbs}g</span>
            <span className="target-val">/ {nutrition.targetMacros.carbs}g</span>
          </div>
          <div className="macro-progress-track">
            <div className="macro-progress-fill carb-fill" style={{ width: `${carbPercent}%` }} />
          </div>
          <span className="macro-remaining">
            {carbPercent >= 100 ? '⚡ Glycogen Stores Replenished' : `${Math.max(0, nutrition.targetMacros.carbs - consumedMacros.carbs)}g remaining`}
          </span>
        </div>

        {/* Fat Card */}
        <div className={`macro-card fat-card ${fatPercent >= 100 ? 'goal-celebrate' : ''}`}>
          <div className="macro-card-header">
            <span className="macro-icon">🥑</span>
            <span className="macro-title">Fats</span>
            <span className="macro-percent">{fatPercent}%</span>
          </div>
          <div className="macro-numbers">
            <span className="current-val">{consumedMacros.fat}g</span>
            <span className="target-val">/ {nutrition.targetMacros.fat}g</span>
          </div>
          <div className="macro-progress-track">
            <div className="macro-progress-fill fat-fill" style={{ width: `${fatPercent}%` }} />
          </div>
          <span className="macro-remaining">
            {fatPercent >= 100 ? '🛡️ Hormone Health Optimized' : `${Math.max(0, nutrition.targetMacros.fat - consumedMacros.fat)}g remaining`}
          </span>
        </div>
      </section>

      {/* Hydration Tracker Station with Fluid Wave Ripple & Goal Glow */}
      <section className={`hydration-station-card ${waterPercent >= 100 ? 'goal-celebrate' : ''} ${showWaterRipple ? 'water-ripple-active' : ''}`}>
        {showWaterRipple && (
          <div className="water-floating-pop" aria-live="polite">
            +{waterRippleAmount}ml 💧 Vitality Up!
          </div>
        )}

        <div className="hydration-info">
          <div className="hydration-header">
            <span className="water-drop-icon">💧</span>
            <div>
              <h3 className="hydration-title">Hydration Station (Vitality Buff)</h3>
              <p className="hydration-sub">
                Drinking adequate water boosts energy, digestion, and muscular contraction speed.
              </p>
            </div>
          </div>
          <div className="hydration-stats">
            <span className="water-current">{(nutrition.consumedWaterMl / 1000).toFixed(2)}L</span>
            <span className="water-target">/ {(nutrition.targetWaterMl / 1000).toFixed(1)}L Goal</span>
            <span className="water-percentage">({waterPercent}%)</span>
          </div>
        </div>

        <div className="hydration-progress-track">
          <div
            className={`hydration-progress-bar ${showWaterRipple ? 'bar-wave' : ''}`}
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        <div className="hydration-actions">
          <button type="button" className="btn-action water-btn" onClick={() => handleAddWaterWithRipple(250)}>
            +250 ml (Cup)
          </button>
          <button type="button" className="btn-action water-btn" onClick={() => handleAddWaterWithRipple(500)}>
            +500 ml (Bottle)
          </button>
          <button type="button" className="btn-action water-btn" onClick={() => handleAddWaterWithRipple(1000)}>
            +1.0 L (Shaker)
          </button>
          <button type="button" className="btn-action water-reset-btn" onClick={resetWater} title="Reset today's water">
            ↺ Reset
          </button>
        </div>
      </section>

      {/* Daily Curated Meal Plan Section */}
      <section className="diet-plan-section">
        <div className="diet-section-header">
          <div>
            <div className="plan-tag">
              {nutrition.dietPreference === 'veg' ? '🌱 100% VEGETARIAN MENU' : '🍗 HIGH-PROTEIN NON-VEG MENU'}
            </div>
            <h3 className="plan-title">Today's Alchemical Meal Plan</h3>
          </div>

          <div className="plan-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={rollNewDailyPlan}
              title="Generate 4 fresh random meals for the day"
            >
              🎲 Roll New Plan
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowCustomModal(true)}
              title="Log snacks, drinks or custom foods"
            >
              + Log Food / Snack
            </button>
          </div>
        </div>

        <div className="meals-grid">
          {mealsList.map(({ key, label, icon, item }) => {
            const isEaten = nutrition.eatenMealIds.includes(item.id);

            return (
              <article key={key} className={`meal-card ${isEaten ? 'eaten' : ''}`}>
                <div className="meal-card-header">
                  <span className="meal-cat-badge">
                    <span className="meal-cat-icon">{icon}</span> {label}
                  </span>
                  <div className="meal-card-top-actions">
                    <button
                      type="button"
                      className="btn-search-swap-mini"
                      onClick={() => {
                        setSwappingCategory(key);
                        setMealSearchQuery('');
                      }}
                      title="Search & swap this meal with another option"
                    >
                      🔍 Swap
                    </button>
                    <button
                      type="button"
                      className="shuffle-meal-btn"
                      onClick={() => shufflePlanMeal(key)}
                      title="Pick a random alternative for this slot"
                    >
                      🔀
                    </button>
                  </div>
                </div>

                <h4 className="meal-name">{item.name}</h4>
                <div className="meal-portion">Portion: {item.portion}</div>

                {/* Macro Badges Row */}
                <div className="meal-macros-row">
                  <span className="macro-chip cal">{item.macros.calories} kcal</span>
                  <span className="macro-chip pro">{item.macros.protein}g Protein</span>
                  <span className="macro-chip carb">{item.macros.carbs}g Carbs</span>
                  <span className="macro-chip fat">{item.macros.fat}g Fat</span>
                </div>

                {/* Ingredients Pill Tags */}
                <div className="ingredients-box">
                  <span className="ing-label">Key Ingredients:</span>
                  <div className="ing-pills">
                    {item.ingredients.map((ing) => (
                      <span key={ing} className="ing-pill">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="meal-desc">{item.description}</p>

                {/* Action Buttons */}
                <div className="meal-card-footer">
                  <button
                    type="button"
                    className="recipe-guide-btn"
                    onClick={() => {
                      setSelectedRecipe(item);
                      setCheckedIngredients({});
                      setRecipeModalQuery('');
                    }}
                    title="View cooking guide & copy grocery list"
                  >
                    📖 Recipe &amp; Prep
                  </button>

                  <button
                    type="button"
                    className={`eat-meal-btn ${isEaten ? 'eaten' : ''}`}
                    onClick={() => toggleEatPlanMeal(item)}
                  >
                    {isEaten ? '✓ Eaten — Undo' : '🍴 Mark As Eaten'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Today's Food Diary & Custom Logs */}
      {nutrition.customFoods.length > 0 && (
        <section className="food-diary-section">
          <div className="diary-header">
            <h3>Custom Logged Foods ({nutrition.customFoods.length})</h3>
            <button type="button" className="btn-ghost" onClick={resetTodayLog}>
              Reset Day Log
            </button>
          </div>

          <div className="custom-foods-list">
            {nutrition.customFoods.map((f) => (
              <div key={f.id} className="custom-food-row">
                <div className="cf-info">
                  <span className="cf-time">{f.loggedAt}</span>
                  <span className="cf-name">{f.name}</span>
                </div>

                <div className="cf-macros">
                  <span className="cf-macro">{f.macros.calories} kcal</span>
                  <span className="cf-macro highlight-pro">{f.macros.protein}g Pro</span>
                  <span className="cf-macro">{f.macros.carbs}g Carb</span>
                  <span className="cf-macro">{f.macros.fat}g Fat</span>
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteCustomFood(f.id)}
                  title="Remove food"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Meal Swap & Instant Keyword Search Modal */}
      {swappingCategory && (
        <div className="modal-overlay" onClick={() => setSwappingCategory(null)}>
          <div className="modal meal-swap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <span className="recipe-tag">MEAL SELECTOR &amp; SEARCH</span>
                <h3 className="modal-title">Swap {swappingCategory.toUpperCase()}</h3>
              </div>
              <button
                type="button"
                className="delete-btn"
                onClick={() => setSwappingCategory(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="meal-search-bar-row">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="meal-search-input"
                value={mealSearchQuery}
                onChange={(e) => setMealSearchQuery(e.target.value)}
                placeholder='Search meals or ingredients (e.g. "eggs", "chicken", "paneer", "oats")...'
                autoFocus
              />
              {mealSearchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setMealSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="swap-meals-list">
              {availableSwapMeals.length === 0 ? (
                <div className="no-meals-found">
                  <p>No {nutrition.dietPreference} {swappingCategory} options found matching "{mealSearchQuery}".</p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMealSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                availableSwapMeals.map((meal) => {
                  const isCurrent = nutrition.activePlan[swappingCategory]?.id === meal.id;
                  return (
                    <div
                      key={meal.id}
                      className={`swap-meal-item ${isCurrent ? 'is-active-meal' : ''}`}
                    >
                      <div className="swap-meal-info">
                        <div className="swap-meal-top">
                          <span className="swap-meal-name">{meal.name}</span>
                          {isCurrent && <span className="active-pill">ACTIVE SELECTION</span>}
                        </div>
                        <span className="swap-meal-portion">Portion: {meal.portion}</span>
                        <div className="swap-meal-macros">
                          <span className="macro-tag cal">{meal.macros.calories} kcal</span>
                          <span className="macro-tag pro">{meal.macros.protein}g Protein</span>
                          <span className="macro-tag carb">{meal.macros.carbs}g Carbs</span>
                          <span className="macro-tag fat">{meal.macros.fat}g Fat</span>
                        </div>
                        <div className="swap-meal-ings">
                          <strong>Key Ingredients:</strong> {meal.ingredients.join(', ')}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`btn-select-meal ${isCurrent ? 'active' : ''}`}
                        disabled={isCurrent}
                        onClick={() => {
                          selectPlanMeal(swappingCategory, meal);
                          setSwappingCategory(null);
                        }}
                      >
                        {isCurrent ? 'Current Selection' : 'Select This Meal'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Custom Food Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal custom-food-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>+ Log Food or Snack</h3>
              <button
                type="button"
                className="delete-btn"
                onClick={() => setShowCustomModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomFoodSubmit}>
              <label>
                Food / Beverage Name *
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. 1 Scoop Whey Protein, 2 Boiled Eggs"
                  autoFocus
                  required
                />
              </label>

              <label>
                Meal Category
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as MealCategory | 'custom')}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Snack / Post-Workout</option>
                  <option value="dinner">Dinner</option>
                  <option value="custom">Other / Drink</option>
                </select>
              </label>

              <div className="macro-input-grid">
                <label>
                  Calories (kcal)
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    min="0"
                    required
                  />
                </label>

                <label>
                  Protein (g)
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    min="0"
                    required
                  />
                </label>

                <label>
                  Carbs (g)
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    min="0"
                  />
                </label>

                <label>
                  Fat (g)
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    min="0"
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCustomModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Log Food &amp; Add Macros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Athletic Chef Recipe & Prep Modal with Recipe Search Filter */}
      {selectedRecipe && (() => {
        const guide = getMealRecipeGuide(selectedRecipe);
        const isRecipeEaten = nutrition.eatenMealIds.includes(selectedRecipe.id);

        return (
          <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
            <div className="modal recipe-prep-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <div className="recipe-modal-heading">
                  <span className="recipe-tag">ATHLETIC CHEF GUIDE • {selectedRecipe.category.toUpperCase()}</span>
                  <h3 className="recipe-title">{selectedRecipe.name}</h3>
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => setSelectedRecipe(null)}
                  aria-label="Close recipe modal"
                >
                  ✕
                </button>
              </div>

              {copyToast && (
                <div className="recipe-toast-alert">
                  ✅ Grocery checklist copied to clipboard!
                </div>
              )}

              {/* Recipe Search & Switcher */}
              <div className="recipe-search-quick">
                <input
                  type="text"
                  placeholder='🔍 Switch recipe or search (e.g. "eggs", "chicken", "paneer", "oats")...'
                  value={recipeModalQuery}
                  onChange={(e) => setRecipeModalQuery(e.target.value)}
                  className="recipe-switch-input"
                />
                {recipeModalMatches.length > 0 && (
                  <div className="recipe-quick-results">
                    {recipeModalMatches.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`quick-recipe-chip ${selectedRecipe.id === m.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRecipe(m);
                          setRecipeModalQuery('');
                          setCheckedIngredients({});
                        }}
                      >
                        {m.name} ({m.macros.protein}g Pro)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recipe Meta Badges */}
              <div className="recipe-meta-row">
                <span className="recipe-meta-chip">⏱️ Prep: {guide.prepTime}</span>
                <span className="recipe-meta-chip">🔥 Cook: {guide.cookTime}</span>
                <span className="recipe-meta-chip">⚡ {guide.difficulty}</span>
                <span className="recipe-meta-chip">🍽️ {selectedRecipe.portion}</span>
              </div>

              {/* Macros Breakdown */}
              <div className="recipe-macros-bar">
                <div className="macro-stat-box">
                  <span className="box-val">{selectedRecipe.macros.calories}</span>
                  <span className="box-label">Calories</span>
                </div>
                <div className="macro-stat-box highlight-pro">
                  <span className="box-val">{selectedRecipe.macros.protein}g</span>
                  <span className="box-label">Protein</span>
                </div>
                <div className="macro-stat-box">
                  <span className="box-val">{selectedRecipe.macros.carbs}g</span>
                  <span className="box-label">Carbs</span>
                </div>
                <div className="macro-stat-box">
                  <span className="box-val">{selectedRecipe.macros.fat}g</span>
                  <span className="box-label">Fats</span>
                </div>
              </div>

              {/* Chef Athletic Insight */}
              <div className="chef-tip-banner">
                <span className="chef-icon">👨‍🍳</span>
                <p>
                  <strong>Athletic Chef Secret:</strong> {guide.chefTip}
                </p>
              </div>

              {/* Ingredients Checklist */}
              <div className="recipe-section">
                <div className="recipe-section-title-row">
                  <h4>Ingredients Checklist</h4>
                  <button
                    type="button"
                    className="copy-grocery-btn"
                    onClick={() => handleCopyGroceryList(selectedRecipe)}
                    title="Copy grocery checklist with macros"
                  >
                    📋 Copy Grocery List
                  </button>
                </div>
                <p className="recipe-subhint">Tap ingredients as you shop or prep your kitchen:</p>
                <div className="ingredients-checklist">
                  {selectedRecipe.ingredients.map((ing) => {
                    const isChecked = !!checkedIngredients[ing];
                    return (
                      <label key={ing} className={`check-item ${isChecked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setCheckedIngredients((prev) => ({
                              ...prev,
                              [ing]: !prev[ing],
                            }))
                          }
                        />
                        <span className="check-text">{ing}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="recipe-section">
                <h4>Step-by-Step Culinary Preparation</h4>
                <ol className="recipe-steps-list">
                  {(guide.steps || []).map((step, idx) => (
                    <li key={idx} className="recipe-step-item">
                      <span className="step-idx">{idx + 1}</span>
                      <span className="step-desc">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Modal Footer Actions */}
              <div className="recipe-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedRecipe(null)}
                >
                  Close Recipe
                </button>

                <button
                  type="button"
                  className={`eat-meal-btn ${isRecipeEaten ? 'eaten' : ''}`}
                  onClick={() => toggleEatPlanMeal(selectedRecipe)}
                >
                  {isRecipeEaten ? '✓ Marked As Eaten — Undo' : '🍴 Mark As Eaten Today'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
