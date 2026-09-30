"use client";

import { useForm } from "@tanstack/react-form";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useVerifyAccount } from "@/hooks/auth.hook";
import { cn } from "@/lib/utils";
import { type OtpValues, otpFormSchema } from "@/validation";

const TOTAL_DIGITS = 6;
const EXPIRY_SECONDS = 600;
const RESEND_AFTER_SECONDS = 45;
const OTP_SLOTS = Array.from({ length: TOTAL_DIGITS }, (_, index) => index);

function formatCountdown(totalSeconds: number) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [elapsed, setElapsed] = useState(0);
  const { mutate: verify, isPending: verifyPending } = useVerifyAccount();

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
    
    validators: {
      onChange: otpFormSchema,
    },
    onSubmit: ({ value }) => {
      verify(value, {
        onSuccess: (res: any) => {
          if (res && res.success === false) {
             toast.error("Couldn't verify that code", {
               description: "Invalid OTP code.",
             });
             return;
          }
          toast.success("Account verified", {
            description: "Your reports now get priority in duplicate detection.",
          });
          router.push("/");
        },
        onError: (error: any) => {
          toast.error("Couldn't verify that code", {
            description: error?.data?.message || "Invalid OTP code.",
          });
        }
      });
    },
  });

  useEffect(() => {
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresIn = Math.max(0, EXPIRY_SECONDS - elapsed);
  const resendIn = Math.max(0, RESEND_AFTER_SECONDS - elapsed);
  const canResend = resendIn === 0;

  function handleResend() {
    setElapsed(0);
    toast.success("New code sent", {
      description: "Check your inbox — the previous code is now invalid.",
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-signal-resolved">
          Verification
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          Enter your 6-digit code
        </h1>
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
            children={(field) => (
              <Input
                type="hidden"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <form.Field
            name="otp"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <InputOTP
                    maxLength={TOTAL_DIGITS}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup>
                      {OTP_SLOTS.map((slotIndex) => (
                        <InputOTPSlot key={slotIndex} index={slotIndex} aria-invalid={isInvalid} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-mono text-xs tabular-nums text-ink/50">
              Code expires in {formatCountdown(expiresIn)}
            </p>
            <button
              type="button"
              disabled={!canResend}
              onClick={handleResend}
              className={cn(
                "font-body text-xs transition-colors",
                canResend
                  ? "text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                  : "cursor-not-allowed text-ink/35",
              )}
            >
              {canResend ? "Resend code" : `Resend code in ${resendIn}s`}
            </button>
          </div>

          <Button
            type="submit"
            disabled={verifyPending}
            loading={verifyPending}
            loadingText="Verifying…"
            className="self-start"
          >
            Verify
          </Button>
        </FieldGroup>
      </form>

      <p className="font-body text-sm text-ink/60">
        Wrong contact details?{" "}
        <Link
          href="/register"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          Start over
        </Link>
      </p>
    </div>
  );
}
