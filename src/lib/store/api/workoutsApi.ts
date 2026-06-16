import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface ExerciseSet {
  reps: number | string;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  desc: string;
  phase: string[];
  intensity: string;
  duration: string;
  duration_mins: number;
  bodypart: string;
  equipment: string;
  phaseNote: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export const workoutsApi = createApi({
  reducerPath: "workoutsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Workouts"],
  endpoints: (builder) => ({
    getWorkouts: builder.query<Workout[], void>({
      query: () => "/workout/library",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Workouts" as const, id })),
              { type: "Workouts", id: "LIST" },
            ]
          : [{ type: "Workouts", id: "LIST" }],
    }),
    createWorkout: builder.mutation<Workout, Partial<Workout>>({
      query: (body) => ({
        url: "/workout/library",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Workouts", id: "LIST" }],
    }),
    updateWorkout: builder.mutation<Workout, { id: string; body: Partial<Workout> }>({
      query: ({ id, body }) => ({
        url: `/workout/library/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Workouts", id: "LIST" }],
    }),
    deleteWorkout: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/workout/library/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Workouts", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWorkoutsQuery,
  useCreateWorkoutMutation,
  useUpdateWorkoutMutation,
  useDeleteWorkoutMutation,
} = workoutsApi;
