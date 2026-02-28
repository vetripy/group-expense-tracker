"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) router.replace("/dashboard");
    else router.replace("/login");
  }, [loading, isAuthenticated, router]);

  return <PageLoader />;
}
