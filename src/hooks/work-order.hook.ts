import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acceptWorkOrder,
  assignTechnician,
  confirmSuggestedTechnician,
  createWorkOrder,
  getAssignmentById,
  getDepartmentWorkOrders,
  getMyQueue,
  getMyWorkOrders,
  getWorkOrderById,
  getWorkOrderResolutions,
  getWorkOrderUpdates,
  type MyQueueFilter,
  type MyWorkOrdersFilter,
  quickActionWorkOrder,
  rejectAssignment,
  startWorkOrder,
  submitResolution,
  submitWorkUpdate,
  updateAssignmentStatus,
  updateWorkOrderStatus,
  updateWorkOrderTask,
} from "@/api/work-order.api";
import type {
  ICreateWorkOrderPayload,
  ISubmitResolutionPayload,
  ISubmitWorkUpdatePayload,
} from "@/types";

export function useDepartmentWorkOrders(departmentId?: string, filters?: Record<string, any>) {
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

export function useWorkOrderResolutions(workOrderId?: string) {
  return useQuery({
    queryKey: ["work-order-resolutions", workOrderId],
    queryFn: () => {
      if (!workOrderId) throw new Error("Work order ID is required");
      return getWorkOrderResolutions(workOrderId);
    },
    enabled: !!workOrderId,
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
      payload: {
        technicianId?: string;
        assignedToId?: string;
        teamId?: string;
        notes?: string;
        reason?: string;
      };
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
    mutationFn: (
      args: { id?: string; payload: ISubmitResolutionPayload } | ISubmitResolutionPayload,
    ) => {
      const payload = "payload" in args ? args.payload : args;
      const id = "id" in args ? args.id : payload.workOrderId;
      return submitResolution(payload, id);
    },
    onSuccess: (_, variables) => {
      const id =
        "id" in variables ? variables.id : (variables as ISubmitResolutionPayload).workOrderId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["work-order", id] });
        queryClient.invalidateQueries({ queryKey: ["work-order-updates", id] });
      }
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["my-work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["technician-dashboard"] });
    },
  });
}

export function useUpdateWorkOrderTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      taskId,
      payload,
    }: {
      workOrderId: string;
      taskId: string;
      payload: { isCompleted: boolean };
    }) => updateWorkOrderTask(workOrderId, taskId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["my-work-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update task");
    },
  });
}

export function useMyWorkOrders(filters?: MyWorkOrdersFilter) {
  return useQuery({
    queryKey: ["my-work-orders", filters],
    queryFn: () => getMyWorkOrders(filters),
  });
}

export function useQuickActionWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        action: "START" | "PAUSE" | "RESUME";
        reason?: string;
        notes?: string;
        attachmentIds?: string[];
      };
    }) => quickActionWorkOrder(id, payload),
    onSuccess: (_data, variables) => {
      const actionLabels = {
        START: "Work started: Status marked as IN PROGRESS",
        PAUSE: "Work paused",
        RESUME: "Work resumed: Status back to IN PROGRESS",
      };
      toast.success(actionLabels[variables.payload.action] || "Action updated successfully");
      queryClient.invalidateQueries({ queryKey: ["work-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["work-order-updates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["technician-queue"] });
      queryClient.invalidateQueries({ queryKey: ["technician-dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update work order action");
    },
  });
}
