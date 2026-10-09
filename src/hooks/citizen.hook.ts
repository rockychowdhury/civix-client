import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCitizenFeedbackById,
  getCitizenServiceRequestById,
  getMyProfile,
  getMyServiceRequests,
  type MyRequestsFilter,
  submitCitizenFeedback,
  updateMyProfile,
} from "@/api/citizen.api";
import { getCivicIssueById } from "@/api/oversight.api";
import { CITIZEN_QUERY_KEYS } from "@/constant/citizen.constant";
import type { CreateFeedbackPayload, UpdateMyProfilePayload } from "@/types";

export function useMyServiceRequests(params?: MyRequestsFilter) {
  return useQuery({
    queryKey: [...CITIZEN_QUERY_KEYS.myRequests, params],
    queryFn: () => getMyServiceRequests(params),
    staleTime: 60 * 1000,
  });
}

export function useCitizenServiceRequest(id: string) {
  return useQuery({
    queryKey: [...CITIZEN_QUERY_KEYS.myRequests, "detail", id],
    queryFn: () => getCitizenServiceRequestById(id),
    enabled: !!id,
  });
}

export function useCivicIssueDetail(id: string) {
  return useQuery({
    queryKey: ["civic-issue", "detail", id],
    queryFn: () => getCivicIssueById(id),
    enabled: !!id,
  });
}

export function useGetMyProfile() {
  return useQuery({
    queryKey: CITIZEN_QUERY_KEYS.myProfile,
    queryFn: () => getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => updateMyProfile(payload),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.myProfile });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });
}

export function useSubmitCitizenFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeedbackPayload) => submitCitizenFeedback(payload),
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.myRequests });
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.feedback });
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Failed to submit feedback";
      toast.error(message);
    },
  });
}

export function useCitizenFeedback(id: string) {
  return useQuery({
    queryKey: [...CITIZEN_QUERY_KEYS.feedback, id],
    queryFn: () => getCitizenFeedbackById(id),
    enabled: !!id,
  });
}
