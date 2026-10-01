import apiClient from "@/lib/apiClient";
import type { PaginatedResponse, Municipality, Zone, Ward } from "@/types";

export const getMunicipalities = async (limit: number = 100): Promise<PaginatedResponse<Municipality>> => {
  return apiClient<PaginatedResponse<Municipality>>(`/municipalities?limit=${limit}`, {
    method: "GET",
  });
};

export const getZones = async (municipalityId: string, limit: number = 100): Promise<PaginatedResponse<Zone>> => {
  return apiClient<PaginatedResponse<Zone>>(`/zones?municipalityId=${municipalityId}&limit=${limit}`, {
    method: "GET",
  });
};

export const getWards = async (zoneId: string, limit: number = 100): Promise<PaginatedResponse<Ward>> => {
  return apiClient<PaginatedResponse<Ward>>(`/wards?zoneId=${zoneId}&limit=${limit}`, {
    method: "GET",
  });
};
