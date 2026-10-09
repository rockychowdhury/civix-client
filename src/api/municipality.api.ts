import apiClient from "@/lib/apiClient";
import type {
  AdminMunicipality,
  CreateMunicipalityPayload,
  MunicipalityFilter,
  PaginatedResponse,
  UpdateMunicipalityPayload,
} from "@/types";
import { cleanParams } from "@/utils";

export function getAdminMunicipalities(params?: MunicipalityFilter) {
  return apiClient<PaginatedResponse<AdminMunicipality>>("/municipalities", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createMunicipality(payload: CreateMunicipalityPayload) {
  return apiClient<{ data: AdminMunicipality }>("/municipalities", {
    method: "POST",
    body: payload,
  });
}

export function getMunicipalityById(municipalityId: string) {
  return apiClient<{ data: AdminMunicipality }>(`/municipalities/${municipalityId}`, {
    method: "GET",
  });
}

export function updateMunicipality(municipalityId: string, payload: UpdateMunicipalityPayload) {
  return apiClient<{ data: AdminMunicipality }>(`/municipalities/${municipalityId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteMunicipality(municipalityId: string) {
  return apiClient<{ data: unknown }>(`/municipalities/${municipalityId}`, {
    method: "DELETE",
  });
}
