import type { Metadata } from "next";

import { RegisterForm } from "@/components/form/register-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Start reporting with just an email. Verify your identity later to unlock priority tracking.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
