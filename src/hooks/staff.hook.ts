import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IStaffFilter } from "@/types";
import {
  createCityAdmin,
  createDepartmentManager,
  createDispatcher,
  createPlatformAdmin,
  createTechnician,
  getAllStaff,
  getAllTechnicians,
  getStaffById,
  getTechnicianDashboard,
  updateStaff,
  updateStaffStatus,
  updateTechnicianAvailability,
} from "../api";

export function useCreatePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlatformAdmin,
    onSuccess: () => {
      toast.success("Platform admin provisioned successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to provision platform admin");
    },
  });
}

export function useCreateCityAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCityAdmin,
    onSuccess: () => {
      toast.success("City admin provisioned successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to provision city admin");
    },
  });
}

export function useCreateDepartmentManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartmentManager,
    onSuccess: () => {
      toast.success("Department manager created successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create department manager");
    },
  });
}

export function useCreateDispatcher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDispatcher,
    onSuccess: () => {
      toast.success("Dispatcher created successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create dispatcher");
    },
  });
}

export function useCreateTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTechnician,
    onSuccess: () => {
      toast.success("Technician created successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to create technician");
    },
  });
}

export function useGetAllStaff(params?: IStaffFilter) {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: () => getAllStaff(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetAllTechnicians(params?: IStaffFilter) {
  return useQuery({
    queryKey: ["staff", "technicians", params],
    queryFn: () => getAllTechnicians(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetStaffById(id: string) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id),
    enabled: !!id,
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateStaff(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update profile");
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateStaffStatus(id, status),
    onSuccess: (_, { id }) => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", id] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update status");
    },
  });
}

export function useTechnicianDashboard() {
  return useQuery({
    queryKey: ["technician-dashboard"],
    queryFn: async () => {
      const res = await getTechnicianDashboard();
      return res.data;
    },
  });
}

export function useUpdateTechnicianAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) => updateTechnicianAvailability(isAvailable),
    onSuccess: (_, isAvailable) => {
      toast.success(
        isAvailable ? "Shift active: You are now On Duty" : "You are now Off Duty / on break",
      );
      queryClient.invalidateQueries({ queryKey: ["technician-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to update availability");
    },
  });
}
