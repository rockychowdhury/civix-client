import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelServiceRequest,
  getCitizenFeedbackById,
  getCitizenServiceRequestById,
  getMyProfile,
  getMyServiceRequests,
  getPendingFeedbackServiceRequests,
  type MyRequestsFilter,
  submitCitizenFeedback,
  updateMyProfile,
} from "@/api/citizen.api";
import { getCivicIssueById } from "@/api/oversight.api";
import { CITIZEN_QUERY_KEYS } from "@/constant/citizen.constant";
import type { CreateFeedbackPayload, UpdateMyProfilePayload } from "@/types";

export function useCancelServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelServiceRequest(id, reason),
    onSuccess: () => {
      toast.success("Service request cancelled successfully", { position: "bottom-right" });
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.myRequests });
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.message || "Failed to cancel request";
      toast.error(message, { position: "bottom-right" });
    },
  });
}

export function useMyServiceRequests(params?: MyRequestsFilter) {
  return useQuery({
    queryKey: [...CITIZEN_QUERY_KEYS.myRequests, params],
    queryFn: () => getMyServiceRequests(params),
    staleTime: 60 * 1000,
  });
}

export function usePendingFeedbackRequests() {
  return useQuery({
    queryKey: [...CITIZEN_QUERY_KEYS.myRequests, "pending-feedback"],
    queryFn: () => getPendingFeedbackServiceRequests(),
    staleTime: 30 * 1000,
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
      queryClient.invalidateQueries({
        queryKey: [...CITIZEN_QUERY_KEYS.myRequests, "pending-feedback"],
      });
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.feedback });
      queryClient.invalidateQueries({ queryKey: ["resolution"] });
      queryClient.invalidateQueries({ queryKey: ["resolution-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
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
