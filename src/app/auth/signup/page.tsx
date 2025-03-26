"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { GrGoogle } from "react-icons/gr";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ROUTES from "@/lib/routes";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the user is already signed in, redirect them
    if (auth && auth.currentUser) {
      router.push(ROUTES.PAGES.APP.CREATE);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });
      // Force token refresh so that updated custom claims are available
      await user.getIdToken(true);
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

  const handleGoogleSignIn = async () => {
    if (!auth) return;

    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(ROUTES.PAGES.APP.SETTINGS.PROFILE);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Google Sign-In Error:", err.message);
      } else {
        console.error("Google Sign-In Error: Unknown error");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      <Card className="relative z-10 w-full max-w-md bg-opacity-80 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>Welcome to VidSpark</CardTitle>
          <CardDescription>
            Sign up to get started with AI-powered video creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="my-8" onSubmit={handleEmailSignUp}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Tyler"
                  type="text"
                  onChange={handleChange}
                  required
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Durden"
                  type="text"
                  onChange={handleChange}
                  required
                />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="your@email.com"
                type="email"
                onChange={handleChange}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                onChange={handleChange}
                required
              />
            </LabelInputContainer>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Loading...
                </span>
              ) : (
                "Sign up →"
              )}
            </Button>
          </form>
        </CardContent>
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-2 h-[1px] w-full" />
        <CardFooter>
          <button
            onClick={handleGoogleSignIn}
            className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          >
            <GrGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Sign up with Google
            </span>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {children}
    </div>
  );
};
