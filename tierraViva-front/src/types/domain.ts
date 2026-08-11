export interface AnimalUpdate {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface Animal {
  id: number;
  name: string;
  species: string;
  bio?: string;
  description: string;
  health_status: 'EXCELLENT' | 'GOOD' | 'RECOVERING' | 'CRITICAL';
  health_status_display?: string;
  is_adopted: boolean;
  image_url?: string;
  sponsors_count?: number;
  updates?: AnimalUpdate[];
}

export interface HiveStatus {
  id: number;
  code: string; // e.g. "COL-01"
  queen_name?: string;
  health_score: number; // 0-100
  honey_production_kg: number;
  activity_level: 'LOW' | 'NORMAL' | 'HIGH' | 'PEAK';
  last_inspection_date: string;
  location: string;
  notes?: string;
}

export interface SponsorshipTier {
  id: number;
  level: number;
  name: string;
  price: number;
  price_annual?: number;
  description: string;
  features?: string[];
  image_url?: string;
  is_active: boolean;
  type: 'SUBSCRIPTION' | 'ONE_TIME';
}

export interface SustainableProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category?: string;
  image_url?: string;
  is_organic: boolean;
  is_active: boolean;
}

export interface CheckoutSessionRequest {
  tier_id?: number;
  animal_id?: number;
  is_annual?: boolean;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
}
