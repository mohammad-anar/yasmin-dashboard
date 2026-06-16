import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface Food {
  id: string;
  emoji: string;
  name: string;
  cat: string;
  phases: string[];
  why: string;
  macros: {
    cal: string;
    pro: string;
    carb: string;
    fat: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  n: string; // name
  a: string; // amount
}

export interface Recipe {
  id: string;
  emoji: string;
  name: string;
  phases: string[];
  meal: string;
  prepTime: string;
  cals: string;
  tagline: string;
  why: string;
  macros: {
    cal: string;
    pro: string;
    carb: string;
    fat: string;
  };
  ingredients: Ingredient[];
  steps: string[];
  createdAt: string;
  updatedAt: string;
}

export const nutritionApi = createApi({
  reducerPath: "nutritionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Foods", "Recipes"],
  endpoints: (builder) => ({
    getFoods: builder.query<Food[], void>({
      query: () => "/nutrition/foods",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Foods" as const, id })),
              { type: "Foods", id: "LIST" },
            ]
          : [{ type: "Foods", id: "LIST" }],
    }),
    createFood: builder.mutation<Food, Partial<Food>>({
      query: (body) => ({
        url: "/nutrition/foods",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Foods", id: "LIST" }],
    }),
    updateFood: builder.mutation<Food, { id: string; body: Partial<Food> }>({
      query: ({ id, body }) => ({
        url: `/nutrition/foods/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Foods", id }, { type: "Foods", id: "LIST" }],
    }),
    deleteFood: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/nutrition/foods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Foods", id: "LIST" }],
    }),

    getRecipes: builder.query<Recipe[], void>({
      query: () => "/nutrition/recipes",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Recipes" as const, id })),
              { type: "Recipes", id: "LIST" },
            ]
          : [{ type: "Recipes", id: "LIST" }],
    }),
    createRecipe: builder.mutation<Recipe, Partial<Recipe>>({
      query: (body) => ({
        url: "/nutrition/recipes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Recipes", id: "LIST" }],
    }),
    updateRecipe: builder.mutation<Recipe, { id: string; body: Partial<Recipe> }>({
      query: ({ id, body }) => ({
        url: `/nutrition/recipes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Recipes", id }, { type: "Recipes", id: "LIST" }],
    }),
    deleteRecipe: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/nutrition/recipes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Recipes", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFoodsQuery,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
  useGetRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = nutritionApi;
