# ShopSphere V1

A modern, responsive full-stack e-commerce web application built as a learning project for
**Software QA Automation (Playwright), REST API testing, SQL, Git, and GitHub Actions (CI/CD).**

> **V1 (MVP) scope:** Register, Login, Product catalog, Product details, Cart, custom 404.
> Features like checkout, payments, wishlist, reviews, coupons, admin dashboard and
> inventory management are intentionally excluded and planned for future versions.

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React 18, Vite, JavaScript, Tailwind CSS  |
| Routing    | React Router                              |
| HTTP       | Axios                                     |
| Icons      | Lucide React                              |
| Backend    | Node.js, Express.js                       |
| Database   | PostgreSQL (Supabase)                     |
| ORM        | Prisma                                    |
| Auth       | JWT (stateless, stored in `localStorage`) |
| API        | REST                                      |

---

## Project Structure

```
ShopSphere/
├── client/                  # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── products/        # Generated SVG product images
│   └── src/
│       ├── assets/          # Static assets (imported at build time)
│       ├── components/      # Reusable components (Navbar, ProductCard, ui/, ...)
│       ├── layouts/         # MainLayout
│       ├── pages/           # Home, Products, ProductDetails, Cart, Login, Register, 404
│       ├── routes/          # AppRoutes
│       ├── hooks/           # useProducts, useRequireAuth
│       ├── context/         # AuthContext, CartContext
│       ├── services/        # Axios API service functions
│       ├── utils/           # formatPrice
│       ├── App.jsx
│       └── main.jsx
│
└── server/                  # Express + Prisma backend
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js          # Seeds 12 products + demo user
    └── src/
        ├── config/          # env
        ├── controllers/     # auth, product, cart
        ├── routes/          # auth, product, cart, index
        ├── middleware/      # auth, validate, error, notFound
        ├── services/        # business logic
        ├── utils/           # AppError, asyncHandler, generateToken
        ├── validations/     # Zod schemas
        ├── app.js
        └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (`node -v` to check)
- A PostgreSQL database (this guide uses [Supabase](https://supabase.com))
- Windows PowerShell (this project), macOS/Linux users: replace `copy`/`powershell` with `cp` and use `cd`

### 1. Set up the database (Supabase)

1. Create a Supabase project (free tier is fine).
2. Go to **Project Settings → Database → Connection string**.
3. Copy the **URI** connection string. Use the **direct** connection (port `5432`).
   > If your machine has no IPv6, use the **Session pooler** string (host `aws-0-<region>.pooler.supabase.com`,
   > port `5432`) — the newer `db.<ref>.supabase.co` direct endpoint is IPv6-only.

### 2. Install dependencies

```powershell
# From the project root (ShopSphere\) — installs BOTH server and client
npm run install:all
```

### 3. Configure the backend

```powershell
cd C:\Users\Administrator\Desktop\ShopSphere\server
copy .env.example .env
# Edit server\.env and set DATABASE_URL to your Supabase connection string
```

### 4. Create tables + seed data

```powershell
cd C:\Users\Administrator\Desktop\ShopSphere
npm run db:setup        # runs prisma migrate dev + seed
```

Creates the tables and seeds **12 products** across 4 categories (Laptop, Smartphone,
Headphones, Accessories) plus demo accounts. All use the password `password123`:

| Role     | Email                        | Notes                                        |
| -------- | ---------------------------- | -------------------------------------------- |
| Customer | `demo@shopsphere.com`        | Browse, cart, checkout                       |
| Seller   | `seller@shopsphere.com`      | Already approved; owns 3 seeded products     |
| Admin    | `admin@shopsphere.com`       | Review & approve/reject seller applications  |

### 5. Run the project (two terminals)

**Terminal 1 — backend API** on http://localhost:5000
```powershell
cd C:\Users\Administrator\Desktop\ShopSphere
npm run dev:server
```

**Terminal 2 — frontend** on http://localhost:5173
```powershell
cd C:\Users\Administrator\Desktop\ShopSphere
npm run dev:client
```

Open **http://localhost:5173** in your browser.

> To run each part directly instead of via the root scripts:
> `cd server` → `npm run dev` (API) and `cd client` → `npm run dev` (frontend).

### Root convenience scripts

Run from `C:\Users\Administrator\Desktop\ShopSphere`:

| Command | What it does |
| ------- | ------------ |
| `npm run install:all` | Installs server + client dependencies |
| `npm run db:setup` | Runs Prisma migration + seed |
| `npm run dev:server` | Starts the API on :5000 |
| `npm run dev:client` | Starts the frontend on :5173 |
| `npm run build:client` | Builds the client for production |

---

## REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint             | Auth | Description                              |
| ------ | -------------------- | ---- | ---------------------------------------- |
| POST   | `/auth/register`     | No   | Create account, returns user + JWT       |
| POST   | `/auth/login`        | No   | Login, returns user + JWT                |
| GET    | `/auth/profile`      | Yes  | Get current authenticated user           |
| GET    | `/products`          | No   | List all products                        |
| GET    | `/products/:id`      | No   | Get a single product                     |
| GET    | `/cart`              | Yes  | Get the current user's cart              |
| POST   | `/cart`              | Yes  | Add a product to the cart                |
| PUT    | `/cart/:id`          | Yes  | Update a cart item quantity              |
| DELETE | `/cart/:id`          | Yes  | Remove an item from the cart             |

All protected endpoints expect an `Authorization: Bearer <token>` header.

### Example requests

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shopsphere.com","password":"password123"}'

# Get products
curl http://localhost:5000/api/products

# Add to cart (replace <token> with the token from login)
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"productId":"<product-id>","quantity":1}'
```

Responses use a consistent `{ success, message, ...data }` envelope. Validation and
business errors return proper HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`).

---

## Automated Testing Support (Playwright)

Every important element has a stable `data-testid`. Selectors never use dynamic IDs, so
tests remain stable across versions. Common examples:

- `login-email`, `login-password`, `login-button`
- `register-firstname`, `register-email`, `register-button`
- `search-input`, `sort-select`, `product-card`, `add-to-cart`
- `cart-item`, `increase-quantity`, `decrease-quantity`, `remove-item`, `cart-total`
- `navbar`, `cart-button`, `logout-button`

---

## Environment Variables

### `server/.env`

| Variable          | Description                                      |
| ----------------- | ------------------------------------------------ |
| `PORT`            | API port (default `5000`)                        |
| `DATABASE_URL`    | PostgreSQL connection string (Supabase)          |
| `JWT_SECRET`      | Secret used to sign JWTs                         |
| `JWT_EXPIRES_IN`  | Token lifetime (default `7d`)                    |
| `CLIENT_URL`      | Allowed frontend origin for CORS                 |

### `client/.env`

| Variable         | Description                                |
| ---------------- | ------------------------------------------ |
| `VITE_API_URL`   | Backend API base URL (default localhost:5000/api) |

---

## Code Quality

- Clean architecture: `controllers → services → Prisma`; no logic in routes.
- Reusable React components with `data-testid` on all interactive elements.
- Loading spinners, skeleton loaders, empty states, and server-error handling everywhere.
- Client-side + server-side validation (Zod).
- Semantic HTML, ARIA attributes, and keyboard-friendly controls.
- Comment only where necessary.

---

## Roadmap

- **V1 (current):** Core catalog, auth, cart.
- **V2:** Checkout, order history, wishlist.
- **V3:** Admin dashboard, inventory management, coupons.
- **V4:** Notifications, reviews, multi-role auth, payments.
