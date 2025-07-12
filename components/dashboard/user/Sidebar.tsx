"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  LayoutList,
  User,
  HelpCircle,
  Phone,
  Sparkles,
  ShoppingCartIcon,
  Menu,
  WandSparklesIcon,
  LucideSignalHigh,
  TrendingUp,
  HomeIcon,
  BookOpen,
  GlobeLock,
  LayoutDashboard,
  Droplet,
  Flower,
} from "lucide-react";
import { cn } from "@/lib/utils/tw";
import { User as UserType } from "@/types/types";
import { ComingSoonWrapper } from "@/components/wrappers/ComingSoonWrapper";


// Reusable navigation item component
type NavItemProps = {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onLinkClick?: () => void; // Add prop for handling link click
};

const NavItem = ({ href, icon, label, onLinkClick }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const content = (
    <>
      <div className="w-8">{icon}</div>
      <span className="font-normal text-[17px]">{label}</span>
      
    </>
  );

  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={cn(
            "flex items-center py-2",
            isActive ? "text-jp-orange" : "text-[#6C7894]"
          )}
          onClick={onLinkClick} // Call onLinkClick when link is clicked
        >
          {content}
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center py-2 cursor-pointer hover:text-jp-orange text-[#6C7894]"
          )}
        >
          {content}
        </div>
      )}
    </li>
  );
};

// Main navigation section component
type NavSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const NavSection = ({ title, children, className }: NavSectionProps) => (
  <div className={cn("space-y-2", className)}>
    <h4 className="text-[#405D9F] font-normal text-sm">{title}</h4>
    <nav>
      <ul className="">{children}</ul>
    </nav>
  </div>
);

// Main sidebar component
const Sidebar = ({ user }: { user?: UserType }) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [isBuddyLensOpen, setIsBuddyLensOpen] = useState(false);

  

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      <button
        className="lg:hidden fixed top-2 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <Menu size={24} />
        )}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className="h-full self-stretch">
        <aside
          className={cn(
            "fixed lg:static top-0 left-0 h-[100vh] bg-white shadow-lg rounded-3xl custom-scroll overflow-y-scroll transition-transform duration-300 z-50",
            "w-64 lg:w-64",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* User Profile Section */}
          <div className="flex flex-col my-6 px-5">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm">Hello</p>
                  <span className="text-amber-400">👋</span>
                </div>
                <h3 className="font-bold text-lg">
                  {user?.name ? user.name : "Your Name"}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-6">
              {/* Menu Section */}
              <NavSection title="Menu">
                <NavItem
                  href="/"
                  icon={<Home size={20} />}
                  label="Home"
                  onLinkClick={toggleSidebar}
                />
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard size={20} />}
                  label="Dashboard"
                  onLinkClick={toggleSidebar}
                />
                <NavItem
                  href="/dashboard/leaderboard"
                  icon={<LayoutList size={20} />}
                  label="Leaderboard"
                  onLinkClick={toggleSidebar}
                />
              </NavSection>
              <NavSection title="Features">
                <NavItem
                  href="/dashboard/daily-bloom"
                  icon={<Flower size={20} />}
                  label="Daily Blooms"
                  onLinkClick={toggleSidebar}
                />
                <NavItem
                  href="/dashboard/miracle-log"
                  icon={<WandSparklesIcon size={20} />}
                  label="Miracle Log"
                  onLinkClick={toggleSidebar}
                />

                <NavItem
                  href="/dashboard/progress-vault"
                  icon={<LucideSignalHigh size={20} />}
                  label="1% Progress Vault"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                {/* BuddyLens dropdown */}
                {/* <div className="space-y-1">
                  <button
                    onClick={() => setIsBuddyLensOpen(!isBuddyLensOpen)}
                    className="flex items-center justify-between w-full py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <span className="flex items-center gap-1 text-[#6C7894]">
                      <Eye size={20} />
                      <span className="text-lg">Buddy Lens</span>
                    </span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${isBuddyLensOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isBuddyLensOpen && (
                    <div className="pl-8 mt-1 space-y-1">
                      <NavItem
                        href="/dashboard/buddy-lens"
                        icon={<HomeIcon size={20} />}
                        label="My BuddyLens"
                      />
                      <NavItem
                        href="/dashboard/buddy-lens/requester"
                        icon={<UserRound size={20} />}
                        label="Request"
                      />
                      <NavItem
                        href="/dashboard/buddy-lens/reviewer"
                        icon={<ScanEye size={20} />}
                        label="Review"
                      />
                      <NavItem
                        href="/dashboard/buddy-lens/approve"
                        icon={<FileUser size={20} />}
                        label="Approve"
                      />
                    </div>
                  )}
                </div> */}

                <NavItem
                  href="/dashboard/buddy-lens"
                  icon={<HomeIcon size={20} />}
                  label="My BuddyLens"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />

                <NavItem
                  href="/dashboard/aligned-actions"
                  icon={<TrendingUp size={20} />}
                  label="1% Start"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <NavItem
                  href="/dashboard/prosperity"
                  icon={<Droplet size={20} />}
                  label="Prosperity Drops"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <NavItem
                  href="/dashboard/spotlight"
                  icon={<Sparkles size={20} />}
                  label="Spotlight"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <ComingSoonWrapper>
                  <NavItem
                    icon={<ShoppingCartIcon size={20} />}
                    label="Store"
                    onLinkClick={toggleSidebar} // Pass toggleSidebar
                  />
                </ComingSoonWrapper>
              </NavSection>
              {/* Settings Section */}
              <NavSection title="Settings">
                <NavItem
                  href="/dashboard/business-profile"
                  icon={<User size={20} />}
                  label="Business Profile"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <NavItem
                  href="/dashboard/faq"
                  icon={<HelpCircle size={20} />}
                  label="FAQ's"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <NavItem
                  href="/contact"
                  icon={<Phone size={20} />}
                  label="Contact us"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
                <NavItem
                  href="/blog"
                  icon={<BookOpen size={20} />}
                  label="Blog"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />

                <NavItem
                  href="/about-us"
                  icon={<GlobeLock size={20} />}
                  label="About us"
                  onLinkClick={toggleSidebar} // Pass toggleSidebar
                />
              </NavSection>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
