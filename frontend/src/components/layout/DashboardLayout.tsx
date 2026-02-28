"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { PageLoader } from "../ui/PageLoader";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      <main className="mx-auto max-w-lg px-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
