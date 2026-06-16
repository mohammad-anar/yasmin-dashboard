import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const loadFromStorage = (): Partial<AuthState> => {
  if (typeof window === "undefined") return {};
  try {
    return {
      accessToken: localStorage.getItem("yd_access_token"),
      refreshToken: localStorage.getItem("yd_refresh_token"),
      user: JSON.parse(localStorage.getItem("yd_user") || "null"),
    };
  } catch {
    return {};
  }
};

const stored = loadFromStorage();

const initialState: AuthState = {
  accessToken: stored.accessToken ?? null,
  refreshToken: stored.refreshToken ?? null,
  user: stored.user ?? null,
  isAuthenticated: !!stored.accessToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthUser }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("yd_access_token", action.payload.accessToken);
        localStorage.setItem("yd_refresh_token", action.payload.refreshToken);
        localStorage.setItem("yd_user", JSON.stringify(action.payload.user));
        document.cookie = `yd_access_token=${action.payload.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `yd_user_role=${action.payload.user.role}; path=/; max-age=86400; SameSite=Lax`;
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("yd_access_token", action.payload.accessToken);
        localStorage.setItem("yd_refresh_token", action.payload.refreshToken);
        document.cookie = `yd_access_token=${action.payload.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("yd_access_token");
        localStorage.removeItem("yd_refresh_token");
        localStorage.removeItem("yd_user");
        document.cookie = "yd_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "yd_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
  },
});

export const { setCredentials, updateTokens, logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthUser, AuthState };
