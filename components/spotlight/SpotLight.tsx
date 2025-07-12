"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { getAxiosErrorMessage } from "@/utils/ax";
import { Prisma } from "@prisma/client";
import axios from "axios";
import ConfirmAction from "@/components/ConfirmAction";
import { toast } from "sonner";
import CustomAccordion from "@/components/dashboard/user/ CustomAccordion";

export default function SpotlightPage() {
  const [isChecked, setIsChecked] = useState(false);

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: spotlights } = useQuery<
    Prisma.SpotlightGetPayload<{ include: { user: true } }>[] // Spotlight is now an array
  >({
    queryKey: ["spotlight", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/user/spotlight`);
      return response.data;
    },
    retry: false,
    enabled: !!session?.user?.id,
  });

  console.log(spotlights);

  const createSpotlight = async () => {
    const response = await axios.post("/api/user/spotlight", {
      userId: session?.user?.id,
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: createSpotlight,
    onSuccess: (data) => {
      console.log(data);
      toast.success(
        "Spotlight application submitted successfully, check your email for more information."
      );
      queryClient.invalidateQueries({ queryKey: ["spotlight"] }); // Refetch spotlight data
      queryClient.invalidateQueries({ queryKey: ["userInfo"] }); // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error));
    },
  });

  const getStatusMessage = () => {
    if (!spotlights) return null;
    const currentSpotlight = spotlights.find((spotlight) =>
      ["APPLIED", "IN_REVIEW", "APPROVED", "ACTIVE"].includes(spotlight.status)
    );

    if (currentSpotlight) {
      switch (currentSpotlight.status) {
        case "APPLIED":
          return "You have already applied for a spotlight. Please wait for review.";
        case "IN_REVIEW":
          return "Your spotlight application is currently under review.";
        case "APPROVED":
          return "Your spotlight application has been approved and will be active soon.";
        case "ACTIVE":
          return "You have an active spotlight running.";
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <>
      <CustomAccordion />
      <div className="container mx-auto px-0 py-8">
        {/* <h1 className="text-3xl font-bold mb-8">Spotlight Feature</h1> */}

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What is Spotlight?</h2>

          <p className="text-gray-600 mb-6">
            A rotating daily Spotlight that showcases one solopreneur to the
            ecosystem with their one-line pitch, profile, and link.
          </p>

          <h3 className="text-xl font-semibold mb-4">Benefits:</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-8">
            <li className="mb-2">
              Increased visibility and exposure, leading to new business
              opportunities.
            </li>
            <li className="mb-2">
              Boosts social proof by being featured in our Social Media.
            </li>
            <li className="mb-2">
              Increases internal belief and momentum in your business.
            </li>
          </ul>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">
              Terms and Conditions:
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-600 mb-3">
                1. Spotlight duration can be increased/decreased to provide
                sufficient business visibility.
              </p>
              <p className="text-gray-600 mb-3">
                2. Content must comply with our community guidelines and terms
                of service.
              </p>
              <p className="text-gray-600 mb-3">
                3. We reserve the right to remove your spotlight if it violates
                our policies.
              </p>
              <p className="text-gray-600 mb-3">
                4. Spotlight placement is subject to availability and approval.
              </p>
              <p className="text-gray-600">
                5. No JoyPearls will be credited back once the applied for
                Spotlight
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-4"> Requirements:</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-8">
              <li className="mb-2">
                You must have 5,000 JP tokens to apply (lower amounts for
                premium plan members).
              </li>
              <li className="mb-2">
                {" "}
                You must have a complete business profile
              </li>
            </ul>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="terms"
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>

            {getStatusMessage() && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                {getStatusMessage()}
              </div>
            )}

            <ConfirmAction
              action={() => mutation.mutate()}
              title="Ready to Step Into the Spotlight?"
              description="If approved, your Spotlight will shine on the platform within 3–5 days."
              confirmText="Yes, I am ready!"
              cancelText="Cancel"
              isDisabled={
                !isChecked ||
                mutation.isPending ||
                (spotlights &&
                  spotlights.some((spotlight) =>
                    ["APPLIED", "IN_REVIEW", "APPROVED", "ACTIVE"].includes(
                      spotlight.status
                    )
                  ))
              }
            >
              <Button
                disabled={
                  !isChecked ||
                  mutation.isPending ||
                  (spotlights &&
                    spotlights.some((spotlight) =>
                      ["APPLIED", "IN_REVIEW", "APPROVED", "ACTIVE"].includes(
                        spotlight.status
                      )
                    ))
                }
                className={`mt-4 px-4 py-2 rounded text-white transition-colors duration-200`}
              >
                Apply for Spotlight
              </Button>
            </ConfirmAction>
          </div>
        </Card>
      </div>
    </>
  );
}
