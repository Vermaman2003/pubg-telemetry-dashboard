import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Alpha: PUBG Telemetry Analytics",
  description: "Advanced analytics dashboard for PUBG telemetry data featuring interactive visualizations, heatmaps, weapon statistics, and win probability predictions.",
  keywords: ["PUBG", "telemetry", "analytics", "esports", "gaming", "data visualization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
