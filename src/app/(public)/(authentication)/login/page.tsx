import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/modules/auth/auth-shell";
import { LoginForm } from "@/components/form/login-form";
import { LoginPanel } from "@/components/modules/auth/login-panel";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to track your reports on Civix.",
};

export default function LoginPage() {
  return (
    <AuthShell panel={<LoginPanel />}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
