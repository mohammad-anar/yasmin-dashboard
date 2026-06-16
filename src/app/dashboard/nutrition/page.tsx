"use client";

import { useState } from "react";
import {
  useGetFoodsQuery,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
  useGetRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  Food,
  Recipe,
  Ingredient,
} from "@/lib/store/api/nutritionApi";
import { Plus, X, Loader2, Apple, Trash2, Eye, Edit2, BookOpen } from "lucide-react";

const PHASES = ["menstrual", "follicular", "ovulatory", "luteal", "all"];
const FOOD_CATEGORIES = ["protein", "carbs", "fats", "veg", "fruit", "dairy", "supplements"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// Add/Edit Food Modal
function FoodModal({
  open,
  food,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  food: Food | null; // Null means Add Mode, otherwise Edit Mode
  onClose: () => void;
  onSubmit: (data: Partial<Food>) => void;
  isLoading: boolean;
}) {
  const [emoji, setEmoji] = useState(food?.emoji || "🥦");
  const [name, setName] = useState(food?.name || "");
  const [cat, setCat] = useState(food?.cat || "protein");
  const [phases, setPhases] = useState<string[]>(food?.phases || []);
  const [why, setWhy] = useState(food?.why || "");
  const [cal, setCal] = useState(food?.macros?.cal || "100");
  const [pro, setPro] = useState(food?.macros?.pro || "10g");
  const [carb, setCarb] = useState(food?.macros?.carb || "0g");
  const [fat, setFat] = useState(food?.macros?.fat || "0g");

  if (!open) return null;

  const togglePhase = (phase: string) => {
    if (phases.includes(phase)) {
      setPhases(phases.filter((p) => p !== phase));
    } else {
      setPhases([...phases, phase]);
    }
  };

  const handleFormSubmit = () => {
    if (!name || !why || phases.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
    onSubmit({
      emoji,
      name,
      cat,
      phases,
      why,
      macros: { cal, pro, carb, fat },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]" style={{ background: "white" }}>
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h3 className="font-bold text-lg" style={{ color: "var(--brand-text-primary)" }}>
            {food ? "Edit Food Item" : "Add Food Item"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 text-gray-500">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Avocado"
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Category *</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50 capitalize"
              >
                {FOOD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Calories (kcal)</label>
              <input
                type="text"
                value={cal}
                onChange={(e) => setCal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Protein</label>
              <input
                type="text"
                value={pro}
                onChange={(e) => setPro(e.target.value)}
                placeholder="e.g. 2g"
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Carbs</label>
              <input
                type="text"
                value={carb}
                onChange={(e) => setCarb(e.target.value)}
                placeholder="e.g. 9g"
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Fat</label>
              <input
                type="text"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="e.g. 15g"
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-500">Why details *</label>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Hormonal and health benefits of this food..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500">Active Phases *</label>
            <div className="flex flex-wrap gap-1.5">
              {PHASES.map((p) => {
                const selected = phases.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePhase(p)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-all"
                    style={{
                      background: selected ? "var(--brand-accent)" : "var(--brand-surface)",
                      color: selected ? "white" : "var(--brand-text-muted)",
                      borderColor: selected ? "var(--brand-accent)" : "var(--brand-border)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-semibold border bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "var(--brand-accent)" }}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Recipe Modal
function RecipeModal({
  open,
  recipe,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onSubmit: (data: Partial<Recipe>) => void;
  isLoading: boolean;
}) {
  const [emoji, setEmoji] = useState(recipe?.emoji || "🍲");
  const [name, setName] = useState(recipe?.name || "");
  const [phases, setPhases] = useState<string[]>(recipe?.phases || []);
  const [meal, setMeal] = useState(recipe?.meal || "dinner");
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || "25 min");
  const [cals, setCals] = useState(recipe?.cals || "320");
  const [tagline, setTagline] = useState(recipe?.tagline || "");
  const [why, setWhy] = useState(recipe?.why || "");
  const [cal, setCal] = useState(recipe?.macros?.cal || "320");
  const [pro, setPro] = useState(recipe?.macros?.pro || "18g");
  const [carb, setCarb] = useState(recipe?.macros?.carb || "48g");
  const [fat, setFat] = useState(recipe?.macros?.fat || "6g");
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients || [{ n: "", a: "" }]);
  const [steps, setSteps] = useState<string[]>(recipe?.steps || [""]);

  if (!open) return null;

  const togglePhase = (phase: string) => {
    if (phases.includes(phase)) {
      setPhases(phases.filter((p) => p !== phase));
    } else {
      setPhases([...phases, phase]);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { n: "", a: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, key: "n" | "a", val: string) => {
    const updated = [...ingredients];
    updated[index][key] = val;
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  const handleFormSubmit = () => {
    if (!name || !tagline || !why || phases.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    const cleanIngredients = ingredients.filter((ing) => ing.n.trim() !== "");
    const cleanSteps = steps.filter((step) => step.trim() !== "");

    onSubmit({
      emoji,
      name,
      phases,
      meal,
      prepTime,
      cals,
      tagline,
      why,
      macros: { cal, pro, carb, fat },
      ingredients: cleanIngredients,
      steps: cleanSteps,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: "white" }}>
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h3 className="font-bold text-lg" style={{ color: "var(--brand-text-primary)" }}>
            {recipe ? "Edit Recipe" : "Add Recipe"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold mb-1 text-gray-500">Recipe Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lentil Soup"
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Meal Type *</label>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50 capitalize"
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Prep Time</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Total Calories</label>
              <input
                type="text"
                value={cals}
                onChange={(e) => setCals(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-500">Tagline *</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. A blood-building bowl of warmth"
              className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-500">Why Description *</label>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Describe the nutritional benefits for hormonal phases..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Cal Macros</label>
              <input
                type="text"
                value={cal}
                onChange={(e) => setCal(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Protein</label>
              <input
                type="text"
                value={pro}
                onChange={(e) => setPro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Carbs</label>
              <input
                type="text"
                value={carb}
                onChange={(e) => setCarb(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">Fat</label>
              <input
                type="text"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500">Target Phases *</label>
            <div className="flex flex-wrap gap-1.5">
              {PHASES.map((p) => {
                const selected = phases.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePhase(p)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-all"
                    style={{
                      background: selected ? "var(--brand-accent)" : "var(--brand-surface)",
                      color: selected ? "white" : "var(--brand-text-muted)",
                      borderColor: selected ? "var(--brand-accent)" : "var(--brand-border)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Ingredients Section */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Ingredients</label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add Ingredient
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ing.n}
                    onChange={(e) => handleIngredientChange(idx, "n", e.target.value)}
                    placeholder="Ingredient name (e.g. Red Lentils)"
                    className="flex-grow px-3 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50 font-medium"
                  />
                  <input
                    type="text"
                    value={ing.a}
                    onChange={(e) => handleIngredientChange(idx, "a", e.target.value)}
                    placeholder="Amount (e.g. 200g)"
                    className="w-28 px-3 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50 font-medium"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Steps Section */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Preparation Steps</label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder={`Step ${idx + 1} instruction...`}
                    className="flex-grow px-3 py-1.5 rounded-lg text-xs border focus:outline-none bg-gray-50"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-semibold border bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "var(--brand-accent)" }}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<"foods" | "recipes">("foods");

  // RTK Query calls
  const { data: foods, isFetching: isFetchingFoods, refetch: refetchFoods } = useGetFoodsQuery();
  const { data: recipes, isFetching: isFetchingRecipes, refetch: refetchRecipes } = useGetRecipesQuery();

  const [createFood, { isLoading: isCreatingFood }] = useCreateFoodMutation();
  const [updateFood, { isLoading: isUpdatingFood }] = useUpdateFoodMutation();
  const [deleteFood] = useDeleteFoodMutation();

  const [createRecipe, { isLoading: isCreatingRecipe }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdatingRecipe }] = useUpdateRecipeMutation();
  const [deleteRecipe] = useDeleteRecipeMutation();

  // Modal controls
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFoodSubmit = async (formData: Partial<Food>) => {
    try {
      if (selectedFood) {
        await updateFood({ id: selectedFood.id, body: formData }).unwrap();
        showToast("Food item updated successfully!");
      } else {
        await createFood(formData).unwrap();
        showToast("Food item created successfully!");
      }
      setFoodModalOpen(false);
      setSelectedFood(null);
      refetchFoods();
    } catch (e: any) {
      alert(`Error: ${e?.data?.message || "Operation failed"}`);
    }
  };

  const handleFoodDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this food item from the library?")) {
      try {
        await deleteFood(id).unwrap();
        showToast("Food item deleted successfully!");
        refetchFoods();
      } catch (e: any) {
        alert(`Error: ${e?.data?.message || "Failed to delete"}`);
      }
    }
  };

  const handleRecipeSubmit = async (formData: Partial<Recipe>) => {
    try {
      if (selectedRecipe) {
        await updateRecipe({ id: selectedRecipe.id, body: formData }).unwrap();
        showToast("Recipe updated successfully!");
      } else {
        await createRecipe(formData).unwrap();
        showToast("Recipe created successfully!");
      }
      setRecipeModalOpen(false);
      setSelectedRecipe(null);
      refetchRecipes();
    } catch (e: any) {
      alert(`Error: ${e?.data?.message || "Operation failed"}`);
    }
  };

  const handleRecipeDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recipe from the library?")) {
      try {
        await deleteRecipe(id).unwrap();
        showToast("Recipe deleted successfully!");
        refetchRecipes();
      } catch (e: any) {
        alert(`Error: ${e?.data?.message || "Failed to delete"}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {toastMessage && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: "var(--brand-accent)",
            color: "white",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--brand-text-primary)" }}>
            <Apple className="w-6 h-6" style={{ color: "var(--brand-accent)" }} />
            Nutrition Library
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
            Manage foods database and recipe guides optimized for cycle phases
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "foods") {
              setSelectedFood(null);
              setFoodModalOpen(true);
            } else {
              setSelectedRecipe(null);
              setRecipeModalOpen(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all self-start sm:self-auto cursor-pointer"
          style={{ background: "var(--brand-accent)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent)"; }}
        >
          <Plus className="w-4 h-4" />
          {activeTab === "foods" ? "Add Food" : "Add Recipe"}
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("foods")}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "foods"
              ? "border-[#8B7355] text-[#8B7355]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🥦 Foods List
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "recipes"
              ? "border-[#8B7355] text-[#8B7355]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🍽️ Recipes Guide
        </button>
      </div>

      {/* Foods view */}
      {activeTab === "foods" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--brand-surface)" }}>
                  {["Food", "Category", "Phases", "Macros", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isFetchingFoods && !foods && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--brand-accent)" }} />
                    </td>
                  </tr>
                )}
                {foods?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--brand-border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--brand-text-primary)" }}>{item.name}</p>
                          <p className="text-xs truncate max-w-sm text-gray-400">{item.why}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                        {item.cat}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {item.phases.map((p) => (
                          <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-[#6B5D4F15] text-[#3a2e28]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-gray-500 font-mono">
                      {item.macros?.cal} kcal · P:{item.macros?.pro} · C:{item.macros?.carb} · F:{item.macros?.fat}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFood(item);
                            setFoodModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border text-gray-500 hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFoodDelete(item.id)}
                          className="p-1.5 rounded-lg border text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {foods?.length === 0 && !isFetchingFoods && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Apple className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No foods found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recipes view */}
      {activeTab === "recipes" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--brand-surface)" }}>
                  {["Recipe", "Meal Type", "Prep Time", "Calories", "Phases", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isFetchingRecipes && !recipes && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--brand-accent)" }} />
                    </td>
                  </tr>
                )}
                {recipes?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--brand-border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--brand-text-primary)" }}>{item.name}</p>
                          <p className="text-xs truncate max-w-sm text-gray-400">{item.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold capitalize text-gray-600">
                      {item.meal}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {item.prepTime}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 font-semibold">
                      {item.cals} kcal
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {item.phases.map((p) => (
                          <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-[#6B5D4F15] text-[#3a2e28]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecipe(item);
                            setRecipeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border text-gray-500 hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRecipeDelete(item.id)}
                          className="p-1.5 rounded-lg border text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recipes?.length === 0 && !isFetchingRecipes && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No recipes found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {foodModalOpen && (
        <FoodModal
          open={foodModalOpen}
          food={selectedFood}
          onClose={() => {
            setFoodModalOpen(false);
            setSelectedFood(null);
          }}
          onSubmit={handleFoodSubmit}
          isLoading={selectedFood ? isUpdatingFood : isCreatingFood}
        />
      )}

      {recipeModalOpen && (
        <RecipeModal
          open={recipeModalOpen}
          recipe={selectedRecipe}
          onClose={() => {
            setRecipeModalOpen(false);
            setSelectedRecipe(null);
          }}
          onSubmit={handleRecipeSubmit}
          isLoading={selectedRecipe ? isUpdatingRecipe : isCreatingRecipe}
        />
      )}
    </div>
  );
}
