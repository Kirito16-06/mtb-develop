"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpotlightStatus } from "@prisma/client";
import { format } from "date-fns";
import { getAxiosErrorMessage } from "@/utils/ax";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PageSkeleton from "@/components/PageSkeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "@/components/ui/table";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { getInitials } from "@/utils/getInitials";
import Image from "next/image";
import ConfirmAction from "@/components/ConfirmAction";
import { type SpotlightApplication } from "@/types/client/spotligh";


const fetchSpotlightApplications = async (
  currentPage: number,
  limit: number
) => {
  const { data } = await axios.get("/api/admin/spotlight/application", {
    params: {
      page: currentPage,
      limit,
    },
  });
  return data;
};

const updateSpotlightStatus = async ({
  id,
  status,
}: {
  id: string;
  status: SpotlightStatus;
}) => {
  const response = await axios.put(`/api/admin/spotlight/${id}`, { status });
  return response.data;
};

const getStatusBadgeVariant = (
  status: SpotlightStatus
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "APPROVED":
      return "secondary";
    case "DISAPPROVED":
      return "destructive";
    case "IN_REVIEW":
      return "outline";
    case "ACTIVE":
      return "default";
    case "EXPIRED":
      return "default";
    default:
      return "outline";
  }
};

export default function SpotlightApplication() {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const limit = 6;

  const { data: applications, isLoading } = useQuery({
    queryKey: ["spotlightApplications"],
    queryFn: () => fetchSpotlightApplications(currentPage, limit),
  });
  const totalPages = Math.ceil((applications?.totalApplications || 0) / limit);

  const mutation = useMutation({
    mutationFn: updateSpotlightStatus,
    onSuccess: () => {
      toast.success("Status updated successfully");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["spotlightApplications"] });
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update status"));
      console.error(error);
    },
  });

  const handleViewProfile = async (
    userId: string,
    spotlightId: string,
    status: SpotlightStatus
  ) => {
    if (status === SpotlightStatus.APPLIED) {
      await mutation.mutateAsync({ id: spotlightId, status: "IN_REVIEW" });
      queryClient.invalidateQueries({ queryKey: ["spotlightApplications"] });
    }
    window.open(`/profile/${userId}`, "_blank");
  };

  if (isLoading) {
    return <PageSkeleton type="spotlight" />;

  }

  const currentSpotlight = applications?.spotlightApplications?.find(
    (app: SpotlightApplication) => app.status === "ACTIVE"
  );
  console.log(currentSpotlight);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">
        Spotlight Management
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Current Spotlight</h3>
        {currentSpotlight ? (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="mr-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center text-lg font-bold">
                  {currentSpotlight.user.image ? (
                    <Image
                      src={currentSpotlight.user.image}
                      alt={currentSpotlight.user.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(currentSpotlight.user.name)
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold">
                  {currentSpotlight.user.name}
                </h4>
                <p className="text-gray-600">
                  User Email: {currentSpotlight.user.email}
                </p>
                <p className="mt-2 text-gray-700">
                  Application Date:
                  {format(new Date(currentSpotlight.appliedAt), "MMM d, yyyy")}
                </p>
                <div className="mt-4">
                  <Button variant="destructive">Remove Spotlight</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active spotlight user found.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Spotlight Applications</h3>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                View Profile
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {applications?.spotlightApplications?.map(
              (app: SpotlightApplication) => (
                <TableRow key={app.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-medium">
                        {app.user.image ? (
                          <Image
                            src={app.user.image}
                            alt={app.user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(app.user.name)
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {app.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(app.appliedAt), "MMM d, yyyy hh:mm a")}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleViewProfile(app.user.id, app.id, app.status)
                      }
                      disabled={mutation.isPending}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <ConfirmAction
                        action={() =>
                          mutation.mutate({ id: app.id, status: "APPROVED" })
                        }
                        isDisabled={mutation.isPending}
                        description="Are you sure you want to approve this application?"
                      >
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={
                            mutation.isPending ||
                            !(
                              app.status === "APPLIED" ||
                              app.status === "IN_REVIEW"
                            )
                          }
                          size="sm"
                        >
                          Approve
                        </Button>
                      </ConfirmAction>
                      <ConfirmAction
                        action={() =>
                          mutation.mutate({ id: app.id, status: "DISAPPROVED" })
                        }
                        isDisabled={mutation.isPending}
                        description="Are you sure you want to disapprove this application?"
                      >
                        <Button
                          variant="destructive"
                          disabled={
                            mutation.isPending ||
                            !(
                              app.status === "APPLIED" ||
                              app.status === "IN_REVIEW"
                            )
                          }
                          size="sm"
                        >
                          Disapprove
                        </Button>
                      </ConfirmAction>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
