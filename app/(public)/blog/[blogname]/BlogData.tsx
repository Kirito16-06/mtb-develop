// app/(public)/blog/[blogname]/ClientBlogPage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { ClientBlogPageProps } from "@/types/client/blog";


export default function ClientBlogPage({ blog }: ClientBlogPageProps) {
  return (
    <AppLayout>
      <div className="p-8 m-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-5">{blog.title}</h1>
        <div className="relative w-full aspect-[16/5] mb-6 rounded-lg overflow-hidden">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex justify-between text-gray-500 text-base my-5">
          <span className="italic">Read time: {blog.readTime}</span>
        </div>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
      <div>
        <p>Ready to transform your solopreneurship journey?</p>
        <br />
        <p>
          <Link href={"/signin"}>
            <span className="font-bold">Join MyThriveBuddy today</span>
          </Link>{" "}
          and be part of a supportive ecosystem that empowers solopreneurs to
          thrive, grow, and succeed. Together, we&apos;re building a future
          where solopreneurship is not just a career choice but a fulfilling and
          joyful way of life.
        </p>
      </div>
    </AppLayout>
  );
}
