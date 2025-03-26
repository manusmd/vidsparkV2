"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Film,
  BarChart,
  Settings,
  Shield,
  Menu,
  X,
  User,
  CreditCard,
  Link as LinkIcon,
  FolderOpen,
  Users,
  Music,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/lib/routes";
import { ShimmeringText } from "@/components/ui/ShimmeringText.component";

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Check if a link is active
  const isActive = (href: string) => pathname.startsWith(href);

  // Get classes for links
  const getLinkClasses = (href: string) => {
    const base = "flex items-center gap-2 px-4 py-2 rounded-md transition-all";
    const active = "bg-indigo-600 text-white";
    const inactive = "hover:bg-indigo-500/10 hover:text-indigo-600";
    return isActive(href) ? `${base} ${active}` : `${base} ${inactive}`;
  };

  // Navigation sections with simplified structure (max 1 submenu level)
  const navigationSections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <BarChart className="w-5 h-5" />,
      items: [
        {
          href: ROUTES.PAGES.APP.DASHBOARD,
          label: "Dashboard",
          icon: <BarChart className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "content-creation",
      title: "Content Creation",
      icon: <Film className="w-5 h-5" />,
      items: [
        {
          href: ROUTES.PAGES.APP.CREATE,
          label: "Create",
          icon: <Plus className="w-4 h-4" />,
        },
        {
          href: ROUTES.PAGES.APP.MY_VIDEOS.INDEX,
          label: "My Videos",
          icon: <Film className="w-4 h-4" />,
        },
        {
          href: ROUTES.PAGES.APP.ANALYTICS.INDEX,
          label: "Analytics",
          icon: <BarChart className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          href: ROUTES.PAGES.APP.SETTINGS.PROFILE,
          label: "Profile",
          icon: <User className="w-4 h-4" />,
        },
        {
          href: ROUTES.PAGES.APP.SETTINGS.CONNECTED_ACCOUNTS,
          label: "Accounts",
          icon: <LinkIcon className="w-4 h-4" />,
        },
        {
          href: ROUTES.PAGES.APP.SETTINGS.BILLING,
          label: "Billing",
          icon: <CreditCard className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Admin section (only shown to admin users)
  const adminSection = {
    id: "administration",
    title: "Administration",
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        href: ROUTES.PAGES.APP.ADMIN.CONTENT_TYPES,
        label: "Content Categories",
        icon: <FolderOpen className="w-4 h-4" />,
      },
      {
        href: ROUTES.PAGES.APP.ADMIN.IMAGE_TYPES,
        label: "Image Templates",
        icon: <Film className="w-4 h-4" />,
      },
      {
        href: ROUTES.PAGES.APP.ADMIN.MUSIC,
        label: "Music Library",
        icon: <Music className="w-4 h-4" />,
      },
      {
        href: ROUTES.PAGES.APP.ADMIN.USERS,
        label: "User Management",
        icon: <Users className="w-4 h-4" />,
      },
      {
        href: ROUTES.PAGES.APP.ADMIN.PRODUCTS,
        label: "Products",
        icon: <ShoppingBag className="w-4 h-4" />,
      },
      {
        href: ROUTES.PAGES.APP.ADMIN.SETTINGS,
        label: "System Config",
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  };

  // Combine sections based on user role
  const sections = isAdmin
    ? [...navigationSections, adminSection]
    : navigationSections;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border transition-all duration-300 z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64 md:w-64
        `}
      >
        {/* Logo with Framer Motion shimmering effect */}
        <div className="p-4 border-b border-border">
          <Link
            href={ROUTES.PAGES.HOME}
            className="text-2xl font-extrabold tracking-tight transition-all hover:opacity-90 relative"
          >
            <ShimmeringText text="VidSpark" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Navigation Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-1 pl-2">
                  {section.items.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <div className={getLinkClasses(item.href)}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

    </>
  );
}
