import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Play It Forward",
  description: "The sportsbook that gives back",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
