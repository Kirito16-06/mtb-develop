"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Prisma, ProsperityDropStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";
import PageSkeleton from "@/components/PageSkeleton";

export default function ProsperityPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch all prosperity applications
  const { data: applications, isLoading } = useQuery<
    Prisma.ProsperityDropGetPayload<{ include: { user: true } }>[]
  >({
    queryKey: ["prosperityApplications"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/prosperity");
      return response.data;
    },
  });

  // Mutation for updating application status
  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ProsperityDropStatus;
    }) => {
      const response = await axios.put(`/api/admin/prosperity/${id}`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prosperityApplications"] });
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update status"));
    },
  });

  if (isLoading)
    return <PageSkeleton type="prosperity-drop" />;


  const getStatusBadgeColor = (status: ProsperityDropStatus) => {
    const colors = {
      APPLIED: "bg-yellow-500",
      IN_REVIEW: "bg-blue-500",
      APPROVED: "bg-green-500",
      DISAPPROVED: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="mx-auto py-10 px-0 ">

      <h1 className="text-2xl font-bold mb-6">Prosperity Drop</h1>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications?.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.title}</TableCell>
                <TableCell>{app.description}</TableCell>
                <TableCell>{app.user.name}</TableCell>
                <TableCell>
                  {format(new Date(app.appliedAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(app.status)}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (app.status === "APPLIED") {
                        updateStatus.mutate(
                          {
                            id: app.id,
                            status: "IN_REVIEW",
                          },
                          {
                            onSuccess: () => {
                              router.push(`/admin/prosperity/${app.id}`);
                            },
                          }
                        );
                      } else {
                        router.push(`/admin/prosperity/${app.id}`);
                      }
                    }}
                    disabled={isLoading || updateStatus.isPending}
                    className="flex gap-1 item-center"
                  >
                    {(isLoading || updateStatus.isPending) && (
                      <Loader2 className="mr-2 animate-spin" />
                    )}
                    Review Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
