"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/PageLoader";
import { getAxiosErrorMessage } from "@/utils/ax";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Category } from "@/types/client/manage-store-product";
import { Item, WishlistItem } from "@/types/client/store";
import Image from "next/image";


const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get("/api/user/store/items/get-categories");
  return res.data.categories;
};

const fetchUserMembership = async (): Promise<string> => {
  const res = await axios.get("/api/user/store/profile");
  return res.data.user?.membership || "FREE";
};

const fetchAllItems = async (): Promise<Item[]> => {
  const res = await axios.get("/api/user/store/items/get-all-items");
  return res.data.items || [];
};

const fetchItemsByCategory = async (categoryId: string): Promise<Item[]> => {
  const res = await axios.get(
    `/api/user/store/items/get-items-by-category?category=${categoryId}`
  );
  return res.data.items || [];
};

const fetchWishlist = async (): Promise<WishlistItem[]> => {
  const res = await axios.get("/api/user/store/items/wishlist");
  return res.data.wishlist || [];
};

const StorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: membership = "FREE", isLoading: membershipLoading } = useQuery({
    queryKey: ["membership"],
    queryFn: fetchUserMembership,
  });
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
  });
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items", selectedCategory],
    queryFn: () =>
      selectedCategory
        ? fetchItemsByCategory(selectedCategory)
        : fetchAllItems(),
    placeholderData: (prev) => prev,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (
        wishlist.some((item) => item.itemId === itemId || item.id === itemId)
      ) {
        await axios.delete("/api/user/store/items/wishlist", {
          data: { itemId },
        });
        toast.info("Removed from wishlist");
      } else {
        await axios.post("/api/user/store/items/wishlist", { itemId });
        toast.success("Added to wishlist");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const addToCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await axios.post(
        "/api/user/store/items/cart/add-cart-items",
        { itemId }
      );
      console.log("response", response);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Item added to cart");
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(
        getAxiosErrorMessage(error, "Something went wrong! Please try again.")
      );
    },
  });

  const getPriceForMembership = (item: Item): number => {
    switch (membership) {
      case "MONTHLY":
        return item.monthlyPrice;
      case "YEARLY":
        return item.yearlyPrice;
      case "LIFETIME":
        return item.lifetimePrice;
      default:
        return item.basePrice;
    }
  };

  const handleBuyNow = (itemId: string) => {
    router.push(`/dashboard/store/checkout?cartItem=${itemId}:1`);
  };

  if (
    categoriesLoading ||
    membershipLoading ||
    wishlistLoading ||
    itemsLoading
  ) {
    return <PageLoader />;
  }

  const bannerImages = [
    "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/544c2e1eca31c88c.jpg?q=20",
    "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/bb6f2a5b16b4c4f9.jpg?q=20",
    "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/1558a721300c7f6d.jpg?q=20",
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">🛍 Store</h1>
            <Link
              href="/dashboard/store/profile"
              className="bg-jp-orange text-white font-bold text-sm rounded-full px-4 py-3 hover:bg-red-600"
            >
              My Cart & Orders
            </Link>
          </div>

            <Carousel
              className="w-full mx-auto mb-6"
              opts={{
                align: "start",
                loop: true,
              }}
              autoplay={true} 
            >
              <CarouselContent>
                {bannerImages.map((url, index) => (
                  <CarouselItem key={index} className="basis-full">
                    <Image
                      src={url}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-[200px] object-cover rounded-lg shadow-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`bg-jp-orange text-white font-bold text-sm rounded-full px-4 py-3 hover:bg-red-600 ${
                selectedCategory === null ? "opacity-90" : ""
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`bg-jp-orange text-white font-bold text-sm rounded-full px-4 py-3 hover:bg-red-600 ${
                  selectedCategory === cat.id ? "opacity-90" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
            {selectedCategory
              ? `${
                  categories.find((c) => c.id === selectedCategory)?.name ||
                  "Selected"
                } Items`
              : "All Products"}
          </h2>

          {items.length === 0 ? (
            <p className="text-center text-gray-600">No items available.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-lg rounded-xl p-4 hover:shadow-2xl transition-shadow relative"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => toggleWishlistMutation.mutate(item.id)}
                      className="cursor-pointer"
                    >
                      <Heart
                        className={
                          wishlist.some((w) => w.itemId === item.id)
                            ? "text-red-500 w-6 h-6 fill-red-500"
                            : "text-gray-500 w-6 h-6"
                        }
                      />
                    </button>
                  </div>
                  <p className="text-sm text-blue-500 font-medium mb-2">
                    {item.category.name}
                  </p>
                  <div className="flex flex-col items-start mb-4">
                    {membership !== "FREE" && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.basePrice}
                      </span>
                    )}
                    <span className="text-lg font-bold text-green-600">
                      ${getPriceForMembership(item)}
                    </span>
                  </div>
                  <div className="flex gap-6">
                    <Button
                      className="flex-1 text-white font-bold text-sm rounded-full px-1 py-6 w-full"
                      onClick={() => addToCartMutation.mutate(item.id)}
                    >
                      <PlusCircle className="w-4 h-4 mr-1 inline" /> Add to Cart
                    </Button>
                    <button
                      className="flex-1 bg-jp-orange text-white font-bold text-sm rounded-full px-1 py-3 hover:bg-red-600 w-full"
                      onClick={() => handleBuyNow(item.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1 inline" /> Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePage;