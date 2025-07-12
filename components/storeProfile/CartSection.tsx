import React from "react";
import { ShoppingCart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Item, CartItem } from "@/types/client/store";
import Image from "next/image";

interface CartSectionProps {
  cart: CartItem[];
  getPriceForMembership: (item: Item) => number | null;
  handleRemoveFromCart: (id: string) => void;
  calculateTotal: () => number;
  handleBuyAll: () => Promise<void>;
  purchasingItemId: string | null;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  getPriceForMembership,
  handleRemoveFromCart,
  calculateTotal,
  handleBuyAll,
  purchasingItemId,
}) => {
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const response = await axios.put(
        "/api/user/store/items/cart/update-item-quantity",
        { cartItemId, quantity },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
      toast.success("Quantity updated successfully!");
    },
    onError: (error) => {
      console.error("Quantity update error:", error);
      toast.error("Failed to update quantity.");
    },
  });

  // const removeFromCartMutation = useMutation({
  //   mutationFn: async (cartItemId: string) => {
  //     await axios.delete("/api/user/store/items/cart/delete-cart-items", { 
  //       data: { cartItemId }
  //     });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["profileData"] });
  //     toast.success("Item removed from cart!");
  //   },
  //   onError: () => {
  //     toast.error("Error removing item from cart.");
  //   },
  // });

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      if (window.confirm("Quantity will be 0. Remove item from cart?")) {
        handleRemoveFromCart(cartItemId);
      }
      return;
    }
    updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity });
  };

  // Debug log to verify cart data
  console.log("Cart items:", cart);

  if (!cart || !Array.isArray(cart) || cart.some((item) => !item.item)) {
    return <p className="text-gray-500">Cart data is unavailable.</p>;
  }

  return (
    <div className="bg-white shadow rounded-xl p-6 col-span-2">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
        My Cart
      </h3>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((cartItem) => {
              const price = getPriceForMembership(cartItem.item);
              return (
                <li
                  key={cartItem.id}
                  className="flex justify-between items-center border-b pb-4"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={cartItem.item.imageUrl}
                      alt={cartItem.item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">{cartItem.item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">
                          ₹{(price ?? cartItem.item.basePrice).toFixed(2)}
                        </span>
                        {price !== cartItem.item.basePrice && (
                          <span className="text-gray-500 line-through text-sm">
                            ₹{cartItem.item.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {cartItem.item.category?.name || "Unknown Category"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded cursor-pointer"
                        onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        -
                      </button>
                      <span className="text-gray-800 font-semibold">{cartItem.quantity}</span>
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded cursor-pointer"
                        onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-green-600 font-semibold">
                      ₹{((price ?? cartItem.item.basePrice) * cartItem.quantity).toFixed(2)}
                    </span>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer"
                      onClick={() => handleRemoveFromCart(cartItem.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 text-xl font-bold text-right">
            Total Amount: ₹{calculateTotal().toFixed(2)}
          </div>

          <div className="flex justify-end">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold mt-4 cursor-pointer disabled:bg-gray-400"
              onClick={handleBuyAll}
              disabled={purchasingItemId !== null}
            >
              {purchasingItemId ? "Processing..." : "Buy All"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSection;