"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";
import { BuddyLensRequest, BuddyLensReview } from "@/types/client/budg-lens";

interface Props {
  userId: string;
}

export default function ReviewedRequests({ userId }: Props) {
  const {
    data: reviewedRequests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["buddyLensReviewedRequests", userId],
    queryFn: async () => {
      const response = await axios.get("/api/buddy-lens/reviewer");
      return response.data;
    },
    enabled: !!userId,
  });

  const { data: reviewRequests = [] } = useQuery({
    queryKey: ["buddyLensRequestsToReview", userId],
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

  const { data: myRequests = [] } = useQuery({
    queryKey: ["buddyLensRequest", userId],
    queryFn: async () => {
      const response = await axios.get(`/api/buddy-lens/requester/${userId}`);
      return response.data.filter(
        (req: BuddyLensRequest) => req.requesterId === userId && !req.isDeleted
      );
    },
    enabled: !!userId,
  });

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">Error: {error.message}</div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium text-gray-700">
        List of all profile audit requests in the system
      </p>{" "}
      {isLoading ? (
        <p>Loading...</p>
      ) : reviewedRequests.length === 0 ? (
        <p>No reviewed requests.</p>
      ) : (
        reviewedRequests.map((review: BuddyLensReview) => {
          const request =
            reviewRequests.find(
              (r: BuddyLensRequest) => r.id === review.requestId
            ) ||
            myRequests.find((r: BuddyLensRequest) => r.id === review.requestId);
          return (
            <Card key={review.id} className="p-4 space-y-2">
              <div className="space-y-1">
                <p className="font-medium">
                  {review.request?.domain || "Unknown Request"}
                </p>
                <a
                  href={request?.socialMediaUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center gap-1 text-sm"
                >
                  <LinkIcon className="w-3 h-3" />
                  View Content
                </a>
                <div className="mt-3 p-3 bg-gray-100 rounded">
                  <p className="text-sm">
                    <strong>Reviewer Name: </strong> {review.reviewer.name}
                  </p>
                  <p className="text-sm">
                    <strong>Domain: </strong>
                    {review?.request?.domain}
                  </p>
                  <p className="text-sm">
                    <strong>Rating: </strong> ⭐ {review.rating}/5
                  </p>
                  <p className="text-sm">
                    <strong>Feedback: </strong> {review.feedback}
                  </p>
                  <p className="text-sm">
                    <strong>Review Text: </strong> {review.reviewText}
                  </p>
                  <p className="text-sm">
                    <strong>Status: </strong> {review.status}
                  </p>
                  {review.answers.length > 0 ? (
                    <ul className="list-disc">
                      <strong>Answers: </strong>
                      {review.answers.map((answer, index) => (
                        <li key={index} className="ml-7">
                          {answer}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No answers provided"
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Reviewed on: </strong>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
