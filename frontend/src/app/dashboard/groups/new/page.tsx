"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function NewGroupPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Group name is required" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post<{ id: string }>("/groups", { name });
      toast.success("Group created!");
      router.replace(`/dashboard/groups/${data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Group name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } dark:bg-gray-800 dark:text-gray-100`}
            placeholder="e.g. Apartment 4B"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-500 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {loading ? "Creating…" : "Create Group"}
        </button>
      </form>
    </div>
  );
}
