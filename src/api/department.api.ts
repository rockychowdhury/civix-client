import apiClient from "@/lib/apiClient";

export function getDepartmentById(id: string) {
  return apiClient<{ data: any }>(`/departments/${id}`, { method: "GET" });
}

export function getDepartmentCategories(departmentId?: string) {
  const params = departmentId ? { departmentId } : undefined;
  return apiClient<{ data: any[] }>("/categories", { method: "GET", params });
}

export function getSlaPolicies(categoryId?: string) {
  const params = categoryId ? { categoryId } : undefined;
  return apiClient<{ data: any[] }>("/sla-policies", { method: "GET", params });
}
