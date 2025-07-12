"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { User, Tag, Award, ExternalLink, CheckCircle } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BuddyLensRequest } from "@/types/client/budg-lens";
import { useSession } from "next-auth/react";
import PageSkeleton from "../PageSkeleton";

interface Props {
  userId: string;
}

function RequestStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Pending Approval
        </Badge>
      );
    case "CLAIMED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Approved
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Submitted
        </Badge>
      );
    case "DISAPPROVED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Disapproved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function ClaimCard({ req }: { req: BuddyLensRequest }) {
  const { data: session } = useSession();
  const review = req.review?.find((r) => r.reviewerId === session?.user?.id);

  console.log("ClaimCard -- -", req);
  console.log("ClaimCard", req.jpCost, review);

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                Domain: {req.domain}
              </h3>
              <RequestStatusBadge status={review?.status || "PENDING"} />
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
        {review?.status === "APPROVED" && (
          <Link href={`/dashboard/buddy-lens/reviewer?requestId=${req.id}`}>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Review
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default function MyClaims({ userId }: Props) {
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["myBuddyLensClaims", userId],
    queryFn: async () => {
      const response = await axios.get("/api/buddy-lens/reviewer/claims");
      return response.data;
    },
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
        <p className="text-base font-normal text-gray-800">
          List of all profile audit request you have claimed
        </p>
      </div>

      {isLoading ? (
        <PageSkeleton type="claims" />) : claims.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              You haven&apos;t claimed any requests yet.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((req: BuddyLensRequest) => (
            <ClaimCard key={req.id} req={req} />
          ))}
        </div>
      )}
    </div>
  );
}
