"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (loading || !user) return <PageLoader />;

  return (
      <div>
        <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.full_name || "—"}</p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">User ID</p>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{user.id}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Share this ID when someone adds you to a group
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-red-200 bg-red-50 py-3 font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          Sign out
        </button>
      </div>
  );
}
