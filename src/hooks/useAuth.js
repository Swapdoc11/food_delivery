"use client";

// This hook must only be used in Client Components.
// Ensure any component using useAuth has 'use client' at the top.

import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "@/slices/authSlice";
import { API_BASE_URL } from "@/utils/api";
import { useEffect, useCallback, useMemo } from "react";

export function useAuth() {
  // Group all state selectors together
  const { accessToken, refreshToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Decode JWT token helper function - moved outside of callback to avoid recreating on each render
  const decodeJWT = useMemo(() => {
    return (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    };
  }, []);

  // Memoize token validation check
  const isTokenValid = useMemo(() => {
    if (!accessToken) return false;
    const payload = decodeJWT(accessToken);
    return payload && payload.exp * 1000 > Date.now();
  }, [accessToken, decodeJWT]);

  // Memoize getValidAccessToken to prevent unnecessary recreations
  const getValidAccessToken = useCallback(async () => {
    if (!accessToken) return null;
    
    try {
      // If current token is valid, return it
      if (isTokenValid) {
        return accessToken;
      }

      // If no refresh token, logout
      if (!refreshToken) {
        dispatch(logout());
        return null;
      }

      // Attempt to refresh the token
      const res = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Token refresh failed:', errorData);
        dispatch(logout());
        return null;
      }

      const data = await res.json();
      dispatch(setCredentials({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user, // Preserve current user data
      }));
      return data.accessToken;

    } catch (error) {
      console.error('Error in token refresh process:', error);
      dispatch(logout());
      return null;
    }
  }, [accessToken, refreshToken, user, dispatch, isTokenValid]);

  // Perform token validation check on mount and when dependencies change
  useEffect(() => {
    const validateToken = async () => {
      try {
        await getValidAccessToken();
      } catch (error) {
        console.error('Token validation failed:', error);
        dispatch(logout());
      }
    };
    
    validateToken();
  }, [getValidAccessToken, dispatch]);

  // Only check token if we're supposed to be authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Create interval to check token validity
      const interval = setInterval(async () => {
        await getValidAccessToken();
      }, 5 * 60 * 1000); // Check every 5 minutes

      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, getValidAccessToken]);

  // Return authenticated state and methods
  return {
    accessToken,
    refreshToken,
    user,
    getValidAccessToken,
    isAuthenticated: Boolean(user && isTokenValid),
  };
}
