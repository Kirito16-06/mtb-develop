import { Metadata } from "next";
import ClientBlogPage from "./BlogData";
import { BlogPost } from "@/types/client/blog";
import axios from "axios";

type PageProps = {
  params: Promise<{ blogname: string }>;
};

const fetchBlog = async (id: string): Promise<BlogPost> => {
  // Use a full URL with the base URL of your API
  const baseUrl = process.env.NEXT_URL;
  const res = await axios.get(`${baseUrl}/api/blogs/getParticularBlog/${id}`);
  return res.data;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { blogname } = await params;
  const id = blogname.includes("-") ? blogname.split("-")[0] : null;
  const baseUrl = process.env.NEXT_URL || "https://www.mythrivebuddy.com";

  if (!id) {
    // Old URLs are handled by next.config.js redirects
    return {
      title: "Blog Not Found - MyThriveBuddy",
      description: "The requested blog post could not be found.",
    };
  }

  try {
    const blog = await fetchBlog(id);
    return {
      title: `${blog.title} - MyThriveBuddy`,
      description: blog.excerpt,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `${baseUrl}/blog/${blogname}`,
        siteName: "MyThriveBuddy",
        images: [
          {
            url: blog.image,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: "en_US",
        type: "article",
        publishedTime: blog.date,
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
        images: [blog.image],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Not Found - MyThriveBuddy",
      description: "The requested blog post could not be found.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  try {
    const { blogname } = await params; 
    const id = blogname.split("-")[0];  
    const blog = await fetchBlog(id); 
    return <ClientBlogPage blog={blog} />;
  } catch (error) {
    return (
      <div className="text-center text-2xl text-red-500 p-10">
        Error loading blog:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}