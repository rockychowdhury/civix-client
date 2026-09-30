"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/auth.hook";
import { type ForgotPasswordValues, forgotPasswordFormSchema } from "@/validation";

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm({
    defaultValues: { email: "" },
    
    validators: {
      onChange: forgotPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordMutation.mutateAsync(value);
        setSubmittedEmail(value.email);
        toast.success("Reset code sent", {
          description: `If an account exists for ${value.email}, it's on the way.`,
        });
      } catch (error: any) {
        toast.error("Couldn't send a reset code", {
          description: error.message || "Failed to send reset code.",
        });
      }
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          Reset your password
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
          We&apos;ll send a single-use code. It expires in 5 minutes.
        </p>
      </header>

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
                disabled={!!submittedEmail}
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

        {!submittedEmail && (
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={isSubmitting}
                loadingText="Sending code…"
                className="self-start"
              >
                Send reset code
              </Button>
            )}
          />
        )}
      </form>

      {submittedEmail && (
        <div className="animate-slide-up border-l-2 border-signal-resolved pl-5 motion-reduce:animate-none">
          <p className="font-body text-sm leading-relaxed text-ink/75">
            If an account exists for <span className="font-mono text-ink">{submittedEmail}</span>,
            we&apos;ve sent a reset code.
          </p>
          <Link
            href="/reset-password"
            className="mt-3 inline-block font-body text-xs text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            I have a code — reset my password
          </Link>
        </div>
      )}

      <p className="font-body text-sm text-ink/60">
        Remembered it?{" "}
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
