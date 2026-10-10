"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import GoogleLoginComponent from "@/components/modules/google-login/GoogleLogin";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLES } from "@/constant/role.constant";
import { useLogin } from "@/hooks/auth.hook";
import { loginFormSchema } from "@/validation";

const DEMO_ACCOUNTS = [
  {
    role: USER_ROLES.SUPER_ADMIN,
    label: "Super Admin",
    email: "superadmin@gmail.com",
    password: "civixsuperadmin",
  },
  {
    role: USER_ROLES.CITY_ADMIN,
    label: "City Admin",
    email: "cityadmin@civix.com",
    password: "civixcityadmin",
  },
  {
    role: USER_ROLES.DEPARTMENT_MANAGER,
    label: "Department Manager",
    email: "department@manager.com",
    password: "civixdepartmentmanager",
  },
  {
    role: USER_ROLES.DISPATCHER,
    label: "Dispatcher",
    email: "dispatcher@email.com",
    password: "civixdispatcher",
  },
  {
    role: USER_ROLES.TECHNICIAN,
    label: "Technician",
    email: "technician@email.com",
    password: "civixtechnician",
  },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "rocky20809@gmail.com",
      password: "shahin567",
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
        onSuccess: (res: any) => {
          queryClient.invalidateQueries({ queryKey: ["user"] });
          const userName =
            res.data?.user?.displayName ||
            (res.data?.user?.citizenProfile?.firstName
              ? `${res.data.user.citizenProfile.firstName} ${res.data.user.citizenProfile.lastName || ""}`.trim()
              : null) ||
            res.data?.user?.email;

          toast.success("Welcome back", {
            description: userName
              ? `${userName}, you are logged in successfully.`
              : "You are logged in successfully.",
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

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="flex w-full border-b border-line/20 rounded-none p-0 bg-transparent h-auto justify-start gap-6">
          <TabsTrigger
            value="login"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-ledger data-[state=active]:text-ledger data-[state=active]:!bg-transparent data-[state=active]:!shadow-none text-ink/60 font-medium py-3 px-1 hover:text-ink focus-visible:outline-none focus-visible:ring-0 transition-colors cursor-pointer"
          >
            Log in manually
          </TabsTrigger>
          <TabsTrigger
            value="demo"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-ledger data-[state=active]:text-ledger data-[state=active]:!bg-transparent data-[state=active]:!shadow-none text-ink/60 font-medium py-3 px-1 hover:text-ink focus-visible:outline-none focus-visible:ring-0 transition-colors cursor-pointer"
          >
            Demo Accounts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-8 flex flex-col gap-8">
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
        </TabsContent>

        <TabsContent value="demo" className="mt-8 flex flex-col gap-4 focus-visible:outline-none">
          <div className="mb-2">
            <p className="font-body text-sm text-ink/60">
              Select a role below to instantly log in and explore the platform.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                className="group flex items-center justify-between w-full p-4 rounded-xl border border-line/40 bg-paper hover:border-ledger/50 hover:bg-field/30 transition-all cursor-pointer text-left shadow-sm hover:shadow"
                onClick={() => {
                  login(
                    { email: account.email, password: account.password },
                    {
                      onSuccess: (res: any) => {
                        queryClient.invalidateQueries({ queryKey: ["user"] });
                        const userName =
                          res.data?.user?.displayName ||
                          (res.data?.user?.citizenProfile?.firstName
                            ? `${res.data.user.citizenProfile.firstName} ${res.data.user.citizenProfile.lastName || ""}`.trim()
                            : null) ||
                          account.label;

                        toast.success("Welcome back", {
                          description: `${userName}, you are logged in successfully.`,
                        });
                        router.push("/");
                      },
                      onError: (err: any) => {
                        toast.error("Couldn't log you in", {
                          description:
                            err?.data?.message || "Invalid credentials or network error.",
                        });
                      },
                    },
                  );
                }}
                disabled={loginPending}
              >
                <div>
                  <p className="font-display font-semibold text-ink group-hover:text-ledger transition-colors">
                    {account.label}
                  </p>
                  <p className="font-body text-xs text-ink/50 mt-1">{account.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-field/50 flex items-center justify-center group-hover:bg-ledger/10 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-ledger transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
