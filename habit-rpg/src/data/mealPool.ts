import type { MealItem, DietPreference, DailyMealPlan, MealCategory } from '../types';

export const MEAL_POOL: MealItem[] = [
  // ===== VEGETARIAN BREAKFAST =====
  {
    id: 'v-b1',
    name: 'Power Oats with Whey & Peanut Butter',
    category: 'breakfast',
    dietType: 'veg',
    portion: '1 Large Bowl',
    macros: { calories: 520, protein: 38, carbs: 58, fat: 14 },
    ingredients: ['80g Rolled Oats', '1 Scoop Whey/Plant Protein', '1 tbsp Peanut Butter', 'Chia Seeds', 'Almond Milk'],
    description: 'Slow-digesting complex carbs and rapid-acting protein for morning physical readiness.',
  },
  {
    id: 'v-b2',
    name: 'Paneer Bhurji & Multigrain Toast',
    category: 'breakfast',
    dietType: 'veg',
    portion: '200g Paneer + 2 Toasts',
    macros: { calories: 540, protein: 40, carbs: 36, fat: 24 },
    ingredients: ['200g Fresh Cottage Cheese (Paneer)', '2 Slices Multigrain Bread', 'Onions, Tomatoes & Green Chillies', 'Turmeric & Cumin'],
    description: 'High-protein scrambled cottage cheese packed with healthy fats and muscle building amino acids.',
  },
  {
    id: 'v-b3',
    name: 'Moong Dal & Sprout High-Protein Chilla',
    category: 'breakfast',
    dietType: 'veg',
    portion: '3 Savory Pancakes',
    macros: { calories: 430, protein: 30, carbs: 52, fat: 10 },
    ingredients: ['Yellow Moong Dal Batter', 'Mixed Sprouted Moong', 'Paneer Crumbs', 'Mint Coriander Chutney'],
    description: 'Traditional clean plant-based fuel rich in dietary fiber, iron, and slow-release energy.',
  },
  {
    id: 'v-b4',
    name: 'Tofu Scramble with Sautéed Spinach',
    category: 'breakfast',
    dietType: 'veg',
    portion: '250g Tofu + Sourdough',
    macros: { calories: 460, protein: 34, carbs: 42, fat: 16 },
    ingredients: ['250g Firm Organic Tofu', 'Baby Spinach & Bell Peppers', '1 Slice Sourdough Toast', 'Nutritional Yeast'],
    description: 'Clean vegan powerhouse loaded with calcium, complete amino acids, and zero cholesterol.',
  },

  // ===== NON-VEGETARIAN BREAKFAST =====
  {
    id: 'nv-b1',
    name: '4-Egg Scramble with Avocado & Sourdough',
    category: 'breakfast',
    dietType: 'non-veg',
    portion: '4 Eggs (2 Whole, 2 Whites) + Toast',
    macros: { calories: 490, protein: 36, carbs: 32, fat: 22 },
    ingredients: ['2 Whole Eggs + 2 Egg Whites', '1/2 Ripe Avocado', '1 Slice Sourdough Bread', 'Baby Spinach & Olive Oil'],
    description: 'The golden bodybuilder breakfast providing choline, healthy monounsaturated fats, and bioavailable protein.',
  },
  {
    id: 'nv-b2',
    name: 'Smoked Salmon & Egg White Omelette',
    category: 'breakfast',
    dietType: 'non-veg',
    portion: '3-Egg White Omelette + 80g Salmon',
    macros: { calories: 440, protein: 42, carbs: 12, fat: 20 },
    ingredients: ['4 Egg Whites', '80g Smoked Salmon', 'Cherry Tomatoes & Dill', 'Olive Oil Cooking Spray'],
    description: 'Omega-3 enriched athletic breakfast designed to reduce inflammation and accelerate recovery.',
  },
  {
    id: 'nv-b3',
    name: 'Chicken Sausage & Scrambled Eggs Wrap',
    category: 'breakfast',
    dietType: 'non-veg',
    portion: '1 Stuffed Whole Wheat Wrap',
    macros: { calories: 510, protein: 40, carbs: 38, fat: 18 },
    ingredients: ['2 Lean Chicken Sausages', '2 Scrambled Eggs', 'Whole Wheat Tortilla', 'Fresh Salsa & Lettuce'],
    description: 'High-energy breakfast burrito packed with lean poultry protein for grueling morning workouts.',
  },
  {
    id: 'nv-b4',
    name: 'Bodybuilder Egg White Banana Oatmeal',
    category: 'breakfast',
    dietType: 'non-veg',
    portion: 'Large Bowl + 4 Whites',
    macros: { calories: 470, protein: 38, carbs: 62, fat: 8 },
    ingredients: ['75g Rolled Oats', '4 Whisked Egg Whites cooked in oats', '1 Sliced Banana', 'Cinnamon & Walnuts'],
    description: 'Creamy, voluminous morning carb and protein feast that fuels maximum calisthenics reps.',
  },

  // ===== VEGETARIAN LUNCH =====
  {
    id: 'v-l1',
    name: 'Soya Chunks & Vegetable Pulao with Curd',
    category: 'lunch',
    dietType: 'veg',
    portion: 'Plate (60g Soya + Rice)',
    macros: { calories: 590, protein: 48, carbs: 70, fat: 11 },
    ingredients: ['60g Textured Soya Chunks (52% protein)', '1 Cup Brown Basmati Rice', 'Mixed Veggies', '150g Curd/Yogurt'],
    description: 'The premier vegetarian protein bomb with complete amino acid profile for muscle hyper-recovery.',
  },
  {
    id: 'v-l2',
    name: 'Grilled Tofu & Quinoa Buddha Bowl',
    category: 'lunch',
    dietType: 'veg',
    portion: 'Large Warm Bowl',
    macros: { calories: 560, protein: 42, carbs: 55, fat: 18 },
    ingredients: ['200g Marinated Grilled Tofu', '1 Cup Cooked Quinoa', 'Steamed Broccoli & Carrots', 'Tahini Sesame Dressing'],
    description: 'Nutrient-dense athletic powerhouse brimming with zinc, magnesium, and plant-based fuel.',
  },
  {
    id: 'v-l3',
    name: 'Paneer Tikka with Yellow Dal & Brown Rice',
    category: 'lunch',
    dietType: 'veg',
    portion: 'Thali (180g Paneer + Dal + Rice)',
    macros: { calories: 630, protein: 44, carbs: 64, fat: 22 },
    ingredients: ['180g Spiced Grilled Paneer', '1 Bowl Thick Tadka Dal', '1 Cup Brown Rice', 'Cucumber Salad'],
    description: 'Balanced warrior thali supplying sustained glycogen replenishment and steady amino acid release.',
  },
  {
    id: 'v-l4',
    name: 'Spiced Chickpea & Paneer Salad Bowl',
    category: 'lunch',
    dietType: 'veg',
    portion: 'Large Salad Bowl',
    macros: { calories: 580, protein: 38, carbs: 62, fat: 20 },
    ingredients: ['1.5 Cups Boiled Kabuli Chana', '120g Diced Paneer', 'Cucumber, Tomatoes & Lemon', 'Olive Oil & Chaat Masala'],
    description: 'High-fiber, high-satiety clean lunch promoting optimal digestion and steady energy throughout the afternoon.',
  },

  // ===== NON-VEGETARIAN LUNCH =====
  {
    id: 'nv-l1',
    name: 'Grilled Chicken Breast with Brown Rice & Broccoli',
    category: 'lunch',
    dietType: 'non-veg',
    portion: '200g Chicken + 1 Cup Rice',
    macros: { calories: 620, protein: 55, carbs: 60, fat: 15 },
    ingredients: ['200g Lean Chicken Breast', '1 Cup Steamed Brown Rice', '1.5 Cups Steamed Broccoli', '1 tbsp Extra Virgin Olive Oil'],
    description: 'The undisputed gold standard fitness meal: pure lean animal protein for maximum muscle synthesis.',
  },
  {
    id: 'nv-l2',
    name: 'Pan-Seared Salmon Fillet with Sweet Potato',
    category: 'lunch',
    dietType: 'non-veg',
    portion: '180g Salmon + 1 Large Sweet Potato',
    macros: { calories: 610, protein: 46, carbs: 50, fat: 23 },
    ingredients: ['180g Atlantic Salmon Fillet', '200g Roasted Sweet Potato', 'Garlic Sautéed Green Beans', 'Lemon Butter Herb Drizzle'],
    description: 'Rich in EPA/DHA Omega-3 fats and complex beta-carotene carbs for peak vascularity and joint health.',
  },
  {
    id: 'nv-l3',
    name: 'Lean Ground Turkey / Beef Rice Bowl',
    category: 'lunch',
    dietType: 'non-veg',
    portion: '200g Lean Meat + Rice',
    macros: { calories: 640, protein: 52, carbs: 62, fat: 18 },
    ingredients: ['200g 93/7 Lean Ground Turkey or Beef', '1 Cup Jasmine Rice', 'Roasted Red Peppers & Zucchini', 'Avocado Oil'],
    description: 'Packed with natural creatine and heme iron to elevate endurance, grip strength, and explosive power.',
  },
  {
    id: 'nv-l4',
    name: 'Chicken Tikka Breast with Multigrain Roti',
    category: 'lunch',
    dietType: 'non-veg',
    portion: '220g Chicken + 2 Rotis',
    macros: { calories: 590, protein: 52, carbs: 48, fat: 16 },
    ingredients: ['220g Spiced Tandoori Chicken Breast', '2 Whole Wheat / Multigrain Rotis', 'Mint Yogurt Dip', 'Onion & Lime Salad'],
    description: 'Flavorful spiced poultry feast offering high bio-availability and minimal excess fat.',
  },

  // ===== VEGETARIAN SNACK (Pre / Post Workout) =====
  {
    id: 'v-s1',
    name: 'Greek Yogurt Bowl with Almonds & Honey',
    category: 'snack',
    dietType: 'veg',
    portion: '250g Greek Yogurt + Toppings',
    macros: { calories: 330, protein: 28, carbs: 32, fat: 10 },
    ingredients: ['250g Plain High-Protein Greek Yogurt', '15g Raw Almonds', '1/2 Cup Blueberries', '1 tsp Raw Honey'],
    description: 'Slow-digesting casein and live probiotics to fortify gut biome and sustain anabolic signaling.',
  },
  {
    id: 'v-s2',
    name: 'Double Chocolate Whey Shake & Banana',
    category: 'snack',
    dietType: 'veg',
    portion: '1 Large Shaker (400ml)',
    macros: { calories: 360, protein: 35, carbs: 42, fat: 6 },
    ingredients: ['1.25 Scoops Chocolate Whey/Plant Isolate', '1 Ripe Banana', '300ml Water/Skim Milk', 'Cinnamon Powder'],
    description: 'Rapid glycogen replenishment and immediate leucine spike post-workout.',
  },
  {
    id: 'v-s3',
    name: 'Roasted Soya Nuts & Roasted Chana Crunch',
    category: 'snack',
    dietType: 'veg',
    portion: '70g Trail Mix',
    macros: { calories: 290, protein: 25, carbs: 30, fat: 8 },
    ingredients: ['35g Dry Roasted Soya Nuts', '35g Roasted Chickpeas (Chana)', 'Rock Salt & Paprika'],
    description: 'Crunchy pocket snack ideal for clean snacking during deep work or study sessions.',
  },
  {
    id: 'v-s4',
    name: 'Peanut Butter & Protein Toast with Chia',
    category: 'snack',
    dietType: 'veg',
    portion: '1 Loaded Toast',
    macros: { calories: 310, protein: 18, carbs: 30, fat: 13 },
    ingredients: ['1 Slice Sprouted Grain Bread', '2 tbsp Natural Peanut Butter', '1 tbsp Chia Seeds', 'Drizzle of Honey'],
    description: 'Rich in potassium, magnesium, and essential fatty acids to combat muscle cramping.',
  },

  // ===== NON-VEGETARIAN SNACK =====
  {
    id: 'nv-s1',
    name: 'Hard Boiled Eggs & Protein Shake',
    category: 'snack',
    dietType: 'non-veg',
    portion: '3 Egg Whites + 1 Scoop Shake',
    macros: { calories: 340, protein: 44, carbs: 12, fat: 7 },
    ingredients: ['3 Hard Boiled Egg Whites', '1 Scoop Whey Isolate in Water', 'Handful of Baby Carrots'],
    description: 'Super-lean 44g protein snack with almost zero extraneous carbs for pure shredded lean muscle.',
  },
  {
    id: 'nv-s2',
    name: 'Chicken Breast Strips with Hummus',
    category: 'snack',
    dietType: 'non-veg',
    portion: '150g Chicken + 2 tbsp Hummus',
    macros: { calories: 310, protein: 38, carbs: 14, fat: 9 },
    ingredients: ['150g Cold Roasted Chicken Strips', '2 tbsp Classic Garlic Hummus', 'Cucumber Slices'],
    description: 'Savory whole-food protein bite supporting fast cellular repair.',
  },
  {
    id: 'nv-s3',
    name: 'Tuna & Cottage Cheese Protein Crunch',
    category: 'snack',
    dietType: 'non-veg',
    portion: '1 Bowl (Canned Tuna in Water)',
    macros: { calories: 290, protein: 42, carbs: 8, fat: 6 },
    ingredients: ['1 Can Chunk Light Tuna in Water (drained)', '80g Low-fat Cottage Cheese', 'Cracked Black Pepper & Lemon Juice'],
    description: 'Ultra-low calorie, dense amino acid payload favored by champion athletes during cutting phases.',
  },
  {
    id: 'nv-s4',
    name: 'Turkey Jerky & Raw Cashew Mix',
    category: 'snack',
    dietType: 'non-veg',
    portion: '60g Pack',
    macros: { calories: 280, protein: 28, carbs: 12, fat: 12 },
    ingredients: ['50g Organic Turkey Jerky', '15g Raw Cashew Nuts'],
    description: 'Convenient zero-prep travel fuel with sustained amino acid availability.',
  },

  // ===== VEGETARIAN DINNER =====
  {
    id: 'v-d1',
    name: 'Pan-Seared Paneer & Sautéed Greens with Roti',
    category: 'dinner',
    dietType: 'veg',
    portion: '200g Paneer + 1 Roti',
    macros: { calories: 550, protein: 42, carbs: 36, fat: 26 },
    ingredients: ['200g Paneer cubes', 'Sautéed Spinach, Mushrooms & Bell Peppers', '1 Whole Wheat Roti', 'Turmeric Ghee Glaze'],
    description: 'Rich in micellar casein that gradually releases amino acids overnight during deep sleep recovery.',
  },
  {
    id: 'v-d2',
    name: 'High-Protein Soya Keema with Sweet Potato',
    category: 'dinner',
    dietType: 'veg',
    portion: 'Large Bowl + 150g Sweet Potato',
    macros: { calories: 520, protein: 46, carbs: 54, fat: 10 },
    ingredients: ['70g Granulated Soya Mince (Keema)', 'Green Peas & Tomato Puree', '150g Boiled Sweet Potato', 'Indian Spices'],
    description: 'Lean and easily digestible dinner promoting muscle hypertrophy without heavy stomach load.',
  },
  {
    id: 'v-d3',
    name: 'Crispy Baked Tofu with Edamame & Lentil Soup',
    category: 'dinner',
    dietType: 'veg',
    portion: '200g Tofu + 1 Bowl Soup',
    macros: { calories: 510, protein: 40, carbs: 46, fat: 16 },
    ingredients: ['200g Extra Firm Pressed Tofu', '1/2 Cup Steamed Edamame', '1 Bowl Red Lentil Soup (Masoor)', 'Steamed Veggies'],
    description: 'Calming plant-protein dinner packed with L-tryptophan and magnesium to promote deep restorative sleep.',
  },
  {
    id: 'v-d4',
    name: 'Cottage Cheese Palak Bowl with Quinoa',
    category: 'dinner',
    dietType: 'veg',
    portion: 'Warm Bowl',
    macros: { calories: 530, protein: 38, carbs: 48, fat: 20 },
    ingredients: ['180g Low-fat Paneer / Cottage Cheese', 'Pureed Spiced Spinach (Palak)', '3/4 Cup Cooked Quinoa', 'Flaxseed Garnish'],
    description: 'Antioxidant and lutein-rich night meal that accelerates soft tissue healing and joint tendon reinforcement.',
  },

  // ===== NON-VEGETARIAN DINNER =====
  {
    id: 'nv-d1',
    name: 'Lemon Herb Grilled Chicken Breast with Quinoa',
    category: 'dinner',
    dietType: 'non-veg',
    portion: '220g Chicken + 1 Cup Quinoa',
    macros: { calories: 570, protein: 56, carbs: 42, fat: 16 },
    ingredients: ['220g Chicken Breast marinated in lemon and rosemary', '1 Cup Fluffy Quinoa', 'Steamed Asparagus Spears', 'Olive Oil Drizzle'],
    description: 'Pure, clean night fuel that rebuilds torn muscle fibers after intense calisthenics bar sets.',
  },
  {
    id: 'nv-d2',
    name: 'Baked White Fish Cod / Tilapia with Roasted Potatoes',
    category: 'dinner',
    dietType: 'non-veg',
    portion: '240g White Fish + 180g Potatoes',
    macros: { calories: 500, protein: 50, carbs: 44, fat: 11 },
    ingredients: ['240g Wild Cod or Tilapia Fillet', '180g Roasted Baby Gold Potatoes', 'Steamed Zucchini & Lemon Butter Sauce'],
    description: 'Exceptionally light on digestion yet delivering 50g of top-grade protein for effortless sleep.',
  },
  {
    id: 'nv-d3',
    name: 'Lean Chicken Meatballs with Whole Wheat Spaghetti',
    category: 'dinner',
    dietType: 'non-veg',
    portion: '6 Meatballs + Pasta Bowl',
    macros: { calories: 590, protein: 52, carbs: 58, fat: 14 },
    ingredients: ['220g Lean Minced Chicken Meatballs', 'Rich Garlic Tomato Basil Marinara', '70g Dry Whole Wheat Pasta', 'Parmesan Dust'],
    description: 'Hearty and satisfying dinner balancing complex carbs and lean protein for next-day stamina.',
  },
  {
    id: 'nv-d4',
    name: 'Seared Sirloin Steak with Roasted Asparagus & Mushrooms',
    category: 'dinner',
    dietType: 'non-veg',
    portion: '180g Lean Sirloin + Vegetables',
    macros: { calories: 560, protein: 48, carbs: 16, fat: 28 },
    ingredients: ['180g Lean Grass-Fed Sirloin', '1 Cup Roasted Asparagus', 'Portobello Mushrooms', 'Garlic Herb Butter'],
    description: 'Natural zinc, vitamin B12, and bioavailable iron to maintain peak testosterone and energy output.',
  },
];

