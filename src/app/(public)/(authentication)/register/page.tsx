import type { Metadata } from "next";

import { AuthShell } from "@/components/modules/auth/auth-shell";
import { RegisterPanel } from "@/components/modules/auth/panels";
import { RegisterForm } from "@/components/form/register-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Start reporting with just an email. Verify your identity later to unlock priority tracking.",
};

export default function RegisterPage() {
  return (
    <AuthShell panel={<RegisterPanel />}>
      <RegisterForm />
    </AuthShell>
  );
}
