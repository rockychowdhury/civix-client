import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/form/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a single-use reset link for your Civix account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
