import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import type { JurisdictionFilter } from "@/types";
import {
  createWard,
  createZone,
  deleteWard,
  deleteZone,
  getAdminWards,
  getAdminZones,
  getWardById,
  getWardDepartments,
  getWardsByZone,
  getZoneById,
  updateWard,
  updateZone,
} from "../api";

export function useGetAdminZones(params?: JurisdictionFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.zones, params],
    queryFn: () => getAdminZones(params),
  });
}

export function useGetZoneById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.zones, id],
    queryFn: () => getZoneById(id),
    enabled: !!id,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => {
      toast.success("Zone created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.zones });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create zone");
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateZone>[1] }) =>
      updateZone(id, payload),
    onSuccess: () => {
      toast.success("Zone updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.zones });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update zone");
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
      toast.success("Zone deleted successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.zones });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete zone");
    },
  });
}

export function useGetAdminWards(params?: JurisdictionFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.wards, params],
    queryFn: () => getAdminWards(params),
  });
}

export function useGetWardsByZone(zoneId: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.zones, zoneId, "wards"],
    queryFn: () => getWardsByZone(zoneId),
    enabled: !!zoneId,
  });
}

export function useGetWardById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.wards, id],
    queryFn: () => getWardById(id),
    enabled: !!id,
  });
}

export function useCreateWard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWard,
    onSuccess: () => {
      toast.success("Ward created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.wards });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create ward");
    },
  });
}

export function useUpdateWard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateWard>[1] }) =>
      updateWard(id, payload),
    onSuccess: () => {
      toast.success("Ward updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.wards });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update ward");
    },
  });
}

export function useDeleteWard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWard,
    onSuccess: () => {
      toast.success("Ward deleted successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.wards });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete ward");
    },
  });
}

export function useGetWardDepartments(wardId: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.wards, wardId, "departments"],
    queryFn: () => getWardDepartments(wardId),
    enabled: !!wardId,
  });
}
