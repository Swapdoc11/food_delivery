"use client";

// This hook must only be used in Client Components.
// Ensure any component using useAuth has 'use client' at the top.

import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "@/slices/authSlice";
import { API_BASE_URL } from "@/utils/api";

export function useAuth() {
  const { accessToken, refreshToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Call this before any protected API call
  async function getValidAccessToken() {
    if (!accessToken) return null;
    // Check if token is expired
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      // Token expired, try refresh
      const res = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user,
        }));
        return data.accessToken;
      } else {
        dispatch(logout());
        return null;
      }
    }
    return accessToken;
  }

  return { accessToken, refreshToken, user, getValidAccessToken };
}
