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

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If user is already signed in, redirect them.
  useEffect(() => {
    if (user) {
      router.push(ROUTES.PAGES.APP.CREATE);
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(ROUTES.PAGES.CREATE);
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
    setError("");
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push(ROUTES.PAGES.APP.CREATE);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      <Card className="relative z-10 w-full max-w-md bg-opacity-80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>Welcome Back to VidSpark</CardTitle>
          <CardDescription>
            Sign in to continue your AI-powered video creation journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="my-8">
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="mt-4"
            />
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Loading...
                </span>
              ) : (
                "Sign In →"
              )}
            </Button>
          </form>
        </CardContent>
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-2 h-[1px] w-full" />
        <CardFooter>
          <button
            onClick={handleGoogleSignIn}
            className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            disabled={isLoading}
          >
            <GrGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Sign in with Google
            </span>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
