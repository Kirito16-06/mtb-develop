import { Metadata } from "next";
import BlogHero from "@/components/blog/BlogHero";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Blog - MyThriveBuddy",
  description: "Latest insights and stories from our community of solopreneurs",
  openGraph: {
    title: "Blog - MyThriveBuddy",
    description:
      "Latest insights and stories from our community of solopreneurs",
    url: "https://mythrivebuddy.com/blog",
    siteName: "MyThriveBuddy",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MyThriveBuddy Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - MyThriveBuddy",
    description:
      "Latest insights and stories from our community of solopreneurs",
    images: ["/logo.png"],
  },
};

export default function BlogPage() {
  return (
    // <main className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#F8F2FF] to-[#FF69B4] py-4 sm:py-6 md:py-8 px-4">
    //   <div className="max-w-[1280px] mx-auto">
    //     <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-4 sm:p-6 md:p-8">
    //       <Navbar />
    <AppLayout>
      <div className="mt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1E2875] mb-4">Our Blog</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover insights, stories, and tips from successful solopreneurs in
            our community
          </p>
        </div>
        <BlogHero />
      </div>
    </AppLayout>
    //     </div>
    //   </div>
    // </main>
  );
}
