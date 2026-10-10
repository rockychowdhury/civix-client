import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type DepartmentServiceRequestsParams,
  flagServiceRequestInvalid,
  getDepartmentServiceRequests,
  getNearbyCivicIssues,
  getServiceRequestById,
  getServiceRequests,
  linkServiceRequestToIssue,
  reclassifyServiceRequest,
} from "@/api/service-requests";
import type { ServiceRequest } from "@/types";

export const serviceRequestKeys = {
  all: ["service-requests"] as const,
  lists: () => [...serviceRequestKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...serviceRequestKeys.lists(), filters] as const,
  department: (deptId?: string, params?: DepartmentServiceRequestsParams) =>
    [...serviceRequestKeys.all, "department", deptId, params] as const,
  details: () => [...serviceRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceRequestKeys.details(), id] as const,
};

export function useDepartmentServiceRequests(
  departmentId?: string,
  params?: DepartmentServiceRequestsParams,
) {
  return useQuery({
    queryKey: serviceRequestKeys.department(departmentId, params),
    queryFn: () => {
      if (!departmentId) throw new Error("Department ID required");
      return getDepartmentServiceRequests(departmentId, params);
    },
    enabled: !!departmentId,
  });
}

export function useServiceRequests(filters: Record<string, string>) {
  return useQuery({
    queryKey: serviceRequestKeys.list(filters),
    queryFn: () => getServiceRequests(filters),
  });
}

export function useServiceRequestDetail(id: string) {
  return useQuery({
    queryKey: serviceRequestKeys.detail(id),
    queryFn: () => getServiceRequestById(id),
    enabled: !!id,
  });
}

function patchRowInList(old: ServiceRequest[] | undefined, updated: ServiceRequest) {
  if (!old) return old;
  return old.map((item) => (item.id === updated.id ? updated : item));
}

export function useReclassifyServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reclassifyServiceRequest,
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(serviceRequestKeys.detail(variables.id), updated);
      queryClient.setQueriesData({ queryKey: serviceRequestKeys.lists() }, (old: any) =>
        patchRowInList(old, updated),
      );
    },
  });
}

export function useLinkServiceRequestToIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkServiceRequestToIssue,
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(serviceRequestKeys.detail(variables.id), updated);
      queryClient.setQueriesData({ queryKey: serviceRequestKeys.lists() }, (old: any) =>
        patchRowInList(old, updated),
      );
    },
  });
}

export function useFlagServiceRequestInvalid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flagServiceRequestInvalid,
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(serviceRequestKeys.detail(variables.id), updated);
      queryClient.setQueriesData({ queryKey: serviceRequestKeys.lists() }, (old: any) =>
        patchRowInList(old, updated),
      );
    },
  });
}

export function useNearbyCivicIssues(categoryId: string, ward: string) {
  return useQuery({
    queryKey: ["nearby-civic-issues", categoryId, ward],
    queryFn: () => getNearbyCivicIssues(categoryId, ward),
    enabled: !!categoryId && !!ward,
  });
}
