"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Group[]>("/groups")
      .then((res) => setGroups(res.data))
      .catch(() => setError("Failed to load groups"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Groups</h1>
        <Link
          href="/dashboard/groups/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          + New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No groups yet"
          description="Create a group to start tracking shared expenses with family, roommates, or friends."
          action={
            <Link
              href="/dashboard/groups/new"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
            >
              Create your first group
            </Link>
          }
        />
      ) : (
        <ul className="mt-6 mb-8 flex list-none flex-col gap-6 p-0">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/dashboard/groups/${g.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{g.name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {g.members.length} member{g.members.length !== 1 ? "s" : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
