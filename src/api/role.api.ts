import apiClient from "@/lib/apiClient";
import type {
  AdminPermission,
  AdminRole,
  AssignRolePayload,
  CreateRolePayload,
  PaginatedResponse,
  UpdateRolePayload,
  UpdateRolePermissionsPayload,
} from "@/types";
import { cleanParams } from "@/utils";

export function getRoles(params?: { page?: number; limit?: number; searchTerm?: string }) {
  return apiClient<PaginatedResponse<AdminRole>>("/roles", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function createRole(payload: CreateRolePayload) {
  return apiClient<{ data: AdminRole }>("/roles", { method: "POST", body: payload });
}

export function getRoleById(roleId: string) {
  return apiClient<{ data: AdminRole }>(`/roles/${roleId}`, { method: "GET" });
}

export function updateRole(roleId: string, payload: UpdateRolePayload) {
  return apiClient<{ data: AdminRole }>(`/roles/${roleId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteRole(roleId: string) {
  return apiClient<{ data: unknown }>(`/roles/${roleId}`, { method: "DELETE" });
}

export function getRolePermissions(roleId: string) {
  return apiClient<{ data: AdminPermission[] }>(`/roles/${roleId}/permissions`, {
    method: "GET",
  });
}

export function updateRolePermissions(roleId: string, payload: UpdateRolePermissionsPayload) {
  // Backend expects snake_case `permission_ids`.
  return apiClient<{ data: AdminPermission[] }>(`/roles/${roleId}/permissions`, {
    method: "PUT",
    body: { permission_ids: payload.permissionIds },
  });
}

export function getUserRoles(userId: string) {
  return apiClient<{ data: AdminRole[] }>(`/roles/users/${userId}`, { method: "GET" });
}

export function assignRoleToUser(userId: string, payload: AssignRolePayload) {
  return apiClient<{ data: unknown }>(`/roles/users/${userId}`, {
    method: "POST",
    body: payload,
  });
}

export function removeRoleFromUser(roleId: string, userId: string) {
  return apiClient<{ data: unknown }>(`/roles/${roleId}/users/${userId}`, {
    method: "DELETE",
  });
}
