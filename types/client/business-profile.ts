export interface SocialHandles {
  linkedin?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
}

export interface BusinessProfile {
  name: string;
  businessInfo?: string;
  missionStatement?: string;
  goals?: string;
  keyOfferings?: string;
  achievements?: string;
  email?: string;
  phone?: string;
  website?: string;
  socialHandles?: SocialHandles;
  featuredWorkTitle?: string;
  featuredWorkDesc?: string;
  featuredWorkImage?: string;
  priorityContactLink?: string;
  completionPercentage?: number;
  
}

export interface ProfileDisplayProps {
  profileData: BusinessProfile | null;
  onEditClick: () => void;
}
