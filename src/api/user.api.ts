import apiClient from "@/lib/apiClient";
import type { AdminUser, AdminUserFilter, PaginatedResponse } from "@/types";
import { cleanParams } from "@/utils";

export function getUsers(params?: AdminUserFilter) {
  return apiClient<PaginatedResponse<AdminUser>>("/users", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getUserById(userId: string) {
  return apiClient<{ data: AdminUser }>(`/users/${userId}`, { method: "GET" });
}

export function updateUserStatus(userId: string, status: string) {
  return apiClient<{ data: AdminUser }>(`/users/${userId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function restoreUser(userId: string) {
  return apiClient<{ data: AdminUser }>(`/users/${userId}/restore`, {
    method: "PATCH",
  });
}

export function deleteUser(userId: string) {
  return apiClient<{ data: unknown }>(`/users/${userId}`, { method: "DELETE" });
}
