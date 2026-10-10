"use client";

import {
  Building2,
  Check,
  ChevronsUpDown,
  CircleAlert,
  Compass,
  Hash,
  Layers,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useGetMunicipalities, useGetWards, useGetZones } from "@/hooks";
import { sanitizeCoordinate, sanitizeNullableString, sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

const LAST_USED_WARD_KEY = "civix_last_used_ward";

interface LocationStepProps {
  form: any;
  errors?: {
    address?: string;
    municipalityId?: string;
  };
  onClearError?: (field: "address" | "municipalityId") => void;
  problemName?: string;
}

export function LocationStep({ form, errors, onClearError, problemName }: LocationStepProps) {
  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } = useGetMunicipalities();
  const municipalities = municipalitiesData?.data || [];

  return (
    <form.Subscribe
      selector={(state: any) => state.values.location}
      children={(location: any) => (
        <LocationContent
          form={form}
          location={location}
          municipalities={municipalities}
          isLoadingMunicipalities={isLoadingMunicipalities}
          errors={errors}
          onClearError={onClearError}
          problemName={problemName}
        />
      )}
    />
  );
}

interface LocationContentProps {
  form: any;
  location: any;
  municipalities: any[];
  isLoadingMunicipalities: boolean;
  errors?: {
    address?: string;
    municipalityId?: string;
  };
  onClearError?: (field: "address" | "municipalityId") => void;
  problemName?: string;
}

