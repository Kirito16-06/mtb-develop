import { z } from "zod";

export const Step1Schema = z.object({
  mood: z.enum(["sleep", "goodToGo", "motivated", "highlyMotivated"]),
  tasks: z.array(z.string().max(120).min(1, "Task cannot be empty")).length(3),
});

export const Step2Schema = z.object({
  selectedTask: z.string().min(1, "Please select a task"),
  category: z.enum(["creative", "nurturing", "revenueGenerating", "admin"]),
});

export const Step3Schema = z
  .object({
    timeFrom: z.date({
      required_error: "Start time is required",
      invalid_type_error: "Invalid start time",
    }),
    timeTo: z.date({
      required_error: "End time is required",
      invalid_type_error: "Invalid end time",
    }),
  })
  .refine(
    (data) => {
      const now = new Date();
      return data.timeFrom >= now;
    },
    {
      message: "Please select a current or future time.",
      path: ["timeFrom"],
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.timeTo >= now;
    },
    {
      message: "Please select a current or future time.",
      path: ["timeTo"],
    }
  )
  .refine(
    (data) => {
      const timeDifference = data.timeTo.getTime() - data.timeFrom.getTime();
      return timeDifference <= 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    },
    {
      message: "Time window cannot exceed 3 hours.",
      path: ["timeTo"],
    }
  )
  .refine(
    (data) => {
      return data.timeTo > data.timeFrom;
    },
    {
      message: "End time must be after start time.",
      path: ["timeTo"],
    }
  );

export const AlignedActionSchema = z
  .object({
    userId: z.string(),
    mood: z.enum(["sleep", "goodToGo", "motivated", "highlyMotivated"]),
    tasks: z.array(z.string().max(120).min(1, "Task cannot be empty")).length(3),
    selectedTask: z.string().min(1, "Please select a task"),
    category: z.enum(["creative", "nurturing", "revenueGenerating", "admin"]),
    timeFrom: z.date(),
    timeTo: z.date(),
  })
  .refine(
    (data) => {
      const now = new Date();
      return data.timeFrom >= now;
    },
    {
      message: "Please select a current or future time.",
      path: ["timeFrom"],
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.timeTo >= now;
    },
    {
      message: "Please select a current or future time.",
      path: ["timeTo"],
    }
  )
  .refine(
    (data) => {
      const diffMs = data.timeTo.getTime() - data.timeFrom.getTime();
      return diffMs <= 3 * 60 * 60 * 1000 && diffMs > 0;
    },
    {
      message: "Time window cannot exceed 3 hours.",
      path: ["timeTo"],
    }
  );

export type AlignedAction = z.infer<typeof AlignedActionSchema>;