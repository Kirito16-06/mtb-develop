"use client";
import React, { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import OrderSection from "@/components/storeProfile/OrderSection";
import CartSection from "@/components/storeProfile/CartSection";
import WishlistSection from "@/components/storeProfile/WishlistSection";
import { Item, Order, CartItem, WishlistItem } from "@/types/client/store";
import { getAxiosErrorMessage } from "@/utils/ax";

interface User {
  id: string;
  name: string;
  email: string;
  membership: "FREE" | "MONTHLY" | "YEARLY" | "LIFETIME";
}

function ProfilePage() {
  const [purchasingItemId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const fetchProfileData = async () => {
    const [profileRes, ordersRes, wishlistRes, cartRes] = await Promise.allSettled([
      axios.get("/api/user/store/profile"),
      axios.get("/api/user/store/items/orders"),
      axios.get("/api/user/store/items/wishlist"),
      axios.get("/api/user/store/items/cart/get-cart-items"),
    ]);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getDataFromSettledPromise = (result: PromiseSettledResult<AxiosResponse<any,any>>, defaultValue: any, endpoint: string) => {
      if (result.status === "fulfilled") {
        return result.value.data;
      }
      console.error(`Failed to fetch from ${endpoint}:`, result);
      return defaultValue;
    };

    const data = {
      user: getDataFromSettledPromise(profileRes, { user: {} }, "/api/user/store/profile"),
      orders: getDataFromSettledPromise(ordersRes, { orders: [] }, "/api/user/store/items/orders"),
      wishlist: getDataFromSettledPromise(wishlistRes, { wishlist: [] }, "/api/user/store/items/wishlist"),
      cart: getDataFromSettledPromise(cartRes, { cart: [] }, "/api/user/store/items/cart/get-cart-items"),
    };

    console.log("Fetched profile data:", data);
    return data;
  };

  const { data, isLoading } = useQuery({ queryKey: ["profileData"], queryFn: fetchProfileData });
  const user = data?.user.user as User;
  const orders = data?.orders?.orders as Order[] || [];
  const wishlist = (Array.isArray(data?.wishlist.wishlist) ? data.wishlist.wishlist : []) as WishlistItem[];
  const cart = data?.cart.cart as CartItem[] || [];

  const getPriceForMembership = (item: Item): number | null => {
    if (!item) return null;
    const price = (() => {
      switch (user?.membership) {
        case "MONTHLY":
          return item.monthlyPrice ?? item.basePrice;
        case "YEARLY":
          return item.yearlyPrice ?? item.basePrice;
        case "LIFETIME":
          return item.lifetimePrice ?? item.basePrice;
        default:
          return item.basePrice;
      }
    })();
    return price;
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, cartItem: CartItem) => {
      const price = getPriceForMembership(cartItem.item);
      return total + (price ?? cartItem.item.basePrice) * cartItem.quantity;
    }, 0);
  };

  const addToCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await axios.post("/api/user/store/items/cart/add-cart-items", { itemId });
      await axios.delete("/api/user/store/items/wishlist", { data: { itemId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      toast.success("Item added to cart!");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Error adding item to cart."));
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      await axios.delete("/api/user/store/items/cart/delete-cart-items", { data: { cartItemId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      toast.success("Item removed from cart!");
    },
    onError: () => {
      toast.error("Error removing item from cart.");
    },
  });

  const handleBuyAll = async () => {
    if (cart.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }
    const cartItemsQuery = cart.map((cartItem: CartItem) => `cartItem=${cartItem.item.id}:${cartItem.quantity}`).join("&");
    router.push(`/dashboard/store/checkout?${cartItemsQuery}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-4">
        <Link href="/dashboard/store" className="bg-jp-orange text-white font-bold text-sm rounded-full px-4 py-3 hover:bg-red-600">
          Back to Store
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
  <WishlistSection wishlist={wishlist} getPriceForMembership={getPriceForMembership} handleAddToCart={addToCartMutation.mutate} />
  <CartSection
    cart={cart}
    getPriceForMembership={getPriceForMembership}
    handleRemoveFromCart={removeFromCartMutation.mutate}
    calculateTotal={calculateTotal}
    handleBuyAll={handleBuyAll}
    purchasingItemId={purchasingItemId}
  />
  <OrderSection orders={orders} getPriceForMembership={getPriceForMembership} />
</div>
    </div>
  );
}

export default ProfilePage;