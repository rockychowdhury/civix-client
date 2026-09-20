import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { LoginPanel } from "@/components/auth/login-panel";

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
