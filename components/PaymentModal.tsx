import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/components/PageLoader';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalAmount: number;
  itemName: string;
  quantity: number;
  isLoading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  totalAmount,
  itemName,
  quantity,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!clientId) {
    console.error('PayPal client ID is not configured');
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

        {/* Order Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-lg mb-2">{itemName}</p>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* PayPal Button */}
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <PageLoader />
          </div>
        ) : (
          <PayPalScriptProvider options={{ 
            clientId: clientId,
            currency: "USD",
            intent: "capture"
          }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: totalAmount.toFixed(2),
                        breakdown: {
                          item_total: {
                            currency_code: "USD",
                            value: totalAmount.toFixed(2)
                          }
                        }
                      },
                      items: [{
                        name: itemName,
                        quantity: quantity.toString(),
                        unit_amount: {
                          currency_code: "USD",
                          value: (totalAmount / quantity).toFixed(2)
                        }
                      }]
                    }
                  ]
                });
              }}
              onApprove={async (data, actions) => {
                if (!actions.order) {
                  toast.error('Payment failed: Order object is missing');
                  return;
                }
                
                try {
                  const captureResult = await actions.order.capture();
                  console.log('Payment captured:', captureResult);

                  const verifyResponse = await fetch('/api/payments/paypal/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      orderId: data.orderID,
                      paymentId: captureResult.id
                    })
                  });

                  if (!verifyResponse.ok) {
                    const errorData = await verifyResponse.json();
                    throw new Error(errorData.message || 'Payment verification failed');
                  }

                  const verificationResult = await verifyResponse.json();
                  if (verificationResult.success) {
                    onSuccess();
                    toast.success('Payment successful!');
                  } else {
                    throw new Error(verificationResult.message || 'Payment verification failed');
                  }
                } catch (error) {
                  console.error('Payment error:', error);
                  toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                toast.error('Payment failed. Please try again.');
              }}
              onCancel={() => {
                toast.error('Payment cancelled.');
              }}
            />
          </PayPalScriptProvider>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 text-center"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal; 