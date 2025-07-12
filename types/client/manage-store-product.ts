export interface Item {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  imageUrl: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface ItemFormData {
  name: string;
  category: string;
  basePrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  imageFile?: File;
  downloadFile?: File;
}

export interface Category {
  id: string;
  name: string;
}
