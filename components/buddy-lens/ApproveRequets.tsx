"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LinkIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAxiosErrorMessage } from "@/utils/ax";
import PageSkeleton from "@/components/PageSkeleton";
import { BuddyLensReview } from "@/types/client/budg-lens";

export default function BuddyLensApprovePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get request ID and reviewer ID from search params
  const requestId = searchParams?.get("requestId");
  const reviewerId = searchParams?.get("reviewerId");

  // Log URL and navigation source for debugging
  useEffect(() => {
    console.log("Approval page loaded with URL:", window.location.href);
    console.log("Search params:", { requestId, reviewerId });
    console.log("Raw search params:", searchParams?.toString());
    console.log("Referrer:", document.referrer);
  }, [searchParams, requestId, reviewerId]);

  // Validate session
  // useEffect(() => {
  //   if (sessionStatus === "loading") return;

  //   if (!session || !session.user?.id) {
  //     console.error("No session or user ID found");
  //     toast.error("Please login to continue");
  //     router.push("/login");
  //   }
  // }, [session, sessionStatus, router]);

  // Fetch request(s) data with React Query
  const {
    data: requests,
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useQuery<BuddyLensReview[] | BuddyLensReview | null>({
    queryKey: ["buddyLensRequests", requestId],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const url = requestId
        ? `/api/buddy-lens/approve?requestId=${requestId}`
        : `/api/buddy-lens/approve`;

      console.log(`Fetching: GET ${url}`);
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      const requestData = response.data;
      console.log("Request data:", requestData);

      return requestData as BuddyLensReview[];
    },
    enabled: !!session?.user?.id && sessionStatus === "authenticated",
    retry: false,
    retryDelay: 1000,
  });

  console.log("requests TO APPROVE---------------------------", requests);

  // Mutation for approve/reject actions
  const { mutateAsync: handleApproveReject, isPending: isApproveLoading } =
    useMutation({
      mutationFn: async ({
        requestId,
        reviewerId,
        approve,
      }: {
        requestId: string;
        reviewerId: string;
        approve: boolean;
      }) => {
        console.log("ids", requestId, "s", reviewerId, "s", approve);

        if (!session?.user?.id || !requestId || !reviewerId) {
          throw new Error("Missing required information");
        }

        console.log("Sending: PATCH /api/buddy-lens/approve", {
          requestId,
          reviewerId,
          approve,
        });
        const response = await axios.patch(
          `/api/buddy-lens/approve`,
          {
            requestId,
            reviewerId,
            approve,
            requesterId: session.user.id,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("data:", response.data);

        return response.data;
      },
      onSuccess: (data, variables) => {
        toast.success(
          data.message ||
          (variables.approve
            ? "Claim approved successfully"
            : "Claim rejected successfully")
        );
        router.push("/dashboard/buddy-lens");
      },
      onError: (error) => {
        const errorMessage = getAxiosErrorMessage(
          error,
          "Error processing request"
        );
        toast.error(errorMessage);
      },
    });

  console.log("requests ---------------------  ", requests);

  // Show loading state
  if (sessionStatus === "loading" || isRequestsLoading) {
    return (
      <PageSkeleton type="approve" />
    );
  }

  // Show error state
  if (requestsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-center">
            Error Loading Requests
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {getAxiosErrorMessage(requestsError, "Failed to load request data")}
          </p>
          <Button
            onClick={() => router.push("/dashboard/buddy-lens/requester")}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Buddy Lens
          </Button>
        </Card>
      </div>
    );
  }

  // Show UI for requests
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center mb-6">
        Pending Reviewer Claims
      </h2>
      {Array.isArray(requests) && requests.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No pending claims to approve.</p>
          <Button
            onClick={() => router.push("/dashboard/buddy-lens")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Buddy lens
          </Button>
        </Card>
      )}

      {Array.isArray(requests) && requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="rounded-2xl shadow-lg p-6 space-y-4"
            >
              <p>
                <strong>Reviewer Name:</strong> {request?.reviewer?.name}
              </p>

              <p>
                <strong>Domain:</strong> {request.request.domain}
              </p>
              <p>
                <strong>Tier:</strong> {request.request.tier}
              </p>
              <p>
                <strong>Reward:</strong> {request.request.jpCost} JoyPearls
              </p>

              <p className="flex items-center gap-1">
                <strong>Reviewer Profile:</strong>{" "}
                <a
                  href={`/profile/${request.reviewerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center gap-1"
                >
                  {" "}
                  <span>
                    {" "}
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  view profile
                </a>
              </p>
              <p>
                <strong>Social Media URL:</strong>{" "}
                <a
                  href={request.request.socialMediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {request.request.socialMediaUrl}
                </a>
              </p>
              <div className="flex gap-11">
                <Button
                  onClick={() =>
                    handleApproveReject({
                      requestId: request.request.id,
                      reviewerId: request.reviewerId || "",
                      approve: true,
                    })
                  }
                  disabled={isApproveLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
                <Button
                  onClick={() =>
                    handleApproveReject({
                      requestId: request.request.id,
                      reviewerId: request.reviewerId || "",
                      approve: false,
                    })
                  }
                  disabled={isApproveLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
                {/* <Button
                  onClick={() =>
                    handleCancel({
                      requestId: request.id,
                      reviewerId: request.pendingReviewerId || '',
                    })
                  }
                  disabled={isApproveLoading || isCancelLoading}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </Button> */}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No pending claims to approve.</p>
          <Button
            onClick={() => router.push("/dashboard/buddy-lens")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Buddy lens
          </Button>
        </Card>
      )}
    </div>
  );
}

// {
//   !Array.isArray(requests) && requests && (
//     <Card className="rounded-2xl shadow-lg p-6 space-y-6">
//       {/* <h2 className="text-3xl font-semibold text-center">
//       Approve Reviewer Claim
//     </h2> */}
//       <div className="space-y-4">
//         <p>
//           <strong>Reviewer Name:</strong> {requests?.reviewer?.name}
//         </p>
//         <p>
//           <strong>Domain:</strong> {requests.request.domain}
//         </p>
//         <p>
//           <strong>Tier:</strong> {requests.request.tier}
//         </p>
//         <p>
//           <strong>Reward:</strong> {requests.request.jpCost} JoyPearls
//         </p>
//         {/* <p>
//         <strong>Reviewer:</strong> {reviewer.name }
//       </p> */}
//         <p className="flex items-center gap-1">
//           <strong>Reviewer Profile:</strong>{" "}
//           <a
//             href={`/profile/${requests.reviewerId}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 flex items-center gap-1"
//           >
//             <span>
//               {" "}
//               <LinkIcon className="w-4 h-4" />
//             </span>
//             view profile
//           </a>
//         </p>
//         <p>
//           <strong>Social Media URL:</strong>{" "}
//           <a
//             href={requests.request.socialMediaUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600"
//           >
//             {requests.request.socialMediaUrl}
//           </a>
//         </p>
//         <div className="flex gap-7">
//           <Button
//             onClick={() =>
//               handleApproveReject({
//                 requestId: requests.request.id,
//                 reviewerId: requests.reviewerId || reviewerId || "",
//                 approve: true,
//               })
//             }
//             disabled={isApproveLoading}
//             className="bg-green-600 hover:bg-green-700 text-white"
//           >
//             Approve
//           </Button>
//           <Button
//             onClick={() =>
//               handleApproveReject({
//                 requestId: requests.request.id,
//                 reviewerId: requests.reviewerId || reviewerId || "",
//                 approve: false,
//               })
//             }
//             disabled={isApproveLoading}
//             className="bg-red-600 hover:bg-red-700 text-white"
//           >
//             Reject
//           </Button>
//           {/* <Button
//           onClick={() =>
//             handleCancel({
//               requestId: requests.id,
//               reviewerId: requests.pendingReviewerId || reviewerId || '',
//             })
//           }
//           disabled={isApproveLoading || isCancelLoading}
//           className="bg-gray-600 hover:bg-gray-700 text-white"
//         >
//           Cancel
//         </Button> */}
//         </div>
//       </div>
//     </Card>
//   );
// }
