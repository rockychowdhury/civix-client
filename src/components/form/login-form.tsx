"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import GoogleLoginComponent from "@/components/modules/google-login/GoogleLogin";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth.hook";
import { loginFormSchema } from "@/validation";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "dispatcher@email.com",
      password: "civixdispatcher",
    },

    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: ({ value }) => {
      const loginData = {
        email: value.email,
        password: value.password,
      };

      login(loginData, {
        onSuccess: (res) => {
          toast.success("Welcome back", {
            description: `${res.data?.user?.displayName} you are logged in successfully`,
          });
          router.push("/");
        },
        onError: (err: any) => {
          toast.error("Couldn't log you in", {
            description: err?.data?.message || "Invalid credentials or network error.",
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
            name="password"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between gap-4">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="font-body text-xs text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
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
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

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
