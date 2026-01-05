import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 1. Load Fonts
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
  title: "IMSAL PRO | Financial Operating System",
  description: "High-performance financial management for contractors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Force Dark Mode class here */
    <html lang="fr" className="dark">
      <head>
        {/* Load Material Symbols Icons from Google */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        /* suppressHydrationWarning fixes the "Dark Reader" extension errors */
        suppressHydrationWarning={true}
        className={`${inter.variable} ${mono.variable} antialiased bg-background-dark text-white font-sans`}
      >
        {children}
      </body>
    </html>
  );
}