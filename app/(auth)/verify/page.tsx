import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyPanel } from "@/components/auth/panels";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Enter the 6-digit code we sent to confirm your account.",
};

export default async function VerifyPage(props: { searchParams: Promise<{ email?: string }> }) {
  const searchParams = await props.searchParams;
  
  return (
    <AuthShell panel={<VerifyPanel />}>
      <VerifyOtpForm initialEmail={searchParams.email} />
    </AuthShell>
  );
}
