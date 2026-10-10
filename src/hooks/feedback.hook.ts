import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CITY_QUERY_KEYS } from "@/constant/city.constant";
import {
  type FeedbackFilter,
  getDepartmentFeedback,
  getFeedbackById,
  getMunicipalityFeedback,
  reopenCivicIssue,
  updateIssueStatus,
} from "../api";

export function useGetMunicipalityFeedback(municipalityId: string, params?: FeedbackFilter) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.feedback, "municipality", municipalityId, params],
    queryFn: () => getMunicipalityFeedback(municipalityId, params),
    enabled: !!municipalityId,
    placeholderData: keepPreviousData,
  });
}

export function useGetDepartmentFeedback(departmentId: string, params?: FeedbackFilter) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.feedback, "department", departmentId, params],
    queryFn: () => getDepartmentFeedback(departmentId, params),
    enabled: !!departmentId,
    placeholderData: keepPreviousData,
  });
}

export function useGetFeedbackById(id: string) {
  return useQuery({
    queryKey: [...CITY_QUERY_KEYS.feedback, id],
    queryFn: () => getFeedbackById(id),
    enabled: !!id,
  });
}

export function useCityIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; notes?: string } }) =>
      updateIssueStatus(id, payload),
    onSuccess: () => {
      toast.success("Issue status updated");
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEYS.cityIssues });
    },
    onError: (error: unknown) => {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update issue status";
      toast.error(message);
    },
  });
}

export function useCityReopenIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reopenCivicIssue(id),
    onSuccess: () => {
      toast.success("Issue reopened");
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEYS.cityIssues });
    },
    onError: () => toast.error("Failed to reopen issue"),
  });
}
