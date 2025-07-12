"use client";

import { supabaseClient } from "@/lib/supabaseClient";
import axios from "axios";
import { useEffect } from "react";

export interface UserPresenceProps {
    userId: string;
}


//     useEffect(()=>{
//         if (!userId) {
//             return
//         }
//         console.log("user id in useUserPresence hook", userId);
        
//        const markOnline = async()=>{
//         await axios.post(`/api/mark-online-offline`,{
//             userId,
//             online: true
//         });
//         console.log("User marked as online");
//        }
//        markOnline();
//        const markOffline = async()=>{
//         await axios.post(`/api/mark-online-offline`,{
//             userId,
//             online: false
//         });
//        }
//        window.addEventListener("beforeunload",markOffline);
//        return()=>{
//         markOffline();
//         window.removeEventListener("beforeunload",markOffline);
//        }

//     },[userId]);

//     return null; // This hook doesn't return anything, it just toggle user's online/offline status
// }

// hooks/useUserPresence.ts

export default function useUserPresence({ userId }: UserPresenceProps) {
  useEffect(() => {
    console.log("user id in useUserPresence hook", userId);
    if (!userId) {
      console.warn("No userId provided for presence tracking.");
      return;
    }
    const presenceChannel = supabaseClient.channel("user-presence", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    const markOnlineStatus = async (online: boolean) => {
      try {
        await axios.post("/api/mark-online-offline", {
          userId,
          online,
        });
      } catch (err) {
        console.error("Failed to update online status:", err);
      }
    };

    presenceChannel
      .on("presence", { event: "join" }, () => markOnlineStatus(true))
      .on("presence", { event: "leave" }, () => markOnlineStatus(false))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Presence] Subscribed!");
          await presenceChannel.track({ userId });
          await markOnlineStatus(true);
          console.log("presenece channel onlnie user ids ",presenceChannel.presenceState());
        }
      });

   
      const cleanUpPresence = () => {
    presenceChannel.untrack();
    markOnlineStatus(false);
    supabaseClient.removeChannel(presenceChannel);
  };

  const beforeUnloadHandler = () => {
    cleanUpPresence();
  };

  const visibilityHandler = () => {
    if (document.visibilityState === "hidden") {
      cleanUpPresence();
    }
  };

  window.addEventListener("beforeunload", beforeUnloadHandler);
  document.addEventListener("visibilitychange", visibilityHandler);

  return () => {
    cleanUpPresence();
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    document.removeEventListener("visibilitychange", visibilityHandler);
  };
  }, [userId]);
}

