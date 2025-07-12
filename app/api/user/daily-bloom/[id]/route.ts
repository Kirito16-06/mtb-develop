
import { NextRequest, NextResponse } from "next/server";
import { dailyBloomSchema } from "@/schema/zodSchema";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
import { assignJp } from "@/lib/utils/jp";
import { ActivityType } from "@prisma/client";


/**
 * Handles GET requests for a specific Daily Bloom entry.
 * Fetches a single 'todo' item by its ID.
 *
 * @param _req - The NextRequest object (unused in this GET handler, hence _req).
 * @param params - An object containing route parameters, specifically Promise<{ id: string }>.
 * @returns A NextResponse containing the Daily Bloom entry or an error message.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Find a unique 'todo' item by its ID from the database
    const id = (await params).id
    const bloom = await prisma?.todo.findUnique({
      where: { id: id },
    });

    // If no bloom entry is found, return a 404 Not Found response
    if (!bloom) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Return the found bloom entry as a JSON response
    return NextResponse.json(bloom);
  } catch (error: unknown) { // ✅ FIXED: Changed 'any' to 'unknown'
    let errorMessage = "Failed to fetch entry";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error("GET Error:", errorMessage);
    // Return a 500 Internal Server Error response if fetching fails
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


/**
 * Handles PUT requests to update a specific Daily Bloom entry.
 * Validates the request body against dailyBloomSchema, updates the entry,
 * and potentially assigns JP points if the task is completed.
 *
 * @param req - The NextRequest object containing the request body.
 * @param params - An object containing route parameters, specifically Promise<{ id: string }>.
 * @returns A NextResponse containing the updated Daily Bloom entry or an error message.
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if the user has the 'USER' role using a utility function
    const session = await checkRole("USER");
    // Parse the JSON body from the request
    const body = await req.json();

    const id = (await params).id
    // 1. Find the existing bloom entry to ensure it exists before updating
    const existing = await prisma?.todo.findUnique({
      where: { id: id },
    });

    // If the entry does not exist, return a 404 Not Found response
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 3. Validate the request body against the dailyBloomSchema
    const validated = dailyBloomSchema.parse(body);

    // Update the 'todo' item in the database with the validated data
    const updated = await prisma?.todo.update({
      where: { id: id },
      data: validated,
    });

    // If the update operation failed, return a 500 Internal Server Error
    if (!updated) {
      return NextResponse.json(
        { error: "error while updating a Daily Bloom", success: false },
        { status: 500 }
      );
    }

    // If the task is marked as completed (isCompleted === true)
    if (updated.isCompleted === true) {
      // Retrieve user information, including their plan, to assign JP points
      const user = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        include: { plan: true },
      });

      if (user) {
        try {
          // Assign Award JP points for daily bloom completion
          await assignJp(user, ActivityType.ADD_LOG);
          // Mark the task as having had its JP points assigned to prevent duplicate awards
          await prisma.todo.update({
            where: { id: updated?.id },
            data: { taskCompleteJP: true },
          });
        } catch (error: unknown) { // ✅ FIXED: Changed 'any' to 'unknown'
          let errorMessage = "Unknown error during JP assignment";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          console.log(
            `Error while assigning the jp from the completion of the daily bloom task : ${errorMessage}`
          );
          // Re-throw the error to be caught by the outer try-catch block
          throw error;
        }
      }
    }

    // Return the updated bloom entry as a JSON response
    return NextResponse.json(updated);
  } catch (error: unknown) { // ✅ FIXED: Changed 'any' to 'unknown'
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error("PUT Error:", errorMessage);
    // Return a 500 Internal Server Error response with the error message
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


/**
 * Handles DELETE requests to remove a specific Daily Bloom entry.
 * Deletes a 'todo' item by its ID.
 *
 * @param _req - The NextRequest object (unused in this DELETE handler).
 * @param params - An object containing route parameters, specifically Promise<{ id:string }>.
 * @returns A NextResponse indicating successful deletion or an error message.
 */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    // Delete the 'todo' item from the database by its ID
    await prisma?.todo.delete({
      where: { id: id },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: unknown) { // ✅ FIXED: Changed 'any' to 'unknown'
    let errorMessage = "Failed to delete";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error("DELETE Error:", errorMessage);
    // Return a 500 Internal Server Error response if deletion fails
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

}

