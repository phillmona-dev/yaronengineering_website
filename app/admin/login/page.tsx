import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { AuthPageFrame } from "@/components/admin/AuthPageFrame";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthPageFrame kicker="Sign in">
      <Suspense fallback={<div className="bg-ink-100 h-48 animate-pulse rounded" />}>
        <LoginForm />
      </Suspense>
    </AuthPageFrame>
  );
}
