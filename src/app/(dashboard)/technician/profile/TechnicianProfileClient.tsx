"use client";

import { useState } from "react";
import { useGetMe } from "@/hooks/auth.hook";
import { Switch } from "@/components/ui/switch";
import { User, Map, Wrench, Calendar as CalendarIcon, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TechnicianProfileClient() {
  const { data: meData, isLoading } = useGetMe();
  
  // Availability toggle state (in a real app, this would mutate to backend)
  const [isAvailable, setIsAvailable] = useState(true);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
        <span className="tracking-wide text-sm">Loading profile...</span>
      </div>
    );
  }

  const staffProfile = meData?.data?.staffProfile;
  const user = meData?.data;

  // Mocked for now if not available in real payload
  const coverageZones = ["North Zone", "Downtown"];
  const skills = ["Plumbing", "Electrical", "General Maintenance"];

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl animate-slide-up motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-ink">Technician Profile</h1>

      {/* Main Card */}
      <div className="bg-paper p-8 rounded-xl border border-line shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="h-24 w-24 rounded-full bg-ledger/10 flex items-center justify-center text-ledger text-3xl font-display shrink-0 border-2 border-ledger/20">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl text-ink font-semibold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-ink/60">{staffProfile?.role || "Technician"}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-sm text-ink/70">
                <Mail className="h-4 w-4 mr-2 opacity-50" />
                {user?.email}
              </div>
              <div className="flex items-center text-sm text-ink/70">
                <Phone className="h-4 w-4 mr-2 opacity-50" />
                +1 (555) 019-2831
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Toggle */}
        <div className="bg-paper p-6 rounded-xl border border-line flex flex-col justify-between shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="font-display text-lg font-medium text-ink flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-ink/50" />
              Availability Status
            </h3>
            <p className="text-sm text-ink/60">
              You won't receive new automated assignments while this is off.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-field/30 border border-line/50">
            <span className={`font-medium ${isAvailable ? 'text-ledger' : 'text-ink/50'}`}>
              {isAvailable ? "Taking Assignments" : "Currently Unavailable"}
            </span>
            <Switch 
              checked={isAvailable} 
              onCheckedChange={setIsAvailable} 
            />
          </div>
        </div>

        {/* Coverage & Skills */}
        <div className="bg-paper p-6 rounded-xl border border-line flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-display text-lg font-medium text-ink flex items-center mb-3">
              <Map className="h-5 w-5 mr-2 text-ink/50" />
              Coverage Zones
            </h3>
            <div className="flex flex-wrap gap-2">
              {coverageZones.map(zone => (
                <Badge key={zone} variant="secondary" className="bg-field border-line/30">
                  {zone}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-medium text-ink flex items-center mb-3">
              <Wrench className="h-5 w-5 mr-2 text-ink/50" />
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill} variant="secondary" className="bg-field border-line/30">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
