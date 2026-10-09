import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import type { AdminUserFilter } from "@/types";
import { deleteUser, getUserById, getUsers, restoreUser, updateUserStatus } from "../api";

export function useGetUsers(params?: AdminUserFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.users, params],
    queryFn: () => getUsers(params),
  });
}

export function useGetUserById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.users, id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateUserStatus(id, status),
    onSuccess: (_, { id }) => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.users, id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update user status");
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      toast.success("User restored successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to restore user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to remove user");
    },
  });
}
