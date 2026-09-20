import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ForgotPasswordPanel } from "@/components/auth/panels";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a single-use reset link for your Civix account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell panel={<ForgotPasswordPanel />}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
