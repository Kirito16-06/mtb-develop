"use client";

import React from "react";
import TopBar from "../dashboard/user/Topbar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/types/types";
import Sidebar from "../dashboard/user/Sidebar";

const UserDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const {
    data: user,
    error,
  } = useQuery<User>({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const response = await axios.get(`/api/user`);
      return response.data.user;
    },
    retry: false,
  });

  // if (isLoading) {
  //   return <PageLoader />;
  // }

  if (error) {
    console.error("Failed to fetch user data:", error);
    return <div>Error loading user data</div>;
  }

  return (
    <div className="w-full min-h-screen bg-dashboard max-w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 w-64 z-20 m-3">
        <Sidebar user={user} />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 md:mt-5 md:mx-5 mt-20 !h-full">
        {/* Fixed TopBar */}
        {/* <div className="md:mx-10 mx-5"> */}
        <div className="md:mx-10 mx-5">
          <TopBar user={user} />
        </div>
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto md:pt-4 px-4 sm:px-6 lg:px-7 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
