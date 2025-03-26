"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import ROUTES from "@/lib/routes";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    // Skip breadcrumbs for home page
    if (pathname === "/") {
      setBreadcrumbs([]);
      return;
    }

    // Generate breadcrumbs based on pathname
    const generateBreadcrumbs = () => {
      const pathSegments = pathname.split("/").filter(Boolean);
      const breadcrumbItems: BreadcrumbItem[] = [];

      // Add home
      breadcrumbItems.push({
        label: "Home",
        href: ROUTES.PAGES.HOME,
      });

      // Handle app routes (without adding "App" to breadcrumbs)
      if (pathSegments[0] === "app") {
        // Handle specific sections
        if (pathSegments.length > 1) {
          const section = pathSegments[1];

          // Content Creation
          if (section === "create") {
            breadcrumbItems.push({
              label: "Create",
              href: ROUTES.PAGES.APP.CREATE,
            });
          } else if (section === "my-videos") {
            breadcrumbItems.push({
              label: "My Videos",
              href: ROUTES.PAGES.APP.MY_VIDEOS.INDEX,
            });

            // Add subsection if present
            if (pathSegments.length > 2) {
              const subsection = pathSegments[2];
              if (subsection === "all") {
                breadcrumbItems.push({
                  label: "All Videos",
                  href: ROUTES.PAGES.APP.MY_VIDEOS.ALL,
                });
              } else if (subsection === "drafts") {
                breadcrumbItems.push({
                  label: "Drafts",
                  href: ROUTES.PAGES.APP.MY_VIDEOS.DRAFTS,
                });
              } else if (subsection === "published") {
                breadcrumbItems.push({
                  label: "Published",
                  href: ROUTES.PAGES.APP.MY_VIDEOS.PUBLISHED,
                });
              } else if (subsection === "archived") {
                breadcrumbItems.push({
                  label: "Archived",
                  href: ROUTES.PAGES.APP.MY_VIDEOS.ARCHIVED,
                });
              }
            }
          }
          // Legacy History
          else if (section === "history") {
            breadcrumbItems.push({
              label: "History",
              href: ROUTES.PAGES.APP.HISTORY,
            });
          }
          // Account Management
          else if (section === "analytics") {
            breadcrumbItems.push({
              label: "Analytics",
              href: ROUTES.PAGES.APP.ANALYTICS.INDEX,
            });

            // Add subsection if present
            if (pathSegments.length > 2) {
              const subsection = pathSegments[2];
              if (subsection === "overview") {
                breadcrumbItems.push({
                  label: "Performance Overview",
                  href: ROUTES.PAGES.APP.ANALYTICS.OVERVIEW,
                });
              } else if (subsection === "channel") {
                breadcrumbItems.push({
                  label: "Channel Analytics",
                  href: ROUTES.PAGES.APP.ANALYTICS.CHANNEL,
                });
              } else if (subsection === "video") {
                breadcrumbItems.push({
                  label: "Video Analytics",
                  href: ROUTES.PAGES.APP.ANALYTICS.VIDEO,
                });
              }
            }
          } else if (section === "settings") {
            breadcrumbItems.push({
              label: "Settings",
              href: ROUTES.PAGES.APP.SETTINGS.INDEX,
            });

            // Add subsection if present
            if (pathSegments.length > 2) {
              const subsection = pathSegments[2];
              if (subsection === "profile") {
                breadcrumbItems.push({
                  label: "Profile",
                  href: ROUTES.PAGES.APP.SETTINGS.PROFILE,
                });
              } else if (subsection === "connected-accounts") {
                breadcrumbItems.push({
                  label: "Connected Accounts",
                  href: ROUTES.PAGES.APP.SETTINGS.CONNECTED_ACCOUNTS,
                });
              } else if (subsection === "billing") {
                breadcrumbItems.push({
                  label: "Billing",
                  href: ROUTES.PAGES.APP.SETTINGS.BILLING,
                });
              }
            }
          }
          // Administration
          else if (section === "admin") {
            breadcrumbItems.push({
              label: "Admin",
              href: ROUTES.PAGES.APP.ADMIN.INDEX,
            });

            // Add subsection if present
            if (pathSegments.length > 2) {
              const subsection = pathSegments[2];
              if (subsection === "content-types") {
                breadcrumbItems.push({
                  label: "Content Types",
                  href: ROUTES.PAGES.APP.ADMIN.CONTENT_TYPES,
                });
              } else if (subsection === "video-types") {
                breadcrumbItems.push({
                  label: "Video Types",
                  href: ROUTES.PAGES.APP.ADMIN.IMAGE_TYPES,
                });
              } else if (subsection === "music") {
                breadcrumbItems.push({
                  label: "Music",
                  href: ROUTES.PAGES.APP.ADMIN.MUSIC,
                });
              } else if (subsection === "users") {
                breadcrumbItems.push({
                  label: "Users",
                  href: ROUTES.PAGES.APP.ADMIN.USERS,
                });
              } else if (subsection === "settings") {
                breadcrumbItems.push({
                  label: "Settings",
                  href: ROUTES.PAGES.APP.ADMIN.SETTINGS,
                });
              }
            }
          }
        }
      }

      return breadcrumbItems;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [pathname]);

  // Don't render if no breadcrumbs or only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-muted-foreground py-4 px-6 bg-background border-b border-border">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={breadcrumb.href}
                  className="flex items-center hover:text-foreground"
                >
                  <Home className="w-3 h-3 mr-1" />
                  <span>{breadcrumb.label}</span>
                </Link>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className={`hover:text-foreground ${isLast ? "font-medium text-foreground" : ""}`}
                >
                  {breadcrumb.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 mx-2 text-muted-foreground" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
