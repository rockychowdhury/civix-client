import apiClient from "@/lib/apiClient";
import type {
  AdminWard,
  AdminZone,
  CreateWardPayload,
  CreateZonePayload,
  JurisdictionFilter,
  PaginatedResponse,
  UpdateWardPayload,
  UpdateZonePayload,
} from "@/types";
import { cleanParams } from "@/utils";

export function getAdminZones(params?: JurisdictionFilter) {
  return apiClient<PaginatedResponse<AdminZone>>("/zones", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createZone(payload: CreateZonePayload) {
  return apiClient<{ data: AdminZone }>("/zones", { method: "POST", body: payload });
}

export function getZoneById(zoneId: string) {
  return apiClient<{ data: AdminZone }>(`/zones/${zoneId}`, { method: "GET" });
}

export function updateZone(zoneId: string, payload: UpdateZonePayload) {
  return apiClient<{ data: AdminZone }>(`/zones/${zoneId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteZone(zoneId: string) {
  return apiClient<{ data: unknown }>(`/zones/${zoneId}`, { method: "DELETE" });
}

export function getWardsByZone(zoneId: string) {
  return apiClient<{ data: AdminWard[] }>(`/zones/${zoneId}/wards`, { method: "GET" });
}

export function getAdminWards(params?: JurisdictionFilter) {
  return apiClient<PaginatedResponse<AdminWard>>("/wards", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createWard(payload: CreateWardPayload) {
  return apiClient<{ data: AdminWard }>("/wards", { method: "POST", body: payload });
}

export function getWardById(wardId: string) {
  return apiClient<{ data: AdminWard }>(`/wards/${wardId}`, { method: "GET" });
}

export function updateWard(wardId: string, payload: UpdateWardPayload) {
  return apiClient<{ data: AdminWard }>(`/wards/${wardId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteWard(wardId: string) {
  return apiClient<{ data: unknown }>(`/wards/${wardId}`, { method: "DELETE" });
}

export function getWardDepartments(wardId: string) {
  return apiClient<{ data: unknown[] }>(`/wards/${wardId}/departments`, {
    method: "GET",
  });
}
