# SAVAGE STORE — Premium Bangladeshi Apparel & Custom Mockup Platform

A complete, production-ready full-stack clothing e-commerce website and administrative control center built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Firebase (Firestore, Authentication, Storage)**.

---

## 1. Project Overview

- **Brand:** SAVAGE STORE (Khulna, Bangladesh)
- **Official Identity:** Official crown mascot on crimson red circle (`/assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`)
- **Currency:** BDT (৳)
- **Timezone:** Asia/Dhaka
- **Contact:** 01779903110 (Call & WhatsApp) | `strvboys512@gmail.com`
- **Fulfillment:** 100% Cash on Delivery (COD) across Bangladesh (Khulna Express ৳60, Dhaka ৳100, Nationwide ৳150)

---

## 2. Key Features

### Customer Storefront
- **Responsive Navigation:** Official logo, search modal, wishlist count, cart count, customer profile, and mobile drawer.
- **Shop Catalog & Dynamic Filtering:** Filter by Category, Clothing Size (XS–XXXL), Color, Gender, and Price slider. Sort by Newest, Price, and Featured.
- **Product Detail Page (PDP):** Multi-image gallery with zoom, stock validation, interactive Size Chart, color swatches, customer review submission, related products.
- **Live Mockup Studio (`/customizer`):** Interactive canvas engine allowing shoppers to upload any logo, choose garment color (Black, White, Slate, Crimson, Olive, Sand), scale, rotate, blend, export PNGs, and order customized printed apparel.
- **Bangladeshi Checkout:** Cash on Delivery, phone number validation (`01XXXXXXXXX`), shipping zones, coupon discount code engine, and instant receipt generation.
- **Real-Time Order Tracking (`/track-order`):** Visual tracking timeline: `Pending` → `Confirmed` → `Processing` → `Packed` → `Shipped` → `Delivered`.
- **Customer Account (`/account`):** Email/password and Google authentication, profile details, and past order history.
- **Static Information Pages:** `/about`, `/contact`, `/shipping-policy`, `/return-policy` (7-day exchange), `/size-guide`, `/faq`, `/privacy-policy`, `/terms`.

### Administrative Control Center (`/admin`)
- **Protected Access:** Enforced via Firebase Auth UID check against primary administrator `h5SWaCFwWiRPtRYcDJNtlCgF2yH3` / `strvboys512@gmail.com`.
- **Dashboard:** Real-time statistics (Orders, Revenue, Inventory, Low Stock, Customers) with clean empty state and initialization checklist.
- **Product Management:** Complete clothing CRUD, variant matrix generator (Size × Color = SKU & Stock), multiple image uploader with preview and reordering.
- **Category Management:** Taxonomy ordering, slugs, active toggles.
- **Order Fulfillment:** Live status transition controls (`Pending` → `Confirmed` → `Processing` → `Packed` → `Shipped` → `Delivered` → `Cancelled`), payment status tracking, internal staff notes, and printable invoice generator.
- **Customer Directory:** Aggregated customer spend and order volume.
- **Promotions & Coupons:** Percentage or fixed amount coupons with minimum purchase thresholds, expiry dates, and usage limits.
- **Logistics & Delivery:** Configurable zone fees for Khulna, Dhaka, and nationwide districts.
- **Homepage Banners:** Carousel management for promotional drops.
- **Reviews Moderation:** Approve, hide, or delete customer reviews.
- **Store Settings:** Live updates for phone numbers, WhatsApp, social media URLs, announcement bar text, and policies.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend & Database:** Firebase Firestore (modular SDK v11), Firebase Authentication, Firebase Storage
- **Build Tool:** Vite 8, tsx

---

## 4. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_FIREBASE_API_KEY="AIzaSyBd5Rk5m3CD6HgvA2x1s1ho9PDmPOdCsoI"
VITE_FIREBASE_AUTH_DOMAIN="savage-store-d153a.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="savage-store-d153a"
VITE_FIREBASE_STORAGE_BUCKET="savage-store-d153a.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="362231763619"
VITE_FIREBASE_APP_ID="1:362231763619:web:4b00668b1b06a08fa7a516"
ADMIN_UID="h5SWaCFwWiRPtRYcDJNtlCgF2yH3"
ADMIN_EMAIL="strvboys512@gmail.com"
```

---

## 5. Firebase Setup Instructions

### A. Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/project/savage-store-d153a/authentication).
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google**
3. Create your administrator account using `strvboys512@gmail.com` with UID `h5SWaCFwWiRPtRYcDJNtlCgF2yH3`.

### B. Firestore Database
1. Go to **Firestore Database** in the Firebase console.
2. Ensure Firestore is created in production mode in your preferred region.
3. Deploy the security rules provided in `firestore.rules`.

### C. Storage
1. Go to **Firebase Storage** in the console.
2. Confirm the bucket `savage-store-d153a.firebasestorage.app` is enabled.
3. Allow image read/write for authenticated admin.

---

## 6. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview build
npm run preview
```


## GitHub Pages Deployment

This repository is configured for the project URL `https://savageaistudio.github.io/SAVAGE-STORE-/`. Push changes to the `main` branch to trigger the GitHub Actions build and deployment workflow. In **Settings → Pages**, set **Source** to **GitHub Actions**. The workflow builds the existing Vite app and deploys `dist`; it does not replace the storefront or admin panel.

Note: Firebase services still require their existing Firebase project configuration, Authentication settings, Firestore rules, and Storage rules. GitHub Pages is static hosting and does not provide a backend server.
