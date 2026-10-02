"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import Loading from "@/app/loading";
import { useGetMe } from "@/hooks";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { data, isPending, isError, isFetching } = useGetMe();

  const user = data?.data;
  
  // Consider it loading if it's pending, or if it's fetching and we don't have user data yet.
  const isLoadingAuth = isPending || (isFetching && !user);

  useEffect(() => {
    if (isLoadingAuth) {
      return;
    }
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isLoadingAuth, isError, user, router]);

  if (isLoadingAuth) {
    return <Loading />;
  }

  if (isError || !user) {
    return <Loading />;
  }

  return <>{children}</>;
}