import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { activityDisplayMap } from "../constants/activityNames";

// Helper function to create a notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
) {
  return prisma.notification.create({
    data: { userId, type, title, message, metadata },
  });
}

// Returns notification data for JP earned
export function getJPEarnedNotificationData(
  userId: string,
  amount: number,
  activity: string
) {
  return {
    userId,
    type: NotificationType.JP_EARNED,
    title: "JP Earned",
    message: `You earned ${amount} JP for ${activityDisplayMap[activity]}`,
    metadata: { amount, activity },
  };
}

// Returns notification data for prosperity applied
export function getProsperityAppliedNotificationData(userId: string) {
  return {
    userId,
    type: NotificationType.PROSPERITY_APPLIED,
    title: "Prosperity Drop Applied",
    message:
      "Your prosperity drop application has been submitted and is under review",
    metadata: {},
  };
}

// Returns notification data for spotlight approved
export function getSpotlightApprovedNotificationData(userId: string) {
  return {
    userId,
    type: NotificationType.SPOTLIGHT_APPROVED,
    title: "Spotlight Approved",
    message: "Your spotlight application has been approved",
    metadata: { url: "/dashboard/spotlight" },
  };
}

// Returns notification data for spotlight approved
export function getSpotlightAppliedNotificationData(userId: string) {
  return {
    userId,
    type: NotificationType.SPOTLIGHT_APPLIED,
    title: "Spotlight Applied",
    message: "You have applied for spotlight and it is under review",
    metadata: {},
  };
}

// Returns notification data for spotlight active
export function getSpotlightActiveNotificationData(userId: string) {
  return {
    userId,
    type: NotificationType.SPOTLIGHT_ACTIVE,
    title: "Spotlight Active",
    message: "Your spotlight is now active and visible to other users",
    metadata: {},
  };
}

// Returns notification data for magic box shared
export function getMagicBoxSharedNotificationData(
  sharedByUserId: string,
  sharedByUserName: string,
  receiverUserId: string,
  amount: number
) {
  return {
    userId: receiverUserId,
    type: NotificationType.MAGIC_BOX_SHARED,
    title: "Magic Box Received",
    message: `${sharedByUserName} shared ${amount} JP with you through a Magic Box!`,
    metadata: { sharedByUserId, sharedByUserName, amount },
  };
}

// Returns notification data for magic box reward (for sender)
export function getMagicBoxRewardNotificationData(
  userId: string,
  amount: number
) {
  return {
    userId,
    type: NotificationType.JP_EARNED,
    title: "Magic Box Reward",
    message: `You earned ${amount} JP from opening the Magic Box!`,
  };
}

// Returns notification data for spotlight transaction (spending JP to activate)
export function getSpotlightTransactionNotificationData(
  userId: string,
  jpAmount: number
) {
  return {
    userId,
    type: NotificationType.SPOTLIGHT_ACTIVE,
    title: "Spotlight Activated",
    message: `You spent ${jpAmount} JP to activate your Spotlight.`,
    metadata: { jpAmount },
  };
}

// Returns notification data for spotlight application (spending JP to apply)
export function getSpotlightAppliedTransactionNotificationData(
  userId: string,
  jpAmount: number
) {
  return {
    userId,
    type: NotificationType.SPOTLIGHT_APPROVED,
    title: "Spotlight Application Submitted",
    message: `You spent ${jpAmount} JP to apply for Spotlight.`,
    metadata: { jpAmount },
  };
}

export async function createJPEarnedNotification(
  userId: string,
  amount: number,
  activity: string
) {
  return createNotification(
    userId,
    NotificationType.JP_EARNED,
    "JP Earned",
    `You earned ${amount} JP for ${activityDisplayMap[activity]}`,
    { amount, activity }
  );
}

export async function createProsperityAppliedNotification(userId: string) {
  return createNotification(
    userId,
    NotificationType.PROSPERITY_APPLIED,
    "Prosperity Drop Applied",
    "Your prosperity drop application has been submitted and is under review",
    {}
  );
}

/**
 * Create a notification for prosperity approval (in-app only, no push)
 * @param userId - ID of the user to notify
 */
export async function createProsperityApprovedNotification(userId: string) {
  return createNotification(
    userId,
    NotificationType.PROSPERITY_APPROVED,
    "Prosperity Drop Approved",
    "Your prosperity drop application has been approved"
    // { url: "/dashboard/prosperity" }
  );
}

/**
 * Create a notification for spotlight approval (in-app only, no push)
 * @param userId - ID of the user to notify
 */
export async function createSpotlightApprovedNotification(userId: string) {
  // Create in-app notification only
  return createNotification(
    userId,
    NotificationType.SPOTLIGHT_APPROVED,
    "Spotlight Approved",
    "Your spotlight application has been approved",
    { url: "/dashboard/spotlight" }
  );
}

export async function createSpotlightAppliedNotification(userId: string) {
  return createNotification(
    userId,
    NotificationType.SPOTLIGHT_APPLIED,
    "Spotlight Applied",
    "You have applied for spotlight and it is under review",
    {}
  );
}

export async function createSpotlightActiveNotification(userId: string) {
  return createNotification(
    userId,
    NotificationType.SPOTLIGHT_ACTIVE,
    "Spotlight Active",
    "Your spotlight is now active and visible to other users",
    {}
  );
}

