import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import type { OversightFilter } from "@/types";
import {
  getAllCivicIssues,
  getAllFeedback,
  getAllServiceRequests,
  getCivicIssueById,
  getServiceRequestById,
  overrideCivicIssueStatus,
  reopenCivicIssue,
} from "../api";

export function useGetAllCivicIssues(params?: OversightFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.oversightIssues, params],
    queryFn: () => getAllCivicIssues(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetOversightIssueById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.oversightIssues, id],
    queryFn: () => getCivicIssueById(id),
    enabled: !!id,
  });
}

export function useOverrideIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; notes?: string } }) =>
      overrideCivicIssueStatus(id, payload),
    onSuccess: () => {
      toast.success("Issue status overridden successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.oversightIssues });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to override issue status");
    },
  });
}

export function useReopenCivicIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reopenCivicIssue,
    onSuccess: () => {
      toast.success("Issue reopened successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.oversightIssues });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to reopen issue");
    },
  });
}

export function useGetAllServiceRequests(params?: OversightFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.oversightRequests, params],
    queryFn: () => getAllServiceRequests(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetOversightServiceRequestById(id: string) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.oversightRequests, id],
    queryFn: () => getServiceRequestById(id),
    enabled: !!id,
  });
}

export function useGetAllFeedback(params?: OversightFilter) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.oversightFeedback, params],
    queryFn: () => getAllFeedback(params),
    placeholderData: keepPreviousData,
  });
}
