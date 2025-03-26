"use client";
import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import ROUTES from "@/lib/routes";
import { RocketIcon } from "@radix-ui/react-icons";
import { BsCreditCard } from "react-icons/bs";
import { ShimmeringText } from "@/components/ui/ShimmeringText.component";

export default function Navbar() {
  const { user, loading, credits, creditsLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Prepare the user avatar URL once
  const userAvatarUrl = user?.photoURL 
    ? `/api/proxy/image?url=${encodeURIComponent(user.photoURL)}` 
    : "";

  // Single dashboard link for logged-in users
  const dashboardLink = { href: ROUTES.PAGES.APP.DASHBOARD, label: "Go To Dashboard" };

  const getLinkClasses = (href: string) => {
    const base =
      "transition-all text-lg font-medium px-4 py-2 rounded-lg text-xl cool-button";
    const active = "bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white";
    const inactive = "hover:bg-gradient-to-r hover:from-[#6366f1] hover:via-[#a855f7] hover:to-[#ec4899] hover:text-white";
    return pathname.startsWith(href)
      ? `${base} ${active}`
      : `${base} ${inactive}`;
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push(ROUTES.PAGES.HOME);
  };

  return (
    <nav
      style={{ zIndex: 1000 }}
      className="w-full fixed top-0 left-0 bg-background border-b border-border shadow-md h-[72px]"
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-full">
        {/* Logo with Framer Motion shimmering effect */}
        <Link
          href={ROUTES.PAGES.HOME}
          className="text-3xl font-extrabold tracking-tight transition-all hover:opacity-90 relative"
        >
          <ShimmeringText text="VidSpark" />
        </Link>

        {/* Cool Button Styles */}
        <style jsx global>{`
          /* Cool Button Styles - Modern Version */
          .cool-button {
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
            background-origin: border-box;
            background-clip: padding-box, border-box;
            background-image: 
              linear-gradient(to right, rgba(99, 102, 241, 0.85), rgba(168, 85, 247, 0.85), rgba(236, 72, 153, 0.85)),
              linear-gradient(to right, #6366f1, #a855f7, #ec4899);
            box-shadow: 
              0 4px 10px -1px rgba(99, 102, 241, 0.2), 
              0 2px 6px -1px rgba(168, 85, 247, 0.15),
              0 0 12px 2px rgba(236, 72, 153, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(0);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }

          .cool-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              120deg,
              transparent 10%,
              rgba(255, 255, 255, 0.5) 20%,
              rgba(255, 255, 255, 0.2) 30%,
              transparent 40%
            );
            animation: buttonShine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            filter: blur(3px);
          }

          .cool-button::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 0.5rem;
            background: linear-gradient(
              to right, 
              rgba(99, 102, 241, 0.7), 
              rgba(168, 85, 247, 0.7), 
              rgba(236, 72, 153, 0.7)
            );
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .cool-button:hover::after {
            opacity: 1;
          }

          .cool-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
              0 10px 25px -5px rgba(99, 102, 241, 0.3), 
              0 8px 10px -6px rgba(168, 85, 247, 0.2),
              0 0 15px 5px rgba(236, 72, 153, 0.15);
            letter-spacing: 0.02em;
          }

          .cool-button:active {
            transform: translateY(1px) scale(0.98);
            box-shadow: 
              0 2px 4px -1px rgba(99, 102, 241, 0.2), 
              0 1px 2px -1px rgba(168, 85, 247, 0.1),
              inset 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          @keyframes buttonShine {
            0% {
              left: -100%;
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            40% {
              opacity: 0.8;
            }
            60% {
              left: 100%;
              opacity: 0.8;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }

        `}</style>

        {/* Navigation Menu - Removed and moved to avatar section */}

        {/* Authentication / Avatar */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-32 h-10" />
          ) : user ? (
            <>
              {/* Dashboard button positioned to the left of the avatar */}
              <Link href={dashboardLink.href} className={getLinkClasses(dashboardLink.href)}>
                <span className="flex items-center gap-2">
                  <RocketIcon className="h-5 w-5" />
                  {dashboardLink.label}
                </span>
              </Link>

              {/* Credits display */}
              <Link 
                href={ROUTES.PAGES.APP.SETTINGS.CREDITS} 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <BsCreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {creditsLoading ? "..." : credits?.availableCredits || 0} Credits
                </span>
              </Link>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer focus:outline-none transition-transform hover:scale-105">
                    <div className="rounded-full border-2 border-white p-1">
                      <Avatar>
                        <AvatarImage
                          key={`user-avatar-${user.uid}`}
                          src={userAvatarUrl}
                          alt="User Avatar"
                          crossOrigin="anonymous"
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
                      href={ROUTES.PAGES.APP.SETTINGS.PROFILE}
                      passHref
                      legacyBehavior
                    >
                      <a className="block w-full text-left px-4 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:bg-gray-600 hover:scale-[1.02] hover:rounded-md">
                        Profile
                      </a>
                    </Link>
                    <Link
                      href={ROUTES.PAGES.APP.SETTINGS.CREDITS}
                      passHref
                      legacyBehavior
                    >
                      <a className="block w-full text-left px-4 py-2 text-sm text-white transition-all duration-300 ease-in-out hover:bg-gray-600 hover:scale-[1.02] hover:rounded-md">
                        Credits
                      </a>
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
            </>
          ) : (
            <>
              <Link href={ROUTES.PAGES.AUTH.SIGNIN} passHref legacyBehavior>
                <a>
                  <Button variant="ghost">Sign In</Button>
                </a>
              </Link>
              <Link href={ROUTES.PAGES.AUTH.SIGNUP} passHref legacyBehavior>
                <a>
                  <Button>Sign Up</Button>
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
