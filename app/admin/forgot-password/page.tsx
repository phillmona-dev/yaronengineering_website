import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { AuthPageFrame } from "@/components/admin/AuthPageFrame";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthPageFrame kicker="Reset password">
      <ForgotPasswordForm />
    </AuthPageFrame>
  );
}
