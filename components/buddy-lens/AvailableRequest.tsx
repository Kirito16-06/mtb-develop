"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { User, Tag, Award, ExternalLink } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuddyLensRequest } from "@/types/client/budg-lens";
import PageSkeleton from "../PageSkeleton";

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
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Pending
        </Badge>
      );
    case "CLAIMED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Claimed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function AvailableRequestCard({
  req,
  onClaim,
  isClaimPending,
  userId,
}: {
  req: BuddyLensRequest;
  onClaim: () => void;
  isClaimPending: boolean;
  userId: string;
}) {
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                Domain: {req.domain}
              </h3>
              <RequestStatusBadge status={req.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Tier:</span> {req.tier}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Reward:</span>
                <span className="font-semibold text-jp-orange">
                  {req.jpCost} JoyPearls
                </span>
              </div>

              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Status:</span> {req.status}
              </div> */}

              <a
                href={req.socialMediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Content
              </a>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Requested By:
                </span>
              </div>
              <a
                href={`/profile/${req.requester?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 font-medium"
              >
                {req.requester?.name}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 p-4 bg-gray-50 border-t border-gray-200">
        {
          !req.review ||
          (!req.review.find((r) => r.reviewer.id === userId) && (
            <Button
              onClick={onClaim}
              disabled={isClaimPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Claim Request
            </Button>
          ))
          //  (
          //   <Button disabled className="bg-gray-400 cursor-not-allowed" size="sm">
          //     Pending Approval
          //   </Button>
          // )
        }
      </CardFooter>
    </Card>
  );
}

export default function AvailableRequest({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const {
    data: reviewRequests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["buddyLensAvailableRequest", userId],
    queryFn: async () => {
      const response = await axios.get("/api/buddy-lens/requester");
      return response.data.filter(
        (req: BuddyLensRequest) =>
          req.requesterId !== userId &&
          ["OPEN", "PENDING", "CLAIMED"].includes(req.status) &&
          !req.isDeleted
      );
    },
    enabled: !!userId,
  });

  console.log("Review Requests: ", reviewRequests);

  const claimRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await axios.patch("/api/buddy-lens/reviewer", {
        requestId,
        reviewerId: userId,
      });
    },
    onSuccess: (_, requestId) => {
      toast.success("Claim request sent for approval");
      queryClient.setQueryData(
        ["buddyLensAvailableRequest", userId],
        (old: BuddyLensRequest[] | undefined) =>
          old?.map((req) =>
            req.id === requestId
              ? { ...req, status: "PENDING", pendingReviewerId: userId }
              : req
          )
      );
      queryClient.invalidateQueries({
        queryKey: ["buddyLensAvailableRequest", userId],
      });
    },
    onError: () => {
      toast.error("Failed to claim request");
    },
  });

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">Error: {error.message}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-5 items-center md:justify-between py-4 border-b border-gray-200 mb-4 custom-responsive">
        <p className="text-base font-normal text-gray-800">
          List of all available profile audit requests in the system
        </p>
      </div>

      {isLoading ? (
        <PageSkeleton type="available-requests" />
      ) : reviewRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No requests available to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviewRequests.map((req: BuddyLensRequest) => (
            <AvailableRequestCard
              key={req.id}
              req={req}
              onClaim={() => claimRequestMutation.mutate(req.id)}
              isClaimPending={claimRequestMutation.isPending}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
