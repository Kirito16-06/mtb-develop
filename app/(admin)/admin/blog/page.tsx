"use client";

import { Pagination } from "@/components/ui/pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmAction from "@/components/ConfirmAction";
import { BlogResponse } from "@/types/client/blog";


// Custom debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function BlogPost() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 6;

  const { data, isLoading, error } = useQuery<BlogResponse, Error>({
    queryKey: ["blogs", page, debouncedSearchTerm, selectedCategory],
    queryFn: async () => {
      const response = await axios.get(
        `/api/blogs/getBlogs?page=${page}&limit=${limit}&search=${debouncedSearchTerm}&category=${selectedCategory}`
      );
      return response.data;
    },
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery<string[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get("/api/blogs/getCategories");
      return response.data.categories;
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: string) => {
      await axios.delete(`/api/admin/blogs?id=${blogId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error) => {
      console.error("Error deleting blog:", error);
    },
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Blog Management</h2>

      <div className="mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => router.push("/admin/blog/new")}
        >
          Create New Blog
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          {isCategoriesLoading ? (
            <select className="px-4 py-2 border rounded-lg">
              <option>Loading...</option>
            </select>
          ) : categoriesError ? (
            <select className="px-4 py-2 border rounded-lg">
              <option>Error loading categories</option>
            </select>
          ) : (
            <select
              className="px-4 py-2 border rounded-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div>Loading blogs...</div>
      ) : error ? (
        <div>Error loading blogs: {error.message}</div>
      ) : data?.blogs.length === 0 ? (
        <div>No blogs found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Card>
              <CardContent>
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {data?.blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="px-6 py-4">
                          {blog.title}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {blog.category}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {format(
                            new Date(blog.createdAt),
                            "MMM d, yyyy hh:mm a"
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 flex gap-2">
                          <button
                            className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                            onClick={() =>
                              router.push(`/admin/blog/${blog.id}`)
                            }
                          >
                            Edit
                          </button>
                          <ConfirmAction
                            action={() => deleteBlogMutation.mutate(blog.id)}
                            title="Delete Blog"
                            description="Are you sure you want to delete this blog?"
                            confirmText="Delete"
                            isDisabled={deleteBlogMutation.isPending}
                          >
                            <button
                              className="px-2 py-1 text-sm rounded-full bg-red-100 text-red-800"
                              // onClick={() => deleteBlogMutation.mutate(blog.id)}
                              disabled={deleteBlogMutation.isPending}
                            >
                              Delete
                            </button>
                          </ConfirmAction>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
