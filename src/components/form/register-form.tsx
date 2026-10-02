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
import { useRegistration } from "@/hooks/auth.hook";
import { type RegisterValues, registerCitizenFormSchema } from "@/validation";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: registration, isPending: registrationPending } = useRegistration();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: undefined,
    } as RegisterValues,
    validators: {
      onSubmit: registerCitizenFormSchema,
    },
    onSubmit: ({ value }) => {
      // Create payload according to API expectation
      const registrationData = {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
        phone: value.phone || undefined,
      };

      registration(registrationData as any, {
        onSuccess: (res: any) => {
          if (res && res.success === false) {
            toast.error("Couldn't create your account", {
              description: "Something went wrong. Please try again",
            });
            return;
          }

          toast.success("Account created", {
            description: `We sent a 6-digit code to ${value.email}.`,
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/register/verify-account?${params.toString()}`);
        },
        onError: (error: any) => {
          toast.error("Couldn't create your account", {
            description: error?.data?.message || "Something went wrong. Please try again.",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          Create your account
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
          You can start reporting with just an email — verifying your identity later unlocks
          priority tracking.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
      >
        <FieldGroup>
          <div className="flex gap-3">
            <form.Field
              name="firstName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="flex-1">
                    <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                    <Input
                      id={field.name}
                      autoComplete="given-name"
                      placeholder="Ayesha"
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
              name="lastName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="flex-1">
                    <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                    <Input
                      id={field.name}
                      autoComplete="family-name"
                      placeholder="Rahman"
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
          </div>

          <form.Field
            name="email"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
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
            name="phone"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Phone <span className="text-ink/40">(optional)</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+880 1XXX XXXXXX"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
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
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
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
            disabled={registrationPending}
            loading={registrationPending}
            loadingText="Creating account…"
            className="mt-2 self-start"
          >
            Create account
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <p className="font-body text-sm text-ink/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
