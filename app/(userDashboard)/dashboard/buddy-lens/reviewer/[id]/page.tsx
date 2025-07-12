"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Clock,
  ExternalLink,
  Star,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { BuddyLensReview } from "@/types/client/budg-lens";
import PageSkeleton from "@/components/PageSkeleton";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<BuddyLensReview>({
    queryKey: ["review", id],
    queryFn: async () => {
      const res = await axios.get(`/api/buddy-lens/reviewer/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading)     return <PageSkeleton type="reviewer" />;
  if (error || !data) return <p>Review not found.</p>;

  return (
    <div className="max-w-2xl mx-auto my-10">
      {/* <div className="max-w-3xl mx-auto my-8 px-4"> */}
      <div className="mb-4">
        <Link href="/dashboard/buddy-lens">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to BuddyLens
          </Button>
        </Link>
      </div>
      <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <h1 className="font-medium text-gray-900 text-xl">
                  BuddyLens Review Details
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Domain:</span>{" "}
                  {data.request.domain || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Status:</span> {data.status}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Rating:</span> {data.rating} / 5
                </div>

                {data.request.socialMediaUrl && (
                  <a
                    href={data.request.socialMediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Review Content
                  </a>
                )}
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Submitted At:
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {data.submittedAt
                    ? new Date(data.submittedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Feedback</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {data.feedback || "No feedback provided"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Review Text</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {data.reviewText || "No review text provided"}
                </p>
              </div>

              {data.answers?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Answers</h3>
                  <ul className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {data.answers.map((answer: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span>{answer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent> 
      </Card>
    </div>
  );
}
