"use client";

import { usePathname } from "next/navigation";
import LayoutWrapper from "./LayoutWrapper.component";
import WaitForAuth from "./WaitForAuth.component";

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return children;
  }

  return (
    <WaitForAuth>
      <LayoutWrapper>{children}</LayoutWrapper>
    </WaitForAuth>
  );
} 