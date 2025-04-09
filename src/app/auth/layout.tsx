import { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "VidSpark - Authentication",
  description: "Sign in or sign up to VidSpark",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex min-h-screen flex-col">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 