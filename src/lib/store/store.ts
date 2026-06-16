import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "./api/authApi";
import { usersApi } from "./api/usersApi";
import { subscriptionsApi } from "./api/subscriptionsApi";
import { onboardingApi } from "./api/onboardingApi";
import { workoutsApi } from "./api/workoutsApi";
import { nutritionApi } from "./api/nutritionApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [workoutsApi.reducerPath]: workoutsApi.reducer,
    [nutritionApi.reducerPath]: nutritionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      subscriptionsApi.middleware,
      onboardingApi.middleware,
      workoutsApi.middleware,
      nutritionApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
