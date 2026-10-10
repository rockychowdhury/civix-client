import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyOtpForm } from "@/components/form/verify-otp-form";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Verify your email address to unlock priority tracking.",
};

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
