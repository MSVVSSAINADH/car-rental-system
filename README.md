# Car Rental System

A local full-stack car rental application. Customers can browse a fleet, request rentals, manage profile documents, track requests, and view invoices and notifications. Administrators manage cars, users, bookings, and dashboard statistics.

## Project architecture

- `frontend/`: React 19 single-page application built with Vite 7 and npm. Vite serves the app on port `7050` and proxies `/api` to the backend on port `7060`.
- `backend/`: Java 17 and Spring Boot 3.2 REST API. It uses Spring MVC, Spring Security, JWT authentication, BCrypt password hashing, Bean Validation, Spring Data JPA, and MySQL.
- The backend is organized into controllers, services, repositories, entities, DTOs, and configuration. The API is rooted at `/api`.
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

The initial administrator is created only when both admin variables are set and that email does not already exist. Existing accounts are not reset. The seeder adds its sample fleet only when the cars table is empty. Hibernate uses `ddl-auto=update`; this project does not include a database migration tool. Configure production database credentials, TLS, and schema migration before deployment.

## Run locally

1. Start MySQL. Set `DB_USERNAME` and `DB_PASSWORD` if the local server does not use the defaults.
2. Set `JWT_SECRET` to a private secret of at least 32 UTF-8 bytes. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` if you need an initial admin account.
3. Start the backend from `backend/`:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   On macOS/Linux, run `./mvnw spring-boot:run`. The API listens on `http://localhost:7060` unless `SERVER_PORT` is set.

4. In another terminal, start the frontend from `frontend/`:

   ```powershell
   npm ci
   npm run dev
   ```

   The UI is served at `http://localhost:7050`. The frontend calls the backend through Vite's `/api` proxy. Set `APP_CORS_ALLOWED_ORIGINS` if the browser uses another origin.

## Features and current limitations

- Customer registration and login; JWT-protected customer and administrator pages.
- Public browsing of cars and car details; booking requests with date and booking-type validation.
- Self Drive requests require a driving-licence image smaller than 500 KB. With Driver requests are also supported.
- The backend applies a 30% discount to customers with fewer than five existing bookings and calculates the booking price server-side.
- Customers can manage their profile, see their bookings, notifications, and invoices, and submit reviews. Administrators can manage cars, bookings, and user access.
- Booking requests are reviewed by an administrator. Booking status changes use the API; requests do not imply a payment charge.
- Online payment processing is not integrated. The payment screen explains this and does not charge a customer. Email delivery depends on external mail configuration and is not configured by default.
- The competitor price comparison listed in `frontend/TODO.md` is not implemented.
- The repository has no deployment configuration or database migration scripts. Review production security, operations, and concurrent booking behavior before deployment.

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

Use `./mvnw test` and `./mvnw package` on macOS/Linux. The full Maven test suite requires its test dependencies; application startup additionally requires a reachable MySQL database and `JWT_SECRET`.

## API overview

- Authentication: `POST /api/auth/signup`, `POST /api/auth/login`; administrator signup is restricted to administrators.
- Customer: `/api/customer/cars`, `/api/customer/car/{id}`, `/api/customer/car/book`, customer booking/profile/notification routes, invoice routes, and review routes.
- Administrator: `/api/admin/cars`, car management, booking review, user management, dashboard statistics, and analytics routes.
- Most routes require a valid JWT and the appropriate role. Public GET access is limited to car browsing and car reviews.
- Booking status changes use `PUT /api/admin/car/booking/{bookingId}/{status}`.

See the controllers under `backend/src/main/java/com/carrental/controller` for the full route definitions.

## Repository layout

```text
backend/       Spring Boot API, Maven Wrapper, and Java tests
frontend/      React/Vite application, assets, and npm lockfile
start-all.bat  Windows convenience launcher
```
