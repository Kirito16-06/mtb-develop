"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import BlogCard from "./BlogCard";
import Skeleton from "../Skeleton";
import { BlogResponse } from "@/types/client/blog";


const BlogHero: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const postsPerPage = 12;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  const { data: categories = ["All"], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get<{ categories: string[] }>(
        "/api/blogs/getCategories"
      );
      return ["All", ...res.data.categories];
    },
  });

  // Infinite query (for Load More)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<BlogResponse>({
    queryKey: ["blogs", selectedCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const catQ =
        selectedCategory !== "All"
          ? `&category=${encodeURIComponent(selectedCategory)}`
          : "";
      const res = await axios.get<BlogResponse>(
        `/api/blogs/getBlogs?page=${pageParam}&limit=${postsPerPage}${catQ}`
      );
      return res.data;
    },
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
  });

  const allPosts = data?.pages.flatMap((p) => p.blogs) || [];

  const renderSkeletons = () =>
    Array(postsPerPage)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-48">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-6">
            <Skeleton className="h-7 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ));

  // optional: horizontal scroll for categories
  const scrollBy = (delta: number) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += delta;
  };

  return (
    <div>
      {/* Category Carousel */}
      <div className="relative w-full mb-4">
        <button
          onClick={() => scrollBy(-300)}
          className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronLeft />
        </button>
        <div
          ref={scrollRef}
          className="no-scrollbar flex overflow-x-auto whitespace-nowrap space-x-3 py-2 px-10"
        >
          {catLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => scrollBy(300)}
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? renderSkeletons()
          : allPosts.map((post) => <BlogCard key={post.id} {...post} />)}
      </div>

      {/* Load More Button */}
      {hasNextPage && !isLoading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center mt-6 text-red-500">
          Error fetching blogs. Please try again later.
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default BlogHero;
