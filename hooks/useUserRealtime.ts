"use client";

import { useEffect, useState } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";


interface OnlineUser {
  userId: string;
}
export default function useAdminPresence(queryKey: QueryKey) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const queryClient = useQueryClient();
  useEffect(() => {
    const presenceChannel = supabaseClient.channel("user-presence", {
      config: {
        presence: {
          key: "admin",
        },
      },
    });
    const updatePresence = () => {
      const presence = presenceChannel.presenceState();
      const users = Object.keys(presence).map((userId) => ({ userId }));
      // Remove admin-tracker from the list
      // const filtered = users.filter((u) => u.userId !== "admin");
      setOnlineUsers(users);
      queryClient.invalidateQueries({queryKey})
    };
    presenceChannel
      .on("presence", { event: "join" }, updatePresence)
      .on("presence", { event: "leave" }, updatePresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ isAdmin: true }); // admin tracking
          updatePresence();
        }
      });


    return () => {
    
    supabaseClient.removeChannel(presenceChannel);
    };
  }, [queryClient]);

  return onlineUsers;
}