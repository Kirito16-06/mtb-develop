import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { type NextRequest } from "next/server";
import { checkRole } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
       await checkRole(
          "USER",
          "You are not authorized for this action"
        );
    const searchTerm = request.nextUrl.searchParams.get("q")?.trim();

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role:"USER",
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            userBusinessProfile: {
              some: {
                OR: [
                  { name: { contains: searchTerm, mode: "insensitive" } },
                  {
                    businessInfo: { contains: searchTerm, mode: "insensitive" },
                  },
                  {
                    missionStatement: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                  { goals: { contains: searchTerm, mode: "insensitive" } },
                  {
                    achievements: { contains: searchTerm, mode: "insensitive" },
                  },
                  {
                    keyOfferings: { contains: searchTerm, mode: "insensitive" },
                  },
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        // userBusinessProfile: {
        //   select: {
        //     name: true,
        //     businessInfo: true,
        //     missionStatement: true,
        //     goals: true,
        //     achievements: true,
        //     keyOfferings: true,
        //     email: true,
        //     phone: true,
        //     website: true,
        //     socialHandles: true,
        //   },
        // },
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
