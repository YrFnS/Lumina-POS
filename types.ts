export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type ViewMode = 'pos' | 'inventory' | 'reports' | 'crm';
export type PaymentMethod = 'cash' | 'card' | 'gift' | 'wallet' | 'check';

export type FulfillmentStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  points: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: number;
  joinedAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number; // Positive (add) or Negative (remove)
  type: StockMovementType;
  reason?: string;
  timestamp: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Discount {
  type: 'percent' | 'fixed';
  value: number;
  description?: string; // e.g. "Loyalty Redemption"
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string; 
  categoryId?: string; 
  supplierId?: string;
  image?: string;
  color?: string;
  variants?: ProductVariant[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedVariants: ProductVariant[];
  discount?: Discount;
  note?: string;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  tipAmount: number;
  total: number;
  payments: Payment[];
  status: 'completed' | 'parked' | 'refunded';
  fulfillmentStatus: FulfillmentStatus;
  customerName?: string;
  customerId?: string; // Link to CRM
  pointsEarned?: number;
  pointsRedeemed?: number;
  createdAt: number;
  globalDiscount?: Discount;
}

export interface HardwareConfig {
  autoPrintReceipt: boolean;
  kickDrawer: boolean;
  showCustomerDisplay: boolean;
  soundEnabled: boolean;
  printerWidth: '58mm' | '80mm';
}

export interface BroadcastMessage {
  type: 'SYNC_CART';
  payload: {
    cart: CartItem[];
    total: number;
    subtotal: number;
    lang: Language;
    theme: Theme;
  };
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

// --- Cash Management Types ---

export type CashTransactionType = 'float' | 'sale' | 'refund' | 'drop' | 'payout';

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  amount: number;
  reason?: string;
  timestamp: number;
  relatedOrderId?: string;
}

export interface CashShift {
  id: string;
  status: 'open' | 'closed';
  openedAt: number;
  closedAt?: number;
  startFloat: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  transactions: CashTransaction[];
  openedBy: string; // Placeholder for user system
}