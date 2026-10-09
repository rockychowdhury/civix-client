import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import {
  assignRoleToUser,
  createRole,
  deleteRole,
  getRoleById,
  getRolePermissions,
  getRoles,
  getUserRoles,
  removeRoleFromUser,
  updateRole,
  updateRolePermissions,
} from "../api";

export function useGetRoles(params?: { page?: number; limit?: number; searchTerm?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.roles, params],
    queryFn: () => getRoles(params),
  });
}

export function useGetRoleById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.roles, id],
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.roles });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create role");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateRole>[1] }) =>
      updateRole(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.roles, id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update role");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.roles });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete role");
    },
  });
}

export function useGetRolePermissions(roleId: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.permissions, "role", roleId],
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: Parameters<typeof updateRolePermissions>[1];
    }) => updateRolePermissions(roleId, payload),
    onSuccess: (_, { roleId }) => {
      toast.success("Permission matrix updated successfully");
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_QUERY_KEYS.permissions, "role", roleId],
      });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.roles });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update permissions");
    },
  });
}

export function useGetUserRoles(userId: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.roles, "user", userId],
    queryFn: () => getUserRoles(userId),
    enabled: !!userId,
  });
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: { roleId: string } }) =>
      assignRoleToUser(userId, payload),
    onSuccess: (_, { userId }) => {
      toast.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.roles, "user", userId] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to assign role");
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      removeRoleFromUser(roleId, userId),
    onSuccess: (_, { userId }) => {
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.roles, "user", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to remove role");
    },
  });
}
