# Use Case Diagram

## Actors

- User
- Admin

## Use Cases

### User

- Register account
- Log in
- Log out
- Create travel plan
- View travel plans
- Update travel plan
- Delete travel plan
- Add destination
- Update destination
- Delete destination
- Add activity
- Update activity
- Delete activity
- Add expense
- Delete expense
- Add checklist item
- Mark checklist item as done
- Delete checklist item
- Generate share link
- Copy share link
- Download QR code
- Download PDF report
- Open read-only shared travel plan

### Admin

- Log in
- View admin overview
- View total user count
- View total travel plan count

## Mermaid Use Case Diagram

```mermaid
flowchart LR
    User[User]
    Admin[Admin]

    Register((Register account))
    Login((Log in))
    Logout((Log out))
    ManagePlans((Manage travel plans))
    ManageDestinations((Manage destinations))
    ManageActivities((Manage activities))
    ManageExpenses((Manage expenses))
    ManageChecklist((Manage checklist))
    SharePlan((Share travel plan))
    DownloadPdf((Download PDF report))
    ViewShared((View shared plan))
    AdminOverview((View admin overview))

    User --> Register
    User --> Login
    User --> Logout
    User --> ManagePlans
    User --> ManageDestinations
    User --> ManageActivities
    User --> ManageExpenses
    User --> ManageChecklist
    User --> SharePlan
    User --> DownloadPdf
    User --> ViewShared

    Admin --> Login
    Admin --> AdminOverview
```
