import { useQuery } from "@tanstack/react-query";
import { getMunicipalities, getZones, getWards } from "@/api/location.api";
import type { PaginatedResponse, Municipality, Zone, Ward } from "@/types";

export const useGetMunicipalities = () => {
  return useQuery<PaginatedResponse<Municipality>, Error>({
    queryKey: ["municipalities"],
    queryFn: () => getMunicipalities(),
  });
};

export const useGetZones = (municipalityId?: string) => {
  return useQuery<PaginatedResponse<Zone>, Error>({
    queryKey: ["zones", municipalityId],
    queryFn: () => getZones(municipalityId!),
    enabled: !!municipalityId,
  });
};

export const useGetWards = (zoneId?: string) => {
  return useQuery<PaginatedResponse<Ward>, Error>({
    queryKey: ["wards", zoneId],
    queryFn: () => getWards(zoneId!),
    enabled: !!zoneId,
  });
};
