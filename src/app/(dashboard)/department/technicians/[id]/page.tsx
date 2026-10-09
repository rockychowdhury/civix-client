"use client";

import { useGetStaffById } from "@/hooks/staff.hook";
import {
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  ShieldAlert,
  BadgeInfo,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading, isError } = useGetStaffById(id);
  const staff = response?.data;

  if (isLoading) {
    return <div className="p-8 text-ink/60">Loading profile...</div>;
  }

  if (isError || !staff) {
    return <div className="p-8 text-signal-open">Profile not found.</div>;
  }

  const status = staff.user?.status || "UNKNOWN";
  const roles = staff.user?.userRoles?.map((ur: any) => ur.role.code) || [];

  let statusColor = "bg-line/20 text-ink/70";
  if (status === "ACTIVE")
    statusColor = "bg-signal-resolved/20 text-signal-resolved border-signal-resolved/30";
  if (status === "INACTIVE")
    statusColor = "bg-signal-progress/20 text-signal-progress border-signal-progress/30";
  if (status === "SUSPENDED" || status === "BANNED")
    statusColor = "bg-signal-open/20 text-signal-open border-signal-open/30";

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-4">
        <Link href="/department/technicians" className="w-fit">
          <Button
            variant="ghost"
            className="pl-0 h-auto hover:bg-transparent text-ink/40 hover:text-ink font-body transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Directory
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-field rounded-full flex items-center justify-center text-ink/40 font-display text-3xl">
              {staff.firstName[0]}
              {staff.lastName[0]}
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-3xl font-semibold text-ink">
                {staff.firstName} {staff.lastName}
              </h1>
              <p className="text-ink/60 font-medium">{staff.designation || "Staff Member"}</p>
            </div>
          </div>
          <Badge variant="outline" className={`capitalize px-3 py-1 text-sm ${statusColor}`}>
            {status.toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-paper border border-line/10 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <h2 className="font-display text-xl font-medium text-ink border-b border-line/10 pb-4">
            Contact Information
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-field/50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-ink/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-ink/50 uppercase tracking-wide">Email Address</span>
                <span className="font-medium text-ink">{staff.user?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-field/50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-ink/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-ink/50 uppercase tracking-wide">Phone Number</span>
                <span className="font-medium text-ink">{staff.phone || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-paper border border-line/10 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <h2 className="font-display text-xl font-medium text-ink border-b border-line/10 pb-4">
            Role & Access
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-field/50 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-ink/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-ink/50 uppercase tracking-wide">System Roles</span>
                <div className="flex gap-2 flex-wrap mt-1">
                  {roles.map((r: string) => (
                    <Badge key={r} variant="outline" className="text-xs bg-field/30 border-line/20">
                      {r.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-field/50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-ink/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-ink/50 uppercase tracking-wide">
                  Department Assignments
                </span>
                <div className="flex flex-col gap-1 mt-1 text-sm font-medium text-ink">
                  {staff.departmentMembers?.map((dm: any) => (
                    <span key={dm.department.id}>
                      {dm.department.name} <span className="text-ink/40 text-xs">({dm.role})</span>
                    </span>
                  )) || "None"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
