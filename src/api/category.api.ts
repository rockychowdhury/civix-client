import apiClient from "@/lib/apiClient";
import type { CategoryResponse } from "@/types";

export const getCategories = async (
  searchTerm?: string,
  limit: number = 100,
): Promise<CategoryResponse> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (limit) params.append("limit", limit.toString());

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiClient<CategoryResponse>(`/categories${query}`, {
    method: "GET",
  });
};
