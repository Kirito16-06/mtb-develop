import { prisma } from "@/lib/prisma";
import { supabaseClient } from "@/lib/supabase"; // Fixed: Use named import
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Create a new blog post
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const readTime = formData.get("readTime") as string;
    const category = (formData.get("category") as string) || "uncategorized";
    const file = formData.get("imageFile") as File | null;

    let imageUrl = "";

    // Upload image to Supabase Storage (if provided)
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error(`Supabase Upload Error: ${uploadError.message}`);
      }

      const { data } = supabaseClient.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
          throw new Error("Could not get public URL for the uploaded image.");
      }

      imageUrl = data.publicUrl;
    }

    // Save blog post in Prisma
    const blog = await prisma.blog.create({
      data: {
        title,
        category,
        excerpt,
        content,
        readTime,
        image: imageUrl,
      },
    });

    return NextResponse.json(
      { message: "Blog created", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

// Edit an existing blog post
export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const readTime = formData.get("readTime") as string;
    const category = (formData.get("category") as string) || "uncategorized";
    const file = formData.get("imageFile") as File | null;

    const existingBlog = await prisma.blog.findUnique({ where: { id } });
    if (!existingBlog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    let imageUrl = existingBlog.image || "";

    // Check if a new image is provided
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error(`Supabase Upload Error: ${uploadError.message}`);
      }

      const { data } = supabaseClient.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
          throw new Error("Could not get public URL for the uploaded image.");
      }
      imageUrl = data.publicUrl;
    }

    // Update the blog post in Prisma
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        category,
        excerpt,
        content,
        readTime,
        image: imageUrl,
      },
    });

    return NextResponse.json({
      message: "Blog updated",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// Delete a blog post
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Remove image from Supabase if it exists
    if (blog.image) {
        // Correctly extract the path from the full URL
        const urlParts = blog.image.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('blog-images')).join('/');
        
        if (filePath) {
             await supabaseClient.storage.from("blog-images").remove([filePath]);
        }
    }

    // Delete blog post from database
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
