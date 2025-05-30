"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const { user, accessToken } = useAuth();
  const isInitialized = useSelector((state) => state.auth.isInitialized);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && !accessToken && !PUBLIC_PATHS.includes(pathname)) {
      // Redirect to login if not authenticated and trying to access protected route
      router.push("/login");
    } else if (isInitialized && accessToken && PUBLIC_PATHS.includes(pathname)) {
      // Redirect to dashboard if already authenticated and trying to access public route
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router, isInitialized]);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  // Show children only if user is authenticated or accessing public route
  return accessToken || PUBLIC_PATHS.includes(pathname) ? children : null;
}
