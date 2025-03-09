import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar.component";
import { ThemeProvider } from "@/providers/ThemeProvider";
import WaitForAuth from "@/components/layout/WaitForAuth.component";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VidSpark - AI-Powered Short Video Generator",
  description: "Create AI-generated short videos with captions in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen text-white`}
      >
        <ThemeProvider>
          <AuthProvider>
            <WaitForAuth>
              <Navbar />
              <main className="flex-1 flex flex-col items-center justify-center w-full pt-[64px]">
                {children}
              </main>
            </WaitForAuth>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
