# Car Rental System frontend

This is the React 19 customer and administrator interface, built with Vite. It calls the Spring Boot API through the `/api` proxy configured for local development.

For project setup, backend configuration, and the supported application features, see the [root README](../README.md).

## Local development

From this directory, install the versions pinned by the lockfile and start Vite:

```sh
npm ci
npm run dev
```

The development server uses port `7050` and forwards `/api` requests to `http://localhost:7060`. Start the backend and MySQL database separately.

## Checks

```sh
npm run lint
npm run build
npm audit
```

There is currently no frontend test script. The production build is written to `dist/`.
