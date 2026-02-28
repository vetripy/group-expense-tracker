"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Group, Stats } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/PageLoader";

const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function StatsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [group, setGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Group>(`/groups/${id}`).then((r) => setGroup(r.data)).catch(() => {});
  }, [id]);

  const [period, setPeriod] = useState<"all" | "month" | "year">("all");
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { period };
    if (period === "month") {
      params.year = currentYear;
      params.month = currentMonth;
    } else if (period === "year") {
      params.year = currentYear;
    }
    api
      .get<Stats>(`/groups/${id}/stats`, { params })
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, [id, period]);

  if (loading) return <PageLoader />;
  if (error)
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const topSpender = stats?.by_user?.[0];
  const pieData = stats?.by_category?.map((c, i) => ({
    name: c.category,
    value: c.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })) ?? [];
  const barData = stats?.monthly?.map((m) => ({
    name: format(new Date(m.year, m.month - 1), "MMM yy"),
    total: m.total,
  })) ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/groups/${id}`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← {group?.name || "Group"}
        </Link>
      </div>

      <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Statistics</h1>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Breakdown period</p>
        <div className="flex gap-2">
          {(["all", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                period === p
                  ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500 dark:text-white"
                  : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {p === "all" ? "All time" : p === "month" ? "This month" : "This year"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total spent</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${(stats?.total ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Top spender</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {topSpender ? `$${topSpender.total.toFixed(2)}` : "—"}
          </p>
          {topSpender && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {topSpender.full_name?.trim() || "—"}
            </p>
          )}
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-medium text-gray-900 dark:text-gray-100">By category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {barData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-medium text-gray-900 dark:text-gray-100">Monthly breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Total"]} />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(!stats || (stats.total === 0 && !stats.by_category?.length && !stats.by_user?.length)) && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <span className="text-4xl">📊</span>
          <p className="mt-4 text-gray-600 dark:text-gray-400">No expense data yet</p>
          <p className="mt-1 text-sm text-gray-500">Add expenses to see charts</p>
          <Link
            href={`/dashboard/groups/${id}/expenses/new`}
            className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
          >
            Add expense
          </Link>
        </div>
      )}
    </div>
  );
}
