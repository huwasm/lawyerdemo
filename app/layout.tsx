import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Richards & Law — Intake Dashboard",
  description: "Automated police report intake powered by AI and Clio Manage",
  icons: {
    icon: "/icon.svg",
  },
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
