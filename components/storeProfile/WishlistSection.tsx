import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Item, WishlistItem } from "@/types/client/store";
import { useAddToCartMutation, useRemoveFromWishlistMutation } from "@/hooks/useAddToCart";
import Image from "next/image";

interface WishlistSectionProps {
  wishlist: WishlistItem[];
  getPriceForMembership: (item: Item) => number | null;
  handleAddToCart: (itemId: string) => void;
}


const WishlistSection: React.FC<WishlistSectionProps> = ({
  wishlist,
  getPriceForMembership,
}) => {
  const addToCartMutation = useAddToCartMutation();
  const removeFromWishlistMutation = useRemoveFromWishlistMutation();

  const handleAddToCart = (itemId: string) => {
    addToCartMutation.mutate(itemId, {
      onSuccess: () => {
        // Remove from wishlist after adding to cart
        removeFromWishlistMutation.mutate(itemId);
      },
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl col-span-2">
      {/* Header */}
      <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
        <Heart className="w-6 h-6 mr-3 text-pink-500" />
        My Wishlist
      </h3>

      {/* Wishlist Content */}
      {!wishlist || wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty.</p>
          <Link
            href="/dashboard/store"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Store
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {wishlist.map((wishlistItem) => {
            if (!wishlistItem.item) return null;
            const item = wishlistItem.item;
            const price = getPriceForMembership(item);
            return (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {/* Item Info */}
                <div className="flex items-center gap-4">
                  <Image
                    src={item.imageUrl || '/placeholder-image.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">
                        ₹{price?.toFixed(2) ?? item.basePrice.toFixed(2)}
                      </span>
                      {price !== item.basePrice && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹{item.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.category && (
                      <p className="text-sm text-gray-500">{item.category.name}</p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-200 sm:w-auto w-full"
                  onClick={() => handleAddToCart(item.id)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WishlistSection;