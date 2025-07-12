
"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  UserRound,
  BarChart,
  CreditCard,
  Users,
  History,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { getInitials } from "@/utils/getInitials";// Make sure this helper exists
import { useState } from "react";
import { ComingSoonModal } from "@/components/modals/CommingSoonModal";
import { UserDropdownProps } from "@/types/client/nav";


const UserProfileDropdown = ({ profilePicture, userName }: UserDropdownProps) => {
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  // console.log("UserProfileDropdown", { profilePicture, userName });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="h-8 w-8 sm:h-10 sm:w-10 aspect-square cursor-pointer">
            <Avatar className="rounded-md border border-[#4B65A2] w-full h-full">
              {profilePicture ? (
                <AvatarImage
                  src={profilePicture}
                  alt="Profile"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-md bg-white w-full h-full flex items-center justify-center uppercase">
                {userName ? (
                  <span className="text-lg sm:text-2xl">
                    {getInitials(userName)}
                  </span>
                ) : (
                  <UserRound size={20} />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 mt-2 space-y-1" align="end">
          <Link href="/dashboard/my-profile">
            <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
              <UserRound size={18} />
              <span>My Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/insights">
            <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
              <BarChart size={18} />
              <span>Insights</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/subscription">
            <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
              <CreditCard size={18} />
              <span>Subscription</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/refer-friend">
            <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
              <Users size={18} />
              <span>Refer a Friend</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/transactions-history">
            <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
              <History size={18} />
              <span>Transactions</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => setIsComingSoonModalOpen(true)}
            className="cursor-pointer flex items-center space-x-2"
          >
            <MessageSquare size={20} />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex items-center space-x-2 text-red-500"
            onClick={() => signOut()}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ComingSoonModal
        open={isComingSoonModalOpen}
        onOpenChange={setIsComingSoonModalOpen}
      />
    </>
  );
};

export default UserProfileDropdown;
