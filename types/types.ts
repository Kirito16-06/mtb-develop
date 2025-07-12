import { Prisma } from "@prisma/client";

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  postedDate: string;
}

export interface Category {
  id: string;
  name: string;
  isActive?: boolean;
} 



export type User = Prisma.UserGetPayload<{ include: { userBusinessProfile: true, spotlight: true, transaction: true }, omit: {password:true} }>