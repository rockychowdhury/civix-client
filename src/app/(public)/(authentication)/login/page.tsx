import type { Metadata } from "next";

import LoginForm from "@/components/form/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to track your reports on Civix.",
};

export default function LoginPage() {
  return <LoginForm />;
}
