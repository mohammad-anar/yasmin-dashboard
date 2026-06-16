import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface ContraceptionOption {
  id: string;
  key: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  accent: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContraceptionDetailOption {
  id: string;
  contraceptionKey: string;
  questionKey: string;
  questionLabel: string;
  type: string;
  value: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalOption {
  id: string;
  value: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SymptomOption {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyCheckInOption {
  id: string;
  icon: string;
  label: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingOptions {
  contraceptions: ContraceptionOption[];
  details: ContraceptionDetailOption[];
  goals: GoalOption[];
  symptoms: SymptomOption[];
  checkins: DailyCheckInOption[];
}

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Onboarding"],
  endpoints: (builder) => ({
    getOnboardingOptions: builder.query<OnboardingOptions, void>({
      query: () => "/onboarding/options",
      providesTags: ["Onboarding"],
      // Handle the nested structure from response
      transformResponse: (response: { success: boolean; data: OnboardingOptions }) => response.data,
    }),
    seedOnboardingStep: builder.mutation<{ success: boolean; message: string }, number>({
      query: (step) => ({
        url: `/onboarding/seed/${step}`,
        method: "POST",
      }),
      invalidatesTags: ["Onboarding"],
    }),
    
    // Contraception
    createContraception: builder.mutation<{ success: boolean; data: ContraceptionOption }, Omit<ContraceptionOption, "id">>({
      query: (body) => ({
        url: "/onboarding/contraception",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    deleteContraception: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/onboarding/contraception/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Contraception Detail
    createContraceptionDetail: builder.mutation<{ success: boolean; data: ContraceptionDetailOption }, Omit<ContraceptionDetailOption, "id">>({
      query: (body) => ({
        url: "/onboarding/contraception-detail",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    deleteContraceptionDetail: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/onboarding/contraception-detail/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Goal
    createGoal: builder.mutation<{ success: boolean; data: GoalOption }, Omit<GoalOption, "id">>({
      query: (body) => ({
        url: "/onboarding/goal",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    deleteGoal: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/onboarding/goal/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Symptom
    createSymptom: builder.mutation<{ success: boolean; data: SymptomOption }, Omit<SymptomOption, "id">>({
      query: (body) => ({
        url: "/onboarding/symptom",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    deleteSymptom: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/onboarding/symptom/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Daily Check-In
    createDailyCheckIn: builder.mutation<{ success: boolean; data: DailyCheckInOption }, Omit<DailyCheckInOption, "id">>({
      query: (body) => ({
        url: "/onboarding/daily-check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    deleteDailyCheckIn: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/onboarding/daily-check-in/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Onboarding"],
    }),
  }),
});

export const {
  useGetOnboardingOptionsQuery,
  useSeedOnboardingStepMutation,
  useCreateContraceptionMutation,
  useDeleteContraceptionMutation,
  useCreateContraceptionDetailMutation,
  useDeleteContraceptionDetailMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useCreateSymptomMutation,
  useDeleteSymptomMutation,
  useCreateDailyCheckInMutation,
  useDeleteDailyCheckInMutation,
} = onboardingApi;