function LocationContent({
  form,
  location,
  municipalities,
  isLoadingMunicipalities,
  errors,
  onClearError,
  problemName,
}: LocationContentProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const [openMunicipality, setOpenMunicipality] = useState(false);
  const [openZone, setOpenZone] = useState(false);
  const [openWard, setOpenWard] = useState(false);

  const [lastUsedWardId, setLastUsedWardId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(LAST_USED_WARD_KEY);
  });

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

  const watchLat = sanitizeCoordinate(location?.latitude, "lat");
  const watchLng = sanitizeCoordinate(location?.longitude, "lng");
  const hasCoordinates = watchLat !== null && watchLng !== null;

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setShowManual(true);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        const lat = sanitizeCoordinate(rawLat, "lat");
        const lng = sanitizeCoordinate(rawLng, "lng");

        form.setFieldValue("location.latitude", lat);
        form.setFieldValue("location.longitude", lng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
              headers: {
                "Accept-Language": "en",
              },
            },
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            // 1. Street Address: building/name, house_number, road, neighbourhood
            const streetParts: string[] = [];
            const buildingOrName = addr.building || data.name;
            if (buildingOrName) streetParts.push(buildingOrName);
            if (addr.house_number) streetParts.push(addr.house_number);
            if (addr.road) streetParts.push(addr.road);
            if (addr.neighbourhood) streetParts.push(addr.neighbourhood);

            let fullAddress = streetParts.join(", ");
            if (!fullAddress && data.display_name) {
              fullAddress = data.display_name.split(",").slice(0, 4).join(", ").trim();
            }
            if (!fullAddress) {
              fullAddress = addr.road || `GPS: ${lat?.toFixed(5)}, ${lng?.toFixed(5)}`;
            }

            form.setFieldValue("location.address", sanitizeText(fullAddress));
            if (errors?.address) {
              onClearError?.("address");
            }

            // 2. Nearby Landmark: quarter, suburb, amenity
            const landmarkParts = [addr.quarter, addr.suburb, addr.amenity].filter(
              (part): part is string => Boolean(part) && !streetParts.includes(part),
            );

            if (landmarkParts.length > 0) {
              form.setFieldValue("location.landmark", sanitizeText(landmarkParts.join(", ")));
            } else if (addr.neighbourhood && !streetParts.includes(addr.neighbourhood)) {
              form.setFieldValue("location.landmark", sanitizeText(addr.neighbourhood));
            }

            // 3. Postal Code: postcode
            if (addr.postcode) {
              form.setFieldValue("location.postalCode", sanitizeText(addr.postcode));
            }

            // 4. Municipality / City matching
            if (municipalities.length > 0) {
              const searchTerms = [
                addr.city,
                addr.county,
                addr.state_district,
                addr.state,
                addr.town,
                addr.municipality,
                addr.suburb,
              ]
                .filter(Boolean)
                .map((t: string) => t.toLowerCase());

              let matchedMun = municipalities.find((m) => {
                const mName = m.name.toLowerCase();
                return searchTerms.some((term) => mName.includes(term) || term.includes(mName));
              });

              // Smart match for Dhaka North vs South based on locality indicators
              if (!matchedMun && searchTerms.some((t) => t.includes("dhaka"))) {
                const northTerms = [
                  "bishil",
                  "mirpur",
                  "baten nagar",
                  "mazar road",
                  "uttara",
                  "gulshan",
                  "banani",
                  "mohammadpur",
                  "north",
                ];
                const isNorth = northTerms.some((nt) =>
                  [addr.road, addr.suburb, addr.neighbourhood, addr.quarter, addr.postcode]
                    .filter(Boolean)
                    .some((val: string) => val.toLowerCase().includes(nt)),
                );

                if (isNorth) {
                  matchedMun = municipalities.find((m) => m.name.toLowerCase().includes("north"));
                }
                if (!matchedMun) {
                  matchedMun = municipalities.find((m) => m.name.toLowerCase().includes("dhaka"));
                }
              }

              if (matchedMun) {
                form.setFieldValue("location.municipalityId", matchedMun.id);
                if (errors?.municipalityId) {
                  onClearError?.("municipalityId");
                }
              } else if (!location?.municipalityId && municipalities.length === 1) {
                form.setFieldValue("location.municipalityId", municipalities[0].id);
                if (errors?.municipalityId) {
                  onClearError?.("municipalityId");
                }
              }
            }
          } else {
            form.setFieldValue(
              "location.address",
              `GPS Coordinates: ${lat?.toFixed(5)}, ${lng?.toFixed(5)}`,
            );
          }
        } catch {
          if (!location?.address) {
            form.setFieldValue(
              "location.address",
              `GPS Pin: ${lat?.toFixed(5)}, ${lng?.toFixed(5)}`,
            );
          }
        } finally {
          setIsLocating(false);
          setShowManual(true);
          toast.success("Location pinpointed via GPS");
        }
      },
      (err) => {
        setIsLocating(false);
        setShowManual(true);
        toast.error("Could not obtain location", {
          description: err.message || "Please enter the address manually.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  return (
    <div className="space-y-6 animate-slide-up motion-reduce:animate-none">
      {!hasCoordinates && !showManual && (
        <div className="flex flex-col items-center justify-center space-y-3.5 rounded-xl border border-line/60 bg-field/20 p-6 sm:p-8 text-center transition-all">
          <div className="h-11 w-11 rounded-full bg-ledger/10 text-ledger flex items-center justify-center">
            <Navigation className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-ink">
              {problemName
                ? `Where is the ${problemName.toLowerCase()} seen?`
                : "Where is the issue located?"}
            </h3>
            <p className="font-body text-xs text-ink/65 leading-relaxed">
              GPS coordinates help technicians navigate directly to the physical site without delay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 pt-2">
            <Button
              onClick={handleGeolocation}
              disabled={isLocating}
              size="sm"
              className="h-10 sm:h-9 px-4 text-xs font-medium gap-2 cursor-pointer rounded-lg shadow-xs bg-ledger text-paper hover:bg-ledger/90"
              type="button"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pinpointing...
                </>
              ) : (
                <>
                  <Compass className="h-3.5 w-3.5" /> Use my current location
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowManual(true)}
              className="h-10 sm:h-9 px-3.5 text-xs font-medium text-ink/75 hover:text-ink cursor-pointer rounded-lg border-line/70 bg-paper hover:bg-field/50"
              type="button"
            >
              Enter manually
            </Button>
          </div>
        </div>
      )}

      {(hasCoordinates || showManual) && (
        <div className="space-y-5">
          {hasCoordinates ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-ledger/25 bg-ledger/[0.03]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-md bg-ledger/10 text-ledger flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-ink flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved inline-block shrink-0" />
                    Coordinates Locked
                  </p>
                  <p className="font-mono text-[11px] text-ink/60 truncate">
                    {watchLat?.toFixed(5)}, {watchLng?.toFixed(5)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGeolocation}
                disabled={isLocating}
                type="button"
                className="text-xs h-9 sm:h-7 px-2.5 text-ledger hover:text-ledger hover:bg-ledger/10 cursor-pointer rounded-md shrink-0"
              >
                {isLocating ? "Updating..." : "Re-detect GPS"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-line/40 bg-field/30">
              <p className="font-body text-xs text-ink/65">
                Tip: Precise GPS makes field inspections faster.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGeolocation}
                disabled={isLocating}
                type="button"
                className="text-xs h-9 sm:h-7 px-2.5 gap-1.5 cursor-pointer rounded-md shrink-0"
              >
                <Compass className="h-3 w-3" /> Get GPS
              </Button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address" className="font-body text-xs font-medium text-ink">
                Street Address or Exact Location Description *
              </Label>
              <form.Field
                name="location.address"
                children={(field: any) => (
                  <>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 pointer-events-none" />
                      <Input
                        id="address"
                        placeholder="e.g. Ekota Bhabon, 312/7/2B, Mazar Road"
                        value={field.state.value || ""}
                        onBlur={(e) => {
                          field.handleChange(sanitizeText(e.target.value));
                          field.handleBlur();
                        }}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (errors?.address) {
                            onClearError?.("address");
                          }
                        }}
                        className={cn(
                          "pl-9 h-10 bg-paper border-line/70 text-ink text-xs sm:text-sm rounded-lg transition-colors placeholder:text-ink/40",
                          errors?.address && "border-signal-open focus-visible:ring-signal-open",
                        )}
                      />
                    </div>
                    {errors?.address && (
                      <p
                        className="text-xs font-medium text-signal-open mt-1.5 flex items-center gap-1.5 animate-slide-up"
                        role="alert"
                      >
                        <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.address}</span>
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="landmark" className="font-body text-xs font-medium text-ink">
                Nearby Landmark (Optional)
              </Label>
              <form.Field
                name="location.landmark"
                children={(field: any) => (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 pointer-events-none" />
                    <Input
                      id="landmark"
                      placeholder="e.g. 2nd Colony, Bishil"
                      value={field.state.value || ""}
                      onBlur={(e) => {
                        field.handleChange(sanitizeNullableString(e.target.value) || "");
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pl-9 h-10 bg-paper border-line/70 text-ink text-xs sm:text-sm rounded-lg placeholder:text-ink/40"
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="font-body text-xs font-medium text-ink">
                Postal Code (Optional)
              </Label>
              <form.Field
                name="location.postalCode"
                children={(field: any) => (
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 pointer-events-none" />
                    <Input
                      id="postalCode"
                      placeholder="e.g. 1216"
                      value={field.state.value || ""}
                      onBlur={(e) => {
                        field.handleChange(sanitizeNullableString(e.target.value) || "");
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pl-9 h-10 bg-paper border-line/70 text-ink text-xs sm:text-sm rounded-lg placeholder:text-ink/40"
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <Label className="font-body text-xs font-medium text-ink">
                Municipality / City *
              </Label>
              <Popover open={openMunicipality} onOpenChange={setOpenMunicipality}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={openMunicipality}
                    className={cn(
                      "justify-between bg-paper border border-line/70 text-ink font-normal w-full h-10 hover:border-ink/45 shadow-xs px-3 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm",
                      errors?.municipalityId && "border-signal-open",
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Building2 className="h-4 w-4 text-ink/40 shrink-0" />
                      <span className={cn("truncate", !location?.municipalityId && "text-ink/50")}>
                        {location?.municipalityId
                          ? municipalities.find((m) => m.id === location.municipalityId)?.name
                          : isLoadingMunicipalities
                            ? "Loading cities..."
                            : "Select municipality..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 bg-paper border border-line/70 rounded-xl shadow-lg">
                  <Command>
                    <CommandInput placeholder="Search municipality..." className="h-9 text-xs" />
                    <CommandList className="max-h-56">
                      <CommandEmpty className="py-3 text-center text-xs text-ink/50">
                        No municipality found.
                      </CommandEmpty>
                      <CommandGroup>
                        {municipalities.map((municipality) => {
                          const isSelected = location?.municipalityId === municipality.id;
                          return (
                            <CommandItem
                              key={municipality.id}
                              value={municipality.name}
                              className={cn(
                                "cursor-pointer text-xs py-2 px-2.5 rounded-md flex items-center justify-between",
                                isSelected && "bg-ledger/[0.08] text-ledger font-medium",
                              )}
                              onSelect={() => {
                                form.setFieldValue("location.municipalityId", municipality.id);
                                form.setFieldValue("location.zoneId", undefined);
                                form.setFieldValue("location.wardId", undefined);
                                if (errors?.municipalityId) {
                                  onClearError?.("municipalityId");
                                }
                                setOpenMunicipality(false);
                              }}
                            >
                              <span>{municipality.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-ledger" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors?.municipalityId && (
                <p
                  className="text-xs font-medium text-signal-open mt-1.5 flex items-center gap-1.5 animate-slide-up"
                  role="alert"
                >
                  <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.municipalityId}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5 flex flex-col">
              <Label className="font-body text-xs font-medium text-ink">Zone (Optional)</Label>
              <Popover open={openZone} onOpenChange={setOpenZone}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={openZone}
                    disabled={!location?.municipalityId}
                    className="justify-between bg-paper border border-line/70 text-ink font-normal w-full h-10 hover:border-ink/45 shadow-xs px-3 rounded-lg cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Layers className="h-4 w-4 text-ink/40 shrink-0" />
                      <span className={cn("truncate", !location?.zoneId && "text-ink/50")}>
                        {location?.zoneId
                          ? zones.find((z) => z.id === location.zoneId)?.name
                          : isLoadingZones
                            ? "Loading zones..."
                            : "Select zone..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 bg-paper border border-line/70 rounded-xl shadow-lg">
                  <Command>
                    <CommandInput placeholder="Search zone..." className="h-9 text-xs" />
                    <CommandList className="max-h-56">
                      <CommandEmpty className="py-3 text-center text-xs text-ink/50">
                        No zone found.
                      </CommandEmpty>
                      <CommandGroup>
                        {zones.map((zone) => {
                          const isSelected = location?.zoneId === zone.id;
                          return (
                            <CommandItem
                              key={zone.id}
                              value={zone.name}
                              className={cn(
                                "cursor-pointer text-xs py-2 px-2.5 rounded-md flex items-center justify-between",
                                isSelected && "bg-ledger/[0.08] text-ledger font-medium",
                              )}
                              onSelect={() => {
                                form.setFieldValue("location.zoneId", zone.id);
                                form.setFieldValue("location.wardId", undefined);
                                setOpenZone(false);
                              }}
                            >
                              <span>{zone.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-ledger" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5 flex flex-col sm:col-span-2">
              <Label className="font-body text-xs font-medium text-ink">
                Ward / Sector (Optional)
              </Label>
              <Popover open={openWard} onOpenChange={setOpenWard}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={openWard}
                    disabled={!location?.zoneId}
                    className="justify-between bg-paper border border-line/70 text-ink font-normal w-full h-10 hover:border-ink/45 shadow-xs px-3 rounded-lg cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Compass className="h-4 w-4 text-ink/40 shrink-0" />
                      <span className={cn("truncate", !location?.wardId && "text-ink/50")}>
                        {location?.wardId
                          ? wards.find((w) => w.id === location.wardId)?.name
                          : isLoadingWards
                            ? "Loading wards..."
                            : "Select ward..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 bg-paper border border-line/70 rounded-xl shadow-lg">
                  <Command>
                    <CommandInput placeholder="Search ward..." className="h-9 text-xs" />
                    <CommandList className="max-h-56">
                      <CommandEmpty className="py-3 text-center text-xs text-ink/50">
                        No ward found.
                      </CommandEmpty>
                      <CommandGroup>
                        {sortedWards.map((ward) => {
                          const isSelected = location?.wardId === ward.id;
                          return (
                            <CommandItem
                              key={ward.id}
                              value={ward.name}
                              className={cn(
                                "cursor-pointer text-xs py-2 px-2.5 rounded-md flex items-center justify-between",
                                isSelected && "bg-ledger/[0.08] text-ledger font-medium",
                              )}
                              onSelect={() => {
                                form.setFieldValue("location.wardId", ward.id);
                                setLastUsedWardId(ward.id);
                                window.localStorage.setItem(LAST_USED_WARD_KEY, ward.id);
                                setOpenWard(false);
                              }}
                            >
                              <span>{ward.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-ledger" />}
                            </CommandItem>
                          );
                        })}
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
}
