# Lumina POS

**Lumina POS** is a high-performance, avant-garde Point of Sale system designed for modern retail and hospitality environments. It features a distinct brutalist-minimalist aesthetic, complete offline capabilities, and bilingual support (English/Arabic).

## 🚀 Features

### Core Point of Sale
- **Fast Checkout**: Optimized for minimal clicks and high speed.
- **Product Lookup**: Search by name, SKU, or barcode scanning (HID mode).
- **Cart Management**: Complex modifiers/variants, line-item notes, and dynamic totals.
- **Discount Engine**: Apply fixed or percentage discounts to specific items or the entire cart.
- **Order Parking**: Hold and retrieve orders instantly.
- **Refund Mode**: Process returns with inventory adjustments.

### 💰 Financial & Shift Management
- **Cash Management**: Open/Close shifts, track float, safe drops, and payouts.
- **Blind Closing**: Z-Report generation with variance tracking.
- **Payment Split**: Support for multiple payment methods per transaction.

### 📦 Inventory & Stock
- **Real-time Tracking**: Automatic stock deduction upon sale.
- **Low Stock Alerts**: Visual indicators for items below minimum levels.
- **Supplier Management**: Track supplier details and assign products.
- **Stock Movement History**: Audit log for all inventory changes (Sales, Restocks, Returns).

### 👥 CRM & Loyalty
- **Customer Database**: Track purchase history, visits, and contact info.
- **Loyalty Program**: Earn points on purchases and redeem for rewards.
- **Quick-Add**: Create customers on the fly during checkout.

### 📊 Reports & Analytics
- **Dashboard**: Real-time sales data, average basket size, and top products.
- **Inventory Valuation**: Track cost basis vs. potential revenue.
- **Export**: Download sales data as CSV.

### 🛠 Technical Highlights
- **Offline-First**: Persisted local state ensures functionality without internet.
- **Bilingual**: Instant toggling between English (LTR) and Arabic (RTL).
- **Theming**: Native Dark Mode support with distinct aesthetic palettes.
- **Hardware Ready**: Hooks for Barcode Scanners and ESC/POS Thermal Printers.

## 🎨 Aesthetic Philosophy

Lumina follows a "Functional Brutalism" design language:
- **Typography**: Uses *Plus Jakarta Sans* for UI and *JetBrains Mono* for data/numbers.
- **Visuals**: High contrast, bold borders, and intentional usage of "Lumina Teal" (#42b2b2) and "Cyber Orange" (#FF5E1E).
- **Motion**: Micro-interactions and layout transitions using CSS animations.

## 🏗 Project Structure

```
src/
├── features/           # Domain-specific modules
│   ├── pos/            # Main checkout logic
│   ├── inventory/      # Product management
│   ├── crm/            # Customer management
│   ├── reports/        # Analytics
│   └── settings/       # Hardware config
├── context/            # Global State (StoreContext)
├── components/         # Shared UI components (Button, Modal, etc.)
├── hooks/              # Custom hooks (Keyboard, Hardware)
└── types/              # TypeScript definitions
```

## 📜 License

Proprietary software. All rights reserved.