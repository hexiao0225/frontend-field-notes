import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Component Playground",
  description: "A playground for practicing modern React composition and accessibility patterns",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