export async function createMagicBoxSharedNotification(
  sharedByUserId: string,
  sharedByUserName: string,
  receiverUserId: string,
  amount: number
) {
  return createNotification(
    receiverUserId,
    NotificationType.MAGIC_BOX_SHARED,
    "Magic Box Received",
    `${sharedByUserName} shared ${amount} JP with you through a Magic Box!`,
    { sharedByUserId, sharedByUserName, amount }
  );
}

// Returns notification data for BuddyLens claim
export function getBuddyLensClaimedNotificationData(
  userId: string,
  reviewerName: string,
  domain: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_CLAIMED,
    title: "BuddyLens Request Claimed",
    message: `${reviewerName} claimed your BuddyLens request in ${domain}. Approve or reject.`,
    metadata: { url: `/dashboard/buddy-lens/approve` },
  };
}

// Returns notification data for BuddyLens approval
export function getBuddyLensApprovedNotificationData(
  userId: string,
  domain: string,
  requestId: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_APPROVED,
    title: "BuddyLens Claim Approved",
    message: `Your claim for the BuddyLens request in ${domain} has been approved! Start reviewing now.`,
    metadata: { url: `/dashboard/buddy-lens/reviewer?requestId=${requestId}` },
  };
}

// Returns notification data for BuddyLens rejection
export function getBuddyLensRejectedNotificationData(
  userId: string,
  domain: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_REJECTED,
    title: "BuddyLens Claim Rejected",
    message: `Your claim for the BuddyLens request in ${domain} was rejected.`,
    metadata: { url: `/dashboard/buddy-lens/reviewer` },
  };
}

// Returns notification data for BuddyLens review completion
export function getBuddyLensReviewedNotificationData(
  userId: string,
  domain: string,
  jpAmount: number,
  requestId: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_REVIEWED,
    title: "BuddyLens Review Completed",
    message: `Your BuddyLens request in ${domain} has been reviewed. ${jpAmount} Joy Pearls have been deducted.`,
    metadata: { url: `/dashboard/buddy-lens/reviewer/${requestId}`, jpAmount },
  };
}

// Returns notification data for BuddyLens reviewer completion
export function getBuddyLensReviewerCompletedNotificationData(
  userId: string,
  domain: string,
  jpAmount: number,
  requestId: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_COMPLETED,
    title: "BuddyLens Review Reward",
    message: `You have earned ${jpAmount} Joy Pearls for reviewing a BuddyLens request in ${domain}.`,
    metadata: { url: `/dashboard/buddy-lens/reviewer/${requestId}`, jpAmount },
  };
}

// Returns notification data for BuddyLens cancellation
export function getBuddyLensCancelledNotificationData(
  userId: string,
  domain: string
) {
  return {
    userId,
    type: NotificationType.BUDDY_LENS_REJECTED, // Using REJECTED type since it's similar
    title: "BuddyLens Claim Cancelled",
    message: `The claim for your BuddyLens request in ${domain} has been cancelled by the requester.`,
    metadata: { url: `/dashboard/buddy-lens/reviewer` },
  };
}

// Create BuddyLens claim notification
export async function createBuddyLensClaimedNotification(
  userId: string,
  reviewerName: string,
  domain: string,
  requestId: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_CLAIMED,
    "BuddyLens Request Claimed",
    `${reviewerName} claimed your BuddyLens request in ${domain}. Approve or reject.`,
    {
      url: `/dashboard/buddy-lens/approve?requestId=${requestId}`,
    }
  );
}

// Create BuddyLens approval notification
export async function createBuddyLensApprovedNotification(
  userId: string,
  domain: string,
  requestId: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_APPROVED,
    "BuddyLens Claim Approved",
    `Your claim for the BuddyLens request in ${domain} has been approved! Start reviewing now.`,
    { url: `/dashboard/buddy-lens/reviewer?requestId=${requestId}` }
  );
}

// Create BuddyLens rejection notification
export async function createBuddyLensRejectedNotification(
  userId: string,
  domain: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_REJECTED,
    "BuddyLens Claim Rejected",
    `Your claim for the BuddyLens request in ${domain} was rejected.`,
    { url: `/dashboard/buddy-lens/reviewer` }
  );
}

// Create BuddyLens review completion notification
export async function createBuddyLensReviewedNotification(
  userId: string,
  domain: string,
  jpAmount: number,
  reviewId: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_REVIEWED,
    "BuddyLens Review Completed",
    `Your BuddyLens request in ${domain} has been reviewed. ${jpAmount} Joy Pearls have been deducted.`,
    { url: `/dashboard/buddy-lens/reviewer/${reviewId}`, jpAmount }
  );
}

// Create BuddyLens reviewer completion notification
export async function createBuddyLensReviewerCompletedNotification(
  userId: string,
  domain: string,
  jpAmount: number,
  // reviewId: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_COMPLETED,
    "BuddyLens Review Reward",
    `You have earned ${jpAmount} Joy Pearls for reviewing a BuddyLens request in ${domain}.`,
    // { url: `/dashboard/buddy-lens/reviewer/${reviewId}`, jpAmount }
  );
}

// Create BuddyLens cancellation notification
export async function createBuddyLensCancelledNotification(
  userId: string,
  domain: string
) {
  return createNotification(
    userId,
    NotificationType.BUDDY_LENS_REJECTED, // Using REJECTED type since it's similar
    "BuddyLens Claim Cancelled",
    `The claim for your BuddyLens request in ${domain} has been cancelled by the requester.`,
    { url: `/dashboard/buddy-lens/reviewer` }
  );
}
