import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import {
  attachDepartmentServiceAreas,
  createDepartment,
  getDepartmentById,
  getDepartmentCategories,
  getDepartments,
  getSlaPolicies,
  removeDepartmentServiceArea,
  updateDepartment,
} from "../api/department.api";

export function useGetDepartmentById(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
  });
}

export function useGetDepartmentCategories(departmentId?: string) {
  return useQuery({
    queryKey: ["categories", { departmentId }],
    queryFn: () => getDepartmentCategories(departmentId),
  });
}

export function useGetSlaPolicies(categoryId?: string) {
  return useQuery({
    queryKey: ["slaPolicies", { categoryId }],
    queryFn: () => getSlaPolicies(categoryId),
  });
}

export function useGetDepartments(params?: { searchTerm?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.departments, params],
    queryFn: () => getDepartments(params),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.departments });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create department");
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateDepartment(id, payload),
    onSuccess: () => {
      toast.success("Department updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.departments });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update department");
    },
  });
}

export function useAttachDepartmentServiceAreas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { areaIds?: string[]; wardIds?: string[] };
    }) => attachDepartmentServiceAreas(id, payload),
    onSuccess: () => {
      toast.success("Service areas attached successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.departments });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to attach service areas");
    },
  });
}

export function useRemoveDepartmentServiceArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, areaId }: { id: string; areaId: string }) =>
      removeDepartmentServiceArea(id, areaId),
    onSuccess: () => {
      toast.success("Service area removed successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.departments });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to remove service area");
    },
  });
}
