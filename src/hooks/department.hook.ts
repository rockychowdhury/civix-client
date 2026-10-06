import { useQuery } from "@tanstack/react-query";
import { getDepartmentById, getDepartmentCategories, getSlaPolicies } from "../api/department.api";

export function useGetDepartmentById(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
  });
}

export function useGetDepartmentCategories(departmentId?: string) {
  return useQuery({
    queryKey: ["categories", { departmentId }],
    queryFn: () => getDepartmentCategories(departmentId),
  });
}

export function useGetSlaPolicies(categoryId?: string) {
  return useQuery({
    queryKey: ["slaPolicies", { categoryId }],
    queryFn: () => getSlaPolicies(categoryId),
  });
}
