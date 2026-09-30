"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useForgotPassword } from "@/hooks/auth.hook";
import { type ForgotPasswordValues, forgotPasswordFormSchema } from "@/validation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm({
    defaultValues: { email: "" },
    
    validators: {
      onChange: forgotPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordMutation.mutateAsync(value);
        toast.success("Reset code sent", {
          description: `If an account exists for ${value.email}, it's on the way.`,
        });
        const params = new URLSearchParams({ email: value.email });
        router.push(`/reset-password?${params.toString()}`);
      } catch (error: any) {
        toast.error("Couldn't send a reset code", {
          description: error?.data?.message || "Failed to send reset code. Please try again.",
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
                    disabled={forgotPasswordMutation.isPending}
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
        </FieldGroup>
      </form>



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
