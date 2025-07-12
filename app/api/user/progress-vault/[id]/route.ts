import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await checkRole("USER");
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 });
    }

    const log = await prisma.progressVault.findUnique({
      where: { id: id }
    });

    if (!log || log.userId !== session.user.id) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updatedLog = await prisma.progressVault.update({
      where: { id: id },
      data: { content }
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    toast.error(getAxiosErrorMessage(error,"An error occurred"))
    return NextResponse.json({ message: "Failed to update log" },{ status: 500 });
  }
}

export async function DELETE(req: Request, 
   { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id :logId} = await params;
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // const logId = params.id; // Get logId from URL parameters

    if (!logId) {
      return NextResponse.json({ message: "Log ID is required" }, { status: 400 });
    }

    // Find the log by ID
    const log = await prisma.progressVault.findUnique({
      where: { id: logId },
    });

    if (!log || log.userId !== session.user.id) {
      return NextResponse.json({ message: "Log not found or not authorized to delete" }, { status: 404 });
    }

    // Soft delete the log by setting the deletedAt field
    await prisma.progressVault.update({
      where: { id: log.id },
      data: { deletedAt: new Date() }, // Mark it as deleted without removing it
    });

    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete log" },
      { status: 500 }
    );
  }
}