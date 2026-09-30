"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useResetPassword } from "@/hooks/auth.hook";
import { type ResetPasswordValues, resetPasswordFormSchema } from "@/validation";

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
          noValidate
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="otp"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Reset code</FieldLabel>
                    <Input
                      id={field.name}
                      readOnly={Boolean(initialOtp)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Check your inbox for the 6-digit code"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
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
          </FieldGroup>
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
