"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, isWithinInterval } from "date-fns";
import { AlignedAction, ReminderListenerProps } from "@/types/client/align-action";


export default function ReminderListener({ onRefetch }: ReminderListenerProps) {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const [showReminder, setShowReminder] = useState(false);
  const [currentAction, setCurrentAction] = useState<AlignedAction | null>(null);
  const [postponed, setPostponed] = useState(false);
  
  // References for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const postponeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedActionIdRef = useRef<string | null>(null);
  const lastCheckRef = useRef<number>(0);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mutation to mark action as completed
  const completeAction = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await fetch("/api/user/aligned-actions/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionId,
          completed: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete action");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Congratulations! +50 JP for completing your 1% Start action!");
      setShowReminder(false);
      setCurrentAction(null);
      setPostponed(false);
      
      // Update the session with the new JP balance
      if (session?.user) {
        updateSession({ user: { ...session.user, jpBalance: data.newBalance } });
      }
      
      // Invalidate the user data and aligned actions query caches to force a refresh
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['aligned-actions'] });
      
      // Refetch the aligned actions
      onRefetch();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Clear all timers function
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (postponeTimerRef.current) {
      clearTimeout(postponeTimerRef.current);
      postponeTimerRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // Fetch the active or upcoming aligned action
  const fetchAlignedAction = useCallback(async (): Promise<AlignedAction | null> => {
    try {
      const response = await fetch("/api/user/aligned-actions/reminders");
      if (!response.ok) return null;

      const data = await response.json();
      
      // If there's no action or it's completed, return null
      if (!data || !data.id || data.completed || !data.timeFrom || data.status === "none") {
        return null;
      }
      
      return data as AlignedAction;
    } catch (error) {
      console.error("Error fetching reminders:", error);
      return null;
    }
  }, []);

  // Check if it's time to show a reminder with more precision
  const checkAndScheduleReminder = useCallback(async (force = false) => {
    if (!session?.user) return;
    
    // Add rate limiting to prevent excessive API calls
    const now = Date.now();
    if (now - lastCheckRef.current < 10000 && !force) { // Don't check more than once every 10 seconds unless forced
      return;
    }
    lastCheckRef.current = now;
    
    const action = await fetchAlignedAction();
    
    // If no action or the action is already completed, don't schedule anything
    if (!action) {
      setCurrentAction(null);
      clearAllTimers();
      return;
    }
    
    // Store the fetched action
    setCurrentAction(action);
    
    // Track the last fetched action ID to detect changes
    const newActionFetched = lastFetchedActionIdRef.current !== action.id;
    lastFetchedActionIdRef.current = action.id;
    
    // Calculate time until the exact start time
    const currentTime = new Date();
    const startTime = new Date(action.timeFrom);
    const endTime = new Date(action.timeTo);
    const timeUntilStart = startTime.getTime() - currentTime.getTime();
    
    console.log(
      `Action found: ${action.selectedTask}\n` +
      `Start time: ${format(startTime, "yyyy-MM-dd h:mm:ss a")}\n` +
      `Current time: ${format(currentTime, "yyyy-MM-dd h:mm:ss a")}\n` +
      `Time until start: ${Math.round(timeUntilStart/1000)} seconds\n` +
      `Postponed: ${postponed}`
    );
    
    // Check if we're currently within the time window
    const isCurrentlyWithinWindow = isWithinInterval(currentTime, {
      start: startTime,
      end: endTime
    });
    
    // Clear existing timer before setting a new one
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Case 1: Start time is in the future - schedule a precise timer
    if (timeUntilStart > 0) {
      console.log(`Scheduling reminder for ${format(startTime, "h:mm:ss a")} (in ${Math.round(timeUntilStart/1000)} seconds)`);
      
      // Set the timer to show the reminder exactly at the start time
      timerRef.current = setTimeout(() => {
        if (!postponed) {
          console.log(`🔔 Time to show reminder at ${format(new Date(), "h:mm:ss a")}`);
          // Double-check before showing to make sure we don't have stale data
          fetchAlignedAction().then(latestAction => {
            if (latestAction && !latestAction.completed) {
              setShowReminder(true);
              
              // Start a more frequent check once we're in the time window
              if (!checkIntervalRef.current) {
                checkIntervalRef.current = setInterval(() => {
                  // This checks for updates while in the time window
                  fetchAlignedAction().then(updatedAction => {
                    if (!updatedAction || updatedAction.completed) {
                      // Action was completed or removed
                      setShowReminder(false);
                      setCurrentAction(null);
                      clearInterval(checkIntervalRef.current!);
                      checkIntervalRef.current = null;
                    }
                  });
                }, 15000); // Check every 15 seconds during the time window
              }
            }
          });
        }
      }, timeUntilStart);
      
      // Add a slightly more frequent polling during the 5 minutes before the task starts
      if (timeUntilStart < 5 * 60 * 1000 && timeUntilStart > 0) {
        // Clear any existing polling timeout
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        // Set up a more frequent poll as we get closer to the time
        pollingTimeoutRef.current = setTimeout(() => {
          checkAndScheduleReminder(true);
        }, Math.min(30000, timeUntilStart / 2)); // Poll more frequently as we get closer
      }
    } 
    // Case 2: Current time is within the scheduled time window - show immediately if not postponed
    else if (isCurrentlyWithinWindow) {
      // If this is a newly fetched action or we're forcing a check, and not postponed, show the reminder
      if ((newActionFetched || force) && !postponed) {
        console.log(`🔔 Showing reminder immediately as we're in the time window: ${format(currentTime, "h:mm:ss a")}`);
        setShowReminder(true);
        
        // Start a more frequent check since we're in the time window
        if (!checkIntervalRef.current) {
          checkIntervalRef.current = setInterval(() => {
            // This checks for updates while in the time window
            fetchAlignedAction().then(updatedAction => {
              if (!updatedAction || updatedAction.completed) {
                // Action was completed or removed
                setShowReminder(false);
                setCurrentAction(null);
                clearInterval(checkIntervalRef.current!);
                checkIntervalRef.current = null;
              }
            });
          }, 15000); // Check every 15 seconds during the time window
        }
      }
    }
    // Case 3: We've passed the time window - clear everything
    else if (currentTime > endTime) {
      setCurrentAction(null);
      setShowReminder(false);
      clearAllTimers();
    }
    
  }, [session, postponed, fetchAlignedAction, clearAllTimers]);

  // Set up the initial check and regular polling interval
  useEffect(() => {
    if (!session?.user) return;
    
    // Initial check on component mount
    checkAndScheduleReminder(true);
    
    // Set up polling every 30 seconds to check for upcoming actions
    // This helps catch any new actions or changes to existing ones
    const pollingInterval = setInterval(() => {
      checkAndScheduleReminder();
    }, 30 * 1000); // Check every 30 seconds
    
    // Clean up all timers on unmount
    return () => {
      clearAllTimers();
      clearInterval(pollingInterval);
    };
  }, [session, checkAndScheduleReminder, clearAllTimers]);

  // Reset everything when postponed status changes
  useEffect(() => {
    checkAndScheduleReminder(true);
  }, [postponed, checkAndScheduleReminder]);

  // If there's a browser visibility change, check reminders
  // This helps catch up after tab has been inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndScheduleReminder(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAndScheduleReminder]);

  const handlePostpone = () => {
    setShowReminder(false);
    setPostponed(true);
    
    // Clear any existing postpone timer
    if (postponeTimerRef.current) {
      clearTimeout(postponeTimerRef.current);
    }

    // Reset postponed after 5 minutes
    postponeTimerRef.current = setTimeout(() => {
      setPostponed(false);
    }, 5 * 60 * 1000);
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "sleep":
        return "😴";
      case "goodToGo":
        return "😐";
      case "motivated":
        return "😊";
      case "highlyMotivated":
        return "😃";
      default:
        return "";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "creative":
        return "Creative";
      case "nurturing":
        return "Nurturing";
      case "revenueGenerating":
        return "Revenue Generating";
      case "admin":
        return "Administrative";
      default:
        return category;
    }
  };

  if (!currentAction) return null;

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="text-2xl">{getMoodEmoji(currentAction.mood)}</span>
            Your 1% Start Action Awaits!
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Its time to tackle your scheduled task. Lets make it happen!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="bg-green-500/10 p-3 rounded-md">
            <p className="font-bold text-green-500 text-sm">{currentAction.selectedTask}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(currentAction.timeFrom), "h:mm a")} - {format(new Date(currentAction.timeTo), "h:mm a")}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</h4>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-green-500"></span>
              {getCategoryLabel(currentAction.category)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePostpone}
            className="px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm rounded-md"
          >
            Remind in 5 Min
          </Button>

          <Button
            type="button"
            onClick={() => completeAction.mutate(currentAction.id)}
            disabled={completeAction.isPending}
            className="px-4 py-1 text-sm bg-green-500 text-white hover:bg-green-600 shadow-md rounded-md"
          >
            {completeAction.isPending ? "Completing..." : "I have Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}