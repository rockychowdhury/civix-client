"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { type LoginValues, loginFormSchema } from "@/lib/validations/auth";
import { getErrorMessage } from "@/services/api.service";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: LoginValues) {
    setPending(true);
    try {
      await authService.login(values);
      toast.success("Welcome back", {
        description: "You're signed in. Your tracked reports are up to date.",
      });
      // Force a hard navigation so the proxy can evaluate roles and redirect
      window.location.assign(searchParams.get("redirectTo") || "/login");
    } catch (error) {
      toast.error("Couldn't log you in", {
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
          Log in
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
          Pick up where your last report left off.
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-4">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="font-body text-xs text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            loading={pending}
            loadingText="Signing in…"
            className="mt-2 self-start"
          >
            Log in
          </Button>
        </form>
      </Form>

      <p className="font-body text-sm text-ink/60">
        New to Civix?{" "}
        <Link
          href="/register"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
