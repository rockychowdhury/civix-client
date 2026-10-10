import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import { getPermissionById, getPermissions } from "../api";

export function useGetPermissions(params?: {
  searchTerm?: string;
  action?: string;
  resource?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.permissions, params],
    queryFn: () => getPermissions(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetPermissionById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.permissions, id],
    queryFn: () => getPermissionById(id),
    enabled: !!id,
  });
}
