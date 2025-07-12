"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import Link from "next/link";
import {
  Trash2,
  Plus,
  User,
  Tag,
  Award,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmAction from "@/components/ConfirmAction";
import type { BuddyLensRequest, DeleteRequestError, DeleteRequestResponse } from "@/types/client/budg-lens";
import PageSkeleton from "../PageSkeleton";
interface Props {
  userId: string;
}

function RequestStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Open
        </Badge>
      );
    case "CLAIMED":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Claimed
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Completed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function MyRequestsCard({
  req,
  onDelete,
  isDeletePending,
}: {
  req: BuddyLensRequest;
  onDelete: () => void;
  isDeletePending: boolean;
}) {
  const {
    reviewer,
    domain,
    tier,
    jpCost,
    status,
    socialMediaUrl,
    review,
    reviewerId,
    id,
  } = req;

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">Domain: {domain}</h3>
              <RequestStatusBadge status={status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Tier:</span> {tier}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Reward:</span>
                <span className="font-semibold text-jp-orange custom-txt">
                  {jpCost} JoyPearls
                </span>
              </div>

              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Status:</span> {status}
              </div> */}

              <a
                href={socialMediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Content
              </a>
            </div>

            {reviewer && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Claimed By:
                  </span>
                </div>
                <a
                  href={`/profile/${reviewer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 font-medium"
                >
                  {reviewer.name}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 p-4 bg-gray-50 border-t border-gray-200">
        {status === "OPEN" && (
          <ConfirmAction
            action={onDelete}
            title="Delete Request?"
            description="Are you sure you want to delete this request? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            isDisabled={isDeletePending}
          >
            <Button
              disabled={isDeletePending}
              variant="destructive"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </ConfirmAction>
        )}

        {status === "COMPLETED" && (
          <Link
            href={`/dashboard/buddy-lens/reviewer/${review.filter((r) => r.reviewerId === reviewerId)[0].id}`}
          >
            <Button
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              View Review
            </Button>
          </Link>
        )}

        {review.length > 0 &&
          !reviewerId &&
          status !== "COMPLETED" &&
          review.some((r) => r.status === "PENDING") && (
            <Link href={`/dashboard/buddy-lens/approve?requestId=${id}`}>
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
              >
                View Claims
              </Button>
            </Link>
          )}
      </CardFooter>
    </Card>
  );
}

export default function MyRequests({ userId }: Props) {
  const queryClient = useQueryClient();

  const QUERY_KEY = ["myBuddyLensRequests", userId];

  const { data: myRequests = [], isLoading } = useQuery<BuddyLensRequest[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await axios.get(`/api/buddy-lens/requester/${userId}`);
      return res.data.filter(
        (req: BuddyLensRequest) => req.requesterId === userId && !req.isDeleted
      );
    },
    enabled: !!userId,
  });

  console.log("My Requests: ", myRequests);

  const deleteRequestMutation = useMutation<
    DeleteRequestResponse,
    AxiosError<DeleteRequestError>,
    string,
    { previousRequests: BuddyLensRequest[] | undefined }
  >({
    mutationFn: async (requestId) => {
      const res = await axios.delete(`/api/buddy-lens/requester/${requestId}`);
      return res.data;
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousRequests =
        queryClient.getQueryData<BuddyLensRequest[]>(QUERY_KEY);
      queryClient.setQueryData(
        QUERY_KEY,
        previousRequests?.filter((r) => r.id !== requestId)
      );
      return { previousRequests };
    },
    onSuccess: () => {
      toast.success("Request deleted successfully");
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousRequests);
      toast.error(error.response?.data?.error || "Failed to delete request");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return (
    <div className="space-y-6">
      <div className="md:flex items-center gap-8  md:justify-between py-4 border-b border-gray-200 mb-4">
        <p className="text-base font-normal text-gray-800 my-5">
          List of all profile audit requests you have submitted
        </p>
        <Link href="/dashboard/buddy-lens/requester">
          <Button className="bg-jp-orange hover:bg-jp-orange/90 text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <PageSkeleton type="my-requests" />
      ) : myRequests.length === 0 ? (

        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center flex-col">

          <p className="text-gray-600 mb-4">No requests created yet.</p>
          <Link href="/dashboard/buddy-lens/requester">
            <Button className="bg-jp-orange hover:bg-jp-orange/90 text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Create Your First Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {myRequests.map((req) => (
            <MyRequestsCard
              key={req.id}
              req={req}
              onDelete={() => deleteRequestMutation.mutate(req.id)}
              isDeletePending={deleteRequestMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
