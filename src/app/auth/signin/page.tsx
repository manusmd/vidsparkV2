"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
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

export default function SignIn() {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error("Authentication service is not available");
      }
      await signInWithEmailAndPassword(auth, email, password);
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

  const handleGoogleSignIn = async () => {
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
            <h1 className="text-3xl font-bold tracking-tight">
              <ShimmeringText text="Welcome Back to VidSpark" className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500" />
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue your AI-powered video creation journey.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="bg-background/40 border-neutral-200/20 focus:border-purple-500/50 transition-all duration-300"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="bg-background/40 border-neutral-200/20 focus:border-purple-500/50 transition-all duration-300"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Loading...
                </span>
              ) : (
                "Sign In →"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-300 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/10"
              disabled={isLoading}
            >
              <GrGoogle className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  href="/auth/signup"
                  className="font-medium text-purple-500 hover:text-purple-600 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
