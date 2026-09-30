"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/auth.hook";
import { type LoginValues, loginFormSchema } from "@/validation";
import GoogleLoginComponent from "@/components/modules/google-login/GoogleLogin";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: (res) => {
          toast.success("Welcome back", {
            description: "You're signed in. Your tracked reports are up to date.",
          });
          // Force a hard navigation so the proxy can evaluate roles and redirect
          window.location.assign(searchParams.get("redirectTo") || "/login");
        },
        onError: (error: any) => {
          toast.error("Couldn't log you in", {
            description: error.message || "Invalid credentials or network error.",
          });
        },
      });
    },
  });

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
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            );
          }}
        />

        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor={field.name}>Password</Label>
                  <Link
                    href="/forgot-password"
                    className="font-body text-xs text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && field.state.meta.errors ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            );
          }}
        />

        <Button
          type="submit"
          disabled={loginPending}
          loading={loginPending}
          loadingText="Signing in…"
          className="mt-2 self-start"
        >
          Log in
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      
      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

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
