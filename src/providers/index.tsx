"use client";

import type { ReactNode } from "react";
import GoogleAuthProvider from "./google-auth.provider";
import QueryProvider from "./query.provider";
import { ThemeProvider } from "./theme.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <GoogleAuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}
