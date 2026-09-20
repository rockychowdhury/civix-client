"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { type ForgotPasswordValues, forgotPasswordFormSchema } from "@/lib/validations/auth";
import { getErrorMessage } from "@/services/api.service";
import { authService } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setPending(true);
    try {
      await authService.forgotPassword(values);
      setSubmitted(true);
      toast.success("Reset code sent", {
        description: `If an account exists for ${values.email}, it's on the way.`,
      });
    } catch (error) {
      toast.error("Couldn't send a reset code", {
        description: getErrorMessage(error),
      });
    } finally {
      setPending(false);
    }
  }

  const email = form.getValues("email");

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
                    disabled={submitted}
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

          {!submitted && (
            <Button
              type="submit"
              loading={pending}
              loadingText="Sending code…"
              className="self-start"
            >
              Send reset code
            </Button>
          )}
        </form>
      </Form>

      {submitted && (
        <div className="animate-slide-up border-l-2 border-signal-resolved pl-5 motion-reduce:animate-none">
          <p className="font-body text-sm leading-relaxed text-ink/75">
            If an account exists for <span className="font-mono text-ink">{email}</span>, we&apos;ve
            sent a reset code.
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
