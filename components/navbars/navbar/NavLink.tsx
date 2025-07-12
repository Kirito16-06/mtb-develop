"use client";
import { cn } from "@/lib/utils/tw";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const NavLink = ({
  href,
  children,
  className = "",
  activeClassName = "font-semibold",
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-[#333333] hover:text-[#1E2875] text-[16px]",
        className,
        isActive && activeClassName
      )}
    >
      {children}
    </Link>
  );
};

export default NavLink;
