"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Group } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const isAdmin = group?.members.some(
    (m) => m.user_id === user?.id && m.role === "admin"
  );

  const refresh = () => {
    api.get<Group>(`/groups/${id}`).then((r) => setGroup(r.data)).catch(() => {});
  };

  useEffect(() => {
    api
      .get<Group>(`/groups/${id}`)
      .then((res) => setGroup(res.data))
      .catch(() => setError("Failed to load group"))
      .finally(() => setLoading(false));
  }, [id]);

  const promote = async (userId: string) => {
    setActioning(userId);
    try {
      await api.patch(`/groups/${id}/members/${userId}/promote`);
      toast.success("Member promoted");
      refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to promote");
    } finally {
      setActioning(null);
    }
  };

  const remove = async (userId: string) => {
    if (!confirm("Remove this member from the group?")) return;
    setActioning(userId);
    try {
      await api.delete(`/groups/${id}/members/${userId}`);
      toast.success("Member removed");
      refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to remove");
    } finally {
      setActioning(null);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !group)
    return <ErrorState message={error || "Group not found"} onRetry={() => window.location.reload()} />;

  const admins = group.members.filter((m) => m.role === "admin");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          ← Groups
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {group.members.length} member{group.members.length !== 1 ? "s" : ""}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <Link href={`/dashboard/groups/${id}/expenses`}>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-2xl">💰</span>
            <h3 className="mt-2 font-medium text-gray-900 dark:text-gray-100">Expenses</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">View & add</p>
          </div>
        </Link>
        <Link href={`/dashboard/groups/${id}/stats`}>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-2xl">📊</span>
            <h3 className="mt-2 font-medium text-gray-900 dark:text-gray-100">Stats</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Charts & insights</p>
          </div>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 font-medium text-gray-900 dark:text-gray-100">Members</h2>
        <ul className="space-y-2">
          {group.members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="text-gray-900 dark:text-gray-100">
                {m.user_id === user?.id
                  ? "You"
                  : (m.full_name && m.full_name.trim() !== ""
                      ? m.full_name
                      : m.user_id.slice(0, 8) + "…")}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    m.role === "admin"
                      ? "bg-primary-100 text-gray-900 dark:bg-primary-200 dark:text-gray-900"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {m.role}
                </span>
                {isAdmin && m.user_id !== user?.id && (
                  <>
                    {m.role !== "admin" && (
                      <button
                        onClick={() => promote(m.user_id)}
                        disabled={!!actioning}
                        className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-500 dark:hover:bg-primary-900/30 disabled:opacity-50"
                      >
                        {actioning === m.user_id ? <LoadingSpinner className="h-3 w-3" /> : "Promote"}
                      </button>
                    )}
                    {(admins.length > 1 || m.role !== "admin") && (
                      <button
                        onClick={() => remove(m.user_id)}
                        disabled={!!actioning}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/30 disabled:opacity-50"
                      >
                        {actioning === m.user_id ? <LoadingSpinner className="h-3 w-3" /> : "Remove"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {isAdmin && (
          <div className="mt-4 space-y-2">
            <Link
              href={`/dashboard/groups/${id}/members/add`}
              className="block rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-500"
            >
              + Add member
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
