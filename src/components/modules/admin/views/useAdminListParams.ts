"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { ADMIN_PAGINATION_DEFAULTS } from "@/constant/admin.constant";

/** Search (debounced) + server-page state shared by every admin list view. */
export function useAdminListParams(extraKey?: string) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, extraKey]);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    limit: ADMIN_PAGINATION_DEFAULTS.limit,
  };
}
