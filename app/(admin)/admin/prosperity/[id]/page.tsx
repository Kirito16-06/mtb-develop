"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Prisma, ProsperityDropStatus } from "@prisma/client";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConfirmAction from "@/components/ConfirmAction";
import { getAxiosErrorMessage } from "@/utils/ax";

export default function ProsperityReviewPage() {
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();

  const { data: application, isLoading } = useQuery<
    Prisma.ProsperityDropGetPayload<{ include: { user: true } }>
  >({
    queryKey: ["prosperityApplication", params.id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/prosperity/${params.id}`);
      return response.data;
    },
  });

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
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["prosperityApplication"] });
      queryClient.invalidateQueries({ queryKey: ["prosperityApplications"] }); // Add this to refresh the listing page
      //   router.push("/admin/prosperity");
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update status"));
    },
  });

  if (isLoading || !application) return <PageLoader />;

  return (
    <div className="container mx-auto pb-10 px-0 space-y-6">
      {/* <Button
        variant="outline"
        onClick={() => router.push("/admin/prosperity")}
        className="mb-6"
      >
        Back to Applications
      </Button> */}

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Submitted on {format(new Date(application.appliedAt), "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Title</h3>
            <p>{application.title}</p>
          </div>
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="whitespace-pre-wrap">{application.description}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <Badge>{application.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Details */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.user.image || ""} />
              <AvatarFallback>{application.user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{application.user.name}</h3>
              <p className="text-sm text-gray-500">{application.user.email}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Account Created</h3>
            <p>{format(new Date(application.user.createdAt), "PPP")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Current JP Balance</h3>
            <p>{application.user.jpBalance} JP</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(application.status === "IN_REVIEW" ||
        application.status === "APPLIED") && (
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <ConfirmAction
              action={() =>
                updateStatus.mutate({
                  id: application.id,
                  status: "APPROVED",
                })
              }
              title="Approve Application"
              description="Are you sure you want to approve this prosperity drop application?"
              confirmText="Approve"
              isDisabled={updateStatus.isPending}
            >
              <Button className="flex-1" disabled={updateStatus.isPending}>
                Approve Application
              </Button>
            </ConfirmAction>

            <ConfirmAction
              action={() =>
                updateStatus.mutate({
                  id: application.id,
                  status: "DISAPPROVED",
                })
              }
              title="Reject Application"
              description="Are you sure you want to reject this prosperity drop application? This action cannot be undone."
              confirmText="Reject"
              isDisabled={updateStatus.isPending}
            >
              <Button
                variant="destructive"
                className="flex-1"
                disabled={updateStatus.isPending || isLoading}
              >
                Reject Application
              </Button>
            </ConfirmAction>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
