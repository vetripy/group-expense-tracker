"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";
import { format } from "date-fns";
import { PageLoader } from "@/components/ui/PageLoader";

export default function NewExpensePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Group>(`/groups/${id}`).then((r) => setGroup(r.data));
    api.get<{ categories: string[] }>(`/groups/${id}/categories`).then((r) => {
      setCategories(r.data.categories);
      if (r.data.categories.length && !category)
        setCategory(r.data.categories[0]);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!title.trim()) e2.title = "Title is required";
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) e2.amount = "Valid amount is required";
    if (!category) e2.category = "Category is required";
    if (!date) e2.date = "Date is required";
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setLoading(true);
    try {
      await api.post(`/groups/${id}/expenses`, {
        title: title.trim(),
        amount: amt,
        category,
        description: description.trim(),
        date,
      });
      toast.success("Expense added!");
      router.replace(`/dashboard/groups/${id}/expenses`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/dashboard/groups/${id}/expenses`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } dark:bg-gray-800 dark:text-gray-100`}
            placeholder="e.g. Groceries"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.amount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } dark:bg-gray-800 dark:text-gray-100`}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Notes..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-500 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {loading ? "Adding…" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
