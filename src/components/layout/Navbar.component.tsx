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
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import ROUTES from "@/lib/routes";
import { BsCreditCard } from "react-icons/bs";
import { ShimmeringText } from "@/components/ui/ShimmeringText.component";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Prepare the user avatar URL once
  const userAvatarUrl = user?.photoURL 
    ? `/api/proxy/image?url=${encodeURIComponent(user.photoURL)}` 
    : "";

  // Single dashboard link for logged-in users
  const dashboardLink = { href: ROUTES.PAGES.APP.DASHBOARD.VIDSPARK, label: "Go To Dashboard" };

  const getLinkClasses = (href: string) => {
    const base =
      "transition-all text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5";
    const active = "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20";
    const inactive = "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md";
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
      className="w-full fixed top-0 left-0 bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg h-[72px]"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer focus:outline-none transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="rounded-full bg-gradient-to-r p-[2px] from-blue-500 to-purple-600">
                      <div className="rounded-full bg-gray-900 p-[2px]">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            key={`user-avatar-${user.uid}`}
                            src={userAvatarUrl}
                            alt="User Avatar"
                            crossOrigin="anonymous"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            {user.displayName ? user.displayName[0] : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-48 p-2 mt-3 rounded-lg shadow-xl overflow-hidden bg-gray-900/90 backdrop-blur-md border border-white/10"
                  style={{ zIndex: 9999 }}
                >
                  <div className="flex flex-col space-y-1">
                    <Link
                      href={ROUTES.PAGES.APP.SETTINGS.PROFILE}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-white/90 transition-all duration-300 ease-in-out hover:bg-white/10 hover:text-white rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href={ROUTES.PAGES.APP.SETTINGS.CREDITS}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-white/90 transition-all duration-300 ease-in-out hover:bg-white/10 hover:text-white rounded-md"
                    >
                      <BsCreditCard className="h-4 w-4 text-purple-400" />
                      Credits
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-white/90 transition-all duration-300 ease-in-out hover:bg-red-500/20 hover:text-red-300 rounded-md mt-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href={ROUTES.PAGES.AUTH.SIGNIN}
                className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link 
                href={ROUTES.PAGES.AUTH.SIGNUP}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:translate-y-[-1px]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
