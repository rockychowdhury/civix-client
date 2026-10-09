import apiClient from "@/lib/apiClient";
import type { AdminPermission, PaginatedResponse } from "@/types";
import { cleanParams } from "@/utils";

export function getPermissions(params?: {
  searchTerm?: string;
  action?: string;
  resource?: string;
  page?: number;
  limit?: number;
}) {
  return apiClient<PaginatedResponse<AdminPermission>>("/permissions", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getPermissionById(permissionId: string) {
  return apiClient<{ data: AdminPermission }>(`/permissions/${permissionId}`, {
    method: "GET",
  });
}
