import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/form/reset-password-form";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Civix account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
