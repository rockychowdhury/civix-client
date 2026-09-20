"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { type OtpValues, otpFormSchema } from "@/lib/validations/auth";
import { getErrorMessage } from "@/services/api.service";
import { authService } from "@/services/auth.service";

const TOTAL_DIGITS = 6;
const EXPIRY_SECONDS = 600;
const RESEND_AFTER_SECONDS = 45;
const OTP_SLOTS = Array.from({ length: TOTAL_DIGITS }, (_, index) => index);

function formatCountdown(totalSeconds: number) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VerifyOtpForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { email: initialEmail, otp: "" },
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

  async function onSubmit(values: OtpValues) {
    setPending(true);
    try {
      await authService.verifyAccount(values);
      toast.success("Account verified", {
        description: "Your reports now get priority in duplicate detection.",
      });
      router.push("/");
    } catch (error) {
      toast.error("Couldn't verify that code", {
        description: getErrorMessage(error),
      });
    } finally {
      setPending(false);
    }
  }

  const hasError = Boolean(form.formState.errors.otp);

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormMessage />
                <Input type="email" autoComplete="email" {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={TOTAL_DIGITS}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup>
                      {OTP_SLOTS.map((slotIndex) => (
                        <InputOTPSlot key={slotIndex} index={slotIndex} aria-invalid={hasError} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

          <Button type="submit" loading={pending} loadingText="Verifying…" className="self-start">
            Verify
          </Button>
        </form>
      </Form>

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
