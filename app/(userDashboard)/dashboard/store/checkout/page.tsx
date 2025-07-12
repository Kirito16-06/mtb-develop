"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import { getAxiosErrorMessage } from "@/utils/ax";
import PaymentModal from "@/components/PaymentModal";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Item, User } from "@/types/client/store";
import Image from "next/image";

// Interfaces

// Mock user data
const mockUser: User = {
  id: "1",
  name: "Vipin Pawar",
  phone: "+918839087148",
  address: {
    street: "H no.15 Atal chouraha shyam nagar, Berkheda pathani Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462022",
  },
};

const CheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItems = searchParams.getAll("cartItem");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Parse cart items from query parameters
  const parsedCartItems = cartItems.map(item => {
    const [itemId, quantity] = item.split(":");
    return { itemId, quantity: parseInt(quantity) };
  });

  // Fetch all items details
  const { data: items, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items", cartItems],
    queryFn: async () => {
      const itemsPromises = parsedCartItems.map(async ({ itemId }) => {
        const res = await axios.get(`/api/user/store/items/get-item?itemId=${itemId}`);
        return res.data.item as Item;
      });
      return Promise.all(itemsPromises);
    },
    enabled: cartItems.length > 0,
  });

  // Simulate out of stock (10% chance)
  const isOutOfStock = React.useMemo(() => Math.random() < 0.1, []);

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/user/store/items/place-order", {
        items: parsedCartItems.map(({ itemId, quantity }) => ({
          itemId,
          quantity,
        })),
      });
    },
    onSuccess: () => {
      toast.success("Order placed successfully!");
      router.push("/dashboard/store/profile");
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to place order"));
    },
  });

  const handlePaymentSuccess = async () => {
    await placeOrderMutation.mutateAsync();
  };

  if (isItemsLoading) {
    return <PageLoader />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">No items found</h1>
        <Link href="/dashboard/store" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Store
        </Link>
      </div>
    );
  }

  // Calculate total amount in INR using only base price
  const totalAmount = items.reduce((total, item, index) => {
    const quantity = parsedCartItems[index].quantity;
    return total + (item.basePrice * quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mb-3 mt-3">
        <Link href="/dashboard/store" className="bg-jp-orange text-white font-bold text-sm rounded-full px-4 py-3 hover:bg-red-600">
          Back to Store
        </Link>
      </div>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Login Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold">1. LOGIN ✓</h2>
                  <p className="text-gray-600">{mockUser.name} {mockUser.phone}</p>
                </div>
                <button className="text-blue-600 font-medium">CHANGE</button>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold">2. DELIVERY ADDRESS ✓</h2>
                  <p className="text-gray-600">
                    {mockUser.name} {mockUser.address.street}, {mockUser.address.city}, {mockUser.address.state} - {mockUser.address.pincode}
                  </p>
                </div>
                <button className="text-blue-600 font-medium">CHANGE</button>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold mb-4">3. ORDER SUMMARY</h2>
              
              {isOutOfStock ? (
                <div className="text-red-500 p-4 bg-red-50 rounded mb-4">
                  <p>Some items have become Out of Stock:</p>
                  {items.map((item) => (
                    <p key={item.id} className="font-medium">{item.name}</p>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <Image src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Pack of 1, {item.category.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold">${item.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 text-center">Qty: {parsedCartItems[index].quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow sticky top-4">
              <h2 className="text-gray-500 font-medium mb-4">PRICE DETAILS</h2>
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span>Price ({parsedCartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>
              <div className="flex justify-between font-bold py-4">
                <span>Total Payable</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-2 text-gray-600 text-sm">
                  <Shield className="w-5 h-5 flex-shrink-0 text-gray-400" />
                  <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                </div>
                <p className="text-xs text-gray-500">
                  By continuing with the order, you confirm that you are above 18 years of age, and you agree to the My Thrive Buddy{" "}
                  <Link href="#" className="text-blue-600">Terms of Use</Link> and{" "}
                  <Link href="#" className="text-blue-600">Privacy Policy</Link>
                </p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={isOutOfStock || placeOrderMutation.isPending}
                  className={`w-full py-4 text-white font-bold rounded-lg ${
                    isOutOfStock || placeOrderMutation.isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#fb641b] hover:bg-[#fb641b]/90"
                  }`}
                >
                  {placeOrderMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <PageLoader /> Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PayPalScriptProvider options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      }}>
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          totalAmount={totalAmount}
          itemName={items.map(item => item.name).join(", ")}
          quantity={parsedCartItems.reduce((sum, item) => sum + item.quantity, 0)}
          isLoading={placeOrderMutation.isPending}
        />
      </PayPalScriptProvider>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<PageLoader />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
};

export default CheckoutPage;