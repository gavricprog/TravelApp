# Travel Planning Web Application

Student-friendly full stack app: **ASP.NET Core 8 Web API** + **SQL Server (EF Core)** + **React (Vite)** with **JWT** auth and a simple **USER / ADMIN** role claim (new accounts register as `USER`).

Architecture stays intentionally small: **Controllers → Services → Repositories**, with three **logical “microservice” folders** on the backend (`UserModule`, `TravelModule`, `FinanceModule`) — not separate deployable services.

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) (for the React app)
- **SQL Server** — default connection string uses **LocalDB** (installed with Visual Studio / Build Tools on Windows)

---

## 1. Backend (API)

Path: `backend/TravelApp.Api`

### Configuration

- Connection string: `appsettings.json` → `ConnectionStrings:DefaultConnection`
- JWT: `Jwt` section — change `Key` to a long random string (≥ 32 characters) for anything beyond local class demos

### Run

```powershell
cd "backend\TravelApp.Api"
dotnet restore
dotnet run
```

- HTTP: `http://localhost:5230`
- Swagger UI (Development): `http://localhost:5230/swagger`

On startup the API runs **`Database.Migrate()`**, so the database is created/updated automatically from the `Migrations` folder.

### EF Core CLI (optional)

If you change models and need a new migration:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.11
cd "backend\TravelApp.Api"
dotnet ef migrations add YourMigrationName
dotnet run
```

---

## 2. Database models (EF Core)

Entities live in `backend/TravelApp.Api/Models/`:

| Model          | Purpose |
|----------------|---------|
| `User`         | Email, password hash, `UserRole` |
| `TravelPlan`   | Title, dates, budget, optional `ShareToken` |
| `Destination`  | Places attached to a plan |
| `Activity`     | Items grouped by `DayDate` |
| `Expense`      | Money lines (Finance module) |
| `ChecklistItem`| Simple todos per plan |

**Validation rules (also enforced in `TravelPlanService`):**

- **End date must be after start date**
- **Budget ≥ 0**

---

## 3. Frontend (React)

Path: `frontend`

API calls are **only** in `src/api/*.js` (not inside components), as requested. Vite **proxies** `/api` → `http://localhost:5230` (see `vite.config.js`).

### Run

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Pages

- `/login`, `/register` — JWT stored in `localStorage`
- `/` — dashboard (list + create trips)
- `/travel/:id` — destinations, activities by day, expenses + totals, checklist, share link
- `/share/:token` — **read-only** shared view (no login)

---

## 4. Main API routes (cheat sheet)

| Area | Method | Route |
|------|--------|--------|
| Auth | POST | `/api/auth/register`, `/api/auth/login` |
| Plans | GET/POST | `/api/travel-plans` |
| Plan | GET/PUT/DELETE | `/api/travel-plans/{id}` |
| Share | POST | `/api/travel-plans/{id}/share` |
| Public | GET | `/api/share/{token}` |
| Destinations | POST/DELETE | `/api/travel-plans/{id}/destinations`, `/api/travel-plans/destinations/{id}` |
| Activities | POST/DELETE | `/api/travel-plans/{id}/activities`, `/api/travel-plans/activities/{id}` |
| Checklist | POST/PATCH/DELETE | `/api/travel-plans/{id}/checklist`, `/api/travel-plans/checklist/{itemId}` |
| Expenses | POST/DELETE | `/api/travel-plans/{id}/expenses`, `/api/travel-plans/{id}/expenses/{expenseId}` |

Swagger: click **Authorize** and paste `Bearer {your_jwt}`.

---

## ADMIN role (optional)

Registration creates **USER** only. To demo **ADMIN**, update SQL (SSMS / `sqlcmd`) after a user exists — `Role` is `0` = User, `1` = Admin:

```sql
UPDATE Users SET Role = 1 WHERE Email = 'you@school.edu';
```

The next login JWT will include the `Admin` role claim.

**Admin API (demo):** `GET /api/admin/stats` — returns total users and travel plans; requires a JWT whose role is `Admin`. The dashboard shows a yellow **Admin overview** bar when you are logged in as admin.

After pulling changes, run the API once so new EF migrations apply (`ActivityExpenseAdminFeatures` adds activity fields + expense category).

---

## Project layout

```
Travel app/
  TravelApp.sln
  README.md
  backend/TravelApp.Api/
    Data/                 # DbContext
    Models/               # EF entities
    DTOs/                 # Request/response shapes
    Infrastructure/       # JWT settings, claim helper
    UserModule/           # Auth controllers/services/repos
    TravelModule/         # Plans, share, destinations, activities, checklist
    FinanceModule/        # Expenses
    Migrations/           # EF migrations
  frontend/
    src/
      api/                # axios + API functions
      context/            # AuthContext
      pages/
```

---

## Troubleshooting

- **502 / proxy errors**: start the API first on port **5230** (or change `vite.config.js` `proxy.target`).
- **SQL connection errors**: install LocalDB or point `DefaultConnection` at your SQL Server instance.
- **HTTPS dev cert**: if you call the API directly over HTTPS, trust the dev cert: `dotnet dev-certs https --trust`.
