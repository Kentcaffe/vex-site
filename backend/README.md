# Backend API (Express + PostgreSQL)

## Pornire

1. Completeaza variabilele in `.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - optional: `API_PORT`, `JWT_EXPIRES_IN`, `DB_SSL`
2. Ruleaza serverul:
   - `npm run dev:api`

## Endpoint-uri

- `GET /api/health`
- `POST /api/auth/register`
  - body: `{ "username": "user", "email": "user@mail.com", "password": "secret123" }`
- `POST /api/auth/login`
  - body: `{ "email": "user@mail.com", "password": "secret123" }`
  - response: `{ "token": "..." }`
- `POST /api/ads` (autentificare Bearer token)
  - header: `Authorization: Bearer <token>`
  - body: `{ "title": "Titlu", "description": "Descriere" }`
- `GET /api/ads`
  - listeaza anunturile cu date de utilizator
