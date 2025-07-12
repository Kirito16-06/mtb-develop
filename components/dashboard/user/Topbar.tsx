"use client";

import {
  Search,
} from "lucide-react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { User as UserType } from "@/types/types";
import { usePathname } from "next/navigation";
import { ROUTE_TITLES } from "@/lib/constants/routeTitles";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/getInitials";
import Image from "next/image";
import { NotificationIcon } from "@/components/icons/NotificationIcons";
import Link from "next/link";
import { Gift } from "lucide-react";
import MagicBoxModal from "@/components/modals/MagicBoxModal";
import { cn } from "@/lib/utils/tw";
import { formatJP } from "@/lib/utils/formatJP";
import UserProfileDropdown from "./UserProfileDropDown";
import { StreakDisplay } from "@/components/userStreak/StreakDisplay"; 
import { SearchUser } from "@/types/client/nav";

const TopBarBadge = ({
  children,
  className,
  ...props
}: { children: React.ReactNode } & BadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "bg-white rounded-md h-8 sm:h-10 flex items-center justify-center px-2 sm:px-3 border border-[#4B65A2]",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
};


const fetchUsers = async (searchTerm: string) => {
  const { data } = await axios.get(`/api/user/search?q=${searchTerm}`);
  return data.users;
};

export default function   TopBar({ user }: { user?: UserType }) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMagicBoxOpen, setIsMagicBoxOpen] = useState(false);
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(user?.image || null);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.profilePicture) {
        setLocalProfilePicture(event.detail.profilePicture);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: () => fetchUsers(searchTerm),
    enabled: searchTerm.length > 0,
  });



  const { data: hasUnopenedBox } = useQuery({
    queryKey: ["magicBoxStatus"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/magic-box");
      return (
        data.magicBox && (!data.magicBox.isOpened || !data.magicBox.isRedeemed)
      );
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  // Replace the unread notifications count query to use the unread API
  const { data: unreadNotificationsCount } = useQuery<number>({
    queryKey: ["unreadNotificationsCount"],
    queryFn: async () => {
      const { data } = await axios.get<{ unreadCount: number }>(
        "/api/user/notifications/unread"
      );

      return data.unreadCount;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });

  // Get the last segment of the pathname and remove query params
  const currentRoute = pathname.split("/").pop()?.split("?")[0] || "dashboard";
  const pageTitle = ROUTE_TITLES[currentRoute] || "Dashboard";

  return (
    <header className=" bg-transparent flex items-center justify-between">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 w-full items-start sm:items-center mb-5">
        <div className="flex flex-col sm:flex-row justify-between w-full sm:w-2/3 gap-4 sm:gap-0 items-center">
          <h1 className="text-xl sm:text-2xl font-normal text-slate-800 md:block hidden">
            {pageTitle}
          </h1>

          <div className="relative w-full sm:w-80 md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 focus:outline-none" />
            </div>
            <input
              type="search"
              className="bg-white shadow-md border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search Anything Here..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-auto">
                {isLoading ? (
                  <div className="p-2 text-sm text-slate-500">Loading...</div>
                ) : users?.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">
                    No users found
                  </div>
                ) : (
                  users?.map((user: SearchUser) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-2 p-2 hover:bg-slate-100 cursor-pointer"
                      target="_blank"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          <p className="text-sm">{getInitials(user.name)}</p>
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* //! Streak added by aaisha */}
        <div className="flex gap-3">
          {/* <StreakDisplay /> */}

          <TopBarBadge>
              <div className="relative">
                <StreakDisplay />
               
              </div>
            </TopBarBadge>
        </div>

        <div className="flex gap-3">
          <TopBarBadge>
            <Image
              src="/Pearls.png"
              alt="Icon"
              width={16}
              height={12}
              className="rounded-xl mr-1"
            />
            <span className="font-medium text-sm sm:text-base">JP</span>
            <span className="font-bold text-blue-500 ml-1 text-sm sm:text-base">
              {formatJP(user?.jpBalance || 0)}
            </span>
          </TopBarBadge>

          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <TopBarBadge className="cursor-pointer">
              <div className="relative">
                <NotificationIcon />
                {(unreadNotificationsCount ?? 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    {unreadNotificationsCount}
                  </div>
                )}
              </div>
            </TopBarBadge>
          </Link>

          <TopBarBadge
            className="cursor-pointer"
            onClick={() => setIsMagicBoxOpen(true)}
          >
            <div className="relative">
              <Gift size={20} />
              {hasUnopenedBox && (
                <div className="absolute top-[-2px] right-[-2px] w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          </TopBarBadge>
          <UserProfileDropdown
            userName={user?.name}
            profilePicture={localProfilePicture}
          />
        </div>
      </div>

      <MagicBoxModal
        isOpen={isMagicBoxOpen}
        onClose={() => setIsMagicBoxOpen(false)}
        userId={user?.id}
      />
    </header>
  );
}
