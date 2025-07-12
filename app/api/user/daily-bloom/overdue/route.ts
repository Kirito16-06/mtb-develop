import { checkRole } from "@/lib/utils/auth"; 
import {  NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; 


export async function GET() {
  try {
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const overdueBlooms = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        isCompleted: false,
        dueDate: {
          lt: now,
          not: null, 
        },
      },
      orderBy: {
        dueDate: 'asc', 
      }
    });

    return NextResponse.json({
      message: "Overdue blooms fetched successfully",
      data: overdueBlooms,
    }, { status: 200 });

  } catch (e) {
    console.error("Failed to fetch overdue blooms:", e);
    return NextResponse.json(
      { message: "An internal server error occurred while fetching overdue blooms." },
      { status: 500 }
    );
  }
}
