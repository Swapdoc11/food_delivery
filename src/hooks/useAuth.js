"use client";

// This hook must only be used in Client Components.
// Ensure any component using useAuth has 'use client' at the top.

import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "@/slices/authSlice";
import { API_BASE_URL } from "@/utils/api";
import { useEffect } from "react";

export function useAuth() {
  const { accessToken, refreshToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Setup auto refresh
  useEffect(() => {
    let refreshTimeout;

    const setupRefreshTimer = () => {
      if (!accessToken) return;

      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const timeUntilExpiry = expiryTime - Date.now();
        
        // Refresh 1 minute before expiry
        const refreshTime = Math.max(0, timeUntilExpiry - 60000);
        
        refreshTimeout = setTimeout(getValidAccessToken, refreshTime);
      } catch (error) {
        console.error('Error setting up refresh timer:', error);
      }
    };

    setupRefreshTimer();
    return () => clearTimeout(refreshTimeout);
  }, [accessToken]);

  // Call this before any protected API call
  async function getValidAccessToken() {
    if (!accessToken) return null;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      if (payload.exp * 1000 > Date.now()) {
        return accessToken; // Token still valid
      }

      // Token expired, try refresh
      if (!refreshToken) {
        dispatch(logout());
        return null;
      }

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
    } catch (error) {
      console.error('Error refreshing token:', error);
      dispatch(logout());
      return null;
    }
  }

  return { accessToken, refreshToken, user, getValidAccessToken };
}
