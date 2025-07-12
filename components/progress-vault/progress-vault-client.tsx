"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Eye, Loader2, Info } from "lucide-react";
import {
  progressvaultSchema,
  type progressVaultFormType,
} from "@/schema/zodSchema";
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
import { startOfDay, endOfDay } from "date-fns";
import CustomAccordion from '@/components/dashboard/user/ CustomAccordion';
import PageSkeleton from "../PageSkeleton";
import { ProgressVault, ProgressVaultClientProps } from "@/types/client/progress-vault";


export default function ProgressVaultClient({ initialLogs, initialStreak }: ProgressVaultClientProps) {
  const [editingLog, setEditingLog] = useState<ProgressVault | null>(null);
  const [viewLog, setViewLog] = useState<ProgressVault | null>(null);
  const [deleteLog, setDeleteLog] = useState<ProgressVault | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [todayEntriesCount, setTodayEntriesCount] = useState(0);

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<progressVaultFormType>({
    resolver: zodResolver(progressvaultSchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: logs = initialLogs, isLoading } = useQuery({
    queryKey: ["progressvault"],
    queryFn: async () => {
      const res = await axios.get("/api/user/progress-vault");
      return res.data;
    },
    initialData: initialLogs,
  });

  const { data: streak = initialStreak } = useQuery({
    queryKey: ["streak", "PROGRESS_VAULT"],
    queryFn: async () => {
      const res = await axios.get("/api/streak?type=PROGRESS_VAULT");
      return res.data;
    },
    initialData: initialStreak,
  });

  // Count today's entries
  useEffect(() => {
    if (logs.length > 0) {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const todayLogs = logs.filter((log: ProgressVault) => {
        const logDate = new Date(log.createdAt);
        return logDate >= startOfToday && logDate <= endOfToday;
      });

      setTodayEntriesCount(todayLogs.length);
    }
  }, [logs]);

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await axios.post("/api/user/progress-vault", { content });
      await axios.post("/api/streak", { type: "PROGRESS_VAULT" });
      queryClient.invalidateQueries({ queryKey: ["progressvault"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      queryClient.invalidateQueries({ queryKey: ["streak", "PROGRESS_VAULT"] });
      reset();
      toast.success("Log created successfully");
      return res.data;
    },
    onError: (error) => {
      const errorMessage = getAxiosErrorMessage(error, "An error occurred");
      if (errorMessage.includes("Daily limit of 3 entries reached")) {
        toast.error("You've reached the daily limit of 3 entries. Please try again tomorrow.");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await axios.put(`/api/user/progress-vault/${id}`, {
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressvault"] });
      setEditingLog(null);
      setUpdateDialogOpen(false);
      toast.success("Log updated successfully");
    },
    onError: () => {
      toast.error("Failed to update log");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/user/progress-vault/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressvault"] });
      toast.success("Log deleted successfully");
      setDeleteLog(null);
    },
    onError: () => {
      toast.error("Failed to delete log");
      setDeleteLog(null);
    },
  });

  const onSubmit = (data: progressVaultFormType) => {
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
                <CardTitle>Progress Vault</CardTitle>
                <CardDescription>
                  Record your daily progress
                </CardDescription>
              </div>
              <div className="flex flex-col items-end mt-2 text-sm">
                <div className="flex items-center gap-1 font-semibold text-orange-500 animate-pulse">
                  🔥 {streak.count} day streak
                </div>
                <div className="text-muted-foreground mt-1">
                  Keep it up! Consistency builds progress ✨
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todayEntriesCount >= 3 ? (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  You have reached the daily limit of 3 entries. You can add more entries tomorrow.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  You can add up to 3 entries per day ({todayEntriesCount}/3 used today)
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="relative">
                <Input
                  {...register("content")}
                  placeholder="Share your progress vault today (max 120 characters)"
                  disabled={isSubmitting || createMutation.isPending || todayEntriesCount >= 3}
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
                  disabled={isSubmitting || createMutation.isPending || todayEntriesCount >= 3}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <PageSkeleton type="Progress-vault" />
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No progress vault yet. Start by adding your first entry above!
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress Vault</CardTitle>
              <CardDescription>View, edit, or delete your progress Vault</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ProgressVault</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: ProgressVault) => {
                    const date = new Date(log.createdAt);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.content.length > 100
                            ? `${log.content.slice(0, 100)}...`
                            : log.content}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {date.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </span>
                            <span className="text-xs text-gray-500">
                              {date.toLocaleDateString()} |{" "}
                              {date.toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingLog(log);
                                setValue("content", log.content);
                                setUpdateDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteLog(log)}
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

        {/* View Modal */}
        <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Progress Vault</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {viewLog && (
                <>
                  <div className="mb-4 text-sm text-gray-500">
                    {new Date(viewLog.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
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

        {/* Delete Modal */}
        <Dialog open={!!deleteLog} onOpenChange={() => setDeleteLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Are you sure you want to delete this?
              <div className="italic text-sm text-muted-foreground mt-2">
                {deleteLog?.content}
              </div>
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

        {/* Update Modal */}
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
              <DialogTitle>Update Your Progress Vault</DialogTitle>
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





