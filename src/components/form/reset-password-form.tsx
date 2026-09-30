"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/auth.hook";
import { type ResetPasswordValues, resetPasswordFormSchema } from "@/validation";
import { PasswordStrength } from "./password-strength";

const REDIRECT_DELAY_MS = 1600;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialOtp = searchParams.get("otp") || "";
  const [done, setDone] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      otp: initialOtp,
      newPassword: "",
      confirmPassword: "",
    },
    
    validators: {
      onChange: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPasswordMutation.mutateAsync({
          email: value.email,
          otp: value.otp,
          password: value.newPassword,
        });
        setDone(true);
        toast.success("Password updated", {
          description: "Taking you back to log in.",
        });
        window.setTimeout(() => router.push("/login"), REDIRECT_DELAY_MS);
      } catch (error: any) {
        toast.error("Couldn't update your password", {
          description: error.message || "Failed to reset password.",
        });
      }
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          Choose a new password
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
          Use at least 6 characters. Longer passphrases beat complicated ones.
        </p>
      </header>

      {done ? (
        <div className="animate-slide-up border-l-2 border-signal-resolved pl-5 motion-reduce:animate-none">
          <p className="font-body text-sm leading-relaxed text-ink/75">
            Your password has been updated. Taking you back to log in…
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
          noValidate
        >
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  readOnly={Boolean(initialEmail)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="otp"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Reset code</Label>
                <Input
                  id={field.name}
                  readOnly={Boolean(initialOtp)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Check your inbox for the 6-digit code"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="newPassword"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>New password</Label>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <PasswordStrength value={field.state.value} />
                {field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Confirm new password</Label>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={isSubmitting}
                loadingText="Updating…"
                className="mt-2 self-start"
              >
                Update password
              </Button>
            )}
          />
        </form>
      )}

      <p className="font-body text-sm text-ink/60">
        <Link
          href="/login"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
