import apiClient from "@/lib/apiClient";
import type {
  AdminSlaPolicy,
  Category,
  CreateCategoryPayload,
  CreateSlaPolicyPayload,
  PaginatedResponse,
  UpdateCategoryPayload,
  UpdateSlaPolicyPayload,
} from "@/types";
import { cleanParams } from "@/utils";

export function getAdminCategories(params?: {
  searchTerm?: string;
  departmentId?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  return apiClient<PaginatedResponse<Category>>("/categories", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createCategory(payload: CreateCategoryPayload) {
  return apiClient<{ data: Category }>("/categories", { method: "POST", body: payload });
}

export function getCategoryById(categoryId: string) {
  return apiClient<{ data: Category }>(`/categories/${categoryId}`, { method: "GET" });
}

export function updateCategory(categoryId: string, payload: UpdateCategoryPayload) {
  return apiClient<{ data: Category }>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteCategory(categoryId: string) {
  return apiClient<{ data: unknown }>(`/categories/${categoryId}`, { method: "DELETE" });
}

export function getCategoryChildren(categoryId: string) {
  return apiClient<{ data: Category[] }>(`/categories/${categoryId}/children`, {
    method: "GET",
  });
}

export function getAdminSlaPolicies(params?: { municipalityId?: string; categoryId?: string }) {
  return apiClient<{ data: AdminSlaPolicy[] }>("/sla-policies", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createSlaPolicy(payload: CreateSlaPolicyPayload) {
  return apiClient<{ data: AdminSlaPolicy }>("/sla-policies", {
    method: "POST",
    body: payload,
  });
}

export function updateSlaPolicy(id: string, payload: UpdateSlaPolicyPayload) {
  return apiClient<{ data: AdminSlaPolicy }>(`/sla-policies/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSlaPolicy(id: string) {
  return apiClient<{ data: unknown }>(`/sla-policies/${id}`, { method: "DELETE" });
}
