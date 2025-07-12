import axios from "axios";

export async function POST() {
  const clientId = process.env.PP_CLIENT_ID!;
  const clientSecret = process.env.PP_SECRET_KEY!;

  try {
    // Step 1: Get Access Token
    const tokenRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Create Product
    const productRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      {
        name: "MTB Premium",
        description: "Premium subscription to MTB platform",
        type: "SERVICE",
        category: "SOFTWARE",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const productId = productRes.data.id;

    // Step 3: Define plan configurations
    const plans = [
      {
        name: "Monthly Plan",
        description: "Monthly subscription to MTB Premium",
        interval_unit: "MONTH",
        interval_count: 1,
        value: "49.00",
        total_cycles: 0, // Infinite cycles
      },
      {
        name: "Yearly Plan",
        description: "Yearly subscription to MTB Premium",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "299.00",
        total_cycles: 0, // Infinite cycles
      },
      {
        name: "Lifetime Plan - Tier 1",
        description: "Lifetime access to MTB Premium (First 10 users)",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "499.00",
        total_cycles: 1, // One-time payment
      },
      {
        name: "Lifetime Plan - Tier 2",
        description: "Lifetime access to MTB Premium (Users 11-20)",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "699.00",
        total_cycles: 1, // One-time payment
      },
      {
        name: "Lifetime Plan - Tier 3",
        description: "Lifetime access to MTB Premium (Users 21-30)",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "999.00",
        total_cycles: 1, // One-time payment
      },
      {
        name: "Lifetime Plan - Tier 4",
        description: "Lifetime access to MTB Premium (Users 31-40)",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "1399.00",
        total_cycles: 1, // One-time payment
      },
      {
        name: "Lifetime Plan - Tier 5",
        description: "Lifetime access to MTB Premium (Users 41-50)",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "1899.00",
        total_cycles: 1, // One-time payment
      },
      {
        name: "Lifetime Plan - Standard",
        description: "Lifetime access to MTB Premium",
        interval_unit: "YEAR",
        interval_count: 1,
        value: "2999.00",
        total_cycles: 1, // One-time payment
      },
    ];

    const createdPlans = [];

    // Step 4: Create Plans
    for (const plan of plans) {
      const planRes = await axios.post(
        "https://api-m.sandbox.paypal.com/v1/billing/plans",
        {
          product_id: productId,
          name: plan.name,
          description: plan.description,
          billing_cycles: [
            {
              frequency: {
                interval_unit: plan.interval_unit,
                interval_count: plan.interval_count,
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: plan.total_cycles,
              pricing_scheme: {
                fixed_price: {
                  value: plan.value,
                  currency_code: "USD",
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
              value: "0",
              currency_code: "USD",
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3,
          },
          taxes: {
            percentage: "0",
            inclusive: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          },
        }
      );

      createdPlans.push({
        name: plan.name,
        planId: planRes.data.id,
        price: plan.value,
      });
    }

    return new Response(
      JSON.stringify({
        message: "MTB Premium Product and Plans created",
        productId,
        plans: createdPlans,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
