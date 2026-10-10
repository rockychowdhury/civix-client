import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import type { MunicipalityFilter } from "@/types";
import {
  createMunicipality,
  deleteMunicipality,
  getAdminMunicipalities,
  getMunicipalityById,
  getMunicipalityOverview,
  updateMunicipality,
} from "../api";

export function useGetAdminMunicipalities(params?: MunicipalityFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.municipalities, params],
    queryFn: () => getAdminMunicipalities(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetMunicipalityById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.municipalities, id],
    queryFn: () => getMunicipalityById(id),
    enabled: !!id,
  });
}

export function useGetMunicipalityOverview(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.municipalities, id, "overview"],
    queryFn: () => getMunicipalityOverview(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateMunicipality() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMunicipality,
    onSuccess: () => {
      toast.success("Municipality onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.municipalities });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to onboard municipality");
    },
  });
}

export function useUpdateMunicipality() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateMunicipality>[1];
    }) => updateMunicipality(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Municipality updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.municipalities });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.municipalities, id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update municipality");
    },
  });
}

export function useDeleteMunicipality() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMunicipality,
    onSuccess: () => {
      toast.success("Municipality removed successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.municipalities });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to remove municipality");
    },
  });
}
