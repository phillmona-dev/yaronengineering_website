"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AdminButton, Field, inputCls, labelCls } from "./ui";
import { PasswordInput } from "./PasswordFields";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const justReset = params.get("reset") === "1";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const pwd = String(data.password || "");

    const storedPassword =
      typeof window !== "undefined"
        ? localStorage.getItem("yaron_admin_password") || "YaronAdmin2024!"
        : "YaronAdmin2024!";

    // Accept custom saved password or master default YaronAdmin2024! / admin
    if (pwd === storedPassword || pwd === "YaronAdmin2024!" || pwd === "admin") {
      document.cookie = "yaron_admin_auth=1; path=/; max-age=604800; SameSite=Lax";
      try {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // Fallback gracefully on static hosting
      }
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
      return;
    }

    setError("Invalid password. Please enter the correct admin password.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {justReset && (
        <p
          role="status"
          className="border-brand-500/30 bg-brand-500/10 text-brand-700 flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your password has been updated. Sign in with the new one.
        </p>
      )}
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputCls}
        />
      </Field>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className={`${labelCls} mb-0`}>
            Password
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-brand-700 text-xs font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <AdminButton type="submit" variant="primary" loading={loading} className="mt-2 h-10">
        Sign in
      </AdminButton>
    </form>
  );
}
