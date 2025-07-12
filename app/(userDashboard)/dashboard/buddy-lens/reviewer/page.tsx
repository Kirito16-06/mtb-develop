"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Send, Star, LinkIcon, FileQuestion, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { BuddyLensRequest, BuddyLensReview } from "@/types/client/budg-lens";


const ReviewerForm = () => {
  const { data: session } = useSession();
  const reviewerId = session?.user?.id;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const router = useRouter();

  // Local UI state
  const [answers, setAnswers] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [ratingError, setRatingError] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Fetch notifications
  const {
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: ["buddyLensNotifications", reviewerId],
    queryFn: async () => {
      const response = await axios.get(`/api/buddy-lens/notifications`, {
        params: { userId: reviewerId },
      });
      return response.data;
    },
    enabled: !!reviewerId,
    refetchInterval: 10000,
  });

  // Fetch selected request based on requestId from URL
  const {
    data: selectedRequest,
    isLoading: isSelectedRequestLoading,
    error: selectedRequestError,
  } = useQuery<BuddyLensReview>({
    queryKey: ["buddyLensSelectedRequest", requestId, reviewerId],
    queryFn: async () => {
      if (!requestId) return null;
      const response = await axios.get(`/api/buddy-lens/review/${requestId}`);
      if (
        response.data &&
        response.data.status === "APPROVED" &&
        response.data.reviewerId === reviewerId
      ) {
        return response.data;
      }
      return null;
    },
    enabled: !!requestId && !!reviewerId,
  });

  useEffect(() => {
    console.log("selectedRequest", selectedRequest);
  });

  // Initialize timer when reviewer opens the form without backend changes
  useEffect(() => {
    if (selectedRequest) {
      // Set initial timer based on tier (in seconds)
      let initialTime;
      switch (selectedRequest.request.tier) {
        case "10min":
          initialTime = 10 * 60; // 10 minutes
          break;
        case "15min":
          initialTime = 15 * 60; // 15 minutes
          break;
        default:
          initialTime = 5 * 60; // 5 minutes (BASIC tier)
      }

      // Store start time in sessionStorage to persist across page refreshes
      const startTimeKey = `review_start_time_${selectedRequest.id}`;
      let startTime = sessionStorage.getItem(startTimeKey);

      if (!startTime) {
        // First time opening the form
        startTime = Date.now().toString();
        sessionStorage.setItem(startTimeKey, startTime);
      }

      // Calculate time elapsed and remaining
      // eslint-disable-next-line prefer-const
      let timerInterval: string | number | NodeJS.Timeout | undefined;
      const calculateRemaining = () => {
        const elapsed = Math.floor(
          (Date.now() - parseInt(startTime as string)) / 1000
        );
        const remaining = Math.max(0, initialTime - elapsed);

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsExpired(true);
          clearInterval(timerInterval);
        } else {
          setIsExpired(false);
        }
      };

      // Calculate immediately and start interval
      calculateRemaining();
      timerInterval = setInterval(calculateRemaining, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [selectedRequest]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    if (timeRemaining === null) return "--:--";
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Mutation for submitting a review
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (isExpired) {
        throw new Error("Time expired! You can no longer submit this review.");
      }

      if (
        !selectedRequest ||
        !reviewText ||
        !rating ||
        answers.some((a) => !a.trim())
      ) {
        throw new Error("Please fill in all fields");
      }

      // No schema changes needed - just using the existing API
      await axios.post("/api/buddy-lens/reviewer", {
        action: "submit-review",
        requestId: selectedRequest.request.id,
        reviewerId,
        answers,
        reviewText,
        rating,
        feedback,
        status: "SUBMITTED",
      });

      // Clear the timer from sessionStorage after successful submission
      sessionStorage.removeItem(`review_start_time_${selectedRequest.id}`);
    },
    onSuccess: () => {
      toast.success(
        `Review submitted successfully! You earned ${selectedRequest?.request.jpCost} JoyPearls.`
      );
      setAnswers([]);
      setReviewText("");
      setRating(null);
      setFeedback("");
      queryClient.setQueryData(
        ["buddyLensRequests", reviewerId],
        (old: BuddyLensRequest[] | undefined) =>
          old?.filter((req) => req.id !== selectedRequest?.id)
      );
      queryClient.invalidateQueries({
        queryKey: ["buddyLensSelectedRequest", requestId, reviewerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["buddyLensReviewedRequests", reviewerId],
      });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] }); // Refetch user data
      router.push("/dashboard/buddy-lens");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  // Initialize answers when selectedRequest changes
  useEffect(() => {
    if (selectedRequest) {
      setAnswers(selectedRequest?.request.questions?.map(() => ""));
    }
  }, [selectedRequest]);

  if (!reviewerId) {
    toast.error("User not logged in");
    return <div>Please log in to view requests.</div>;
  }

  if (notificationsError || selectedRequestError) {
    return (
      <div className="text-center p-8 text-red-600">
        Error: {notificationsError?.message || selectedRequestError?.message}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-3xl font-semibold text-center">👀 Review Page</h2>

        {isNotificationsLoading || isSelectedRequestLoading ? (
          <p>Loading...</p>
        ) : !selectedRequest ? (
          <></>
        ) : (
          <div className="space-y-6">
            {/* Timer Section */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Time Remaining:</span>
              </div>
              <div
                className={`font-mono font-bold text-lg ${
                  isExpired
                    ? "text-red-600"
                    : timeRemaining && timeRemaining < 60
                    ? "text-orange-600"
                    : "text-blue-600"
                }`}
              >
                {formatTimeRemaining()}
              </div>
            </div>

            {isExpired && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Time Expired!</p>
                <p>
                  You can no longer submit this review. Please claim a new
                  request.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="w-4 h-4" />
                Social Media URL
              </label>
              <a
                href={selectedRequest.request.socialMediaUrl}
                target="_blank"
                className="text-blue-600"
              >
                {selectedRequest.request.socialMediaUrl}
              </a>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileQuestion className="w-4 h-4" />
                Answer Questions
              </label>
              {selectedRequest?.request?.questions?.map(
                (q: string, index: number) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm">{q}</p>
                    <Textarea
                      placeholder={`Answer ${index + 1}`}
                      value={answers[index] || ""}
                      onChange={(e) => {
                        const updated = [...answers];
                        updated[index] = e.target.value;
                        setAnswers(updated);
                      }}
                      disabled={isExpired}
                    />
                  </div>
                )
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Eye className="w-4 h-4" />
                Review Text
              </label>
              <Textarea
                placeholder="Write your review here"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={isExpired}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Star className="w-4 h-4" />
                Rating (1-5)
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={rating || ""}
                onChange={(e) => {
                  const newRating = Number(e.target.value);
                  if (newRating > 5) {
                    setRatingError("Rating cannot be greater than 5!");
                  } else if (newRating >= 1 && newRating <= 5) {
                    setRating(newRating);
                    setRatingError("");
                  } else {
                    setRatingError("Rating must be between 1 and 5.");
                  }
                }}
                disabled={isExpired}
              />
              {ratingError && (
                <p className="text-red-500 text-sm">{ratingError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Send className="w-4 h-4" />
                Additional Feedback
              </label>
              <Textarea
                placeholder="Optional feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isExpired}
              />
            </div>

            <Button
              onClick={() => submitReviewMutation.mutate()}
              disabled={submitReviewMutation.isPending || isExpired}
              className={`w-full text-white ${
                isExpired
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitReviewMutation.isPending
                ? "Submitting..."
                : isExpired
                ? "Time Expired"
                : "Submit Review"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const BuddyLensReviewPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <ReviewerForm />
      </Suspense>
    </div>
  );
};

export default BuddyLensReviewPage;
