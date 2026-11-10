export type Gender = 'Men' | 'Women' | 'Unisex' | 'Kids';

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName?: string;
  subcategory?: string;
  brand: string;
  gender: Gender;
  fabric?: string;
  images: string[];
  thumbnail: string;
  price: number;
  salePrice?: number;
  costPrice?: number; // Admin only
  sizes: string[];
  colors: ProductColor[];
  variants: ProductVariant[];
  totalStock: number;
  tags: string[];
  likesCount?: number;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  maxStock: number;
  sku?: string;
  isCustomMockup?: boolean;
  customMockupUrl?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  division: string;
  district: string;
  upazila?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  deliveryZoneName: string;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  deliveryCharge: number;
  minimumOrder?: number;
  estimatedDays: string;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  sortOrder: number;
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  photos?: string[];
  fitFeedback?: string;
  approved: boolean;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  deliveryArea: string;
  currency: string;
  announcement?: string;
  returnPolicyDays?: number;
  logoUrl?: string;
  faviconUrl?: string;
  adminPin?: string;
  geminiApiKey?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  target: string;
  details?: string;
  adminEmail: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  createdAt: string;
}

export interface MockupConfig {
  productType: 't-shirt' | 'hoodie' | 'mug' | 'cap' | 'tote-bag';
  apparelColor: string;
  logoUrl: string;
  logoScale: number;
  logoX: number;
  logoY: number;
  logoRotation: number;
  viewSide: 'front' | 'back';
}
