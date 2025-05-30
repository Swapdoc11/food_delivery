"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (!state.isInitialized && typeof window !== 'undefined') {
        try {
          const authState = localStorage.getItem('authState');
          if (authState) {
            const parsed = JSON.parse(authState);
            state.accessToken = parsed.accessToken;
            state.refreshToken = parsed.refreshToken;
            state.user = parsed.user;
          }
        } catch (err) {
          console.error('Failed to load auth state:', err);
        }
        state.isInitialized = true;
      }
    },
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authState', JSON.stringify({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          user: action.payload.user,
        }));
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authState');
      }
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
