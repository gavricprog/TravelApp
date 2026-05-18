# TravelApp Service Fabric Layer

This folder contains the Service Fabric deployment structure for the TravelApp backend.

## Services

- `UserStatelessService` - authentication, users, roles, and admin account operations.
- `TravelStatefulService` - travel plans, destinations, activities, checklist, sharing, QR, and PDF reporting.
- `FinanceStatelessService` - expenses, categories, totals, and budget-related operations.

The ASP.NET Core API exposes the `/api/...` routes used by the frontend.

## Application Package

The manifests are stored under `ApplicationPackageRoot`:

- `ApplicationManifest.xml`
- `UserServicePkg/ServiceManifest.xml`
- `TravelServicePkg/ServiceManifest.xml`
- `FinanceServicePkg/ServiceManifest.xml`

The service hosts are stored under `src/`.
