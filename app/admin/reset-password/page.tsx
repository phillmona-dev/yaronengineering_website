import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { AuthPageFrame } from "@/components/admin/AuthPageFrame";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthPageFrame kicker="New password">
      <Suspense fallback={<div className="bg-ink-100 h-48 animate-pulse rounded" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageFrame>
  );
}
