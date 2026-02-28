"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function AddMemberPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrors({ userId: "User ID is required" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post(`/groups/${id}/members`, { user_id: userId.trim() });
      toast.success("Member added");
      router.replace(`/dashboard/groups/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/dashboard/groups/${id}`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Member</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.userId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } dark:bg-gray-800 dark:text-gray-100`}
            placeholder="e.g. 507f1f77bcf86cd799439011"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ask the user for their ID (they can find it in Profile)
          </p>
          {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-500 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {loading ? "Adding…" : "Add Member"}
        </button>
      </form>
    </div>
  );
}
