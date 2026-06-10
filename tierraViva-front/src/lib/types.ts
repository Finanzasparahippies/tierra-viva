
// types.ts
export interface FamilyProfile {
    id: number;
    title: string;
    bio: string;
    public_email: string;
    whatsapp: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    photo_url?: string;
}

export interface Species {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    max_sponsorship_level?: number;
    family_profile?: FamilyProfile;
    total_contributions?: number;
    date_joined?: string;
}

export interface AnimalContentMedia {
    id: number;
    file_url: string;
    media_type: 'IMAGE' | 'VIDEO';
    created_at: string;
}

export interface AnimalContentFolder {
    id: number;
    name: string;
    min_tier_level: number;
    cover_image_url?: string;
    is_locked: boolean;
    animal?: number;
    species?: number;
    media: AnimalContentMedia[];
    created_at: string;
}

export interface RanchUpdateImage {
    id: number;
    url: string;
    caption?: string;
    order: number;
}

export interface RanchUpdateTag {
    id: number;
    name: string;
    slug: string;
}

export interface RanchUpdate {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    image_url?: string;
    gallery?: RanchUpdateImage[];
    tags?: RanchUpdateTag[];
    min_tier_level: number;
    is_locked: boolean;
    created_at: string;
}

export interface Animal {
    id: number;
    name: string;
    species: string;
    species_name?: string;
    breed?: string;
    breed_name?: string;
    age?: number;
    description: string;
    image_url?: string;
    rescue_video_url?: string;
    is_adopted: boolean;
    sponsorship_price?: number;
    folders: AnimalContentFolder[];
    
    // Bitácora y Control
    birth_date?: string;
    rescue_date?: string;
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
    health_status: 'GOOD' | 'TREATMENT' | 'CRITICAL' | 'RECOVERED';
    health_status_display?: string;
    weight?: string;
    provenance?: string;
    
    // Campos calculados
    age_display: string;
    time_at_ranch_display: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image?: string;
    image_url?: string;
    category?: string;
    unit: "GRAMS" | "KILOS" | "LITERS" | "PIECE";
    unit_amount: number;
    is_active: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Sponsorship {
    id: number;
    user: number; // User ID
    animal: number; // Animal ID
    amount: number;
    start_date: string;
    end_date?: string;
    active: boolean;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    image_url: string | null;
    is_public: boolean;
    author: string;
    author_name?: string;
    created_at: string;
}

export interface SponsorshipTier {
    id: number;
    name: string;
    level: number;
    type: string;
    price: string;
    price_annual?: string;
    stripe_price_id?: string;
    stripe_price_id_annual?: string;
    description: string;
    image_url?: string;
}

export interface ActivityImage {
    id: number;
    url: string;
    caption?: string;
    order: number;
}

export interface Activity {
    id: number;
    title: string;
    slug: string;
    description: string;
    activity_type: 'TOUR' | 'WORKSHOP' | 'EVENT';
    type_display: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    capacity: number;
    remaining_capacity: number;
    location: string;
    image?: string;
    image_url?: string;
    gallery: ActivityImage[];
    is_active: boolean;
    created_at: string;
}

export interface Booking {
    id: number;
    user: number;
    user_name: string;
    activity: number;
    activity_title: string;
    tickets: number;
    total_price: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
    status_display: string;
    stripe_payment_intent?: string;
    created_at: string;
}


