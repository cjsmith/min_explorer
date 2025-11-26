import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIN Explorer - Avalanche Observations",
  description: "View avalanche observations from Avalanche Canada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
