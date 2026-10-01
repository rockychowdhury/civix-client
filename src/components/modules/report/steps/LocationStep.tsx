"use client";

import { CheckCircle2, ChevronsUpDown, MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  useGetMunicipalities,
  useGetZones,
  useGetWards,
} from "@/hooks";

const LAST_USED_WARD_KEY = "civix_last_used_ward";

interface LocationStepProps {
  form: any;
}

export function LocationStep({ form }: LocationStepProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const [openWard, setOpenWard] = useState(false);
  const [openZone, setOpenZone] = useState(false);

  // Silent personalization: surface the citizen's most recently used ward first
  const [lastUsedWardId, setLastUsedWardId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(LAST_USED_WARD_KEY);
  });

  const [openMunicipality, setOpenMunicipality] = useState(false);

  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } = useGetMunicipalities();
  const municipalities = municipalitiesData?.data || [];

  return (
    <form.Subscribe
      selector={(state: any) => state.values.location}
      children={(location: any) => {
        const { data: zonesData, isLoading: isLoadingZones } = useGetZones(location?.municipalityId);
        const zones = zonesData?.data || [];

        const { data: wardsData, isLoading: isLoadingWards } = useGetWards(location?.zoneId);
        const wards = wardsData?.data || [];

        const sortedWards = useMemo(() => {
          if (!lastUsedWardId) return wards;
          return [...wards].sort((a, b) =>
            a.id === lastUsedWardId ? -1 : b.id === lastUsedWardId ? 1 : 0,
          );
        }, [lastUsedWardId, wards]);

        const watchLat = location?.latitude;
        const watchLng = location?.longitude;
        const hasCoordinates = watchLat != null && watchLng != null;

        const handleGeolocation = () => {
          setIsLocating(true);
          if (!navigator.geolocation) {
            setIsLocating(false);
            setShowManual(true);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              form.setFieldValue("location.latitude", latitude);
              form.setFieldValue("location.longitude", longitude);

              // Mock reverse geocode
              setTimeout(() => {
                form.setFieldValue("location.address", "123 Civic Way, City Center");
                if (municipalities.length > 0) {
                  form.setFieldValue("location.municipalityId", municipalities[0].id);
                }
                setIsLocating(false);
                setShowManual(true);
              }, 800);
            },
            () => {
              setIsLocating(false);
              setShowManual(true);
            },
            { timeout: 10000 },
          );
        };

        return (
          <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
            {!hasCoordinates && !showManual && (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-line bg-paper px-6 py-12 text-center">
                <div className="rounded-full bg-ledger/10 p-4">
                  <Navigation className="h-8 w-8 text-ledger" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-medium text-ink">Where is the issue?</h3>
                  <p className="font-body text-sm text-ink/60">
                    We'll use this only to pinpoint the issue location.
                  </p>
                </div>
                <Button
                  onClick={handleGeolocation}
                  disabled={isLocating}
                  className="w-full max-w-sm mt-2"
                  size="lg"
                  type="button"
                >
                  {isLocating ? "Finding location..." : "Use my current location"}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="text-sm font-medium text-ink/60 underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink"
                >
                  Enter address manually
                </button>
              </div>
            )}

            {(hasCoordinates || showManual) && (
              <div className="space-y-6">
                {hasCoordinates && (
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-line bg-ink/[0.02]">
                    {/* Static Map Preview Mock */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ledger text-white shadow-md">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="mt-1 flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-ink shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-ledger" />
                          Location found
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <form.Field
                      name="location.address"
                      children={(field: any) => (
                        <>
                          <Input
                            id="address"
                            placeholder="e.g. 123 Main St"
                            value={field.state.value || ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          {field.state.meta.isTouched && !field.state.meta.isValid && (
                            <p className="text-sm text-signal-open">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <form.Field
                      name="location.landmark"
                      children={(field: any) => (
                        <Input
                          id="landmark"
                          placeholder="e.g. Near the park"
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                    <form.Field
                      name="location.postalCode"
                      children={(field: any) => (
                        <Input
                          id="postalCode"
                          placeholder="e.g. 12345"
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label>Municipality</Label>
                    <Popover open={openMunicipality} onOpenChange={setOpenMunicipality}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          role="combobox"
                          aria-expanded={openMunicipality}
                          className="justify-between bg-field border border-line text-ink font-normal w-full h-11 hover:border-ink/45 hover:-translate-y-0 shadow-none px-3.5"
                        >
                          {location?.municipalityId
                            ? municipalities.find((m) => m.id === location.municipalityId)?.name
                            : isLoadingMunicipalities
                              ? "Loading..."
                              : "Select municipality..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search municipality..." />
                          <CommandList>
                            <CommandEmpty>No municipality found.</CommandEmpty>
                            <CommandGroup>
                              {municipalities.map((municipality) => (
                                <CommandItem
                                  key={municipality.id}
                                  value={municipality.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    form.setFieldValue("location.municipalityId", municipality.id);
                                    // Reset zone and ward when municipality changes
                                    form.setFieldValue("location.zoneId", undefined);
                                    form.setFieldValue("location.wardId", undefined);
                                    setOpenMunicipality(false);
                                  }}
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      location?.municipalityId === municipality.id
                                        ? "opacity-100 text-ledger"
                                        : "opacity-0",
                                    )}
                                  />
                                  {municipality.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label>Zone</Label>
                    <Popover open={openZone} onOpenChange={setOpenZone}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          role="combobox"
                          aria-expanded={openZone}
                          disabled={!location?.municipalityId}
                          className="justify-between bg-field border border-line text-ink font-normal w-full h-11 hover:border-ink/45 hover:-translate-y-0 shadow-none px-3.5"
                        >
                          {location?.zoneId
                            ? zones.find((z) => z.id === location.zoneId)?.name
                            : isLoadingZones
                              ? "Loading..."
                              : "Select zone..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search zone..." />
                          <CommandList>
                            <CommandEmpty>No zone found.</CommandEmpty>
                            <CommandGroup>
                              {zones.map((zone) => (
                                <CommandItem
                                  key={zone.id}
                                  value={zone.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    form.setFieldValue("location.zoneId", zone.id);
                                    form.setFieldValue("location.wardId", undefined);
                                    setOpenZone(false);
                                  }}
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      location?.zoneId === zone.id
                                        ? "opacity-100 text-ledger"
                                        : "opacity-0",
                                    )}
                                  />
                                  {zone.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label>Ward</Label>
                    <Popover open={openWard} onOpenChange={setOpenWard}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          role="combobox"
                          aria-expanded={openWard}
                          disabled={!location?.zoneId}
                          className="justify-between bg-field border border-line text-ink font-normal w-full h-11 hover:border-ink/45 hover:-translate-y-0 shadow-none px-3.5"
                        >
                          {location?.wardId
                            ? wards.find((w) => w.id === location.wardId)?.name
                            : isLoadingWards
                              ? "Loading..."
                              : "Select ward..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search ward..." />
                          <CommandList>
                            <CommandEmpty>No ward found.</CommandEmpty>
                            <CommandGroup>
                              {sortedWards.map((ward) => (
                                <CommandItem
                                  key={ward.id}
                                  value={ward.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    form.setFieldValue("location.wardId", ward.id);
                                    setLastUsedWardId(ward.id);
                                    window.localStorage.setItem(LAST_USED_WARD_KEY, ward.id);
                                    setOpenWard(false);
                                  }}
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      location?.wardId === ward.id
                                        ? "opacity-100 text-ledger"
                                        : "opacity-0",
                                    )}
                                  />
                                  {ward.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
