import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.emailTemplate.findUnique({
      where: {
        id: id,
      },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching email template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { templateId, subject, htmlContent, description } = body;

    if (!templateId || !subject || !htmlContent) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await prisma.emailTemplate.update({
      where: {
        id: id,
      },
      data: {
        templateId,
        subject,
        htmlContent,
        description,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating email template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.emailTemplate.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
