import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import handleSupabaseImageUpload from "@/lib/utils/supabase-image-upload";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const categoryId = formData.get("category") as string;
    const basePrice = parseInt(formData.get("basePrice") as string);
    const monthlyPrice = parseInt(formData.get("monthlyPrice") as string) || 0;
    const yearlyPrice = parseInt(formData.get("yearlyPrice") as string) || 0;
    const lifetimePrice = parseInt(formData.get("lifetimePrice") as string) || 0;
    const imageFile = formData.get("image") as File | null;
    const downloadFile = formData.get("download") as File | null;

    if (!name || !categoryId || isNaN(basePrice)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const updateData: {
      name: string;
      categoryId: string;
      basePrice: number;
      monthlyPrice: number;
      yearlyPrice: number;
      lifetimePrice: number;
      imageUrl: string;
      downloadUrl: string | null;
    } = {
      name,
      categoryId,
      basePrice,
      monthlyPrice,
      yearlyPrice,
      lifetimePrice,
      imageUrl: '',
      downloadUrl: '',
    };

    if (imageFile) {
      updateData.imageUrl = await handleSupabaseImageUpload(imageFile, "store-images", "store-images");
    }

    if (downloadFile) {
      updateData.downloadUrl = await handleSupabaseImageUpload(downloadFile, "store-images", "store-images");
    } else if (formData.get("download") === null) {
      updateData.downloadUrl = null;
    }

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        categoryId: true,
        basePrice: true,
        monthlyPrice: true,
        yearlyPrice: true,
        lifetimePrice: true,
        imageUrl: true,
        downloadUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        item: {
          ...item,
          category: item.categoryId,
          createdAt: item.createdAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating item:", errorMessage);
    return NextResponse.json(
      { error: "Failed to update item", message: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting item:", errorMessage);
    return NextResponse.json(
      { error: "Failed to delete item", message: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}