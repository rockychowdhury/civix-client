import type { Metadata } from "next";

import { AuthShell } from "@/components/modules/auth/auth-shell";
import { VerifyPanel } from "@/components/modules/auth/panels";
import { VerifyOtpForm } from "@/components/form/verify-otp-form";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Enter the 6-digit code we sent to confirm your account.",
};

export default function VerifyPage() {
  return (
    <AuthShell panel={<VerifyPanel />}>
      <VerifyOtpForm />
    </AuthShell>
  );
}
