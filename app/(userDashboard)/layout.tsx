"use client"; // This directive is crucial for using React Hooks in App Router layouts

import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
// Ensure the import path and named export are correct for your hook
import useUserPresence, { UserPresenceProps } from "@/hooks/userUserPresence";
import { useSession } from "next-auth/react";
import React from "react"; // Explicitly import React if not implicitly available or for clarity

export default function Layout({ // Capitalized 'Layout' is common for components, though 'layout' works for file-based layouts.
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ FIXED: Removed 'status' from the destructuring as it was not being used.
  const { data: session } = useSession();

  // The 'id' from session?.user can be string, null, or undefined.
  // We ensure the type passed to useUserPresence is compatible.
  const userId: string | null | undefined = session?.user?.id;

  // Pass the object that matches UserPresenceProps.
  // The 'as UserPresenceProps' cast can often be removed if types align,
  // but keeping it here doesn't hurt if it helps TypeScript infer correctly.
  useUserPresence({ userId } as UserPresenceProps);

  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
