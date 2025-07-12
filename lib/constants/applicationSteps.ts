import { ProsperityDropStatus, SpotlightStatus } from "@prisma/client";
import { Step } from "@/components/ApplicationStepper";

export const spotlightSteps: Step[] = [
  {
    id: "applied",
    title: "Applied",
    description: "You've taken the first step!",
    status: "completed",
  },
  {
    id: "in-review",
    title: "In Review",
    description: "Under assessment stay tuned!",
    status: "current",
  },
  {
    id: "approved",
    title: "Approved",
    description: "You're in! Get ready to shine",
    status: "upcoming",
  },
  {
    id: "active",
    title: "Active",
    description: "Your Spotlight is live now",
    status: "upcoming",
  },
];

export const prosperitySteps: Step[] = [
  {
    id: "applied",
    title: "Applied",
    description: "Application submitted",
    status: "completed",
  },
  {
    id: "in-review",
    title: "In Review",
    description: "Under evaluation",
    status: "current",
  },
  {
    id: "approved",
    title: "Approved",
    description: "Application successful",
    status: "upcoming",
  },
];

export const SpotlightStepperMap: Record<SpotlightStatus, number> = {
  [SpotlightStatus.APPLIED]: 1,
  [SpotlightStatus.IN_REVIEW]: 2,
  [SpotlightStatus.APPROVED]: 3,
  [SpotlightStatus.ACTIVE]: 4,
  [SpotlightStatus.DISAPPROVED]: -1,
  [SpotlightStatus.EXPIRED]: -1,
};

export const ProsperityStepperMap: Record<ProsperityDropStatus, number> = {
  [ProsperityDropStatus.APPLIED]: 1,
  [ProsperityDropStatus.IN_REVIEW]: 2,
  [ProsperityDropStatus.APPROVED]: 3,
  [ProsperityDropStatus.DISAPPROVED]: -1,
};
