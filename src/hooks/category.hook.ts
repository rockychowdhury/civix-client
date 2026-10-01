import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api";
import type { CategoryResponse } from "@/types";

export const useGetCategories = (searchTerm?: string) => {
  return useQuery<CategoryResponse, Error>({
    queryKey: ["categories", searchTerm],
    queryFn: () => getCategories(searchTerm, 100),
  });
};
