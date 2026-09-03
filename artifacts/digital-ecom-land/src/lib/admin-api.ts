/**
 * Lightweight admin API client — direct fetch calls, no orval codegen needed.
 * All calls hit /api/admin/* which are proxied by Vite to the Express backend.
 */
import { supabase } from "./supabase";

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  delivered: number;
  returned: number;
  pending: number;
  activeAffiliates: number;
  totalAffiliates: number;
  totalProducts: number;
  inStockProducts: number;
  deliveryRate: number;
}

export interface AdminCategory {
  id: number;
  key: string;
  labelFr: string;
  labelAr: string;
  icon: string;
  active: boolean;
}

export interface SupplierProduct {
  productName: string;
  category: string;
  unitPrice: number;
  minOrder: number;
}

export interface AdminSupplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  notes: string;
  products: SupplierProduct[];
  active: boolean;
  createdAt: string;
}

export interface AdminDeliveryAgency {
  id: number;
  name: string;
  phone: string;
  email: string;
  wilayasCovered: string[];
  pricePerKg: number;
  deliveryDelay: string;
  trackingUrl: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export interface AdminAffiliate {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  brandName: string;
  joinedAt: string;
  totalOrders: number;
  totalDelivered: number;
  totalEarned: number;
  status: "active" | "blocked" | "pending";
  bankName: string | null;
  ribNumber: string | null;
}

export interface ProductDetail {
  images: string[];
  longDescription: string;
  benefits: string[];
  ingredients?: string[];
  specs?: { label: string; value: string }[];
  badge?: string;
  videoUrl?: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  wholesalePrice: number;
  suggestedPrice: number;
  affiliateMargin: number;
  description: string;
  deliveryCost: number;
  inStock: boolean;
  detail?: ProductDetail;
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const token = data.session?.access_token;
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Stats
export const getAdminStats = () => req<AdminStats>("/api/admin/stats");

// Products
export const adminListProducts = () => req<AdminProduct[]>("/api/products");
export const adminCreateProduct = (data: Partial<AdminProduct>) =>
  req<AdminProduct>("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
export const adminUpdateProduct = (id: number, data: Partial<AdminProduct>) =>
  req<AdminProduct>(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const adminDeleteProduct = (id: number) =>
  req<void>(`/api/admin/products/${id}`, { method: "DELETE" });

// Categories
export const adminListCategories = () => req<AdminCategory[]>("/api/admin/categories");
export const adminCreateCategory = (data: Partial<AdminCategory>) =>
  req<AdminCategory>("/api/admin/categories", { method: "POST", body: JSON.stringify(data) });
export const adminUpdateCategory = (id: number, data: Partial<AdminCategory>) =>
  req<AdminCategory>(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const adminDeleteCategory = (id: number) =>
  req<void>(`/api/admin/categories/${id}`, { method: "DELETE" });

// Suppliers
export const adminListSuppliers = () => req<AdminSupplier[]>("/api/admin/suppliers");
export const adminCreateSupplier = (data: Partial<AdminSupplier>) =>
  req<AdminSupplier>("/api/admin/suppliers", { method: "POST", body: JSON.stringify(data) });
export const adminUpdateSupplier = (id: number, data: Partial<AdminSupplier>) =>
  req<AdminSupplier>(`/api/admin/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const adminDeleteSupplier = (id: number) =>
  req<void>(`/api/admin/suppliers/${id}`, { method: "DELETE" });

// Delivery agencies
export const adminListAgencies = () => req<AdminDeliveryAgency[]>("/api/admin/delivery-agencies");
export const adminCreateAgency = (data: Partial<AdminDeliveryAgency>) =>
  req<AdminDeliveryAgency>("/api/admin/delivery-agencies", { method: "POST", body: JSON.stringify(data) });
export const adminUpdateAgency = (id: number, data: Partial<AdminDeliveryAgency>) =>
  req<AdminDeliveryAgency>(`/api/admin/delivery-agencies/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const adminDeleteAgency = (id: number) =>
  req<void>(`/api/admin/delivery-agencies/${id}`, { method: "DELETE" });

// Affiliates
export const adminListAffiliates = () => req<AdminAffiliate[]>("/api/admin/affiliates");
export const adminUpdateAffiliate = (id: number, data: Partial<AdminAffiliate>) =>
  req<AdminAffiliate>(`/api/admin/affiliates/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// Orders (reuse existing endpoint)
export const adminListOrders = () => req<any[]>("/api/orders");
export const adminUpdateOrderStatus = (id: number, status: string) =>
  req<any>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
