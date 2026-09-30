import type { ReactNode } from "react";

export function Container({
  className = "max-w-[1200px]",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}
