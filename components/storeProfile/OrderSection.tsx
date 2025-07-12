import React from "react";
import { Star } from "lucide-react";
import { Order, Item } from "@/types/client/store";
import Image from "next/image";

interface OrdersSectionProps {
  orders: Order[];
  getPriceForMembership: (item: Item) => number | null;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ orders}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600";
      case "shipped":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "pending":
        return "text-orange-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Debugging: Log orders to inspect the data
  console.log("Orders data in OrderSection:", orders);

  return (
    <div className="bg-white shadow rounded-xl p-6 col-span-2">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-500" />
        My Orders
      </h3>
      {!orders || orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: {order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ordered: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </p>
                  <p className="text-green-600 font-semibold">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.items.map((orderItem) => (
                  <div key={orderItem.id} className="flex items-center space-x-4">
                    <Image
                      src={orderItem.item.imageUrl}
                      alt={orderItem.item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="text-gray-800 font-semibold">{orderItem.item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {orderItem.item.category.name} • Qty: {orderItem.quantity}
                      </p>
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">
                          ₹{orderItem.priceAtPurchase.toFixed(2)}
                        </span>
                        {orderItem.priceAtPurchase !== orderItem.item.basePrice && (
                          <span className="text-gray-500 line-through ml-2">
                            ₹{orderItem.item.basePrice.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersSection;