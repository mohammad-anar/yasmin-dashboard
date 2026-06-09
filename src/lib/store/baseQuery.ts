import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { updateTokens, logout } from "./authSlice";
import { RootState } from "./store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 — try to refresh the access token
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const currentRefreshToken = state.auth.refreshToken;

    if (!currentRefreshToken) {
      api.dispatch(logout());
      return result;
    }

    // Prevent multiple concurrent refresh calls
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      })
        .then(async (res) => {
          if (!res.ok) return null;
          const data = await res.json();
          return data as { access_token: string; refresh_token: string };
        })
        .then((data) => {
          if (data && typeof data === "object" && "access_token" in data) {
            api.dispatch(
              updateTokens({
                accessToken: (data as any).access_token,
                refreshToken: (data as any).refresh_token,
              })
            );
            isRefreshing = false;
            return (data as any).access_token;
          }
          api.dispatch(logout());
          isRefreshing = false;
          return null;
        })
        .catch(() => {
          api.dispatch(logout());
          isRefreshing = false;
          return null;
        });
    }

    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      // Retry the original request with the new token
      if (typeof args === "string") {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        result = await rawBaseQuery(
          {
            ...args,
            headers: {
              ...(args.headers as Record<string, string>),
              Authorization: `Bearer ${newToken}`,
            },
          },
          api,
          extraOptions
        );
      }
    }
  }

  return result;
};
