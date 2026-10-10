"use client";

import { useForm } from "@tanstack/react-form";
import {
  Activity,
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useMyServiceRequests, useUpdateMyProfile } from "@/hooks/citizen.hook";
import { cn } from "@/lib/utils";
import { CitizenTrustBadge } from "./CitizenTrustBadge";

const profileSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  nidNumber: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function CitizenProfileView() {
  const { data: meData, isLoading } = useGetMe();
  const user = meData?.data;

  const { data: requestsRes } = useMyServiceRequests();
  const requests = requestsRes?.data || [];
  const resolvedCount = requests.filter(
    (r) => r.status.toUpperCase() === "RESOLVED" || r.status.toUpperCase() === "CLOSED",
  ).length;
  const reviewsCount = requests.filter((r) => !!r.feedback).length;

  const updateProfileMutation = useUpdateMyProfile();

  const citizenProfile = user?.citizenProfile;
  const trustLevel = citizenProfile?.trustLevel || user?.trustLevel || "NEW";

  const firstName = citizenProfile?.firstName || user?.firstName || "";
  const lastName = citizenProfile?.lastName || user?.lastName || "";
  const displayName = user?.displayName || citizenProfile?.displayName || "";
  const phone = citizenProfile?.phone || user?.phone || "";
  const nidNumber = (user as any)?.nidNumber || (citizenProfile as any)?.nidNumber || "";

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      phone: "",
      nidNumber: "",
    } as ProfileFormValues,
    onSubmit: async ({ value }) => {
      await updateProfileMutation.mutateAsync({
        firstName: value.firstName?.trim() || undefined,
        lastName: value.lastName?.trim() || undefined,
        displayName: value.displayName?.trim() || undefined,
        phone: value.phone?.trim() || undefined,
        nidNumber: value.nidNumber?.trim() || undefined,
      });
    },
  });

  // Populate form when meData loads
  useEffect(() => {
    if (user) {
      form.setFieldValue("firstName", firstName);
      form.setFieldValue("lastName", lastName);
      form.setFieldValue("displayName", displayName);
      form.setFieldValue("phone", phone);
      form.setFieldValue("nidNumber", nidNumber);
    }
  }, [user, firstName, lastName, displayName, phone, nidNumber]);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-line border-t-ink/70 animate-spin mb-4" />
        <span className="tracking-wide text-sm font-mono">Loading citizen profile...</span>
      </div>
    );
  }

  const initials =
    (firstName?.[0] || "") + (lastName?.[0] || "") ||
    displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "C";

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const headerName = displayName || fullName || user?.email || "Citizen";

  const resolutionRate =
    requests.length > 0 ? Math.round((resolvedCount / requests.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Citizen Profile</h1>
          <p className="font-body text-xs sm:text-sm text-ink/60">
            Manage your verified citizen credentials, contact details, and municipal trust standing.
          </p>
        </div>
        <CitizenTrustBadge level={trustLevel} showPerk={true} />
      </div>

      {/* 2 Col x 2 Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Row 1, Col 1: Citizen Identity & Contact Details */}
        <div className="bg-paper p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <User className="size-4 text-ink/60" />
                <h2 className="font-display text-base font-semibold text-ink">Citizen Identity</h2>
              </div>
              {nidNumber ? (
                <Badge
                  variant="outline"
                  className="border-signal-resolved/40 bg-signal-resolved/5 text-signal-resolved text-[11px] font-mono"
                >
                  <ShieldCheck className="size-3 mr-1" /> Verified Citizen
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-line bg-field text-ink/60 text-[11px] font-mono"
                >
                  Unverified NID
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-field border border-line flex items-center justify-center text-ink font-display text-xl font-bold uppercase shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg text-ink font-semibold">{headerName}</h3>
                <p className="text-xs text-ink/60 font-body">Ward Resident • Citizen Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-field/40 border border-line/60 space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-ink/50 flex items-center gap-1">
                  <Mail className="size-3 opacity-60" /> Email
                </span>
                <p className="text-xs font-mono text-ink/80 truncate">{user?.email || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-field/40 border border-line/60 space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-ink/50 flex items-center gap-1">
                  <Phone className="size-3 opacity-60" /> Phone
                </span>
                <p className="text-xs font-mono text-ink/80 truncate">
                  {phone || "Not configured"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-field/30 border border-line/50 flex items-center justify-between text-xs font-body text-ink/70">
            <span className="flex items-center gap-1.5">
              <CreditCard className="size-3.5 opacity-60" />
              National ID (NID)
            </span>
            <span className="font-mono font-medium text-ink">
              {nidNumber ? `••••••••${nidNumber.slice(-4)}` : "Pending verification"}
            </span>
          </div>
        </div>

        {/* Row 1, Col 2: Civic Engagement & Municipal Activity Overview */}
        <div className="bg-paper p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-signal-progress" />
                <h2 className="font-display text-base font-semibold text-ink">Civic Engagement</h2>
              </div>
              <span className="text-[11px] font-mono text-ink/50 uppercase">Municipal Records</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-field/40 border border-line/60">
                <p className="font-display text-2xl font-bold text-ink">{requests.length}</p>
                <p className="text-[10px] font-mono text-ink/50 uppercase mt-0.5">Total Reports</p>
              </div>
              <div className="p-3 rounded-xl bg-field/40 border border-line/60">
                <p className="font-display text-2xl font-bold text-signal-resolved">
                  {resolvedCount}
                </p>
                <p className="text-[10px] font-mono text-ink/50 uppercase mt-0.5">Resolved</p>
              </div>
              <div className="p-3 rounded-xl bg-field/40 border border-line/60">
                <p className="font-display text-2xl font-bold text-signal-progress">
                  {reviewsCount}
                </p>
                <p className="text-[10px] font-mono text-ink/50 uppercase mt-0.5">Reviewed</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink/60">Municipal Resolution Rate</span>
                <span className="font-semibold text-ink">{resolutionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-field border border-line/50 overflow-hidden">
                <div
                  className="h-full bg-signal-resolved transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, resolutionRate)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-line/60 flex items-center justify-between">
            <span className="text-xs text-ink/60 font-body">Track status & community issues</span>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-8 text-xs cursor-pointer active:translate-y-px font-medium"
            >
              <Link href="/citizen/my-reports">
                My Reports <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Row 2, Col 1: Personal Information Form */}
        <div className="bg-paper p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <div className="pb-3 border-b border-line mb-3.5">
              <h2 className="font-display text-base font-semibold text-ink">
                Personal Information
              </h2>
              <p className="font-body text-xs text-ink/60">
                Official contact credentials and verified identity details.
              </p>
            </div>

            <form
              id="profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-3"
            >
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field
                  name="firstName"
                  children={(field) => (
                    <div className="space-y-1">
                      <label
                        htmlFor="firstName"
                        className="text-xs font-medium text-ink/80 flex items-center gap-1.5"
                      >
                        <User className="size-3.5 text-ink/40" /> First Name
                      </label>
                      <Input
                        id="firstName"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Jane"
                        className="bg-paper border-line text-sm"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="lastName"
                  children={(field) => (
                    <div className="space-y-1">
                      <label
                        htmlFor="lastName"
                        className="text-xs font-medium text-ink/80 flex items-center gap-1.5"
                      >
                        <User className="size-3.5 text-ink/40" /> Last Name
                      </label>
                      <Input
                        id="lastName"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Doe"
                        className="bg-paper border-line text-sm"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Display Name */}
              <form.Field
                name="displayName"
                children={(field) => (
                  <div className="space-y-1">
                    <label htmlFor="displayName" className="text-xs font-medium text-ink/80">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="bg-paper border-line text-sm"
                    />
                  </div>
                )}
              />

              {/* Phone Number & National ID in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field
                  name="phone"
                  children={(field) => (
                    <div className="space-y-1">
                      <label
                        htmlFor="phone"
                        className="text-xs font-medium text-ink/80 flex items-center gap-1.5"
                      >
                        <Phone className="size-3.5 text-ink/40" /> Phone Number
                      </label>
                      <Input
                        id="phone"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="bg-paper border-line text-sm font-mono"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="nidNumber"
                  children={(field) => (
                    <div className="space-y-1">
                      <label
                        htmlFor="nidNumber"
                        className="text-xs font-medium text-ink/80 flex items-center gap-1.5"
                      >
                        <CreditCard className="size-3.5 text-ink/40" /> National ID (NID)
                      </label>
                      <Input
                        id="nidNumber"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. 19942691234567890"
                        className="bg-paper border-line text-sm font-mono"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Read-Only Registered Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email-readonly"
                  className="text-xs font-medium text-ink/60 flex items-center gap-1.5"
                >
                  <Lock className="size-3 text-ink/40" /> Registered Email Address
                </label>
                <Input
                  id="email-readonly"
                  value={user?.email || ""}
                  disabled
                  className="bg-field/40 border-line/60 text-ink/60 text-sm cursor-not-allowed font-mono"
                />
              </div>
            </form>
          </div>

          <div className="pt-2 border-t border-line/60 flex justify-end">
            <Button
              type="submit"
              form="profile-form"
              variant="primary"
              disabled={updateProfileMutation.isPending}
              className="cursor-pointer active:translate-y-px text-xs px-5 py-2 font-medium"
            >
              {updateProfileMutation.isPending ? "Saving changes..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Row 2, Col 2: Trust Standing & Routing Privileges */}
        <div className="bg-paper p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-signal-progress" />
                <h2 className="font-display text-base font-semibold text-ink">Trust Standing</h2>
              </div>
              <span className="text-[11px] font-mono text-ink/50 uppercase">
                Active: <strong className="text-ink">{trustLevel}</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                className={cn(
                  "p-3 rounded-xl border space-y-1 transition-colors",
                  trustLevel === "NEW"
                    ? "border-signal-open/50 bg-signal-open/5 ring-1 ring-signal-open/30"
                    : "border-line/50 bg-field/20 opacity-75",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink">NEW CITIZEN</span>
                  {trustLevel === "NEW" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-signal-open uppercase font-semibold">
                      <Check className="size-3" /> Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink/60 leading-snug">
                  Standard intake queue with standard automated duplicate check.
                </p>
              </div>

              <div
                className={cn(
                  "p-3 rounded-lg border space-y-1 transition-colors",
                  trustLevel === "REGULAR"
                    ? "border-signal-progress/50 bg-signal-progress/5 ring-1 ring-signal-progress/30"
                    : "border-line/50 bg-field/20 opacity-75",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink">ACTIVE CONTRIBUTOR</span>
                  {trustLevel === "REGULAR" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-signal-progress uppercase font-semibold">
                      <Check className="size-3" /> Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink/60 leading-snug">
                  Priority triage queue and faster departmental dispatch routing.
                </p>
              </div>

              <div
                className={cn(
                  "p-3 rounded-lg border space-y-1 transition-colors",
                  trustLevel === "TRUSTED"
                    ? "border-signal-resolved/50 bg-signal-resolved/5 ring-1 ring-signal-resolved/30"
                    : "border-line/50 bg-field/20 opacity-75",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink">TRUSTED CITIZEN</span>
                  {trustLevel === "TRUSTED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-signal-resolved uppercase font-semibold">
                      <Check className="size-3" /> Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink/60 leading-snug">
                  Instant dispatch authorization. Highest priority routing in your municipality.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-field/30 border border-line/50 text-[11px] text-ink/60 leading-snug font-body">
            Providing your verified National ID (NID) helps accelerate your progression to Trusted
            Citizen status.
          </div>
        </div>
      </div>
    </div>
  );
}
