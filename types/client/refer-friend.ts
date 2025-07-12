export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalRewards: number;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    rewardEarned: number;
  }>;
}
