"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/auth.hook";
import { type RegisterValues, registerCitizenFormSchema } from "@/validation";
import GoogleLoginComponent from "@/components/modules/google-login/GoogleLogin";

export function RegisterForm() {
  const router = useRouter();
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
        name: `${value.firstName} ${value.lastName}`,
        email: value.email,
        password: value.password,
        patient: {
          contactNumber: value.phone || "",
        },
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
            description: error.message || "Something went wrong.",
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
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="flex gap-3">
          <form.Field
            name="firstName"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex-1 space-y-2">
                  <Label htmlFor={field.name}>First name</Label>
                  <Input
                    id={field.name}
                    autoComplete="given-name"
                    placeholder="Ayesha"
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
            name="lastName"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex-1 space-y-2">
                  <Label htmlFor={field.name}>Last name</Label>
                  <Input
                    id={field.name}
                    autoComplete="family-name"
                    placeholder="Rahman"
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
        </div>

        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email address</Label>
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
          name="phone"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Phone <span className="text-ink/40">(optional)</span>
                </Label>
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
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
          disabled={registrationPending}
          loading={registrationPending}
          loadingText="Creating account…"
          className="mt-2 self-start"
        >
          Create account
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
