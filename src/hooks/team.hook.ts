import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ITeamFilter } from "@/types";
import { createTeam, deleteTeam, getTeamById, getTeams, updateTeam } from "../api/team.api";

export function useGetTeams(params?: ITeamFilter) {
  return useQuery({
    queryKey: ["teams", params],
    queryFn: () => getTeams(params),
  });
}

export function useGetTeamById(id: string) {
  return useQuery({
    queryKey: ["teams", id],
    queryFn: () => getTeamById(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      toast.success("Team created successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create team");
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTeam(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update team");
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      toast.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete team");
    },
  });
}
