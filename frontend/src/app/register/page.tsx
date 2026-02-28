"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, fullName);
      toast.success("Account created!");
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;
  if (isAuthenticated) {
    router.replace("/dashboard");
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Join to track group expenses</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } dark:bg-gray-800 dark:text-gray-100`}
              placeholder="Jane Doe"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } dark:bg-gray-800 dark:text-gray-100`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } dark:bg-gray-800 dark:text-gray-100`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
