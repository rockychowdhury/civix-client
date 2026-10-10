"use client";

import { Mail, Phone, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useGetMunicipalityById } from "@/hooks/municipality.hook";
import { useGetMyCityProfile, useUpdateMyCityProfile } from "@/hooks/user.hook";
import { CityHeader } from "./city-ui";

export function CityProfileView() {
  const meQuery = useGetMe();
  const profileQuery = useGetMyCityProfile();
  const updateMutation = useUpdateMyCityProfile();

  const me = meQuery.data?.data as
    | {
        displayName?: string;
        email?: string;
        staffProfile?: {
          firstName?: string;
          lastName?: string;
          phone?: string;
          designation?: string;
          municipalityId?: string;
        } | null;
      }
    | undefined;

  const staff = me?.staffProfile;
  const municipalityId = staff?.municipalityId;
  const cityQuery = useGetMunicipalityById(municipalityId ?? "");

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", displayName: "" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (me && !hydrated) {
      setForm({
        firstName: staff?.firstName ?? "",
        lastName: staff?.lastName ?? "",
        phone: staff?.phone ?? "",
        displayName: me.displayName ?? "",
      });
      setHydrated(true);
    }
  }, [me, hydrated, staff]);

  if (meQuery.isLoading || profileQuery.isLoading) return <AdminSectionSkeleton />;
  if (meQuery.isError || !me) {
    return (
      <EmptyState
        title="Profile unavailable"
        body="Your admin profile could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => meQuery.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const city = cityQuery.data?.data as { name?: string; code?: string } | undefined;
  const profile = profileQuery.data?.data as { email?: string } | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() && !form.displayName.trim()) {
      toast.error("Provide a name for your profile");
      return;
    }
    updateMutation.mutate(
      Object.fromEntries(
        Object.entries({
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          displayName: form.displayName.trim() || undefined,
        }).filter(([, v]) => v !== undefined),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CityHeader
        eyebrow="Account management"
        title="My Profile"
        description="Your city admin identity — contact info, designation, and municipality assignment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Contact details</h2>
            <p className="font-body text-xs text-ink/60 mt-0.5">
              Updates apply to your municipal staff record.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="profile-first" className="text-xs font-medium text-ink/80">
                  First name
                </label>
                <Input
                  id="profile-first"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jane"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="profile-last" className="text-xs font-medium text-ink/80">
                  Last name
                </label>
                <Input
                  id="profile-last"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-display" className="text-xs font-medium text-ink/80">
                Display name
              </label>
              <Input
                id="profile-display"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="City Admin"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="profile-phone" className="text-xs font-medium text-ink/80">
                Phone
              </label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={updateMutation.isPending}
                className="cursor-pointer text-xs active:translate-y-px rounded-xs"
              >
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-line/50">
              <ShieldCheck className="size-4 text-ledger" />
              <h3 className="font-display text-sm font-semibold text-ink">Admin standing</h3>
            </div>
            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60 flex items-center gap-1.5">
                  <User className="size-3 text-ink/40" /> Role
                </span>
                <span className="font-mono font-semibold text-ink">CITY ADMIN</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60 flex items-center gap-1.5">
                  <Mail className="size-3 text-ink/40" /> Email
                </span>
                <span className="font-mono text-ink truncate max-w-[160px]">
                  {profile?.email || me.email || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60 flex items-center gap-1.5">
                  <Phone className="size-3 text-ink/40" /> Phone
                </span>
                <span className="font-mono text-ink">{staff?.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink/60">Designation</span>
                <span className="text-ink font-medium">
                  {staff?.designation || "City Administrator"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3 shadow-2xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">
              Municipality
            </h4>
            <p className="font-display text-lg font-semibold text-ink">
              {cityQuery.isLoading ? "…" : city?.name || "Assigned city"}
            </p>
            {city?.code && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                {city.code}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
