import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await axios.post("/api/user/store/items/cart/add-cart-items", {
        itemId,
        wasInWishlist: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      toast.success("Item added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error adding item to cart.");
    },
  });
};

export const useRemoveFromWishlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await axios.delete("/api/user/store/items/wishlist", { data: { itemId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error removing from wishlist.");
    },
  });
}; 