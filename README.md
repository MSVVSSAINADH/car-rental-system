# CarRentalX

A full-stack car rental application. Customers browse a fleet, send rental requests, manage profile documents, and track their requests, invoices and notifications. Administrators manage cars, users and booking requests.

## Project architecture

- `frontend/`: React 19 single-page application built with Vite 7, Tailwind CSS 4 and npm. Vite serves the app on port `7050` and proxies `/api` to the backend on port `7060`.
- `backend/`: Java 17 and Spring Boot 3.2 REST API. It uses Spring MVC, Spring Security, JWT authentication, BCrypt password hashing, Bean Validation, Spring Data JPA and MySQL.
- The backend is organized into controllers, services, repositories, entities, DTOs and configuration. The API is rooted at `/api`.
- Backend tests use Maven and include H2 as a test dependency. The normal application configuration uses MySQL.

## Requirements

- Java 17
- Node.js and npm
- MySQL

The Maven Wrapper and npm lockfile are included. No separate Maven installation is needed.

## Configuration

Set backend configuration as environment variables before starting the application:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/car_rental_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true` | JDBC URL for MySQL |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | empty | Database password |
| `JWT_SECRET` | none | Required JWT signing secret; must contain at least 32 UTF-8 bytes |
| `ADMIN_EMAIL` | none | Email for an initial administrator account |
| `ADMIN_PASSWORD` | none | Password for the initial administrator account |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:7050` | Comma-separated allowed browser origins |
| `SERVER_PORT` | `7060` | Spring Boot server port |

The initial administrator is created only when both admin variables are set and that email does not already exist. Existing accounts are not reset. The seeder adds its sample fleet only when the cars table is empty. Hibernate uses `ddl-auto=update`; this project does not include a database migration tool. Configure production database credentials, TLS and schema migration before deployment.

Never commit real values. `.env*` files are ignored by git.

## Run locally

1. Start MySQL. Set `DB_USERNAME` and `DB_PASSWORD` if the local server does not use the defaults.
2. Set `JWT_SECRET` to a private secret of at least 32 UTF-8 bytes. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` if you need an initial admin account.
3. Start the backend from `backend/`:

```powershell
   .\mvnw.cmd spring-boot:run
```

   On macOS or Linux, run `./mvnw spring-boot:run`. The API listens on `http://localhost:7060` unless `SERVER_PORT` is set.

4. In another terminal, start the frontend from `frontend/`:

```powershell
   npm ci
   npm run dev
```

   The UI is served at `http://localhost:7050`. The frontend calls the backend through Vite's `/api` proxy. Set `APP_CORS_ALLOWED_ORIGINS` if the browser uses another origin.

## Features

**Customers**
- Public browsing of the fleet at `/cars`, with filters for category, fuel and transmission, and sorting. Filters live in the URL, so a filtered view can be shared.
- Registration and login with JWT authentication.
- Booking requests with date and booking-type validation. The price breakdown shown before sending comes from the server, including the new customer discount.
- Self Drive requests require a driving licence image smaller than 500 KB. With Driver requests are also supported.
- A bookings page with request status, the rejection reason when one is given, and an invoice view for approved bookings.
- In-app notifications with an unread count, and a profile page for name, photo and licence image.

**Administrators**
- Fleet management: add, edit, mark unavailable and delete cars.
- Booking review: approve or reject requests. Both ask for confirmation, and rejecting asks for a reason.
- User management: block and unblock customers.
- Dashboard counts for cars, bookings, pending requests and users. A pending count shows in the navigation.

**Site**
- Privacy policy and terms and conditions pages at `/privacy` and `/terms`. Their facts live in `frontend/src/content/legal.js` and must be completed before launch.
- Cars without a photo show a "Photo coming soon" placeholder instead of a stand-in image.

## Current limitations

- Online payment is not integrated. The review page explains this and does not charge a customer. There is no revenue figure because no payments are recorded.
- Reviews exist only as backend endpoints. There is no review interface.
- Email delivery depends on external mail configuration and is not configured by default.
- Two simultaneous requests for the same car and dates can both be accepted, because the overlap check is not locked. Review concurrent booking behavior before deployment.
- There is no deployment configuration, database migration tooling or frontend test suite.
- Images are stored in the database as base64 text. Move them to object storage before real use.

## Before launch

- [ ] Fill in every `REPLACE_ME` in `frontend/src/content/legal.js`, then have the policy and terms reviewed by someone qualified.
- [ ] Connect a custom domain with HTTPS, and set `APP_CORS_ALLOWED_ORIGINS` to that exact origin.
- [ ] Add the favicon files referenced by `frontend/index.html`: `favicon.ico` and `apple-touch-icon.png` in `frontend/public/`.
- [ ] Add real, rights-cleared photos for every car.
- [ ] Fix the concurrent booking race and add a test for it.
- [ ] Replace `ddl-auto=update` with migrations, and set a production database with TLS.

## Checks

From `frontend/`:

```sh
npm run lint
npm run build
npm audit
```

There is no frontend test script currently. `npm audit` needs access to the npm registry.

From `backend/`:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

Use `./mvnw test` and `./mvnw package` on macOS or Linux. The full Maven test suite requires its test dependencies; application startup additionally requires a reachable MySQL database and `JWT_SECRET`.

## API overview

- Authentication: `POST /api/auth/signup`, `POST /api/auth/login`. Administrator signup is restricted to administrators.
- Public: `GET /api/config` (discount settings), `GET /api/customer/cars`, `GET /api/customer/car/{id}` and car reviews.
- Customer: `POST /api/customer/car/quote` (server price), `POST /api/customer/car/book`, plus booking, profile, notification and invoice routes.
- Administrator: `/api/admin/cars`, car management, booking review, user management and dashboard statistics.
- Most routes require a valid JWT and the appropriate role.
- Booking status changes use `PUT /api/admin/car/booking/{bookingId}/{status}`.

See the controllers under `backend/src/main/java/com/carrental/controller` for the full route definitions.

## Repository layout

```text
backend/       Spring Boot API, Maven Wrapper and Java tests
frontend/      React and Vite application, assets and npm lockfile
start-all.bat  Windows convenience launcher
```