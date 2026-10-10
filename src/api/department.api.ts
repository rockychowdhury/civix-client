import apiClient from "@/lib/apiClient";
import { cleanParams } from "@/utils";

export function getDepartments(params?: {
  searchTerm?: string;
  municipalityId?: string;
  page?: number;
  limit?: number;
}) {
  return apiClient<{ data: any[]; meta?: unknown }>("/departments", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createDepartment(payload: Record<string, unknown>) {
  return apiClient<{ data: any }>("/departments", { method: "POST", body: payload });
}

export function getDepartmentById(id: string) {
  return apiClient<{ data: any }>(`/departments/${id}`, { method: "GET" });
}

export function updateDepartment(id: string, payload: Record<string, unknown>) {
  return apiClient<{ data: any }>(`/departments/${id}`, { method: "PATCH", body: payload });
}

export function attachDepartmentServiceArea(id: string, wardId: string) {
  return apiClient<{ data: any }>(`/departments/${id}/service-areas`, {
    method: "POST",
    body: { wardId },
  });
}

export function removeDepartmentServiceArea(id: string, areaId: string) {
  return apiClient<{ data: any }>(`/departments/${id}/service-areas/${areaId}`, {
    method: "DELETE",
  });
}

export function getDepartmentCategories(departmentId?: string) {
  const params = departmentId ? { departmentId } : undefined;
  return apiClient<{ data: any[] }>("/categories", { method: "GET", params });
}

export function getSlaPolicies(categoryId?: string) {
  const params = categoryId ? { categoryId } : undefined;
  return apiClient<{ data: any[] }>("/sla-policies", { method: "GET", params });
}

export function getDepartmentOverview(departmentId: string, params?: { timeRange?: string }) {
  return apiClient<{ data: any; message: string; success: boolean }>(
    `/departments/${departmentId}/overview`,
    {
      method: "GET",
      params: cleanParams(params),
    },
  );
}
