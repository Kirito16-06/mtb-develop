import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import handleSupabaseImageUpload from "@/lib/utils/supabase-image-upload";

const prisma = new PrismaClient();
// GET /api/items - Fetch all items
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        category: true,
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
      { items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const basePrice = parseInt(formData.get("basePrice") as string);
    const monthlyPrice = parseInt(formData.get("monthlyPrice") as string) || 0;
    const yearlyPrice = parseInt(formData.get("yearlyPrice") as string) || 0;
    const lifetimePrice = parseInt(formData.get("lifetimePrice") as string) || 0;
    const imageFile = formData.get("image") as File;
    const downloadFile = formData.get("download") as File | null;

    if (!name || !category || !imageFile || isNaN(basePrice)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const imageUrl = await handleSupabaseImageUpload(imageFile,"store-images","store-images");
    let downloadUrl: string | undefined;

    if (downloadFile) {
      downloadUrl = await handleSupabaseImageUpload(downloadFile,"store-images","store-images");
    }

    const item = await prisma.item.create({
      data: {
        name,
        categoryId: category,
        basePrice,
        monthlyPrice,
        yearlyPrice,
        lifetimePrice,
        imageUrl,
        downloadUrl,
      },
      select: {
        id: true,
        name: true,
        category: true,
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
      { item: { ...item, createdAt: item.createdAt.toISOString() } },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating item:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create item", message: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const basePrice = parseInt(formData.get("basePrice") as string);
    const monthlyPrice = parseInt(formData.get("monthlyPrice") as string) || 0;
    const yearlyPrice = parseInt(formData.get("yearlyPrice") as string) || 0;
    const lifetimePrice = parseInt(formData.get("lifetimePrice") as string) || 0;
    const imageFile = formData.get("image") as File | null;
    const downloadFile = formData.get("download") as File | null;

    if (!name || !category || isNaN(basePrice)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData : {
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
      categoryId: category,
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
        category: true,
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
      { item: { ...item, createdAt: item.createdAt.toISOString() } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

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
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}