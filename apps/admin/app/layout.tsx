import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qubi Admin",
  description: "Qubi LLC admin panel for content, providers and sync control.",
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