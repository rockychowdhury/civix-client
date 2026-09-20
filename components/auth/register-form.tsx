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
import { type RegisterValues, registerCitizenFormSchema } from "@/lib/validations/auth";
import { getErrorMessage } from "@/services/api.service";
import { authService } from "@/services/auth.service";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerCitizenFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: RegisterValues) {
    setPending(true);
    try {
      await authService.register(values);
      toast.success("Account created", {
        description: `We sent a 6-digit code to ${values.email}.`,
      });
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error("Couldn't create your account", {
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
          Create your account
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
          You can start reporting with just an email — verifying your identity later unlocks
          priority tracking.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" placeholder="Ayesha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" placeholder="Rahman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone <span className="text-ink/40">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+880 1XXX XXXXXX"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            loading={pending}
            loadingText="Creating account…"
            className="mt-2 self-start"
          >
            Create account
          </Button>
        </form>
      </Form>

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
