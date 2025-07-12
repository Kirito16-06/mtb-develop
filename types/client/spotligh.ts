import { Prisma, SpotlightStatus } from "@prisma/client";

export interface SpotlightApplication {
  id: string;
  user: {
    name: string;
    email: string;
    id: string;
    image: string | null;
  };
  status: SpotlightStatus;
  appliedAt: string;
}



export interface SpotlightResponse {
  id: string;
  expiresAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
    userBusinessProfile: Prisma.UserGetPayload<{
      include: { userBusinessProfile: true };
    }>["userBusinessProfile"];
  };
}
