// useAuth.tsx
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserCredits } from "@/services/credits/creditService";

const provider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  credits: UserCredits | null;
  creditsLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!db) return;
      setUser(currentUser);
      if (currentUser) {
        // Fetch the user document from Firestore and check roles.
        setCreditsLoading(true);
        getDoc(doc(db, "users", currentUser.uid))
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const roles = data.roles;
              setIsAdmin(Array.isArray(roles) && roles.includes("admin"));

              // Extract credit information
              const creditsValue =
                data.credits !== undefined
                  ? data.credits
                  : data.availableCredits;
              if (creditsValue !== undefined) {
                setCredits({
                  availableCredits: creditsValue || 0,
                  lifetimeCredits: data.lifetimeCredits || 0,
                  creditsExpiration: data.creditsExpiration,
                  plan: data.plan || "free",
                });
              } else {
                setCredits({
                  availableCredits: 0,
                  lifetimeCredits: 0,
                  plan: "free",
                });
              }
            } else {
              setIsAdmin(false);
              setCredits({
                availableCredits: 0,
                lifetimeCredits: 0,
                plan: "free",
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching user document:", error);
            setIsAdmin(false);
            setCredits({
              availableCredits: 0,
              lifetimeCredits: 0,
              plan: "free",
            });
          })
          .finally(() => {
            setLoading(false);
            setCreditsLoading(false);
          });
      } else {
        setIsAdmin(false);
        setCredits(null);
        setLoading(false);
        setCreditsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        credits,
        creditsLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
