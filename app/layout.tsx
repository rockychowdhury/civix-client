import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  display: "swap",
  subsets: ["latin"],
});

const body = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  display: "swap",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Civix — Report it once. Watch it get fixed.",
    template: "%s — Civix",
  },
  description:
    "Civix is a public record for city issues that get fixed, not filed away. File a complaint and track its progress from submission to resolution.",
  applicationName: "Civix",
  keywords: [
    "civic tech",
    "city issues",
    "complaint tracking",
    "municipal services",
    "public accountability",
  ],
  openGraph: {
    title: "Civix — Report it once. Watch it get fixed.",
    description: "Civix is a public record for city issues that get fixed, not filed away.",
    type: "website",
    siteName: "Civix",
  },
};

export const viewport: Viewport = {
  themeColor: "#EFEBE2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} motion-safe:scroll-smooth`}
    >
      <head>
        {/* Anti-FOUC: apply theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('civix-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-paper font-body text-ink antialiased leading-relaxed"
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
