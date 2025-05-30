"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken && !PUBLIC_PATHS.includes(pathname)) {
      // Redirect to login if not authenticated and trying to access protected route
      router.push("/login");
    } else if (accessToken && PUBLIC_PATHS.includes(pathname)) {
      // Redirect to dashboard if already authenticated and trying to access public route
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  // Show children only if user is authenticated or accessing public route
  return (accessToken || PUBLIC_PATHS.includes(pathname)) ? children : null;
}
