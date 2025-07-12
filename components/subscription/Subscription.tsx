
"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Loader2, Info, X } from "lucide-react";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getAxiosErrorMessage } from "@/utils/ax";
import PageSkeleton from "../PageSkeleton";
import { PaymentModalProps, Plan, SubscriptionData } from "@/types/client/subscription";


const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  price,
  paypalPlanId,
  isSubscription,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4 sm:px-6">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Complete Your Subscription
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            You are subscribing to the{" "}
            <span className="font-medium">{plan.name}</span>
          </p>
          <div className="text-base sm:text-lg font-bold mt-2">
            <span>Total: ${price}</span>
            {isSubscription && (
              <span> /{plan.name.includes("Monthly") ? "month" : "year"}</span>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="flex justify-center items-center my-4 py-2 bg-gray-50 rounded-md">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 text-blue-500" />
            <span className="text-gray-700 text-sm sm:text-base">
              Processing payment...
            </span>
          </div>
        )}

        <PayPalScriptProvider
          options={{
            clientId: process.env.NEXT_PUBLIC_PP_CLIENT_ID || "",
            intent: isSubscription ? "subscription" : "capture",
            components: "buttons",
            currency: "USD",
            vault: true,
            debug: process.env.NODE_ENV !== "production",
          }}
        >
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: isSubscription ? "subscribe" : "pay",
            }}
            disabled={isProcessing}
            forceReRender={[price, paypalPlanId, isSubscription]}
            createOrder={
              isSubscription
                ? undefined
                : (_, actions) => {
                  console.log(paypalPlanId);
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          value: price,
                          currency_code: "USD",
                        },
                        description: `Subscription to ${plan.name}`,
                      },
                    ],
                    application_context: {
                      shipping_preference: "NO_SHIPPING",
                    },
                  });
                }
            }
            createSubscription={
              isSubscription
                ? (_, actions) => {
                  console.log(paypalPlanId);
                  return actions.subscription.create({
                    plan_id: paypalPlanId,
                    custom_id: `SUB-${plan.id}-${Date.now()}`,
                  });
                }
                : undefined
            }
            onApprove={async (data, actions) => {
              setIsProcessing(true);
              try {
                let paidAmount: string;
                if (isSubscription) {
                  const details = await actions.subscription?.get();
                  if (!details) {
                    throw new Error("Failed to capture subscription");
                  }
                  paidAmount = price;
                  const subscriptionId = details.id;
                  const res = await axios.post(
                    "/api/user/subscription/create",
                    { subscriptionId }
                  );
                  if (!res) {
                    throw new Error(
                      "Failed to update subscription in database"
                    );
                  }
                  console.log("Subscription created:", details);
                } else {
                  const details = await actions.order?.capture();
                  if (!details || !details.purchase_units?.[0]?.amount?.value) {
                    throw new Error("Failed to capture payment");
                  }
                  paidAmount = details.purchase_units[0].amount.value;
                  console.log("Payment captured:", details);
                }
                await onSuccess(paidAmount);
                toast.success(
                  "Payment successful! Your subscription has been activated."
                );
              } catch (error: unknown) {
                console.error("Payment processing error:", error);
                if (
                  error instanceof Error &&
                  error.message.includes("Window closed")
                ) {
                  toast.error("Payment window was closed. Please try again.");
                } else {
                  toast.error(
                    "Payment processing failed. Please try again or contact support."
                  );
                }
              } finally {
                setIsProcessing(false);
                onClose();
              }
            }}
            onError={(err) => {
              console.error("PayPal SDK error:", err);
              toast.error(
                "An error occurred with PayPal. Please try again or use a different payment method."
              );
            }}
            onCancel={() => {
              toast.info(
                "Payment cancelled. Your subscription was not processed."
              );
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  discount?: string;
  onSubscribe: () => void;
  isLoading: boolean;
  isCurrentPlan?: boolean;
  disabled?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  period,
  discount,
  onSubscribe,
  isLoading,
  isCurrentPlan,
  disabled = false,
}) => (
  <div className="bg-[#F1F3FF] border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
    <div className="p-4 sm:p-6 text-center flex-grow">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h2>
      <p className="text-base sm:text-xl text-gray-600 mt-2">
        ${price} {period}
        {discount && ` (${discount})`}
      </p>
    </div>
    <div className="px-4 sm:px-6 pb-4 sm:pb-6 mt-auto">
      <button
        onClick={onSubscribe}
        disabled={isLoading || disabled || isCurrentPlan}
        className={`w-full md:w-48 py-2 sm:py-3 px-4 rounded-md text-base sm:text-lg font-medium transition-colors mx-auto block ${isCurrentPlan || disabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : name === "Monthly Plan"
              ? "bg-[#151E46] hover:bg-[#1a2a5e] text-white"
              : "bg-[#111c40] hover:bg-[#1a2a5e] text-white"
          }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          "Subscribe"
        )}
      </button>
    </div>
  </div>
);

interface CurrentPlanStatusProps {
  currentPlan: Plan;
  planStart: string | null;
  planEnd: string | null;
}

const CurrentPlanStatus: React.FC<CurrentPlanStatusProps> = ({
  currentPlan,
  planStart,
  planEnd,
}) => {
  const planEndDate = planEnd ? new Date(planEnd) : null;

  return (
    <div className="bg-[#EDF2FF] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start">
      <Info className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
      <div>
        <h3 className="text-sm sm:text-base font-medium">
          Your Current Subscription
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          You are currently subscribed to the{" "}
          <span className="font-medium">{currentPlan.name}</span>
          {planStart && (
            <span> since {format(new Date(planStart), "MMMM d, yyyy")}</span>
          )}
          {planEndDate && (
            <span> until {format(planEndDate, "MMMM d, yyyy")}</span>
          )}
          {!planEndDate && currentPlan.name.startsWith("Lifetime Plan") && (
            <span> with no expiration</span>
          )}
        </p>
      </div>
    </div>
  );
};

const SubscriptionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [selectedPaypalPlanId, setSelectedPaypalPlanId] = useState<string>("");
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await axios.get<SubscriptionData>(
        "/api/user/subscription"
      );
      return response.data;
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({
      planId,
      price,
    }: {
      planId: string;
      price: string;
    }) => {
      const response = await axios.post("/api/user/subscription", {
        planId,
        price,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error));
    },
  });

  const handleSubscribe = (
    planId: string,
    price: string,
    plan: Plan,
    paypalPlanId: string,
    isSub: boolean
  ) => {
    setSelectedPlan(plan);
    setSelectedPrice(price);
    setSelectedPaypalPlanId(paypalPlanId);
    setIsSubscription(isSub);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (paidAmount: string) => {
    if (!selectedPlan) {
      toast.error("No plan selected");
      return;
    }

    setIsSubscribing(true);
    try {
      await subscribeMutation.mutateAsync({
        planId: selectedPlan.id,
        price: paidAmount,
      });
      setIsModalOpen(false);
      setSelectedPlan(null);
      setSelectedPrice("");
      setSelectedPaypalPlanId("");
      setIsSubscription(false);
    } catch (error) {
      console.error("Failed to update subscription:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const monthlyPlan = useMemo(
    () => data?.plans.find((plan) => plan.name === "Monthly Plan"),
    [data?.plans]
  );

  const yearlyPlan = useMemo(
    () => data?.plans.find((plan) => plan.name === "Yearly Plan"),
    [data?.plans]
  );

  const lifetimeStandardPlan = useMemo(
    () => data?.plans.find((plan) => plan.name === "Lifetime Plan Standard"),
    [data?.plans]
  );

  if (isLoading) {
    return <PageSkeleton type="subscription" />;
  }

  const hasLifetimePlan = data?.currentPlan?.name.startsWith("Lifetime Plan");
  const hasActivePlan = data?.hasActiveSubscription && data?.currentPlan;

  const availableTiers = (data?.lifetimeTiers || [])
    .filter((tier) => tier.planName !== "Lifetime Plan Standard")
    .sort((a, b) => Number(a.price) - Number(b.price));

  const getDisabledStatus = (planName: string) => {
    if (!hasActivePlan) return false;

    const currentPlan = data.currentPlan?.name;

    if (currentPlan === "Lifetime Plan Standard") {
      return planName !== "Lifetime Plan Standard";
    }

    if (currentPlan === "Yearly Plan") {
      return planName === "Monthly Plan";
    }

    if (currentPlan === "Monthly Plan") {
      return false;
    }

    return false;
  };

  const taglines = [
    "Early Bird Gets The Best Deal!",
    "Still Early — Save Big!",
    "Almost Half Gone – Act Fast!",
    "Last Few Spots Left!",
    "Final Chance At This Offer!",
  ];

  const currentTierIndex = availableTiers.findIndex(
    (tier) => tier.planId === data?.currentLifetimePlan.planId
  );
  const currentTier = availableTiers[currentTierIndex];
  const upperLimit = currentTier
    ? currentTier.userRange.split("-")[1].trim()
    : "50";
  const spotsClaimed = data?.lifetimePlanUsers || 0;

  return (
    <div className="w-full min-h-screen bg-dashboard max-w-full overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            {hasActivePlan
              ? hasLifetimePlan
                ? "You Have Lifetime Access"
                : "Upgrade Your Plan"
              : "Unlock Unlimited JoyPearls"}
            <span className="ml-2">🚀</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {hasActivePlan
              ? hasLifetimePlan
                ? "You have unlimited access to all premium features with your Lifetime plan."
                : "Choose an upgrade option below to get more value and features."
              : "Choose the membership that suits you best and start enjoying unlimited JoyPearls to unlock all premium features."}
          </p>
        </div>

        {hasActivePlan && data.currentPlan && (
          <CurrentPlanStatus
            currentPlan={data.currentPlan}
            planStart={data.planStart}
            planEnd={data.planEnd}
          />
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {monthlyPlan && (
            <PlanCard
              name="Monthly Plan"
              price={monthlyPlan.price}
              period="per month"
              onSubscribe={() =>
                handleSubscribe(
                  monthlyPlan.id,
                  monthlyPlan.price,
                  monthlyPlan,
                  monthlyPlan.paypalPlanId,
                  true
                )
              }
              isLoading={isSubscribing}
              isCurrentPlan={
                !!(hasActivePlan && data.currentPlan?.name === "Monthly Plan")
              }
              disabled={getDisabledStatus("Monthly Plan")}
            />
          )}
          {yearlyPlan && (
            <PlanCard
              name="Yearly Plan"
              price={yearlyPlan.price}
              period="per year"
              discount={
                yearlyPlan.discountPercent
                  ? `Save ${yearlyPlan.discountPercent}%`
                  : undefined
              }
              onSubscribe={() =>
                handleSubscribe(
                  yearlyPlan.id,
                  yearlyPlan.price,
                  yearlyPlan,
                  yearlyPlan.paypalPlanId,
                  true
                )
              }
              isLoading={isSubscribing}
              isCurrentPlan={
                !!(hasActivePlan && data.currentPlan?.name === "Yearly Plan")
              }
              disabled={getDisabledStatus("Yearly Plan")}
            />
          )}
          {lifetimeStandardPlan && (
            <PlanCard
              name="Lifetime Plan"
              price={lifetimeStandardPlan.price}
              period="One-time payment"
              onSubscribe={() =>
                handleSubscribe(
                  lifetimeStandardPlan.id,
                  lifetimeStandardPlan.price,
                  lifetimeStandardPlan,
                  lifetimeStandardPlan.paypalPlanId,
                  false
                )
              }
              isLoading={isSubscribing}
              isCurrentPlan={
                !!(
                  hasActivePlan &&
                  data.currentPlan?.name === "Lifetime Plan Standard"
                )
              }
              disabled={getDisabledStatus("Lifetime Plan Standard")}
            />
          )}
        </div>

        {/* Banner and Table Section */}
        {data?.limitedOfferAvailable && (
          <div className="bg-[#111c40] text-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 relative">
            <div className="mb-6 sm:mb-8">
              <button className="w-full sm:w-auto mx-auto block bg-slate-200 text-[#111c40] hover:bg-gray-100 py-2 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg font-semibold transition-colors absolute -top-3 left-1/2 transform -translate-x-1/2">
                Invest Once, Thrive Forever — Grab Your Lifetime Plan Now!
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12">
              {/* Pricing Table */}
              <div className="col-span-1 lg:col-span-3">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 sm:py-3 text-left text-sm sm:text-base">
                          Range
                        </th>
                        <th className="py-2 sm:py-3 text-left text-sm sm:text-base">
                          Price
                        </th>
                        <th className="py-2 sm:py-3 text-left text-sm sm:text-base">
                          Tagline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableTiers.map((tier, index) => (
                        <tr
                          key={tier.tier}
                          className={
                            index !== currentTierIndex ? "text-gray-400" : ""
                          }
                        >
                          <td className="py-2 sm:py-3 text-sm sm:text-base">
                            {tier.userRange}
                          </td>
                          <td className="py-2 sm:py-3 text-sm sm:text-base">
                            ${tier.price}
                          </td>
                          <td className="py-2 sm:py-3 text-sm sm:text-base">
                            {taglines[index]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Limited Offer Box */}
              <div className="col-span-1 bg-white text-[#111c40] rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                    Limited Offer
                  </h3>
                  <p className="text-[#ff7f7f] font-medium mb-4 text-sm sm:text-base">
                    {taglines[currentTierIndex]}
                  </p>
                  <div className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6">
                    {spotsClaimed}/{upperLimit}
                  </div>
                  <button
                    onClick={() =>
                      handleSubscribe(
                        data.currentLifetimePlan.planId,
                        data.currentLifetimePlan.price,
                        data.plans.find(
                          (p) => p.id === data.currentLifetimePlan.planId
                        )!,
                        data.currentLifetimePlan.paypalPlanId,
                        false
                      )
                    }
                    disabled={isSubscribing}
                    className="w-full bg-[#ff7f7f] hover:bg-[#ff6666] text-white py-2 sm:py-3 px-4 rounded-md text-base sm:text-lg font-medium transition-colors"
                  >
                    {isSubscribing ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      `Claim Spot for $${data.currentLifetimePlan.price}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPlan && (
          <PaymentModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPlan(null);
              setSelectedPrice("");
              setSelectedPaypalPlanId("");
              setIsSubscription(false);
            }}
            plan={selectedPlan}
            price={selectedPrice}
            paypalPlanId={selectedPaypalPlanId}
            isSubscription={isSubscription}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;

