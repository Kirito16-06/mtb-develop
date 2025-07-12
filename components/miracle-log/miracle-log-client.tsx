"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Eye, Loader2, Info } from "lucide-react"; // Added Info icon
import { miracleLogSchema, type MiracleLogFormType } from "@/schema/zodSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { getAxiosErrorMessage } from "@/utils/ax";
import { startOfDay, endOfDay } from "date-fns"; // Added for daily limit check
import CustomAccordion from "@/components/dashboard/user/ CustomAccordion";
import PageSkeleton from "../PageSkeleton";
import { MiracleLog, MiracleLogClientProps } from "@/types/client/mericle-lo";


export default function MiracleLogClient({ }: MiracleLogClientProps) {
  const [editingLog, setEditingLog] = useState<MiracleLog | null>(null);
  const [viewLog, setViewLog] = useState<MiracleLog | null>(null);
  const [deleteLog, setDeleteLog] = useState<MiracleLog | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [todayEntriesCount, setTodayEntriesCount] = useState(0); // State for daily entries count

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MiracleLogFormType>({
    resolver: zodResolver(miracleLogSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    console.log("error", errors);
  }, [errors]);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["miracleLogs"],
    queryFn: async () => {
      const res = await axios.get("/api/user/miracle-log");
      return res.data;
    },
  });

  const { data: streak = { count: 0 } } = useQuery({
    // Simplified streak type
    queryKey: ["streak", "MIRACLE_LOG"],
    queryFn: async () => {
      const res = await axios.get("/api/streak?type=MIRACLE_LOG");
      return res.data;
    },
  });

  // Count today's entries for Miracle Log
  useEffect(() => {
    if (logs.length > 0) {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const todayLogs = logs.filter((log: MiracleLog) => {
        const logDate = new Date(log.createdAt);
        return logDate >= startOfToday && logDate <= endOfToday;
      });

      setTodayEntriesCount(todayLogs.length);
    }
  }, [logs]);

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await axios.post("/api/user/miracle-log", { content });
      await axios.post("/api/streak", { type: "MIRACLE_LOG" }); // Add streak update
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miracleLogs"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      queryClient.invalidateQueries({ queryKey: ["streak", "MIRACLE_LOG"] }); // Invalidate streak
      reset();
      toast.success("Log created successfully");
    },
    onError: (error) => {
      const errorMessage = getAxiosErrorMessage(error, "An error occurred");
      if (errorMessage.includes("Daily limit of 3 entries reached")) {
        toast.error(
          "You've reached the daily limit of 3 entries. Please try again tomorrow."
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await axios.put(`/api/user/miracle-log/${id}`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miracleLogs"] });
      setEditingLog(null);
      setUpdateDialogOpen(false);
      reset();
      toast.success("Log updated successfully");
    },
    onError: () => {
      toast.error("Failed to update log");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/user/miracle-log/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miracleLogs"] });
      toast.success("Log deleted successfully");
      setDeleteLog(null);
    },
    onError: () => {
      toast.error("Failed to delete log");
      setDeleteLog(null);
    },
  });

  const onSubmit = (data: MiracleLogFormType) => {
    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, content: data.content });
    } else {
      createMutation.mutate(data.content);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteLog) {
      deleteMutation.mutate(deleteLog.id);
    }
  };

  return (
    <>
      <CustomAccordion />
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-3">
                <CardTitle>Miracle Log</CardTitle>
                <CardDescription>
                  Record your daily miracles and positive moments
                </CardDescription>
              </div>
              <div className="flex flex-col items-end mt-2 text-sm ">
                <div className="flex items-center gap-1 font-semibold text-orange-500 animate-pulse">
                  🔥 {streak.count === 0 ? 'Day 0' : `${streak.count} day streak`}
                </div>
                <div className=" text-muted-foreground mt-1 ">
                  {streak.count === 0 ? (
                    <span>Your streak is broken. Start again to build your streak!</span>
                  ) : streak.count >= 90 ? (
                    <span>You have completed the 90-day streak! No more rewards, but keep logging for your growth ✨</span>
                  ) : (
                    <span>Keep it up Consistency builds miracles ✨</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {todayEntriesCount >= 3 ? (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  You have reached the daily limit of 3 entries. Please try again
                  tomorrow.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  You can add up to 3 entries per day ({todayEntriesCount}/3
                  used today)
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
              <div className="relative">
                <Input
                  {...register("content")}
                  placeholder="Share a small miracle today (max 120 characters)"
                  disabled={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    todayEntriesCount >= 3
                  }
                  className="mb-2"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1 absolute -bottom-6 left-0">
                    {errors.content.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-8">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    todayEntriesCount >= 3
                  }
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingLog ? "Update" : "Save"}
                </Button>
                {editingLog && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingLog(null);
                      setUpdateDialogOpen(false);
                      reset();
                    }}
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        {isLoading ? (
          <PageSkeleton type="miracle-log" />
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">
                No miracle logs yet. Start by adding your first entry above!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Miracle Logs</CardTitle>
              <CardDescription>
                View, edit, or delete your miracle logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: MiracleLog) => {
                    const date = new Date(log.createdAt);
                    const formattedDate = date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    const formattedTime = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const formattedDay = date.toLocaleDateString("en-US", {
                      weekday: "long",
                    });

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.content.length > 100
                            ? `${log.content.slice(0, 100)}...`
                            : log.content}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formattedDay}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formattedDate}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formattedTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewLog(log)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingLog(log);
                                setUpdateDialogOpen(true);
                                setValue("content", log.content);
                              }}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteLog(log)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {/* View Dialog */}
        <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Miracle Log</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {viewLog && (
                <>
                  <div className="mb-4 text-sm text-gray-500">
                    {new Date(viewLog.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" at "}
                    {new Date(viewLog.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <p className="whitespace-pre-wrap">{viewLog.content}</p>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewLog(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteLog} onOpenChange={() => setDeleteLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this miracle log?</p>
              {deleteLog && (
                <p className="mt-2 text-sm text-gray-500 italic">
                  {deleteLog.content.length > 100
                    ? `${deleteLog.content.slice(0, 100)}...`
                    : deleteLog.content}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteLog(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Update Dialog */}
        <Dialog
          open={updateDialogOpen}
          onOpenChange={() => {
            setUpdateDialogOpen(false);
            setEditingLog(null);
            reset();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Your Miracle Log</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                {...register("content")}
                defaultValue={editingLog?.content}
                className="mt-4"
                maxLength={120}
                disabled={updateMutation.isPending}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.content.message}
                </p>
              )}
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUpdateDialogOpen(false);
                    setEditingLog(null);
                    reset();
                  }}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}