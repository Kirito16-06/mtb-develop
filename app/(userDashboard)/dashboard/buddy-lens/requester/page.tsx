"use client";

import { JSX, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { BuddyLensRequestInputs, buddyLensRequestSchema } from "@/schema/zodSchema";
import {
  LinkIcon,
  FileQuestion,
  Code2,
  Users,
  Brush,
  BarChart3,
  TrendingUp,
  MessageSquareText,
  Smile,
  Clock,
} from "lucide-react";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


interface ApiErrorResponse {
  message?: string;
}

const DOMAIN_QUESTIONS: Record<string, string[]> = {
  "Clarity & Messaging": [
    "Is it clear what I do at a glance?",
    "Does my bio explain who I help and how?",
    "Is my call-to-action obvious and compelling?",
    "Do I sound human or too robotic?",
    "Is anything confusing or vague?",
  ],
  "Target Audience Fit": [
    "Can you tell who my ideal audience is?",
    "Would you know if this page is for you?",
    "Do my posts/bio speak to a specific niche or group?",
    "Am I being too general or too specific?",
  ],
  "Visual Aesthetic": [
    "Do my profile pic and cover/banner image look professional and aligned with my brand?",
    "Is the overall vibe (colors, fonts, layout) cohesive?",
    "Does my feed have a consistent look and feel?",
    "Do I look approachable and trustworthy?",
  ],
  "Content Impact": [
    "Are my captions engaging and clear?",
    "Do I share value, or does it feel like noise?",
    "Are my posts scroll-stopping or easy to overlook?",
    "Is it easy to tell what kind of content I usually post?",
  ],
  "Conversion Readiness": [
    "Can this profile turn followers into clients or leads?",
    "Would this page make someone want to learn more?",
    "Is it easy to book a call, buy, or connect further?",
    "Does it build trust quickly?",
    "What’s missing that could increase conversions?",
  ],
  "First Impressions": [
    "What’s the first word that comes to mind when you see my profile?",
    "What kind of person/business do you think I am?",
    "What emotion does my profile evoke?",
    "Would you follow or click away?",
  ],
};

const DOMAIN_ICONS: Record<string, JSX.Element> = {
  "Clarity & Messaging": (
    <MessageSquareText className="w-4 h-4 text-indigo-500" />
  ),
  "Target Audience Fit": <Users className="w-4 h-4 text-indigo-500" />,
  "Visual Aesthetic": <Brush className="w-4 h-4 text-indigo-500" />,
  "Content Impact": <BarChart3 className="w-4 h-4 text-indigo-500" />,
  "Conversion Readiness": <TrendingUp className="w-4 h-4 text-indigo-500" />,
  "First Impressions": <Smile className="w-4 h-4 text-indigo-500" />,
};

export default function BuddyLensRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const requesterId = session?.user?.id;

  const { mutate: submitRequest, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: BuddyLensRequestInputs) => {
      if (!requesterId) throw new Error("User not logged in");
      return axios.post("/api/buddy-lens/requester", {
        ...data,
        requesterId,
      });
    },
    onSuccess: () => {
      toast.success("Request submitted!");
      router.push("/dashboard/buddy-lens");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const message =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Something went wrong";
        toast.error(`Error: ${message}`);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error occurred");
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<BuddyLensRequestInputs>({
    resolver: zodResolver(buddyLensRequestSchema),
    defaultValues: {
      socialMediaUrl: "",
      tier: "5min",
      questions: ["", "", ""],
      jpCost: 500,
      domain: "",
    },
  });

  useEffect(() => {
    console.log("Form state error:", errors);
  });

  const domain = watch("domain");
  const questions = watch("questions");

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <Card className="rounded-xl shadow-md border border-gray-200 bg-white p-8 space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          📋 BuddyLens Review Request
        </h2>
        <form
          onSubmit={handleSubmit((data) => submitRequest(data))}
          className="space-y-8"
        >
          <InputWithLabel
            label={
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <LinkIcon className="w-4 h-4" />
                Social Media / Website URL
              </div>
            }
            type="url"
            placeholder="Enter your social media URL"
            {...register("socialMediaUrl")}
            error={errors.socialMediaUrl}
          />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Code2 className="w-4 h-4" />
              Select Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(DOMAIN_QUESTIONS).map((label) => (
                <label
                  key={label}
                  className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    domain === label
                      ? "bg-indigo-100 border-indigo-500 text-indigo-700 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("domain")}
                    value={label}
                    checked={domain === label}
                    onChange={() => {
                      setValue("domain", label, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      trigger("domain");
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 hidden"
                  />
                  {DOMAIN_ICONS[label]}
                  <span className="text-sm text-center">{label}</span>
                </label>
              ))}
            </div>
            {errors.domain && (
              <p className="text-red-500 text-sm">{errors.domain.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              Select Tier
            </label>
            <div className="flex flex-col gap-2">
              {[
                { value: "5min", label: "5 Minutes" },
                { value: "10min", label: "10 Minutes" },
                { value: "15min", label: "15 Minutes" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    {...register("tier")}
                    value={value}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {errors.tier && (
              <p className="text-red-500 text-sm">{errors.tier.message}</p>
            )}
          </div>

          {domain && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileQuestion className="w-4 h-4" />
                Choose Questions
              </label>
              {[0, 1, 2].map((index) => {
                const domainQuestions = DOMAIN_QUESTIONS[domain] || [];
                const isCustom =
                  questions[index] &&
                  !domainQuestions.includes(questions[index]) &&
                  questions[index] !== "";

                return (
                  <div key={index} className="space-y-2">
                    <select
                      value={isCustom ? "Other" : questions[index]}
                      onChange={async (e) => {
                        const updated = [...questions];
                        if (e.target.value === "Other") {
                          updated[index] = "";
                        } else {
                          updated[index] = e.target.value;
                        }
                        setValue("questions", updated, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        await trigger("questions");
                      }}
                      className="w-full border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a question</option>
                      {domainQuestions.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Question)</option>
                    </select>
                    {(questions[index] === "" && domain) || isCustom ? (
                      <Input
                        type="text"
                        placeholder="Enter your custom question"
                        value={questions[index]}
                        onChange={async (e) => {
                          const updated = [...questions];
                          updated[index] = e.target.value;
                          setValue("questions", updated, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          await trigger("questions");
                        }}
                      />
                    ) : null}
                    {errors.questions?.[index] && (
                      <p className="text-red-500 text-sm">
                        {errors.questions[index]?.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <InputWithLabel
            label={
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                JoyPearls Cost
              </div>
            }
            type="number"
            min={100}
            step={100}
            placeholder="Enter cost in JoyPearls"
            {...register("jpCost", { valueAsNumber: true })}
            error={errors.jpCost}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
