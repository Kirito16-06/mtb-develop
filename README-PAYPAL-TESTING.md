# Testing PayPal Integration in Development

This guide explains how to test the PayPal subscription payment flow in a development environment.

## Prerequisites

1. Make sure your `.env.local` file contains the PayPal Sandbox credentials:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID='YOUR_SANDBOX_CLIENT_ID'
PAYPAL_CLIENT_SECRET='YOUR_SANDBOX_SECRET_KEY'
PAYPAL_MODE='https://sandbox.paypal.com'
```

2. Ensure your application is running (`npm run dev` or equivalent)

## PayPal Sandbox Testing

### Creating a Sandbox Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Sign in with your PayPal account (or create one)
3. Navigate to "Sandbox" > "Accounts" 
4. You should see test accounts (if not, create a new Business account and a Personal account)

### Test Buyers (Personal Account)

Use these credentials to simulate a buyer making a payment:

- Email: `sb-buyer@example.com` (use the email from your sandbox personal account)
- Password: The password you set for the sandbox account
- Credit Card: PayPal provides test credit card numbers in the sandbox

### Testing the Payment Flow

1. Navigate to your subscription page at `/dashboard/subscription`
2. Select a plan and click "Subscribe"
3. In the payment modal, click the PayPal button
4. A PayPal popup will appear - log in with your sandbox personal account credentials
5. Complete the payment flow
6. The application should handle the success callback, update the database, and show a success message

### Common Testing Scenarios

- **Successful Payment**: Use a valid sandbox account with sufficient funds
- **Payment Failure**: Use the special buyer account marked for payment failures
- **Cancellation**: Close the PayPal popup without completing the payment

## Debugging Tips

- Check browser console for any errors
- Verify network requests to the PayPal API
- Inspect the response from your verification endpoint (`/api/payments/paypal/verify`)
- Check database entries after subscription to ensure they're properly updated

## Moving to Production

When moving to production:

1. Replace sandbox credentials with production credentials
2. Update the PayPal mode from sandbox to live
3. Uncomment and implement the real PayPal verification methods in `api/payments/paypal/verify/route.ts`
4. Remove any testing or debugging code

## Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/checkout/)
- [PayPal React Components](https://github.com/paypal/react-paypal-js)
- [PayPal Testing in Sandbox](https://developer.paypal.com/tools/sandbox/) 