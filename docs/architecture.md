# System Architecture

## Overview

TravelApp is a full-stack travel planning system built with React, ASP.NET Core 8 Web API, Entity Framework Core, and Microsoft SQL Server. The current implementation is a modular monolith: all backend modules run in one ASP.NET Core host, but the code is separated by service responsibility so it can be migrated to independently deployed services later.

## Frontend

The frontend is a React application created with Vite. It is organized around routed pages, shared components, API service modules, a model layer, and React Context for authentication and notifications.

- `src/pages` contains route-level views.
- `src/components` contains reusable UI sections.
- `src/api` contains all HTTP calls.
- `src/models` defines frontend domain model shapes.
- `src/context` contains global authentication and notification state.

API configuration is loaded from `VITE_API_BASE_URL` in `frontend/.env`.

## Backend

The backend follows a Controllers -> Services -> Repositories structure. DTOs are separated from EF Core entities, and service classes perform business validation and mapping.

### UserService

Located under `backend/TravelApp.Api/UserModule`.

Responsibilities:

- User registration and login
- Password hashing
- JWT creation
- Role handling
- Admin statistics endpoint

This module is designed to be deployed as a separate Microsoft Service Fabric service in a future migration.

### TravelService

Located under `backend/TravelApp.Api/TravelModule`.

Responsibilities:

- Travel plan CRUD
- Destinations
- Activities
- Checklist items
- Share links and QR codes
- PDF report generation

This module is designed to be deployed as a separate Microsoft Service Fabric service in a future migration.

### FinanceService

Located under `backend/TravelApp.Api/FinanceModule`.

Responsibilities:

- Expense creation
- Expense deletion
- Expense category and amount validation
- Ownership checks through travel plan access

This module is designed to be deployed as a separate Microsoft Service Fabric service in a future migration.

## Database

The system uses Microsoft SQL Server through EF Core. The default development database is SQL Server LocalDB. Migrations are stored in `backend/TravelApp.Api/Migrations`, and `Database.Migrate()` runs during backend startup to keep the database schema current.

Main relationships:

- `User` owns many `TravelPlan` records.
- `TravelPlan` owns destinations, activities, expenses, and checklist items.
- Dependent records are deleted through cascade delete when their parent plan is deleted.

## Service Fabric Migration Path

The project does not currently include Service Fabric project files or runtime hosting. The code is prepared for migration by keeping service boundaries explicit:

- `UserModule` -> future UserService
- `TravelModule` -> future TravelService
- `FinanceModule` -> future FinanceService

A future Service Fabric implementation should create separate stateless services for API/controller hosting and, where required, a stateful service using Reliable Collections for service-owned state. The database-backed EF Core model can remain the persistent source of truth during the first migration phase.
