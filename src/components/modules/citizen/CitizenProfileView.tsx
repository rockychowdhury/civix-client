"use client";

import { useForm } from "@tanstack/react-form";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useMyServiceRequests, useUpdateMyProfile } from "@/hooks/citizen.hook";
import { CitizenTrustBadge } from "./CitizenTrustBadge";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
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

  const updateProfileMutation = useUpdateMyProfile();

  const citizenProfile = user?.citizenProfile;
  const trustLevel = citizenProfile?.trustLevel || user?.trustLevel || "NEW";

  const firstName = citizenProfile?.firstName || user?.firstName || "";
  const lastName = citizenProfile?.lastName || user?.lastName || "";
  const phone = citizenProfile?.phone || user?.phone || "";
  const address = citizenProfile?.address || user?.address || "";

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
    } as ProfileFormValues,
    onSubmit: async ({ value }) => {
      await updateProfileMutation.mutateAsync({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        phone: value.phone?.trim() || undefined,
        address: value.address?.trim() || undefined,
      });
    },
  });

  // Populate form when meData loads
  useEffect(() => {
    if (user) {
      form.setFieldValue("firstName", firstName);
      form.setFieldValue("lastName", lastName);
      form.setFieldValue("phone", phone);
      form.setFieldValue("address", address);
    }
  }, [user, firstName, lastName, phone, address]);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-line border-t-ink/70 animate-spin mb-4" />
        <span className="tracking-wide text-sm">Loading your profile...</span>
      </div>
    );
  }

  const initials =
    (firstName?.[0] || "") + (lastName?.[0] || "") || user?.email?.[0]?.toUpperCase() || "C";

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Citizen Profile</h1>
        <p className="font-body text-sm text-ink/60">
          Manage your personal details, contact preferences, and municipal trust standing.
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-paper p-6 sm:p-8 rounded-xl border border-line shadow-xs">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-full bg-field border-2 border-line flex items-center justify-center text-ink font-display text-2xl font-bold uppercase shrink-0">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email}
                </h2>
                <CitizenTrustBadge level={trustLevel} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink/60 font-body">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5 opacity-60" />
                  {user?.email}
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Phone className="size-3.5 opacity-60" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-around sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-line text-center">
            <div className="px-3">
              <p className="font-display text-xl font-bold text-ink">{requests.length}</p>
              <p className="text-[11px] font-mono text-ink/50 uppercase">Reports</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="px-3">
              <p className="font-display text-xl font-bold text-signal-resolved">{resolvedCount}</p>
              <p className="text-[11px] font-mono text-ink/50 uppercase">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Edit Form (2 cols) + Trust Level Standing (1 col) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="md:col-span-2 bg-paper p-6 rounded-xl border border-line space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="font-display text-lg font-semibold text-ink">Personal Information</h3>
            <p className="font-body text-xs text-ink/60">
              Update your contact info for municipal notifications and service verification.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field
                name="firstName"
                validators={{
                  onChange: ({ value }) => (!value ? "First name is required" : undefined),
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-xs font-medium text-ink/80">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Jane"
                      className="bg-paper border-line text-sm"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] text-red-500 font-mono">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="lastName"
                validators={{
                  onChange: ({ value }) => (!value ? "Last name is required" : undefined),
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-xs font-medium text-ink/80">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Doe"
                      className="bg-paper border-line text-sm"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] text-red-500 font-mono">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <form.Field
              name="phone"
              children={(field) => (
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-medium text-ink/80">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-paper border-line text-sm font-mono"
                  />
                  <p className="text-[11px] text-ink/40 font-mono">
                    Used for SMS notifications when emergency issues in your ward are updated.
                  </p>
                </div>
              )}
            />

            <form.Field
              name="address"
              children={(field) => (
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-medium text-ink/80">
                    Residential Address
                  </label>
                  <Input
                    id="address"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="123 Civic Ave, Ward 4"
                    className="bg-paper border-line text-sm"
                  />
                </div>
              )}
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={updateProfileMutation.isPending}
                className="cursor-pointer"
              >
                {updateProfileMutation.isPending ? "Saving changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Trust Level Perks Explanation */}
        <div className="bg-paper p-6 rounded-xl border border-line space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-signal-progress" />
            <h3 className="font-display text-base font-semibold text-ink">Trust Standing</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-line bg-field/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-ink">NEW</span>
                {trustLevel === "NEW" && (
                  <span className="text-[10px] font-mono text-signal-open uppercase font-semibold">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink/60 leading-normal">
                Standard intake queue with standard automated duplicate check.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-line bg-field/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-ink">REGULAR</span>
                {trustLevel === "REGULAR" && (
                  <span className="text-[10px] font-mono text-signal-progress uppercase font-semibold">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink/60 leading-normal">
                Priority triage queue and faster department routing.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-line bg-field/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-ink">TRUSTED</span>
                {trustLevel === "TRUSTED" && (
                  <span className="text-[10px] font-mono text-signal-resolved uppercase font-semibold">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink/60 leading-normal">
                Instant dispatch authorization. Highest priority routing in your municipality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
