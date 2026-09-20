import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordPanel } from "@/components/auth/panels";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Civix account.",
};

export default async function ResetPasswordPage(props: { searchParams: Promise<{ email?: string; otp?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <AuthShell panel={<ResetPasswordPanel />}>
      <ResetPasswordForm initialEmail={searchParams.email} initialOtp={searchParams.otp} />
    </AuthShell>
  );
}
