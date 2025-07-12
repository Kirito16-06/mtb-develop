"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Trash2,
  EyeIcon,
  Pencil,
  AlertTriangle,
  Repeat,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageSkeleton from "../PageSkeleton"; // Assuming this path is correct
import { DailyBloomFormType } from "@/schema/zodSchema"; // Assuming this path is correct

// Re-using the DailyBloom interface from the parent component
interface DailyBloom extends DailyBloomFormType {
  id: string;
}

// Define the props the Overdue component will accept from its parent
interface OverdueProps {
  onView: (bloom: DailyBloom) => void;
  onEdit: (bloom: DailyBloom) => void;
  onDelete: (id: string) => void;
  onUpdateCompletion: (bloom: DailyBloom, isCompleted: boolean) => void;
}

/**
 * Overdue Component
 * Fetches and displays tasks that are past their due date and are not yet completed.
 * It receives handler functions as props from the parent component to manage state and actions.
 */
export default function Overdue({ onView, onEdit, onDelete, onUpdateCompletion }: OverdueProps) {
  
  // Fetch overdue tasks using react-query.
  const { data: overdueBlooms, isLoading } = useQuery<DailyBloom[]>({
    queryKey: ["overdueDailyBlooms"],
    queryFn: async () => {
      const res = await axios.get("/api/user/daily-bloom/overdue");
      return res.data.data; 
    },
    refetchOnWindowFocus: false, 
  });

  if (isLoading) {
    // Show a skeleton loader while fetching data.
    return <PageSkeleton type="leaderboard" />;
  }

  // If there are no overdue blooms, we don't render the component.
  if (!overdueBlooms || overdueBlooms.length === 0) {
    return null;
  }

  return (
    // Updated card style to use a "destructive" theme for overdue items
    <Card className="mb-8 border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div>
            <CardTitle className="text-destructive">Overdue Blooms</CardTitle>
            {/* ✅ FIXED: Replaced ' with &apos; to fix the build error */}
            <CardDescription className="text-destructive/80">
              These tasks have passed their due date. Let&apos;s get them done!
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">Achieve</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueBlooms.map((bloom) => (
                <TableRow key={bloom.id}>
                  <TableCell className="text-center">
                    <Input
                      type="checkbox"
                      checked={bloom.isCompleted}
                      // Directly call the parent's handler function
                      onChange={(e) => onUpdateCompletion(bloom, e.target.checked)}
                      className="w-4 h-4 rounded-md cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{bloom.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {bloom.description
                      ? bloom.description.length > 25
                        ? `${bloom.description.slice(0, 25)}...`
                        : bloom.description
                      : "—"}
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">
                    {bloom.dueDate ? new Date(bloom.dueDate).toLocaleDateString("en-IN") : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{bloom.frequency || "—"}</TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(bloom)}>
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(bloom)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(bloom.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {overdueBlooms.map((bloom: DailyBloom) => (
            <Card key={bloom.id} className="bg-background/50">
               <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle>{bloom.title}</CardTitle>
                    <div className="flex flex-col items-center flex-shrink-0">
                        <Input
                          type="checkbox"
                          checked={bloom.isCompleted}
                          onChange={(e) => onUpdateCompletion(bloom, e.target.checked)}
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
                    <div className="flex items-center text-destructive font-medium">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>Due: {bloom.dueDate ? new Date(bloom.dueDate).toLocaleDateString("en-IN") : "-"}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onView(bloom)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(bloom)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(bloom.id)}>Delete</Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
