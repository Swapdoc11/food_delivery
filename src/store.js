"use client";

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tableReducer from './slices/tableSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    table: tableReducer,
  },
});
