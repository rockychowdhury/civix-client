"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ResetPasswordValues, resetPasswordFormSchema } from "@/lib/validations/auth";
import { getErrorMessage } from "@/services/api.service";
import { authService } from "@/services/auth.service";
import { PasswordStrength } from "./password-strength";

const REDIRECT_DELAY_MS = 1600;

export function ResetPasswordForm({
  initialEmail = "",
  initialOtp = "",
}: {
  initialEmail?: string;
  initialOtp?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: initialEmail,
      otp: initialOtp,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: ResetPasswordValues) {
    setPending(true);
    try {
      await authService.resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      setDone(true);
      toast.success("Password updated", {
        description: "Taking you back to log in.",
      });
      window.setTimeout(() => router.push("/login"), REDIRECT_DELAY_MS);
    } catch (error) {
      toast.error("Couldn't update your password", {
        description: getErrorMessage(error),
      });
    } finally {
      setPending(false);
    }
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={Boolean(initialEmail)}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset code</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={Boolean(initialOtp)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Check your inbox for the 6-digit code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <PasswordStrength value={field.value} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              loading={pending}
              loadingText="Updating…"
              className="mt-2 self-start"
            >
              Update password
            </Button>
          </form>
        </Form>
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
