import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/modules/auth/auth-shell";
import { VerifyPanel } from "@/components/modules/auth/panels";
import { VerifyOtpForm } from "@/components/form/verify-otp-form";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Verify your email address to unlock priority tracking.",
};

export default function VerifyAccountPage() {
  return (
    <AuthShell panel={<VerifyPanel />}>
      <Suspense fallback={null}>
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}
