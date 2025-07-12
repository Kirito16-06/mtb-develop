"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { Bell, Gift, Sparkles, Coins, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/tw";
import axios from "axios";
import PushNotificationToggle from "@/components/notifications/PushNotificationToggle";
import PageSkeleton from "../PageSkeleton";
import Link from "next/link";
import { Notification } from "@/types/client/notifcation";


export default function NotificationsPage()  {
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/notifications");
      return data as Notification[];
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading) {
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
    }
  }, [queryClient, isLoading]);

  console.log(notifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "JP_EARNED":
        return <Coins className="w-5 h-5 text-yellow-500" />;
      case "PROSPERITY_APPLIED":
      case "SPOTLIGHT_APPROVED":
      case "SPOTLIGHT_ACTIVE":
        return <Sparkles className="w-5 h-5 text-blue-500" />;
      case "MAGIC_BOX_SHARED":
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <PageSkeleton type="notification" />;
  }

  return (
    <div className="p-6">
      {/* Push Notification Settings */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-medium mb-3">Notification Settings</h2>
        <div className="space-y-3">
          <PushNotificationToggle
            variant="switch"
            label="Browser Push Notifications"
          />
          <p className="text-sm text-gray-500 mt-1">
            Receive notifications even when you&aposre not actively using the
            site
          </p>
        </div>
      </div>

      {/* Recent Notifications Header */}
      <h2 className="text-lg font-medium mb-3">Recent Notifications</h2>

      {/* Notification List */}
      {notifications?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications yet
        </div>
      ) : (
        notifications?.map((notification) => {
          const url = notification.metadata?.url;
          const card = (
            <div
              key={notification.id}
              className={cn(
                "bg-white p-4 rounded-lg shadow-sm border mb-3 ",
                !notification.isRead && "border-blue-500"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {notification.isRead && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
          return url ? (
            <Link
              href={url}
              key={notification.id}
              // legacyBehavior
              className="cursor-pointer"
            >
              {card}
            </Link>
          ) : (
            card
          );
        })
      )}
    </div>
  );
}
