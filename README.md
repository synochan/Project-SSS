# CashTrack POS

CashTrack POS is an offline-first Android mobile POS and inventory management MVP for small shops, food stalls, cafes, milk tea shops, fried chicken businesses, sari-sari stores, and mini groceries.

## Features

- Owner and cashier accounts with JWT authentication
- Multiple shops with shop-level data access
- Product catalog with categories, images, prices, stock, and low-stock thresholds
- POS cart, stock validation, checkout, and receipts
- Cash, GCash, and other payment methods
- Inventory add/reduce flows and audit logs
- Sales history and daily/weekly/monthly report endpoints
- Offline sales with immediate local inventory deduction
- SQLite sync queue for pending offline changes
- PostgreSQL-ready Django REST backend

## Architecture

The repository contains two production-oriented layers:

- `src/`: Expo React Native mobile app using TypeScript, Expo Router, React Query, Zustand, Expo SQLite, and Expo SecureStore.
- `backend/`: Django REST Framework API using PostgreSQL, SimpleJWT, CORS headers, and Cloudinary-ready URL image storage.

Mobile follows an offline-first flow. Product, sale, sale item, inventory log, and sync queue data are persisted locally in SQLite. Checkout never depends on network availability. When internet returns, `processSyncQueue()` uploads pending sales and marks records synced.

## Database Design

Backend models:

- `User`: email login, username, first name, last name, phone, active/staff flags, timestamps
- `Shop`: name, address, contact number, owner
- `ShopMember`: shop, user, role (`OWNER`, `CASHIER`)
- `Product`: shop, name, category, price, stock, low stock threshold, image URL, active flag
- `Sale`: shop, cashier, receipt number, totals, payment method, created date
- `SaleItem`: sale, product, product snapshot, quantity, price, subtotal
- `InventoryLog`: product, action, quantity, previous stock, new stock, note

Local SQLite tables:

- `products`
- `sales`
- `sale_items`
- `inventory_logs`
- `sync_queue`

## API Endpoints

See [API.md](./API.md) for request details.

Core endpoints:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET|POST /api/shops/`
- `GET /api/shops/{id}/`
- `GET|POST /api/products/`
- `PUT|DELETE /api/products/{id}/`
- `GET /api/inventory/`
- `POST /api/inventory/add-stock/`
- `POST /api/inventory/reduce-stock/`
- `GET|POST /api/sales/`
- `GET /api/sales/{id}/`
- `GET /api/reports/daily/`
- `GET /api/reports/weekly/`
- `GET /api/reports/monthly/`

## Authentication Flow

1. Mobile submits login credentials.
2. Backend returns JWT access and refresh tokens.
3. Mobile stores tokens in Expo SecureStore.
4. API client attaches the access token to requests.
5. On `401`, the client refreshes the access token and retries once.
6. Logout clears SecureStore and can blacklist the refresh token server-side.

## Offline Sync Design

When offline:

1. Cashier checks out a cart.
2. Sale and sale items are saved in SQLite.
3. Product stock is deducted locally immediately.
4. Inventory logs are created locally.
5. The sale payload is added to `sync_queue` as `PENDING`.
6. Receipt is shown immediately.

When online returns:

1. `expo-network` detects internet availability.
2. Sync engine reads `PENDING` and `FAILED` queue items.
3. Pending sales are uploaded to `POST /api/sales/`.
4. Queue rows are marked `SYNCED` or `FAILED`.
5. Local sales are marked synced with the remote ID.

## Installation

Install mobile dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Running Backend

Create `backend/.env` from `backend/.env.example`, then run:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Demo users:

- Owner: `owner@cashtrack.test` / `password123`
- Cashier: `cashier@cashtrack.test` / `password123`

## Running Mobile App

```bash
npm run android
```

For an Android emulator, set the API URL to the host machine:

```bash
set EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
npm run android
```

## Building Android APK

Install EAS CLI and build:

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

## Deployment

Backend can deploy to Railway or Render with PostgreSQL. Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, and CORS origins. Cloudinary credentials are reserved for image upload integration.

## Future Improvements

- Barcode scanner
- Receipt printer
- Multi-shop analytics
- Cloud backup
- Export reports to PDF
- Export reports to Excel
- Customer loyalty system