/**
 * Filter pool by category and diet preference
 */
export function getMealsByCategory(category: MealCategory, preference: DietPreference): MealItem[] {
  return MEAL_POOL.filter(
    (m) => m.category === category && m.dietType === preference
  );
}

/**
 * Pick a random meal for category and preference
 */
export function pickRandomMeal(category: MealCategory, preference: DietPreference, currentId?: string): MealItem {
  const candidates = getMealsByCategory(category, preference).filter((m) => m.id !== currentId);
  if (candidates.length === 0) {
    return getMealsByCategory(category, preference)[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Generate a complete fresh 4-meal plan
 */
export function generateDailyMealPlan(preference: DietPreference): DailyMealPlan {
  return {
    breakfast: pickRandomMeal('breakfast', preference),
    lunch: pickRandomMeal('lunch', preference),
    snack: pickRandomMeal('snack', preference),
    dinner: pickRandomMeal('dinner', preference),
  };
}

/**
 * Sum macros of all meals in a plan
 */
export function calculatePlanTotalMacros(plan: DailyMealPlan) {
  const meals = [plan.breakfast, plan.lunch, plan.snack, plan.dinner];
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.macros.calories,
      protein: acc.protein + m.macros.protein,
      carbs: acc.carbs + m.macros.carbs,
      fat: acc.fat + m.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export interface MealRecipeGuide {
  prepTime: string;
  cookTime: string;
  difficulty: 'Quick (Under 10 mins)' | 'Medium (15-20 mins)' | 'Easy Meal Prep';
  steps: string[];
  instructions?: string[];
  chefTip: string;
}

export function getMealRecipeGuide(meal: MealItem): MealRecipeGuide {
  if (meal.category === 'breakfast') {
    const steps = [
      `Assemble primary complex carb base (${meal.ingredients[0] || 'grains'}) in a bowl or skillet.`,
      `Incorporate ${meal.ingredients[1] || 'protein source'} and cook or stir vigorously over medium flame until evenly blended.`,
      `Garnish with ${meal.ingredients[2] || 'healthy fats and seeds'}. Serve hot alongside 500ml water to kickstart hydration.`,
    ];
    return {
      prepTime: '5-10 Mins',
      cookTime: '5-8 Mins',
      difficulty: 'Quick (Under 10 mins)',
      steps,
      instructions: steps,
      chefTip: 'Measure your protein powder or egg portions precisely for optimal morning anabolic synthesis.',
    };
  } else if (meal.category === 'lunch') {
    const steps = [
      `Preheat skillet or grill pan with light avocado or olive oil over medium-high heat.`,
      `Season ${meal.ingredients[0]} with sea salt, black pepper, and garlic powder; sear until golden brown and cooked thoroughly.`,
      `Warm or plate ${meal.ingredients[1] || 'complex carbs'} alongside sautéed ${meal.ingredients[2] || 'greens and vegetables'}.`,
      `Combine in meal prep bowl. Portion is tailored for clean digestion and sustained midday physical output.`,
    ];
    return {
      prepTime: '10 Mins',
      cookTime: '15 Mins',
      difficulty: 'Medium (15-20 mins)',
      steps,
      instructions: steps,
      chefTip: 'Batch cook grains (brown rice, quinoa) for 3 days in advance to make weekday lunches effortlessly fast.',
    };
  } else if (meal.category === 'snack') {
    const steps = [
      `In a shaker cup or bowl, blend ${meal.ingredients.slice(0, 2).join(' and ')}.`,
      `Add remaining toppings: ${meal.ingredients.slice(2).join(', ') || 'a pinch of Himalayan pink salt'}.`,
      `Consume 45-60 minutes before training for explosive glycogen, or right after your workout for instant recovery.`,
    ];
    return {
      prepTime: '3-5 Mins',
      cookTime: '0-5 Mins',
      difficulty: 'Quick (Under 10 mins)',
      steps,
      instructions: steps,
      chefTip: 'Consume with cold water to enhance rapid amino acid absorption into exhausted muscle tissue.',
    };
  } else {
    const steps = [
      `Sear or grill ${meal.ingredients[0]} with warming spices (cumin, paprika, turmeric) on medium flame.`,
      `Steam or roast ${meal.ingredients[1] || 'healthy greens'} until fork-tender to preserve micronutrients.`,
      `Serve alongside ${meal.ingredients[2] || 'slow-digesting complex carbs'}. Consume at least 2 hours before bed for optimal deep sleep.`,
    ];
    return {
      prepTime: '10 Mins',
      cookTime: '15-20 Mins',
      difficulty: 'Medium (15-20 mins)',
      steps,
      instructions: steps,
      chefTip: 'A moderate-fat, high-protein dinner supports steady overnight muscle recovery and cellular repair.',
    };
  }
}
