import type { Metadata } from "next";

import { AuthShell } from "@/components/modules/auth/auth-shell";
import { ResetPasswordPanel } from "@/components/modules/auth/panels";
import { ResetPasswordForm } from "@/components/form/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Civix account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell panel={<ResetPasswordPanel />}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
