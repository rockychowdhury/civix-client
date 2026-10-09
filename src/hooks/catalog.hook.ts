import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import {
  createCategory,
  createSlaPolicy,
  deleteCategory,
  deleteSlaPolicy,
  getAdminCategories,
  getAdminSlaPolicies,
  getCategoryById,
  getCategoryChildren,
  updateCategory,
  updateSlaPolicy,
} from "../api";

export function useGetAdminCategories(params?: {
  searchTerm?: string;
  departmentId?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.categories, params],
    queryFn: () => getAdminCategories(params),
  });
}

export function useGetCategoryById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.categories, id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
}

export function useGetCategoryChildren(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.categories, id, "children"],
    queryFn: () => getCategoryChildren(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete category");
    },
  });
}

export function useGetAdminSlaPolicies(params?: { municipalityId?: string; categoryId?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.slaPolicies, params],
    queryFn: () => getAdminSlaPolicies(params),
  });
}

export function useCreateSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSlaPolicy,
    onSuccess: () => {
      toast.success("SLA policy created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.slaPolicies });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create SLA policy");
    },
  });
}

export function useUpdateSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateSlaPolicy>[1] }) =>
      updateSlaPolicy(id, payload),
    onSuccess: () => {
      toast.success("SLA policy updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.slaPolicies });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update SLA policy");
    },
  });
}

export function useDeleteSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSlaPolicy,
    onSuccess: () => {
      toast.success("SLA policy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.slaPolicies });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete SLA policy");
    },
  });
}
