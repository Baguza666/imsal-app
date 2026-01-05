import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 1. Load the fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "IMSAL | Financial Operating System",
  description: "The heartbeat of your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 2. Apply fonts to the HTML tag */}
      {/* ADD suppressHydrationWarning={true} TO FIX EXTENSION ERRORS */}
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${mono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        {children}
      </body>
    </html>
  );
}