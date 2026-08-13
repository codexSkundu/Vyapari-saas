# Vyapari — Integrated Customer Module

This package contains the integrated **Customer Frontend + Customer Backend** only.
Seller dashboard, delivery-personnel module and the old `vyapari-backend` are NOT part
of this integration (their files are untouched and their code paths are unused).

## Contents

| Folder | What it is | Modified? |
|---|---|---|
| `customer-frontend/` | React (Vite) app from the Vyapari-saas repo | 4 files changed (see report) |
| `customer-backend/`  | Your Spring Boot customer backend (`com.ecom.backend`, DB `ecom_db`) | **Completely untouched** |
| `auth-backend/`      | `backend3` from the repo — customer registration/login with BCrypt (DB `login`) | **Completely untouched** |

## Prerequisites

- MySQL 8 running on `localhost:3306` with your existing `ecom_db` (do NOT re-import
  `ecom_db.sql` if your live database already has data — importing would DROP and
  recreate the tables and wipe your extra products).
- Java 17+ and Node.js 18+.

## How to run (3 terminals)

**1. Customer backend — port 8080 (as-is):**
```
cd customer-backend
mvnw spring-boot:run
```
(Uses your existing `application.properties`: `ecom_db`, root / EcomBackend@2026.)

**2. Auth backend — port 8081 (runtime args only; no file was edited):**
```
cd auth-backend
mvnw spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081 --spring.datasource.url=jdbc:mysql://localhost:3306/login?createDatabaseIfNotExist=true --spring.datasource.password=EcomBackend@2026"
```
Adjust `--spring.datasource.password=` to YOUR MySQL root password (the file itself
says empty password; the argument overrides it without modifying the file).
The `login` database and its `USER` table are created automatically on first start.

**3. Frontend — port 5173:**
```
cd customer-frontend
npm install
npm run dev
```
Open http://localhost:5173

All API calls go through the Vite dev proxy (`vite.config.js`):
`/api/users/**` → 8081 (auth), everything else `/api/**` → 8080 (customer backend).
The browser never makes a cross-origin request, so no CORS annotation needed changing.

## Test flow

1. On the landing page, use the **Customer entrance** → Sign up (email + password ≥ 8 chars).
2. Shop tab shows every item in `ecom_db.items` (including Mango, Parwal, Potato, …) with
   category-matched images.
3. Add to kart → quantities/removal are server-side (`cart` table).
4. Billing → enter address → Place order (Cash on delivery). Address is saved via
   `/api/addresses`; order via `/api/orders/customer/{id}`; COD payment via
   `/api/payments/cod/{orderId}`.
5. Orders tab shows your orders with item lists, totals, status badges and a
   **Cancel order** button for PLACED orders.
6. Log out / log in again with the same email+password on the same browser — works.

## Known limitations (by design of the existing backends)

- **Cross-device login:** credentials are verified by the auth backend anywhere, but the
  store profile id (`ecom_db.customers.id`) is linked to the email in the browser's
  localStorage at signup. On a brand-new device/cleared storage, login succeeds but the
  profile can't be recovered (the customer backend has no lookup-by-email endpoint, and
  fetching all customers was explicitly ruled out).
- **Payments:** only Cash on Delivery (the only method your backend supports).
- **Order note** field is UI-only (no backend field exists for it).
- Cancelling an order does not restore item stock, and placing an order does not decrease
  stock — that is existing backend behaviour, unchanged.
- The customer backend's `customers.password` column is NOT NULL, so a fixed placeholder
  string is stored there; the real password lives only in the auth backend, BCrypt-hashed.
