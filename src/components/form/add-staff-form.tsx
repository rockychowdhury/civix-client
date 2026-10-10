"use client";

import { useForm } from "@tanstack/react-form";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useCreateDispatcher, useCreateTechnician } from "@/hooks/staff.hook";
import { cn } from "@/lib/utils";
import { type AddStaffValues, addStaffFormSchema } from "@/validation";

export function AddStaffForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { data: userData } = useGetMe();

  const departmentMember = userData?.data?.staffProfile?.departmentMembers?.[0];
  const departmentId = departmentMember?.departmentId;
  const departmentName = departmentMember?.department?.name;

  const { mutate: createDispatcher, isPending: dispatcherPending } = useCreateDispatcher();
  const { mutate: createTechnician, isPending: technicianPending } = useCreateTechnician();

  const isPending = dispatcherPending || technicianPending;

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: undefined,
      designation: "",
      role: "technician",
    } as AddStaffValues,
    validators: {
      onSubmit: addStaffFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!departmentId) {
        toast.error("Department ID not found. Please try refreshing.");
        return;
      }

      const payloadData = {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
        password: value.password,
        phone: value.phone?.trim() || undefined,
        designation: value.designation?.trim() || undefined,
        departmentId: departmentId,
      };

      const handleSuccess = () => {
        router.push("/department/technicians");
      };

      if (value.role === "dispatcher") {
        createDispatcher(payloadData, { onSuccess: handleSuccess });
      } else {
        createTechnician(payloadData, { onSuccess: handleSuccess });
      }
    },
  });

  const generateSecurePassword = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const specials = "!@#$";
    const randChar = (set: string) => set[Math.floor(Math.random() * set.length)];

    const generated =
      `Civix` +
      randChar(letters) +
      randChar(lowers) +
      randChar(numbers) +
      randChar(specials) +
      Math.floor(100 + Math.random() * 900);

    form.setFieldValue("password", generated);
    setShowPassword(true);
    toast.success("Generated secure temporary password");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
    >
      {/* Left Column: Role Selector & Policy Notice (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Role Selection Card */}
        <div className="bg-paper border border-line/40 rounded-lg p-5 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink tracking-tight">
                Operational Role
              </h2>
              <span className="text-[11px] font-mono text-ink/40">Required</span>
            </div>
            <p className="text-xs text-ink/60 mt-0.5">
              Select the team member's functional permission level.
            </p>
          </div>

          <form.Field
            name="role"
            children={(field) => {
              const currentRole = field.state.value;
              return (
                <div className="space-y-3">
                  {/* Technician Role Radio Card */}
                  <label
                    className={cn(
                      "relative flex items-start gap-3.5 p-3.5 rounded-md border cursor-pointer transition-all duration-200 select-none group",
                      currentRole === "technician"
                        ? "border-ledger bg-ledger/5 shadow-2xs"
                        : "border-line/40 bg-field/20 hover:bg-field/40 hover:border-line/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="technician"
                      className="sr-only"
                      checked={currentRole === "technician"}
                      onChange={() => field.handleChange("technician")}
                    />

                    <div
                      className={cn(
                        "mt-0.5 size-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        currentRole === "technician"
                          ? "bg-ledger text-paper shadow-2xs"
                          : "bg-field text-ink/60 group-hover:text-ink",
                      )}
                    >
                      <Wrench className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-medium text-sm text-ink">
                          Technician
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-mono tracking-wider px-1.5 py-0",
                            currentRole === "technician"
                              ? "bg-ledger/15 text-ledger border-ledger/20"
                              : "text-ink/50",
                          )}
                        >
                          Field Ops
                        </Badge>
                      </div>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                        Executes on-site work orders, provides photographic proof, and logs repair
                        progress.
                      </p>
                    </div>

                    <div
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        currentRole === "technician"
                          ? "border-ledger bg-ledger text-paper"
                          : "border-line/60 bg-paper",
                      )}
                    >
                      {currentRole === "technician" && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                  </label>

                  {/* Dispatcher Role Radio Card */}
                  <label
                    className={cn(
                      "relative flex items-start gap-3.5 p-3.5 rounded-md border cursor-pointer transition-all duration-200 select-none group",
                      currentRole === "dispatcher"
                        ? "border-ledger bg-ledger/5 shadow-2xs"
                        : "border-line/40 bg-field/20 hover:bg-field/40 hover:border-line/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="dispatcher"
                      className="sr-only"
                      checked={currentRole === "dispatcher"}
                      onChange={() => field.handleChange("dispatcher")}
                    />

                    <div
                      className={cn(
                        "mt-0.5 size-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        currentRole === "dispatcher"
                          ? "bg-ledger text-paper shadow-2xs"
                          : "bg-field text-ink/60 group-hover:text-ink",
                      )}
                    >
                      <Headphones className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-medium text-sm text-ink">
                          Dispatcher
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-mono tracking-wider px-1.5 py-0",
                            currentRole === "dispatcher"
                              ? "bg-ledger/15 text-ledger border-ledger/20"
                              : "text-ink/50",
                          )}
                        >
                          Triage & Queue
                        </Badge>
                      </div>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                        Triages civic issue queue, creates work orders, and assigns technicians or
                        teams.
                      </p>
                    </div>

                    <div
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        currentRole === "dispatcher"
                          ? "border-ledger bg-ledger text-paper"
                          : "border-line/60 bg-paper",
                      )}
                    >
                      {currentRole === "dispatcher" && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                  </label>
                </div>
              );
            }}
          />
        </div>

        {/* Manager Review Notice */}
        <div className="bg-signal-progress/5 border border-signal-progress/25 p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert className="size-4 text-signal-progress shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-display font-medium text-ink">Manager Approval Notice</span>
            <p className="text-ink/70 leading-relaxed font-body">
              Account is created immediately in pending status. Department managers must verify the
              profile before full portal access is activated.
            </p>
          </div>
        </div>

        {/* Department Binding Context */}
        {departmentName && (
          <div className="flex items-center gap-2 text-xs text-ink/70 bg-field/30 border border-line/30 rounded-lg px-3.5 py-2.5">
            <Building2 className="size-4 text-ledger shrink-0" />
            <span className="truncate">
              Department: <strong className="text-ink font-medium">{departmentName}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right Column: Credentials Form Card (7 cols) */}
      <div className="lg:col-span-7 bg-paper border border-line/40 rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-line/30 pb-4">
          <h2 className="font-display text-base font-semibold text-ink tracking-tight">
            Identity & System Credentials
          </h2>
          <p className="text-xs text-ink/60 mt-0.5">
            Enter staff personal contact details and generate their provisional credentials.
          </p>
        </div>

        {/* 2-Column Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <form.Field
            name="firstName"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <label htmlFor="first-name-input" className="text-xs font-medium text-ink block">
                    First Name <span className="text-signal-open">*</span>
                  </label>
                  <Input
                    id="first-name-input"
                    autoComplete="given-name"
                    placeholder="e.g. Jane"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body",
                      isInvalid && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />

          {/* Last Name */}
          <form.Field
            name="lastName"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <label htmlFor="last-name-input" className="text-xs font-medium text-ink block">
                    Last Name <span className="text-signal-open">*</span>
                  </label>
                  <Input
                    id="last-name-input"
                    autoComplete="family-name"
                    placeholder="e.g. Doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body",
                      isInvalid && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />

          {/* Email Address */}
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <label htmlFor="email-input" className="text-xs font-medium text-ink block">
                    Official Email <span className="text-signal-open">*</span>
                  </label>
                  <Input
                    id="email-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="staff@dncc.gov.bd"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={cn(
                      "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body",
                      isInvalid && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />

          {/* Contact Phone */}
          <form.Field
            name="phone"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="phone-input" className="text-xs font-medium text-ink">
                      Contact Phone
                    </label>
                    <span className="text-[10px] font-mono text-ink/40">Optional</span>
                  </div>
                  <Input
                    id="phone-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+880 1712 345678"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    className={cn(
                      "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body",
                      isInvalid && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />

          {/* Internal Designation */}
          <form.Field
            name="designation"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="designation-input" className="text-xs font-medium text-ink">
                      Internal Designation
                    </label>
                    <span className="text-[10px] font-mono text-ink/40">Optional</span>
                  </div>
                  <Input
                    id="designation-input"
                    placeholder="e.g. Lead Maintenance Crew"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    className={cn(
                      "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body",
                      isInvalid && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />

          {/* Temporary Password with Generator */}
          <form.Field
            name="password"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password-input" className="text-xs font-medium text-ink">
                      Temporary Password <span className="text-signal-open">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="text-[11px] text-ledger hover:underline cursor-pointer flex items-center gap-1 font-mono transition-opacity hover:opacity-80"
                      title="Generate a secure temporary password"
                    >
                      <Sparkles className="size-3" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        "h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body pr-9",
                        isInvalid && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors cursor-pointer p-0.5"
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                  {isInvalid && (
                    <p className="text-[11px] text-destructive font-body">
                      {String(
                        field.state.meta.errors?.[0]?.message || field.state.meta.errors?.[0],
                      )}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Security Rule Checklist Pill */}
        <div className="bg-field/30 border border-line/30 rounded-md p-3 text-[11px] text-ink/60 flex items-center gap-2">
          <KeyRound className="size-3.5 text-ink/40 shrink-0" />
          <span>
            Requirement: Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter,
            and 1 number.
          </span>
        </div>

        {/* Action Footer */}
        <div className="border-t border-line/30 pt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/department/technicians")}
            className="text-xs text-ink/60 hover:text-ink cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending}
            loading={isPending}
            loadingText="Provisioning..."
            className="cursor-pointer text-xs font-medium bg-ledger text-paper hover:bg-ledger/90 shadow-2xs px-5 h-9"
          >
            Provision Staff Member
          </Button>
        </div>
      </div>
    </form>
  );
}
