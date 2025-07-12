import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.emailTemplate.count(),
    ]);

    return NextResponse.json({
      templates,
      total,
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, subject, htmlContent, description } = body;

    if (!templateId || !subject || !htmlContent) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        templateId,
        subject,
        htmlContent,
        description,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating email template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
