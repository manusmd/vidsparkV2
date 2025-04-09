"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { GrGoogle } from "react-icons/gr";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import ROUTES from "@/lib/routes";
import { ShimmeringText } from "@/components/ui/ShimmeringText.component";
import Link from "next/link";
import InteractiveBackground from "@/components/ui/InteractiveBackground";

export default function SignUp() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(ROUTES.PAGES.APP.STUDIO);
    }
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error("Authentication service is not available");
      }
      await createUserWithEmailAndPassword(auth, email, password);
      router.push(ROUTES.PAGES.APP.STUDIO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    if (!auth) return;
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(ROUTES.PAGES.APP.STUDIO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <InteractiveBackground />
      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <ShimmeringText text="Join VidSpark" className="text-2xl" />
            <p className="text-muted-foreground">
              Sign up to continue your AI-powered video creation journey
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                className="flex h-10 w-full rounded-md border border-input bg-background/40 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-neutral-200/20 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background/40 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-neutral-200/20 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Password"
              />
            </div>
            <button className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-10 px-4 py-2 text-white shadow-lg hover:shadow-blue-500/25">
              Sign Up →
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background/40 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-neutral-200/20 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Sign up with Google
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-purple-500 hover:text-purple-600 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
