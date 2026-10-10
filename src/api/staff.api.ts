import apiClient from "@/lib/apiClient";
import type {
  ICreateStaffPayload,
  IStaffFilter,
  IStaffListResponse,
  IStaffProfile,
  ITechnicianDashboardData,
  IUpdateStaffPayload,
} from "@/types";

export function createPlatformAdmin(payload: ICreateStaffPayload) {
  return apiClient("/staff/platform-admin", { method: "POST", body: payload });
}

export function createCityAdmin(payload: ICreateStaffPayload) {
  return apiClient("/staff/city-admin", { method: "POST", body: payload });
}

export function createDepartmentManager(payload: ICreateStaffPayload) {
  return apiClient("/staff/department-manager", { method: "POST", body: payload });
}

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
  return apiClient<IStaffListResponse>("/staff/technicians", {
    method: "GET",
    params: params as any,
  });
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

export function getTechnicianDashboard() {
  return apiClient<{ data: ITechnicianDashboardData }>("/staff/me/technician-dashboard", {
    method: "GET",
  });
}

export function updateTechnicianAvailability(isAvailable: boolean) {
  return apiClient<{ data: any }>("/staff/me/availability", {
    method: "PATCH",
    body: { isAvailable },
  });
}
