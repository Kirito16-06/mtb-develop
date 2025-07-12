"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
} from "@/schema/aligned-actions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";


export default function AlignedActionWizard({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood: "",
    tasks: ["", "", ""],
    selectedTask: "",
    category: "",
    timeFrom: "",
    timeTo: "",
  });

  // Step 1 form
  const step1Form = useForm({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      mood: (formData.mood || "") as
        | "sleep"
        | "goodToGo"
        | "motivated"
        | "highlyMotivated",
      tasks: formData.tasks,
    },
  });

  // Step 2 form
  const step2Form = useForm({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      selectedTask: formData.selectedTask,
      category: (formData.category || "") as
        | "creative"
        | "nurturing"
        | "revenueGenerating"
        | "admin",
    },
  });

  // Step 3 form
  const step3Form = useForm({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      timeFrom: formData.timeFrom ? new Date(formData.timeFrom) : new Date(),
      timeTo: formData.timeTo ? new Date(formData.timeTo) : new Date(),
    },
  });

  // Create aligned action mutation
  const createAlignedAction = useMutation({
    mutationFn: async (data: {
      mood: string;
      tasks: string[];
      selectedTask: string;
      category: string;
      timeFrom: string;
      timeTo: string;
    }) => {
      const res = await fetch("/api/user/aligned-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create 1% Start action");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("1% Start action created successfully!");
      onComplete();
    },
    onError: (error: Error) => {
      if (
        error.message.includes("already created an 1% Startaction for today")
      ) {
        toast.error(
          "You can only create one 1% Start action per day. Please try again tomorrow."
        );
      } else {
        toast.error(error.message || "Failed to create 1% Start action");
      }
    },
  });

  // Handle step 1 submission
  const onSubmitStep1 = (data: {
    mood: "sleep" | "goodToGo" | "motivated" | "highlyMotivated";
    tasks: string[];
  }) => {
    setFormData((prev) => ({ ...prev, mood: data.mood, tasks: data.tasks }));
    setStep(2);
  };

  // Handle step 2 submission
  const onSubmitStep2 = (data: {
    selectedTask: string;
    category: "creative" | "nurturing" | "revenueGenerating" | "admin";
  }) => {
    setFormData((prev) => ({
      ...prev,
      selectedTask: data.selectedTask,
      category: data.category,
    }));
    setStep(3);
  };

  // Handle step 3 submission
  const onSubmitStep3 = (data: { timeFrom: Date; timeTo: Date }) => {
    setFormData((prev) => ({
      ...prev,
      timeFrom: data.timeFrom.toISOString(),
      timeTo: data.timeTo.toISOString(),
    }));
    setStep(4);
  };

  // Handle final submission
  const handleSubmit = () => {
    createAlignedAction.mutate({
      mood: formData.mood,
      tasks: formData.tasks,
      selectedTask: formData.selectedTask,
      category: formData.category,
      timeFrom: formData.timeFrom,
      timeTo: formData.timeTo,
    });
  };

  // Convert time input value to date object
  const timeToDate = (timeString: string) => {
    if (!timeString) return undefined;

    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert date object to time input value
  const dateToTime = (date: Date | undefined) => {
    if (!date) return "";
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <>

    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s === step
                    ? "bg-jp-orange text-white"
                    : s < step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 ${
                    s < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Mood and Tasks */}
      {step === 1 && (
        <Form {...step1Form}>
          <form
            onSubmit={step1Form.handleSubmit(onSubmitStep1)}
            className="space-y-6"
          >
            <FormField
              control={step1Form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-medium">
                    How are you feeling today?
                  </FormLabel>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {[
                      { value: "sleep", emoji: "😴", label: "Sleepy" },
                      { value: "goodToGo", emoji: "😐", label: "Good to Go" },
                      { value: "motivated", emoji: "😊", label: "Motivated" },
                      {
                        value: "highlyMotivated",
                        emoji: "😃",
                        label: "Highly Motivated",
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        className={`cursor-pointer text-center p-4 rounded-lg transition-all ${
                          field.value === option.value
                            ? "bg-jp-orange/10 border-2 border-jp-orange"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-4xl mb-2">{option.emoji}</div>
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel className="text-lg font-medium">
                List 3 tasks you want to accomplish today
              </FormLabel>
              <FormDescription>
                These should be tasks that would make today feel productive
              </FormDescription>

              {[0, 1, 2].map((index) => (
                <FormField
                  key={index}
                  control={step1Form.control}
                  name={`tasks.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={`Task ${index + 1}`}
                          maxLength={120}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !step1Form.formState.isValid ||
                  step1Form.formState.isSubmitting
                }
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 2: Select Task and Category */}
      {/* {step === 2 && (
        <Form {...step2Form}>
          <form
            onSubmit={step2Form.handleSubmit(onSubmitStep2)}
            className="space-y-6"
          >
            <FormField
              control={step2Form.control}
              name="selectedTask"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    Select one task to focus on
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.tasks.map((task, index) => (
                        <SelectItem key={index} value={task}>
                          {task}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={step2Form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    What category does this task fall under?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {[
                        {
                          value: "creative",
                          label: "Creative",
                          description: "Creating or designing something new",
                        },
                        {
                          value: "nurturing",
                          label: "Nurturing",
                          description: "Taking care of yourself or others",
                        },
                        {
                          value: "revenueGenerating",
                          label: "Revenue Generating",
                          description: "Activities that bring in income",
                        },
                        {
                          value: "admin",
                          label: "Administrative",
                          description: "Organizational or management tasks",
                        },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="mt-1"
                          />
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={
                  !step2Form.formState.isValid ||
                  step2Form.formState.isSubmitting
                }
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      )} */}

      {step === 2 && (
        <Form {...step2Form}>
          <form
            onSubmit={step2Form.handleSubmit(onSubmitStep2)}
            className="space-y-6"
          >
            <FormField
              control={step2Form.control}
              name="selectedTask"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    Select one task to focus on
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      {formData.tasks.map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={task}
                            id={`task-${index}`}
                            className="mt-1"
                          />
                          <label
                            htmlFor={`task-${index}`}
                            className="text-sm font-medium leading-none"
                          >
                            {task}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={step2Form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    What category does this task fall under?
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          value: "creative",
                          label: "Creative",
                          description: "Creating or designing something new",
                        },
                        {
                          value: "nurturing",
                          label: "Nurturing",
                          description: "Taking care of yourself or others",
                        },
                        {
                          value: "revenueGenerating",
                          label: "Revenue Generating",
                          description: "Activities that bring in income",
                        },
                        {
                          value: "admin",
                          label: "Administrative",
                          description: "Organizational or management tasks",
                        },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            checked={field.value === option.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? option.value : "");
                            }}
                            id={option.value}
                            className="mt-1"
                          />
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={
                  !step2Form.formState.isValid ||
                  step2Form.formState.isSubmitting
                }
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Time Selection */}
      {/* {step === 3 && (
        <Form {...step3Form}>
          <form
            onSubmit={step3Form.handleSubmit(onSubmitStep3)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormLabel className="text-lg font-medium">
                When will you work on this task?
              </FormLabel>
              <FormDescription>
                Choose a time window of up to 3 hours ending before midnight
              </FormDescription>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={step3Form.control}
                  name="timeFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={dateToTime(field.value)}
                          onChange={(e) => {
                            const date = timeToDate(e.target.value);
                            if (date) field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step3Form.control}
                  name="timeTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={dateToTime(field.value)}
                          onChange={(e) => {
                            const date = timeToDate(e.target.value);
                            if (date) field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={
                  !step3Form.formState.isValid ||
                  step3Form.formState.isSubmitting
                }
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      )} */}

      {/* Step 3: Time Selection */}
      {step === 3 && (
        <Form {...step3Form}>
          <form
            onSubmit={step3Form.handleSubmit(onSubmitStep3)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormLabel className="text-lg font-medium">
                When will you work on this task?
              </FormLabel>
              <FormDescription>
                Select a time window of up to 3 hours, starting from the current
                time or later.
              </FormDescription>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={step3Form.control}
                  name="timeFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="time"
                            value={dateToTime(field.value)}
                            onChange={(e) => {
                              const date = timeToDate(e.target.value);
                              if (date) field.onChange(date);
                            }}
                            // className="pl-10"
                          />
                          {/* <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg> */}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step3Form.control}
                  name="timeTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="time"
                            value={dateToTime(field.value)}
                            onChange={(e) => {
                              const date = timeToDate(e.target.value);
                              if (date) field.onChange(date);
                            }}
                            // className="pl-10"
                          />
                          {/* <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg> */}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {step3Form.formState.errors.timeTo?.message ===
                "Time window cannot exceed 3 hours." && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-700">
                  Time window cannot exceed 3 hours. Please select an end time
                  within 3 hours of the start time.
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button type="submit" disabled={step3Form.formState.isSubmitting}>
                Next
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 4: Summary and Confirmation */}
      {/* {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Review Your Aligned Action
          </h2>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="font-medium">Mood:</div>
                  <div className="text-2xl">
                    {formData.mood === "sleep" && "😴"}
                    {formData.mood === "goodToGo" && "😐"}
                    {formData.mood === "motivated" && "😊"}
                    {formData.mood === "highlyMotivated" && "😃"}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Tasks:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {formData.tasks.map((task, i) => (
                      <li
                        key={i}
                        className={
                          task === formData.selectedTask ? "font-bold" : ""
                        }
                      >
                        {task}
                        {task === formData.selectedTask && " (selected)"}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-medium mb-1">Category:</div>
                  <div>
                    {formData.category === "creative" && "Creative"}
                    {formData.category === "nurturing" && "Nurturing"}
                    {formData.category === "revenueGenerating" &&
                      "Revenue Generating"}
                    {formData.category === "admin" && "Administrative"}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-1">Time Window:</div>
                  <div>
                    {formData.timeFrom && formData.timeTo && (
                      <>
                        {format(new Date(formData.timeFrom), "h:mm a")} -{" "}
                        {format(new Date(formData.timeTo), "h:mm a")}
                      </>
                    )}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            You'll receive an email reminder 5 minutes before
                            your scheduled time
                          </li>
                          <li>
                            At the scheduled time, you'll be prompted to confirm
                            if you completed the task
                          </li>
                          <li>
                            If completed, you'll earn +50 Joy Pearls and the
                            task will be saved to your Progress Vault
                          </li>
                          <li>
                            <span className="font-semibold">Remember:</span> You
                            can only create one aligned action per day
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAlignedAction.isPending}
              className="bg-jp-orange hover:bg-jp-orange/90"
            >
              {createAlignedAction.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )} */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-gray-900">
            Your Action Plan is Ready!
          </h2>
          <p className="text-sm text-center text-gray-600">
            Review and launch your plan to make today count!
          </p>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-100">
            <CardContent className="pt-6 pb-8">
              <div className="space-y-6">
                {/* Mood Section */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 border border-green-500 text-2xl">
                    {formData.mood === "sleep" && "😴"}
                    {formData.mood === "goodToGo" && "😐"}
                    {formData.mood === "motivated" && "😊"}
                    {formData.mood === "highlyMotivated" && "😃"}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 capitalize tracking-wide">
                      Mood
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {formData.mood === "sleep" && "Sleepy"}
                      {formData.mood === "goodToGo" && "Good to Go"}
                      {formData.mood === "motivated" && "Motivated"}
                      {formData.mood === "highlyMotivated" &&
                        "Highly Motivated"}
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div>
                  <div className="text-xs font-medium text-gray-500 capitalize tracking-wide mb-2">
                    Tasks
                  </div>
                  <ul className="space-y-2">
                    {formData.tasks.map((task, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 text-gray-800 p-2 rounded-md text-sm ${
                          task === formData.selectedTask
                            ? "bg-green-500/10 font-bold text-green-500"
                            : "bg-gray-50"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 flex items-center justify-center rounded-full ${
                            task === formData.selectedTask
                              ? "bg-green-500 text-white text-xs"
                              : "bg-gray-400 text-white text-xs"
                          }`}
                        >
                          {task === formData.selectedTask ? "✓" : "+"}
                        </span>
                        <span>{task}</span>
                        {task === formData.selectedTask && (
                          <span className="text-xs text-green-500">
                            (Selected)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category Section */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-xs font-medium text-gray-500 capitalize tracking-wide mb-1">
                    Category
                  </div>
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm bg-green-500"></span>
                    {formData.category === "creative" && "Creative"}
                    {formData.category === "nurturing" && "Nurturing"}
                    {formData.category === "revenueGenerating" &&
                      "Revenue Generating"}
                    {formData.category === "admin" && "Administrative"}
                  </div>
                </div>

                {/* Time Window Section */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-xs font-medium text-gray-500 capitalize tracking-wide mb-1">
                    Zone/Flow-Time
                  </div>
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-500"></span>
                    {formData.timeFrom && formData.timeTo && (
                      <>
                        {format(new Date(formData.timeFrom), "h:mm a")} -{" "}
                        {format(new Date(formData.timeTo), "h:mm a")}
                      </>
                    )}
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-md">
                  <div className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      !
                    </span>
                    <div className="text-sm text-blue-900">
                      <p className="text-base font-bold text-blue-950 mb-3">
                        You are one step away from crushing it!
                      </p>
                      <p className="text-xs text-blue-800 mb-4">
                        Your 1% Start action is locked in. Here is how we will
                        help you stay on track and celebrate your success!
                      </p>
                      <ul className="list-none space-y-3">
                        <li className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                          <span>
                            <strong>Email Reminder:</strong> Get a nudge 5
                            minutes before your task starts to keep you focused.
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                          <span>
                            <strong>Completion Check:</strong> Confirm your task
                            at the end time to mark it as done.
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                            ★
                          </span>
                          <span>
                            <strong>Joy Pearls:</strong> Earn +50 Joy Pearls for
                            completing your task, saved to your Progress Vault.
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                            ★
                          </span>
                          <span>
                            <strong>Track Progress:</strong> See your completed
                            tasks in the Progress Vault to stay motivated.
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs">
                            i
                          </span>
                          <span>
                            <strong className="font-semibold">Pro Tip:</strong>{" "}
                            One 1% Start action per day keeps you focused. Make
                            it count!
                          </span>
                        </li>
                      </ul>
                      <p className="text-xs text-blue-800 mt-4 italic">
                        Stay focused, and lets make this task a win!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(3)}
              className="px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm rounded-md"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAlignedAction.isPending}
              className="px-4 py-1 text-sm bg-green-500 text-white hover:bg-green-600 shadow-md rounded-md"
            >
              {createAlignedAction.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
