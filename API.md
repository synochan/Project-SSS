# CashTrack POS API

All protected endpoints require:

```http
Authorization: Bearer <access-token>
```

## Auth

`POST /api/auth/register/`

```json
{
  "email": "owner@example.com",
  "username": "owner",
  "password": "password123",
  "first_name": "Ana",
  "last_name": "Owner",
  "phone": "09170000000",
  "shop_name": "Ana Store"
}
```

`POST /api/auth/login/`

```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```

`POST /api/auth/refresh/`

```json
{
  "refresh": "<refresh-token>"
}
```

`POST /api/auth/logout/`

```json
{
  "refresh": "<refresh-token>"
}
```

`GET /api/auth/me/` returns the current user with role and primary shop.

## Shops

`GET /api/shops/` lists shops where the user is a member.

`POST /api/shops/`

```json
{
  "name": "Branch 2",
  "address": "Market Road",
  "contact_number": "09170000001"
}
```

## Products

`GET /api/products/?search=rice`

`POST /api/products/`

```json
{
  "shop": 1,
  "name": "Fried Chicken",
  "category": "Food",
  "price": "99.00",
  "stock": 50,
  "low_stock_threshold": 8,
  "image": null,
  "is_active": true
}
```

Owners can create, edit, and delete products. Cashiers can list products for their assigned shop.

## Inventory

`GET /api/inventory/` lists inventory logs.

`POST /api/inventory/add-stock/`

```json
{
  "product": 1,
  "quantity": 10,
  "note": "Supplier delivery"
}
```

`POST /api/inventory/reduce-stock/`

```json
{
  "product": 1,
  "quantity": 2,
  "note": "Damaged stock"
}
```

## Sales

`GET /api/sales/` returns all shop sales for owners and own sales for cashiers.

`POST /api/sales/`

```json
{
  "shop": 1,
  "receipt_number": "CT-20260605220000-100",
  "total_amount": "114.00",
  "payment_method": "CASH",
  "amount_received": "120.00",
  "change_amount": "6.00",
  "created_at": "2026-06-05T22:00:00+08:00",
  "items": [
    {
      "product": 1,
      "product_name": "Fried Chicken",
      "quantity": 1,
      "unit_price": "99.00",
      "subtotal": "99.00"
    },
    {
      "product": 2,
      "product_name": "Rice",
      "quantity": 1,
      "unit_price": "15.00",
      "subtotal": "15.00"
    }
  ]
}
```

The backend validates shop access, non-empty cart, stock availability, total integrity, cash received, and no negative stock. Product stock is deducted inside a database transaction.

## Reports

`GET /api/reports/daily/`

`GET /api/reports/weekly/`

`GET /api/reports/monthly/`

Each report returns sales totals, transaction count, best-selling products, inventory value, low-stock products, low-stock count, and total products.
