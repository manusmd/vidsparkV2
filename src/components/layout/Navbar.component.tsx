"use client";
import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const navLinks = [
    { href: "/create", label: "Create" },
    { href: "/history", label: "History" },
    { href: "/admin", label: "Admin" },
  ];
  const navLinksToRender = navLinks.filter((link) =>
    link.label === "Admin" ? isAdmin : true,
  );

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav
      style={{ zIndex: 1000 }}
      className="w-full fixed top-0 left-0 bg-background border-b border-border shadow-md h-[72px]"
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-full">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight transition-all hover:opacity-80 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          VidSpark
        </Link>

        {/* Navigation Menu */}
        {user && (
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              {navLinksToRender.map(({ href, label }) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    href={href}
                    className={`${navigationMenuTriggerStyle()} transition-all text-lg font-medium px-4 py-2 rounded-lg hover:text-blue-400 hover:bg-blue-500/10`}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Authentication / Avatar */}
        <div className="flex items-center gap-4">
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="cursor-pointer focus:outline-none transition-transform hover:scale-105">
                  <div className="rounded-full border-2 border-white p-1">
                    <Avatar>
                      <AvatarImage
                        src={user.photoURL || ""}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {user.displayName ? user.displayName[0] : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-40 p-2 mt-3 rounded-md shadow-xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700"
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col space-y-1">
                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:bg-gray-600 hover:scale-[1.02] hover:rounded-md"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:bg-gray-600 hover:scale-[1.02] hover:rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
