"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";
import { Item, ItemFormData, Category } from "@/types/client/manage-store-product";
import PageSkeleton from "@/components/PageSkeleton";


export default function ProductManagement() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    category: "",
    basePrice: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    lifetimePrice: 0,
  });
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<Item[], Error>({
    queryKey: ["items"],
    queryFn: async (): Promise<Item[]> => {
      const response = await axios.get<{ items: Item[] }>("/api/admin/store/items");
      return response.data.items;
    },
  });

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery<Category[], Error>({
    queryKey: ["item-categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await axios.get<{ categories: Category[] }>("/api/admin/store/items/categories");
      return response.data.categories;
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load items: ${error.message}`);
    }
    if (categoriesError) {
      toast.error(`Failed to load categories: ${categoriesError.message}`);
    }
  }, [error, categoriesError]);

  const createMutation = useMutation({
    mutationFn: async (newItem: ItemFormData) => {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("basePrice", newItem.basePrice.toString());
      formData.append("monthlyPrice", newItem.monthlyPrice.toString());
      formData.append("yearlyPrice", newItem.yearlyPrice.toString());
      formData.append("lifetimePrice", newItem.lifetimePrice.toString());
      if (newItem.imageFile) {
        formData.append("image", newItem.imageFile);
      }
      if (newItem.downloadFile) {
        formData.append("download", newItem.downloadFile);
      }
      return axios.post("/api/admin/store/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setModalOpen(false);
      resetForm();
      toast.success("Item created successfully!");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Failed to create item."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ItemFormData }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("basePrice", data.basePrice.toString());
      formData.append("monthlyPrice", data.monthlyPrice.toString());
      formData.append("yearlyPrice", data.yearlyPrice.toString());
      formData.append("lifetimePrice", data.lifetimePrice.toString());
      if (data.imageFile) {
        formData.append("image", data.imageFile);
      }
      if (data.downloadFile) {
        formData.append("download", data.downloadFile);
      }
      return axios.put(`/api/admin/store/items/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setModalOpen(false);
      setEditingItem(null);
      resetForm();
      toast.success("Item updated successfully!");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Failed to update item."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/admin/store/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted successfully!");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Failed to delete item."));
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      const response = await axios.post("/api/admin/store/items/categories", {
        name: category,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      setCategoryModalOpen(false);
      setNewCategory("");
      setFormData((prev) => ({
        ...prev,
        category: data.category.id, // Set new category ID in form
      }));
      toast.success("Category created successfully!");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Failed to create category."));
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      basePrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      lifetimePrice: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      createCategoryMutation.mutate(newCategory.trim());
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      basePrice: item.basePrice,
      monthlyPrice: item.monthlyPrice,
      yearlyPrice: item.yearlyPrice,
      lifetimePrice: item.lifetimePrice,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  // Type assertions for the data
  const typedItems = items as Item[];
  const typedCategories = categories as Category[];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Product Management</h2>

      <div className="mb-6 flex gap-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          Add New Product
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => setCategoryModalOpen(true)}
        >
          Add New Category
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Item" : "Create New Item"}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {typedCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="px-3 py-2 bg-gray-200 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Base Price</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Monthly Price
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Yearly Price</label>
                <input
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearlyPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Lifetime Price
                </label>
                <input
                  type="number"
                  value={formData.lifetimePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifetimePrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageFile: e.target.files?.[0] || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingItem}
                />
                {editingItem && (
                  <p className="text-sm text-gray-500">
                    Current: {editingItem.imageUrl}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Download File
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloadFile: e.target.files?.[0] || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {editingItem && editingItem.downloadUrl && (
                  <p className="text-sm text-gray-500">
                    Current: {editingItem.downloadUrl}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingItem
                  ? updateMutation.isPending
                    ? "Updating..."
                    : "Update Item"
                  : createMutation.isPending
                    ? "Creating..."
                    : "Create Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Category</h3>
              <button
                onClick={() => {
                  setCategoryModalOpen(false);
                  setNewCategory("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border rounded-lg"
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
            <select className="px-4 py-2 border rounded-lg">
              <option value="">All Categories</option>
              {typedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton type="manage-store-product" />
      ) : error ? (
        <div>Error loading items: {error.message}</div>
      ) : typedItems.length === 0 ? (
        <div>No items found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yearly Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lifetime Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {typedItems.map((item) => {
                const category = typedCategories.find(
                  (cat) => cat.id === item.category
                );
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">
                      {category ? category.name : "Unknown"}
                    </td>
                    <td className="px-6 py-4">${item.basePrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      ${item.monthlyPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">${item.yearlyPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      ${item.lifetimePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={deleteMutation.isPending}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending &&
                          deleteMutation.variables === item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}