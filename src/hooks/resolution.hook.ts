import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getResolutionById, getResolutionFeedback, verifyResolution } from "@/api/resolution.api";
import { CITIZEN_QUERY_KEYS } from "@/constant/citizen.constant";
import { CITY_QUERY_KEYS } from "@/constant/city.constant";
import type { IVerifyResolutionPayload } from "@/types";

export function useResolutionById(id?: string) {
  return useQuery({
    queryKey: ["resolution", id],
    queryFn: () => {
      if (!id) throw new Error("Resolution ID is required");
      return getResolutionById(id);
    },
    enabled: !!id,
  });
}

export function useResolutionFeedback(id?: string) {
  return useQuery({
    queryKey: ["resolution-feedback", id],
    queryFn: () => {
      if (!id) throw new Error("Resolution ID is required");
      return getResolutionFeedback(id);
    },
    enabled: !!id,
  });
}

export function useVerifyResolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IVerifyResolutionPayload }) =>
      verifyResolution(id, payload),
    onSuccess: (_data, variables) => {
      const status = variables.payload.status;
      if (status === "VERIFIED") {
        toast.success("Resolution verified & civic issue marked resolved!");
      } else if (status === "REOPENED") {
        toast.success("Resolution rejected — issue reopened and queued for reassignment.");
      } else if (status === "REJECTED") {
        toast.warning("Resolution bounced back to technician for rework.");
      } else {
        toast.success("Resolution verification updated.");
      }

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["resolution", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["resolution-feedback", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates"] });
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["department-issues"] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEYS.cityIssues });
      queryClient.invalidateQueries({ queryKey: CITIZEN_QUERY_KEYS.myRequests });
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Failed to process resolution verification";
      toast.error(message);
    },
  });
}
