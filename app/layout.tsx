import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { RouteLoader } from "@/components/ui/route-loader";

export const metadata: Metadata = {
  title: "NextGen SIS",
  description: "Student information system MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RouteLoader />
        {children}
      </body>
    </html>
  );
}
