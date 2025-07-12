import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { Role } from "@prisma/client";
import { getServerSession, Session } from "next-auth";

// type SessionUser = {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: Role;
// };

// type Session = {
//   user: SessionUser;
//   expires: string;
// };

export async function checkRole(
  role: Role | Role[],
  msg: string = "You are not authorized for this action"
): Promise<Session> {
  const session = await getServerSession(authConfig);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(session.user.role as Role)) {
    throw new Error(msg);
  }
  return session;
}
