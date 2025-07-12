"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Editor } from "@tinymce/tinymce-react";
import { BlogFormProps } from "@/types/client/blog";
import Image from "next/image";


export default function BlogForm({
  blogId,
  onSuccess,
  blogString,
}: BlogFormProps) {
  const isEdit = !!blogId;
  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [readTime, setReadTime] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch categories for the select dropdown
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

  // Fetch blog data if editing
  const { data: blogData } = useQuery({
    queryKey: ["blog", blogString],
    queryFn: async () => {
      const response = await axios.get(
        `/api/blogs/getParticularBlog/${blogString}`
      );
      return response.data;
    },
    enabled: isEdit,
  });

  // Populate form with existing blog data when editing
  useEffect(() => {
    if (blogData) {
      setTitle(blogData.title);
      setExcerpt(blogData.excerpt);
      setContent(blogData.content);
      setReadTime(blogData.readTime);
      setCategory(blogData.category);
      setPreviewImage(blogData.image);
    }
  }, [blogData]);

  // Mutation for creating or updating a blog post
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const url = isEdit ? `/api/admin/blogs?id=${blogId}` : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      // toast.success(
      //   isEdit
      //     ? "Blog post updated successfully!"
      //     : "Blog post created successfully!"
      // );
      onSuccess();
    },
    onError: () => {
      toast.error(
        isEdit ? "Error updating blog post" : "Error creating blog post"
      );
    },
  });

  // Handle image file selection and preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("readTime", readTime);
    formData.append("category", newCategory.trim() ? newCategory : category);
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        required
        className="border p-2 rounded"
      />

      {isCategoriesLoading ? (
        <select className="border p-2 rounded">
          <option>Loading...</option>
        </select>
      ) : categoriesError ? (
        <select className="border p-2 rounded">
          <option>Error loading categories</option>
        </select>
      ) : (
        <>
          <select
            className="border p-2 rounded"
            value={category}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
            disabled={!!newCategory.trim()}
            required={!newCategory.trim()}
          >
            <option value="">Select Category</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Or add a new category"
            value={newCategory}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewCategory(e.target.value)
            }
            className="border p-2 rounded"
          />
        </>
      )}

      <textarea
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setExcerpt(e.target.value)
        }
        required
        className="border p-2 rounded"
      />
      <Editor
        value={content}
        onEditorChange={(content) => setContent(content)}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`}
        init={{
          height: 500,
          menubar: false,
          plugins: "link image media table code fullscreen",
          toolbar:
            "code | fontsize | bold italic underline strikethrough superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent | link image media | table | fullscreen | undo redo",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />

      <input
        type="text"
        placeholder="Read Time (e.g., 5 min read)"
        value={readTime}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setReadTime(e.target.value)
        }
        required
        className="border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />
      {previewImage && isEdit && (
        <div className="mt-4">
          <Image src={previewImage} alt="Preview" className="w-40 h-auto" />
        </div>
      )}
      <button type="submit" className="bg-blue-600 text-white rounded p-2">
        {isEdit ? "Update Blog Post" : "Create Blog Post"}
      </button>
    </form>
  );
}
