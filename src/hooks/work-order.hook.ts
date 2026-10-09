import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptWorkOrder,
  assignTechnician,
  confirmSuggestedTechnician,
  createWorkOrder,
  getAssignmentById,
  getDepartmentWorkOrders,
  getMyQueue,
  getWorkOrderById,
  getWorkOrderUpdates,
  type MyQueueFilter,
  rejectAssignment,
  startWorkOrder,
  submitResolution,
  submitWorkUpdate,
  updateAssignmentStatus,
  updateWorkOrderStatus,
} from "@/api/work-order.api";
import type {
  ICreateWorkOrderPayload,
  ISubmitResolutionPayload,
  ISubmitWorkUpdatePayload,
} from "@/types";

export function useDepartmentWorkOrders(departmentId?: string, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["department-work-orders", departmentId, filters],
    queryFn: () => {
      if (!departmentId) throw new Error("Department ID is required");
      return getDepartmentWorkOrders(departmentId, filters);
    },
    enabled: !!departmentId,
  });
}

export function useWorkOrderById(id?: string) {
  return useQuery({
    queryKey: ["work-order", id],
    queryFn: () => {
      if (!id) throw new Error("Work order ID is required");
      return getWorkOrderById(id);
    },
    enabled: !!id,
  });
}

export function useWorkOrderUpdates(id?: string) {
  return useQuery({
    queryKey: ["work-order-updates", id],
    queryFn: () => {
      if (!id) throw new Error("Work order ID is required");
      return getWorkOrderUpdates(id);
    },
    enabled: !!id,
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; notes?: string } }) =>
      updateWorkOrderStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
    },
  });
}

export function useAssignTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { technicianId: string; reason?: string };
    }) => assignTechnician(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
    },
  });
}

export function useConfirmSuggestedTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => confirmSuggestedTechnician(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateWorkOrderPayload) => createWorkOrder(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["department-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", variables.civicIssueId] });
    },
  });
}

export function useMyQueue(filters?: MyQueueFilter) {
  return useQuery({
    queryKey: ["technician-queue", filters],
    queryFn: () => getMyQueue(filters),
  });
}

export function useAssignmentById(id?: string) {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => {
      if (!id) throw new Error("Assignment ID is required");
      return getAssignmentById(id);
    },
    enabled: !!id,
  });
}

export function useAcceptWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => acceptWorkOrder(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.id] });
    },
  });
}

export function useRejectAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectAssignment(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.id] });
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: "ACCEPTED" | "REJECTED"; notes?: string };
    }) => updateAssignmentStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order"] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.id] });
    },
  });
}

export function useStartWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => startWorkOrder(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
    },
  });
}

export function useSubmitWorkUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ISubmitWorkUpdatePayload }) =>
      submitWorkUpdate(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
    },
  });
}

export function useSubmitResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ISubmitResolutionPayload }) =>
      submitResolution(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
    },
  });
}
