"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AlignedActionWizard from "@/components/aligned-actions/AlignedActionWizard";
import ReminderListener from "@/components/aligned-actions/ReminderListener";
import CustomAccordion from '@/components/dashboard/user/ CustomAccordion';
import PageSkeleton from "../PageSkeleton";
import { AlignedAction } from "@/types/client/align-action";


export default function AlignedActionsPage() {
  const { data: session } = useSession();
  const [showWizard, setShowWizard] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const {
    data: actions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["aligned-actions", today],
    queryFn: async () => {
      const res = await fetch(`/api//user/aligned-actions?date=${today}`);
      if (!res.ok) {
        throw new Error("Failed to fetch 1% Start actions");
      }
      return res.json();
    },
    enabled: !!session?.user,
  });

  const hasCreatedToday = actions && actions.length > 0;

  function getMoodEmoji(mood: string) {
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
  }

  function getCategoryLabel(category: string) {
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
  }

  return (
    <>
    <CustomAccordion/>
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          {/* <h1 className="text-3xl font-bold">1% Start</h1> */}
          <p className="text-gray-500">
            Schedule and track your 1% Start actions
          </p>
        </div>
        {/* <Button
          onClick={() => setShowWizard(true)}
          disabled={hasCreatedToday}
          className="bg-jp-orange hover:bg-jp-orange/90"
        >
          {hasCreatedToday ? "Already Created Today" : "Create New Action"}
        </Button> */}
      </div>

      {hasCreatedToday && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm flex items-center">
            <span className="mr-2">ℹ️</span>
            You can create only one 1% Start action per day to help you stay
            focused on what matters most.
          </p>
        </div>
      )}

      {showWizard && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create 1% Start actions</CardTitle>
              <CardDescription>
                Complete all steps to create your 1% Start actions for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlignedActionWizard
                onComplete={() => {
                  setShowWizard(false);
                  refetch();
                }}
                onCancel={() => setShowWizard(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8"><PageSkeleton type="align-action" /></div>
      ) : hasCreatedToday ? (
        <div className="grid gap-6">
          {actions.map((action: AlignedAction) => (
            <Card key={action.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getMoodEmoji(action.mood)}
                    </span>
                    <span>
                      {format(new Date(action.timeFrom), "h:mm a")} -{" "}
                      {format(new Date(action.timeTo), "h:mm a")}
                    </span>
                  </CardTitle>
                  <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                    {getCategoryLabel(action.category)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Selected Task:</h3>
                  <p className="p-3 bg-gray-50 rounded-md">
                    {action.selectedTask}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Other Tasks:</h3>
                  <ul className="space-y-2">
                    {action.tasks.map(
                      (task: string, i: number) =>
                        task !== action.selectedTask && (
                          <li key={i} className="p-3 bg-gray-50 rounded-md">
                            {task}
                          </li>
                        )
                    )}
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  {action.completed ? (
                    <Button disabled className="bg-green-500">
                      Completed ✓
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        You will receive a reminder 5 minutes before your
                        scheduled time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !showWizard && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">
              No 1% Start Action Created Today
            </h3>
            <p className="text-gray-500 mb-4">
              Create an 1% Start actions to focus on what matters most to you
              today.
            </p>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-jp-orange hover:bg-jp-orange/90"
            >
              Create Now
            </Button>
          </div>
        )
      )}

      {/* Reminder listener component */}
      <ReminderListener onRefetch={refetch} />
    </div>
            </>
  );
}
