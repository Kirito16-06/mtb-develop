
export interface Plan {
  id: string;
  name: string;
  jpMultiplier: number;
  discountPercent: number;
  durationDays: number | null;
  price: string;
  paypalPlanId: string;
  paypalProductId: string;
}

export interface LifetimeTier {
  tier: string;
  planId: string;
  planName: string;
  price: string;
  paypalPlanId: string;
  userRange: string;
}

export interface CurrentLifetimePlan {
  planId: string;
  planName: string;
  price: string;
  paypalPlanId: string;
}

export interface SubscriptionData {
  currentPlan: Plan | null;
  planStart: string | null;
  planEnd: string | null;
  hasActiveSubscription: boolean;
  plans: Plan[];
  currentLifetimePlan: CurrentLifetimePlan;
  lifetimePlanUsers?: number;
  limitedOfferAvailable?: boolean;
  lifetimeTiers: LifetimeTier[];
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  price: string;
  paypalPlanId: string;
  isSubscription: boolean;
  onSuccess: (paidAmount: string) => void;
}