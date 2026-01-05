import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 1. Load Manrope (Brand Font)
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

// 2. Load Mono (Financial Data Font)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: "IMSAL Services | Command Center",
  description: "Silence is Luxury.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrainsMono.variable} bg-surface-app text-text-body antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}