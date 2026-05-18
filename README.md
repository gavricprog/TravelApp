# Travel Planning Web Application

Full stack travel planning app: **ASP.NET Core 8 Web API** + **SQL Server (EF Core)** + **React (Vite)** with **JWT** auth and a **USER / ADMIN** role claim.

Backend architecture follows **Controllers → Services → Repositories**, with three service boundaries:

- `UserModule` / **UserService** — authentication, JWT, users, admin role checks
- `TravelModule` / **TravelService** — plans, destinations, activities, checklist, sharing, PDF/QR features
- `FinanceModule` / **FinanceService** — expenses and finance operations

The ASP.NET Core API exposes the `/api/...` routes used by the React app. The repository also includes a **Microsoft Service Fabric layer** under `backend/ServiceFabric` with service manifests for `UserService`, `TravelService`, and `FinanceService`, including stateless and stateful service definitions.

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) (for the React app)
- **SQL Server** — default connection string uses **LocalDB** (installed with Visual Studio / Build Tools on Windows)
- Optional for Service Fabric packaging: Visual Studio with the Microsoft Service Fabric tools/workload and a local Service Fabric cluster

---

## 1. Backend (API)

Path: `backend/TravelApp.Api`

### Configuration

- Connection string: `appsettings.json` → `ConnectionStrings:DefaultConnection`
- JWT: `Jwt` section

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
| `User`         | Name, email, password hash, `UserRole` |
| `TravelPlan`   | Title, description, dates, budget, notes, optional `ShareToken` |
| `Destination`  | Places attached to a plan |
| `Activity`     | Items grouped by `DayDate` |
| `Expense`      | Money lines (Finance module) |
| `ChecklistItem`| Checklist items and reminders per plan |

**Validation rules (also enforced in `TravelPlanService`):**

- **End date must be after start date**
- **Budget ≥ 0**

---

## 3. Service Fabric layer

Path: `backend/ServiceFabric`

The Service Fabric package contains three service boundaries:

- `UserStatelessService` - auth, JWT, users, roles, and admin account operations
- `TravelStatefulService` - travel plans, destinations, activities, checklist, sharing, QR, and PDF reports
- `FinanceStatelessService` - expenses, categories, totals, and budget operations

The application manifest is in `backend/ServiceFabric/ApplicationPackageRoot/ApplicationManifest.xml`. Service manifests are split into `UserServicePkg`, `TravelServicePkg`, and `FinanceServicePkg`. If Service Fabric tooling is installed, open the Service Fabric project in Visual Studio and package/deploy it to the local cluster. The ASP.NET Core API can still be run directly as shown above.

---

## 4. Frontend (React)

Path: `frontend`

API calls are in `src/api/*.js`. The API base URL is configured through Vite environment variables.

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

## 5. Main API routes (cheat sheet)

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
| Expenses | POST/PUT/DELETE | `/api/travel-plans/{id}/expenses`, `/api/travel-plans/{id}/expenses/{expenseId}` |

Swagger: click **Authorize** and paste `Bearer {your_jwt}`.

---

## Admin Role

Registration creates **USER** accounts. To create an **ADMIN**, update SQL after a user exists. `Role` is `0` = User, `1` = Admin:

```sql
UPDATE Users SET Role = 1 WHERE Email = 'you@school.edu';
```

The next login JWT will include the `Admin` role claim.

**Admin API:** `GET /api/admin/stats` returns total users and travel plans. It requires a JWT whose role is `Admin`.

Run the API after schema changes so EF migrations can apply.

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
    UserModule/           # User service boundary
    TravelModule/         # Travel service boundary
    FinanceModule/        # Finance service boundary
    Migrations/           # EF migrations
  backend/ServiceFabric/
    ApplicationPackageRoot/
      ApplicationManifest.xml
      UserServicePkg/     # Stateless service manifest
      TravelServicePkg/   # Stateful service manifest
      FinanceServicePkg/  # Stateless service manifest
    src/                  # Service Fabric hosts
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

## Architecture

- System architecture: `docs/architecture.md`
- Use case diagram: `docs/use-case.md`
- Service Fabric layer: `backend/ServiceFabric` contains the application manifest, service manifests, and stateless/stateful hosts for User, Travel, and Finance services.

---

## Troubleshooting

- **Network errors from frontend**: start the API first on port **5000** and verify `frontend/.env` has `VITE_API_BASE_URL=http://localhost:5000`.
- **SQL connection errors**: install LocalDB or point `DefaultConnection` at your SQL Server instance.
- **HTTPS dev cert**: if you call the API directly over HTTPS, trust the dev cert: `dotnet dev-certs https --trust`.
