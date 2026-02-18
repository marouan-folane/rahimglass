
export type UserRole = 'customer' | 'wholesale' | 'admin';

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  email?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_per_m2: number;
  stock: number;
  thickness: number; // in mm
  category_id: string;
  is_customizable: boolean;
  image_url: string | null; // Cover image
  images?: ProductImage[]; // Loaded via join
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface CartItem {
  id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  custom_width?: number; // in cm
  custom_height?: number; // in cm
  calculated_price: number;
  // New fields for AI Custom Mirrors
  custom_image?: string; // Base64 or URL
  custom_specs?: {
    shape: string;
    frameType: string;
    frameColor: string;
    room: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[]; // Joined data
  profiles?: Profile; // Joined data
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  custom_width?: number;
  custom_height?: number;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
}

export interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
}

export interface ShippingZone {
  id: string;
  city: string;
  cost: number;
  delivery_days: number;
}

export interface ProductInput {
  name: string;
  description: string;
  price_per_m2: number;
  stock: number;
  thickness: number;
  category_id: string;
  is_customizable: boolean;
  image_url?: string;
}