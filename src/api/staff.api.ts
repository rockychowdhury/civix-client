import apiClient from "@/lib/apiClient";
import type { ICreateStaffPayload, IUpdateStaffPayload, IStaffFilter, IStaffListResponse, IStaffProfile } from "@/types";

export function createDispatcher(payload: ICreateStaffPayload) {
  return apiClient("/staff/dispatcher", { method: "POST", body: payload });
}

export function createTechnician(payload: ICreateStaffPayload) {
  return apiClient("/staff/technician", { method: "POST", body: payload });
}

export function getAllStaff(params?: IStaffFilter) {
  return apiClient<IStaffListResponse>("/staff", { method: "GET", params: params as any });
}

export function getAllTechnicians(params?: IStaffFilter) {
  return apiClient<IStaffListResponse>("/staff/technicians", { method: "GET", params: params as any });
}

export function getStaffById(id: string) {
  return apiClient<{ data: IStaffProfile }>(`/staff/${id}`, { method: "GET" });
}

export function updateStaff(id: string, payload: IUpdateStaffPayload) {
  return apiClient<{ data: IStaffProfile }>(`/staff/${id}`, { method: "PATCH", body: payload });
}

export function updateStaffStatus(id: string, status: string) {
  return apiClient<{ data: any }>(`/staff/${id}/status`, { method: "PATCH", body: { status } });
}
