import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";


export default function CreateProductCategory({ onSuccess }: { onSuccess: () => void }) {
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isPending } = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const response = await axios.post("/api/admin/store/create-category", {
        category,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Create Product Category</h2>
      <div className="space-y-2">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || isPending}
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {isLoading || isPending ? "Creating..." : "Create Category"}
      </button>
    </div>
  );
}
                    