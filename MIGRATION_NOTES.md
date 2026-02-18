# Migration to Node.js + SQLite

The application has been successfully migrated from Supabase to a local Node.js server with SQLite.

## key Changes
1. **Backend Server**: Located in `server/`.
   - Uses `express` for API.
   - Uses `better-sqlite3` for a high-performance local database file (`server/rahimglass.db`).
   - Uses `jsonwebtoken` (JWT) for authentication.
   - Uses `bcryptjs` for password hashing.
   - Implements rate limiting and security headers.

2. **Frontend**:
   - `supabase.ts` has been removed.
   - `api.ts` is the new client that communicates with your local server.
   - All components (`Home`, `Shop`, `ProductDetail`, `Checkout`, `AdminDashboard`) now use `api.ts`.

3. **Database**:
   - Expects a file `server/rahimglass.db` which is automatically created and seeded on first run.
   - Default Admin User: `admin@rahimglass.ma` / `admin123`

## How to Run

1. **Install Dependencies** (if you haven't already):
   ```bash
   npm install
   ```
   
2. **Start the Application**:
   ```bash
   npm run dev
   ```
   This command now runs BOTH the backend API (port 3001) and the Vite frontend (port 5173) concurrently.

3. **Verify**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/health

## New API Enpoints
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `POST /api/orders`
... and more (see `server/routes/*.js`).
