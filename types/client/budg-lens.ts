// export interface BuddyLensRequest {
//   id: string;
//   feedbackType: string;
//   platform: string;
//   domain: string;
//   tier: string;
//   jpCost: number;
//   socialMediaUrl: string;
//   status: 'OPEN' | 'PENDING' | 'CLAIMED' | 'SUBMITTED';
//   requesterId: string;
//   reviewerId?: string | null;
//   pendingReviewerId?: string | null;
//   questions: string[];
//   isDeleted: boolean;
//   createdAt: string; // ISO string from Prisma DateTime
//   requester?: {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//   };
//   reviewer?: {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//   } | null;
// }

import { Prisma } from "@prisma/client";

export type BuddyLensRequest = Prisma.BuddyLensRequestGetPayload<{
  include: {
    reviewer: true;
    requester: true;
    request: true;
    review: { include: { reviewer: true } };
  };
}>;

export type BuddyLensReview = Prisma.BuddyLensReviewGetPayload<{
  include: {
    reviewer: true;
    request: true;    
  };
}>;



export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string; // ISO string from Prisma DateTime
}



export interface DeleteRequestResponse {
  message: string;
  data?: BuddyLensRequest;
}

export interface DeleteRequestError {
  error: string;
  details?: string;
}
