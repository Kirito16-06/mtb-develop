"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Loader2,
  EyeIcon,
  Calendar as CalendarIcon,
  FileText,
  Repeat,
  BookOpen,
  Pencil,
  PlusCircle,
  ListChecks,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";

import { dailyBloomSchema, DailyBloomFormType } from "@/schema/zodSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";

import CustomAccordion from "@/components/dashboard/user/ CustomAccordion";
import PageSkeleton from "../PageSkeleton";
import { getAxiosErrorMessage } from "@/utils/ax";
import { toast } from "sonner";
import Overdue from "./Overdue";

// Define a proper type for a single bloom item, including the ID from the database
interface DailyBloom extends DailyBloomFormType {
  id: string;
}

const defaultFormValues: DailyBloomFormType = {
  title: "",
  description: "",
  frequency: "Daily",
  dueDate: undefined,
  isCompleted: false,
  taskAddJP: false,
  taskCompleteJP: false,
};

export default function DailyBloomClient() {
  const queryClient = useQueryClient();
  const [editData, setEditData] = useState<DailyBloom | null>(null);
  const [viewData, setViewData] = useState<DailyBloom | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addData, setAddData] = useState<boolean>(false);
  const [frequencyFilter, setFrequencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [addInputType, setAddInputType] = useState<'frequency' | 'date'>('frequency');

  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DailyBloomFormType>({
    resolver: zodResolver(dailyBloomSchema),
    defaultValues: defaultFormValues,
  });
  
  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title || "",
        description: editData.description || "",
        frequency: editData.frequency || undefined,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
      });
    }
  }, [editData, reset]);

  useEffect(() => {
    if (addData) {
        setAddInputType('frequency');
        reset(defaultFormValues);
    }
  }, [addData, reset]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [frequencyFilter, statusFilter]);

  const { data, isLoading } = useQuery<{ data: DailyBloom[]; totalCount: number }>({
    queryKey: ["dailyBloom", frequencyFilter, statusFilter, currentPage],
    queryFn: async () => {
      const res = await axios.get(
        `/api/user/daily-bloom?frequency=${frequencyFilter}&status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}`
      );
      return res.data; 
    },
  });

  const dailyBloom = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const createMutation = useMutation({
    mutationFn: async (newData: DailyBloomFormType) => {
      const res = await axios.post("/api/user/daily-bloom", newData);
      console.log("final commit")
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyBloom"] });
      // Also invalidate overdue in case a new overdue task was created
      queryClient.invalidateQueries({ queryKey: ["overdueDailyBlooms"] });
      toast.success("Daily Bloom created successfully!");
      setAddData(false);
    },
    onError: (error: AxiosError) => {
      const errorMessage = getAxiosErrorMessage(
        error,
        "An error occurred while creating Daily Bloom."
      );
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      updatedData: DailyBloomFormType;
    }) => {
      const res = await axios.put(
        `/api/user/daily-bloom/${payload.id}`,
        payload.updatedData
      );
      return res.data;
    },
    // ✅ THIS IS THE KEY FIX
    onSuccess: () => {
      // Invalidate both queries to ensure both lists refresh automatically
      queryClient.invalidateQueries({ queryKey: ["dailyBloom"] });
      queryClient.invalidateQueries({ queryKey: ["overdueDailyBlooms"] });
    },
    onError: (error: AxiosError) => {
      const errorMessage = getAxiosErrorMessage(error, "Failed to update task.");
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/user/daily-bloom/${id}`);
      return res.data;
    },
    // ✅ THIS IS THE KEY FIX
    onSuccess: () => {
      toast.success("Deleted successfully");
      // Invalidate both queries to ensure both lists refresh automatically
      queryClient.invalidateQueries({ queryKey: ["dailyBloom"] });
      queryClient.invalidateQueries({ queryKey: ["overdueDailyBlooms"] });
    },
    onError: (error: AxiosError) => {
        const errorMessage = getAxiosErrorMessage(error, "Failed to delete task.");
        toast.error(errorMessage);
    },
  });

  const onSubmit = (formData: DailyBloomFormType) => {
    createMutation.mutate(formData);
  };

  const onUpdate = (formData: DailyBloomFormType) => {
    if (editData) {
      updateMutation.mutate(
        { id: editData.id, updatedData: formData },
        {
          onSuccess: () => {
            toast.success("Updated successfully");
            setEditData(null);
          },
        }
      );
    }
  };

  const handleCloseEditModal = () => {
    setEditData(null);
    reset(defaultFormValues);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleUpdateCompletion = (bloom: DailyBloom, isCompleted: boolean) => {
    updateMutation.mutate(
      {
        id: bloom.id,
        updatedData: { ...bloom, isCompleted },
      },
      {
        onSuccess: () => {
          toast.success(`Task marked as ${isCompleted ? "complete" : "pending"}.`);
        },
      }
    );
  };

  return (
    <>
      <CustomAccordion />
      <div className="container mx-auto p-3 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-3">
              <CardTitle>Daily Blooms</CardTitle>
              <CardDescription>
                Let your goals bloom by planting the seeds of daily action.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setAddData(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Daily Bloom
            </Button>
          </CardContent>
        </Card>
        
        {/* Pass all handler functions as props to the Overdue component */}
        <Overdue
          onView={setViewData}
          onEdit={setEditData}
          onDelete={setDeleteId}
          onUpdateCompletion={handleUpdateCompletion}
        />

        {isLoading ? (
          <PageSkeleton type="leaderboard" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Daily Blooms</CardTitle>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-2">
                <CardDescription className="w-full">
                  Overview of your tracked blooms
                </CardDescription>
                <div className="flex w-full md:w-auto items-center space-x-2 justify-end">
                  <div className="relative group w-1/2 md:w-36">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>{statusFilter}</span>
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <div className="absolute z-10 w-full top-full mt-1 bg-background border rounded-md shadow-lg p-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant={statusFilter === 'Pending' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setStatusFilter('Pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        type="button"
                        variant={statusFilter === 'Completed' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setStatusFilter('Completed')}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>
                  <div className="relative group w-1/2 md:w-36">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>{frequencyFilter}</span>
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <div className="absolute z-10 w-full top-full mt-1 bg-background border rounded-md shadow-lg p-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant={frequencyFilter === 'All' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFrequencyFilter('All')}
                      >
                        All
                      </Button>
                      <Button
                        type="button"
                        variant={frequencyFilter === 'Daily' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFrequencyFilter('Daily')}
                      >
                        Daily
                      </Button>
                      <Button
                        type="button"
                        variant={frequencyFilter === 'Weekly' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFrequencyFilter('Weekly')}
                      >
                        Weekly
                      </Button>
                      <Button
                        type="button"
                        variant={frequencyFilter === 'Monthly' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFrequencyFilter('Monthly')}
                      >
                        Monthly
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dailyBloom.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">
                      No blooms match your filters.
                    </p>
                  </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-center">Achieve</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyBloom.map((bloom: DailyBloom) => (
                          <TableRow key={bloom.id}>
                            <TableCell className="text-center">
                              <Input
                                type="checkbox"
                                checked={bloom.isCompleted}
                                onChange={(e) => handleUpdateCompletion(bloom, e.target.checked)}
                                className="w-4 h-4 rounded-md cursor-pointer"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{bloom.title.length > 10
                            ? `${bloom.title.slice(0, 10)}...`
                            : bloom.title}</TableCell>
                            <TableCell>
                              {bloom.description
                                ? bloom.description.length > 10
                                  ? `${bloom.description.slice(0, 10)}...`
                                  : bloom.description
                                : ""}
                            </TableCell>
                            <TableCell>{bloom.dueDate ? new Date(bloom.dueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                            <TableCell>{bloom.frequency || "-"}</TableCell>
                            <TableCell className="text-center space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewData(bloom)}>
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setEditData(bloom)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(bloom.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden space-y-4">
                    {dailyBloom.map((bloom: DailyBloom) => (
                      <Card key={bloom.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <CardTitle>{bloom.title}</CardTitle>
                            <div className="flex flex-col items-center flex-shrink-0">
                                <Input
                                  type="checkbox"
                                  checked={bloom.isCompleted}
                                  onChange={(e) => handleUpdateCompletion(bloom, e.target.checked)}
                                  className="w-5 h-5 rounded-md cursor-pointer"
                                />
                                <Label className="text-xs text-muted-foreground mt-1">Achieve</Label>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {bloom.description && (
                                <p className="text-muted-foreground">{bloom.description}</p>
                            )}
                            <div className="flex items-center">
                                <Repeat className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>Frequency: {bloom.frequency || "-"}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>Due: {bloom.dueDate ? new Date(bloom.dueDate).toLocaleDateString("en-IN") : "-"}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                           <Button variant="outline" size="sm" onClick={() => setViewData(bloom)}>View</Button>
                           <Button variant="outline" size="sm" onClick={() => setEditData(bloom)}>Edit</Button>
                           <Button variant="destructive" size="sm" onClick={() => setDeleteId(bloom.id)}>Delete</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
            <div className="flex items-center justify-center space-x-2 py-4">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
              >
                  Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
              >
                  Next
              </Button>
            </div>
          </Card>
        )}
        
        {/* All Dialogs remain here in the parent component */}
        <Dialog open={!!viewData} onOpenChange={() => setViewData(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Bloom Details</DialogTitle>
            </DialogHeader>
            {viewData && (
              <div className="grid gap-6 py-4">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-muted-foreground mt-1" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-muted-foreground">Title</p>
                    <p className="text-base font-semibold">{viewData.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground mt-1" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-base text-gray-700">
                      {viewData.description || (<span className="text-gray-400">Not provided</span>)}
                    </p>
                  </div>
                </div>
                {viewData.dueDate && (
                  <div className="flex items-start gap-4">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground mt-1" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className="text-base">
                        {new Date(viewData.dueDate).toLocaleDateString("en-IN", {
                            year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {viewData.frequency && (
                  <div className="flex items-start gap-4">
                    <Repeat className="h-6 w-6 text-muted-foreground mt-1" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                      <p className="text-base">{viewData.frequency}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewData(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editData} onOpenChange={(isOpen) => !isOpen && handleCloseEditModal()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Daily Bloom</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onUpdate)}>
              <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="title-edit">Title</Label>
                  <Input id="title-edit" {...register("title")} />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="desc-edit">Description</Label>
                  <Textarea id="desc-edit" {...register("description")} />
                </div>
                
                {editData?.dueDate ? (
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                        <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="date-edit">Due Date</Label>
                        <Input
                          id="date-edit"
                          type="date"
                          value={field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                          {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>}
                        </div>
                    )}
                  />
                ) : (
                  <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <div className="grid w-full items-center gap-1.5">
                          <Label>Frequency</Label>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Frequency..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frequency && <p className="text-sm text-red-500 mt-1">{errors.frequency.message}</p>}
                      </div>
                    )}
                  />
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseEditModal}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={addData} onOpenChange={setAddData}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Your Bloom</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="title-add">Title</Label>
                  <Input id="title-add" {...register("title")} />
                  {errors.title && (<p className="text-red-500 text-sm">{errors.title.message}</p>)}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="desc-add">Description</Label>
                  <Textarea id="desc-add" {...register("description")} />
                </div>
                
                <div className="grid gap-2">
                    <Label className="text-sm text-muted-foreground">Select one: Due Date or Frequency</Label>
                    <div className="flex bg-muted p-1 rounded-md">
                        <Button type="button" onClick={() => { setAddInputType('date'); setValue('frequency', undefined); setValue('dueDate', new Date()) }} variant={addInputType === 'date' ? 'default' : 'ghost'} className="flex-1">Due Date</Button>
                        <Button type="button" onClick={() => { setAddInputType('frequency'); setValue('dueDate', undefined); setValue('frequency', 'Daily') }} variant={addInputType === 'frequency' ? 'default' : 'ghost'} className="flex-1">Frequency</Button>
                    </div>
                </div>

                {addInputType === 'date' ? (
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <div className="grid w-full items-center gap-1.5">
                        <Input
                          type="date"
                          value={field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
                      </div>
                    )}
                  />
                ) : (
                  <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <div className="grid w-full items-center gap-1.5">
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Frequency..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frequency && <p className="text-sm text-red-500 mt-1">{errors.frequency.message}</p>}
                      </div>
                    )}
                  />
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddData(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                  Add Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
