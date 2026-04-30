# Travel Planning Web Application

Student-friendly full stack app: **ASP.NET Core 8 Web API** + **SQL Server (EF Core)** + **React (Vite)** with **JWT** auth and a simple **USER / ADMIN** role claim (new accounts register as `USER`).

Architecture stays intentionally small and clear: **Controllers → Services → Repositories**, with three logical service boundaries on the backend:

- `UserModule` / **UserService** — authentication, JWT, users, admin role checks
- `TravelModule` / **TravelService** — plans, destinations, activities, checklist, sharing, PDF/QR features
- `FinanceModule` / **FinanceService** — expenses and finance operations

The current backend is a **modular monolith with microservice-ready boundaries**. It is not a full Microsoft Service Fabric deployment yet, but each backend service boundary is documented and designed so it can be moved into a separate Service Fabric service later.

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

- HTTP: `http://localhost:5000`
- Swagger UI (Development): `http://localhost:5000/swagger`

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

API calls are **only** in `src/api/*.js` (not inside components), as requested. The API base URL is configured through Vite environment variables.

Create or update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Run

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Frontend structure

- `src/pages/` — route-level pages
- `src/components/` — reusable UI sections (`TripSummaryForm`, `DestinationsSection`, `ActivitiesSection`, `ExpensesSection`, `ChecklistSection`)
- `src/api/` — HTTP service modules and axios client
- `src/models/` — frontend model shapes and normalizers
- `src/context/` — auth and notification state

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
    UserModule/           # UserService boundary
    TravelModule/         # TravelService boundary
    FinanceModule/        # FinanceService boundary
    Migrations/           # EF migrations
  frontend/
    src/
      api/                # axios + API functions
      components/         # reusable UI sections
      context/            # AuthContext
      models/             # frontend domain models
      pages/
  docs/
    architecture.md
    use-case.md
```

---

## Architecture and academic deliverables

- System architecture: `docs/architecture.md`
- Use case diagram: `docs/use-case.md`
- Service Fabric migration note: the current implementation keeps User, Travel, and Finance as explicit logical service boundaries. A future Service Fabric version should split those modules into separate deployable services and add the required stateless/stateful Service Fabric hosts.

---

## Troubleshooting

- **Network errors from frontend**: start the API first on port **5000** and verify `frontend/.env` has `VITE_API_BASE_URL=http://localhost:5000`.
- **SQL connection errors**: install LocalDB or point `DefaultConnection` at your SQL Server instance.
- **HTTPS dev cert**: if you call the API directly over HTTPS, trust the dev cert: `dotnet dev-certs https --trust`.
