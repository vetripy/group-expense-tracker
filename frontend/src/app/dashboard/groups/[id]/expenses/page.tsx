"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Expense, Group } from "@/lib/types";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";

export default function ExpensesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    api.get<Group>(`/groups/${id}`).then((r) => setGroup(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ items: Expense[]; total: number }>(`/groups/${id}/expenses`, {
        params: { page, limit, sort_order: -1 },
      })
      .then((res) => {
        setExpenses(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => setError("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, [id, page]);

  if (loading && expenses.length === 0) return <PageLoader />;
  if (error)
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/dashboard/groups/${id}`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← {group?.name || "Group"}
        </Link>
        <Link
          href={`/dashboard/groups/${id}/expenses/new`}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          + Add
        </Link>
      </div>

      <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>

      {expenses.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No expenses yet"
          description="Add your first expense to start tracking."
          action={
            <Link
              href={`/dashboard/groups/${id}/expenses/new`}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
            >
              Add expense
            </Link>
          }
        />
      ) : (
        <>
          {(() => {
            const byMonth: Record<string, Expense[]> = {};
            expenses.forEach((e) => {
              const d = new Date(e.date);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              if (!byMonth[key]) byMonth[key] = [];
              byMonth[key].push(e);
            });
            const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
            return (
              <div className="space-y-6">
                {monthKeys.map((key) => {
                  const [y, m] = key.split("-").map(Number);
                  const heading = format(new Date(y, m - 1), "MMMM yyyy");
                  return (
                    <section key={key}>
                      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {heading}
                      </h2>
                      <ul className="space-y-3">
                        {byMonth[key].map((e) => (
                          <li
                            key={e.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">{e.title}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {e.category} · {format(new Date(e.date), "MMM d, yyyy")}
                                </p>
                                {e.description && (
                                  <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                                    {e.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                ${e.amount.toFixed(2)}
                              </span>
                            </div>
                            {e.created_by === user?.id && (
                              <span className="mt-2 inline-block text-xs text-gray-400">You</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            );
          })()}

          {total > limit && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2 text-sm text-gray-500">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href={`/dashboard/groups/${id}/expenses/new`}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-2xl text-white shadow-lg hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        +
      </Link>
    </div>
  );
}
