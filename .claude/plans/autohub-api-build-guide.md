# Auto Hub API — Build Guide

> Step-by-step guide to implement `autohub-api` from scratch.
> Stack: Node.js 24 LTS · Express · TypeScript · PostgreSQL · Prisma · BullMQ · Redis · Zod · JWT

---

## Before You Start

Make sure you have installed locally:
- Node.js 24 LTS
- PostgreSQL (or a free cloud instance at neon.tech)
- Redis (or Upstash for free cloud Redis)
- Your editor of choice (VS Code recommended)
- Postman or Insomnia for testing endpoints

---

## Step 1 — Project Setup

Create the project folder and initialize it.

```
cd auto-hub-api
npm init -y
```

Install all dependencies:

**Runtime:**
```
npm install express zod bcryptjs jsonwebtoken bullmq @prisma/client dotenv cors
```

**Types + Dev:**
```
npm install -D typescript ts-node-dev @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/cors prisma
```

Create `tsconfig.json` at the root with strict mode enabled, targeting `ES2022`,
with `rootDir: src` and `outDir: dist`.

Create `.env` at the root with these variables:
```
DATABASE_URL=
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
PORT=3000
NODE_ENV=development
```

Create `.env.example` with the same keys but empty values. Commit `.env.example`, never `.env`.

Add scripts to `package.json`:
- `dev` → runs `ts-node-dev src/server.ts`
- `build` → runs `tsc`
- `start` → runs `node dist/server.js`

---

## Step 2 — Folder Structure

Create this exact folder structure inside `src/`:

```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── repositories/
├── application/
│   ├── use-cases/
│   │   ├── auth/
│   │   ├── shop/
│   │   ├── car/
│   │   ├── appointment/
│   │   └── rating/
│   ├── interfaces/
│   └── dtos/
├── infrastructure/
│   ├── database/
│   │   └── repositories/
│   ├── jobs/
│   │   └── workers/
│   └── email/
├── presentation/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── app.ts
└── server.ts
```

No code yet — just create the folders with empty `.gitkeep` files so git tracks them.

---

## Step 3 — Database Schema

Initialize Prisma:
```
npx prisma init
```

This creates `prisma/schema.prisma`. Replace its contents with the full schema
covering these five models: `User`, `Shop`, `Car`, `Appointment`, `Rating`.

Field-by-field reference for each model is in `autohub-ai-context.md` → Section 3.
Every field listed there must be present in the schema. Do not add extra fields.

Prisma still needs enums at the **database level** for these fields.
Define them in the schema so PostgreSQL enforces the values:
- `Role` → `CLIENT`, `SHOP`
- `AppointmentStatus` → `PENDING`, `APPROVED`, `DENIED`, `COMPLETED`, `CANCELLED`
- `RaterType` → `CLIENT`, `SHOP`

These are Prisma-only enums — they do NOT replace the value object classes in the domain layer.
The domain uses its own classes (Step 4.1). The Prisma enums are an infrastructure concern only.
When mapping from Prisma to domain entities in repositories, convert raw strings
using the value object's `from()` method (e.g. `Role.from(raw.role)`).

After writing the schema, run:
```
npx prisma migrate dev --name init
```

This creates the database tables and generates the Prisma client.

Verify the migration ran by opening Prisma Studio:
```
npx prisma studio
```

---

## Step 4 — Domain Layer

Build the domain layer first. No framework imports allowed anywhere in this layer.

### 4.1 Value Objects
Value objects are **classes**, not enums. Each one is a class that wraps a string value,
validates it on construction, and exposes static factory methods for each valid state.
This gives you type safety and encapsulation — you can never create an invalid value object.

Create in `src/domain/value-objects/`:

**`Role.ts`**
- Private constructor receiving a string value
- Static methods: `client()`, `shop()`
- Static method: `from(value: string)` — reconstructs from a raw string (used when loading from DB), throws if value is invalid
- Getter: `value` returns the string
- Method: `isClient()`, `isShop()` — convenience boolean checks

**`AppointmentStatus.ts`**
- Private constructor receiving a string value
- Static methods: `pending()`, `approved()`, `denied()`, `completed()`, `cancelled()`
- Static method: `from(value: string)` — reconstructs from raw string, throws if invalid
- Getter: `value` returns the string
- Methods: `isPending()`, `isApproved()`, `isDenied()`, `isCompleted()`, `isCancelled()`

**`RaterType.ts`**
- Private constructor receiving a string value
- Static methods: `client()`, `shop()`
- Static method: `from(value: string)` — reconstructs from raw string, throws if invalid
- Getter: `value` returns the string
- Methods: `isClient()`, `isShop()`

---

### 4.2 Domain Events
Create event classes in `src/domain/events/`. Each event is a plain class
with readonly properties set via constructor and an `occurredAt` timestamp set automatically.

Events to create:
- `AppointmentCreated` → carries `appointmentId`, `shopId`, `clientId`
- `AppointmentApproved` → carries `appointmentId`, `clientId`, `negotiatedPrice`
- `AppointmentDenied` → carries `appointmentId`, `clientId`
- `AppointmentCompleted` → carries `appointmentId`, `clientId`, `shopId`

---

### 4.3 Entities
Create entity classes in `src/domain/entities/`. Entities carry their properties
and business rules as methods. They must never import from Prisma, Express, or BullMQ.

Each entity has:
- A **private constructor** — never instantiated with `new` from outside
- A static **`create()`** factory — builds a new entity with a generated UUID
- A static **`reconstitute()`** factory — rebuilds an entity from raw database data

---

**`User.ts`**

Props:
- `id: string`
- `name: string`
- `email: string`
- `password: string` (hashed)
- `phone: string`
- `role: Role` (value object)
- `averageRating: number`
- `isActive: boolean`
- `createdAt: Date`

No business methods needed in MVP beyond construction.

---

**`Shop.ts`**

Props:
- `id: string`
- `userId: string`
- `description: string`
- `imageUrl: string | null`
- `street: string`
- `city: string`
- `state: string`
- `zipCode: string`
- `totalDailyCapacity: number`
- `averageRating: number`
- `isActive: boolean`
- `createdAt: Date`

No business methods needed in MVP beyond construction.

---

**`Car.ts`**

Props:
- `id: string`
- `clientId: string`
- `make: string`
- `model: string`
- `year: number`
- `plate: string`

No business methods needed in MVP beyond construction.

---

**`Appointment.ts`** ⭐ Most important entity

Props:
- `id: string`
- `clientId: string`
- `carId: string`
- `shopId: string`
- `requestedDate: Date`
- `requestedTime: string`
- `status: AppointmentStatus` (value object)
- `description: string`
- `negotiatedPrice: number | null`
- `clientNotes: string | null`
- `shopNotes: string | null`
- `approvedAt: Date | null`
- `deniedAt: Date | null`
- `completedAt: Date | null`
- `createdAt: Date`
- `updatedAt: Date`

Business methods:
- `approve(negotiatedPrice: number)` — throws if status is not PENDING, transitions to APPROVED, sets price and approvedAt
- `deny()` — throws if status is not PENDING, transitions to DENIED, sets deniedAt
- `complete()` — throws if status is not APPROVED, transitions to COMPLETED, sets completedAt
- `cancel()` — throws if status is not PENDING or APPROVED, transitions to CANCELLED

---

**`Rating.ts`**

Props:
- `id: string`
- `appointmentId: string`
- `raterUserId: string`
- `raterType: RaterType` (value object)
- `score: number`
- `comment: string | null`
- `createdAt: Date`

No business methods needed in MVP beyond construction.

---

### 4.4 Repository Interfaces
Create interfaces in `src/domain/repositories/`. TypeScript interfaces only —
no implementation here. Implementation lives in infrastructure.

Interfaces to create:
- `IUserRepository` → `save`, `findById`, `findByEmail`, `update`
- `IShopRepository` → `save`, `findById`, `findAll`, `update`
- `ICarRepository` → `save`, `findById`, `findByClientId`, `delete`
- `IAppointmentRepository` → `save`, `findById`, `findByClientId`, `findByShopId` (with optional status filter), `countApprovedByShopAndDate`, `update`
- `IRatingRepository` → `save`, `findByAppointmentId`, `findByShopId`, `existsByAppointmentAndRaterType`

---

## Step 5 — Application Layer

Use cases live here. Each use case is one class with one `execute` method.
No Express, no Prisma — only domain entities, interfaces, and DTOs.

### 5.1 Application Interfaces
Create in `src/application/interfaces/`:
- `IEventPublisher` → `publish(event: unknown): Promise<void>`
- `IAuthService` → `hashPassword`, `comparePassword`, `generateToken`, `verifyToken`

### 5.2 Use Cases

Create one file per use case in `src/application/use-cases/`.

**Auth use cases:**
- `RegisterUser` → validates email is not taken, hashes password, saves user, if role is SHOP also creates Shop record
- `LoginUser` → finds user by email, compares password, returns JWT token

**Shop use cases:**
- `CreateShop` → saves shop linked to authenticated user
- `ListShops` → returns all active shops
- `GetShop` → returns one shop by id
- `UpdateShop` → updates shop fields, verifies ownership

**Car use cases:**
- `AddCar` → validates plate is unique, saves car linked to authenticated client
- `ListMyCars` → returns all cars for authenticated client
- `RemoveCar` → soft deletes car, validates no active appointments exist for it

**Appointment use cases:**
- `CreateAppointment` → validates shop is active, validates car belongs to client, creates appointment with PENDING status, publishes `AppointmentCreated` event
- `GetAppointment` → returns appointment, validates user is either the client or the shop owner
- `ListMyAppointments` → returns appointments for authenticated user (filtered by their role)
- `ApproveAppointment` → validates shop ownership, validates capacity not exceeded, calls `appointment.approve()`, saves, publishes `AppointmentApproved` event
- `DenyAppointment` → validates shop ownership, calls `appointment.deny()`, saves, publishes `AppointmentDenied` event
- `CompleteAppointment` → validates shop ownership, calls `appointment.complete()`, saves, publishes `AppointmentCompleted` event
- `CancelAppointment` → validates client ownership, calls `appointment.cancel()`, saves

**Rating use cases:**
- `CreateRating` → validates appointment is COMPLETED, validates user is participant, validates no duplicate rating exists for this side, saves rating, recalculates and updates target's `averageRating`

### 5.3 DTOs
Create input/output type definitions for each use case in `src/application/dtos/`.
These are plain TypeScript interfaces — no classes, no decorators.
Input DTOs are what the use case receives. Output DTOs are what it returns.

---

## Step 6 — Infrastructure Layer

### 6.1 Prisma Client Singleton
Create `src/infrastructure/database/prisma/client.ts`.
Export a single shared `PrismaClient` instance. Do not instantiate it more than once.

### 6.2 Prisma Repositories
Create one repository per entity in `src/infrastructure/database/repositories/`.
Each repository implements its domain interface using the Prisma client.

For every repository:
- Constructor receives the Prisma client
- `save` → calls `prisma.model.create`
- `findById` → calls `prisma.model.findUnique`
- `update` → calls `prisma.model.update`
- List methods → call `prisma.model.findMany` with appropriate filters
- All methods map Prisma records back to domain entities via a private `toDomain()` helper

### 6.3 Auth Service Implementation
Create `src/infrastructure/auth/JwtAuthService.ts` implementing `IAuthService`.
Use `bcryptjs` for password hashing (salt rounds: 10).
Use `jsonwebtoken` for token generation and verification.
Token payload: `{ userId, role }`. Token expiry: 7 days.

### 6.4 BullMQ Event Publisher
Create `src/infrastructure/jobs/BullMQEventPublisher.ts` implementing `IEventPublisher`.
On `publish`, check which event type was received and add the appropriate job to the
`notifications` queue.

### 6.5 Notification Worker
Create `src/infrastructure/jobs/workers/notification.worker.ts`.
This worker processes jobs from the `notifications` queue.
In MVP, each job handler logs to console and sends an email (use Nodemailer with any
SMTP provider — Resend or Brevo are free tiers that work well).

Job handlers to implement:
- `notify-shop-new-appointment` → email to shop owner
- `notify-client-approved` → email to client with negotiated price
- `notify-client-denied` → email to client
- `notify-rating-available` → email to both client and shop

---

## Step 7 — Presentation Layer

### 7.1 Middleware
Create in `src/presentation/middleware/`:

**`auth.middleware.ts`**
Reads the `Authorization` header, verifies the JWT, attaches `{ userId, role }` to `req.user`.
Returns 401 if token is missing or invalid.

**`role.middleware.ts`**
Factory function that takes a role and returns middleware.
Returns 403 if `req.user.role` does not match the required role.
Usage: `roleGuard('SHOP')` or `roleGuard('CLIENT')`.

**`error.middleware.ts`**
Global Express error handler (4-argument middleware).
Catches all thrown errors. Returns the standard error shape:
```json
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
```
Maps known error types to HTTP status codes. Unknown errors return 500.

### 7.2 Controllers
Create in `src/presentation/controllers/`. One file per domain area.
Each controller method does exactly three things:
1. Parse and validate the request (use Zod schemas)
2. Call the use case `execute` method
3. Return the response with the appropriate HTTP status code

No business logic in controllers. No Prisma in controllers.

Controllers to create:
- `auth.controller.ts` → `register`, `login`, `me`
- `shop.controller.ts` → `create`, `list`, `getOne`, `update`
- `car.controller.ts` → `add`, `list`, `remove`
- `appointment.controller.ts` → `create`, `getOne`, `listMine`, `approve`, `deny`, `complete`, `cancel`
- `rating.controller.ts` → `create`

### 7.3 Zod Validation Schemas
For each controller, define Zod schemas for request body and params validation.
Keep schemas in the same file as the controller or in a sibling `*.schema.ts` file.
Call `schema.parse(req.body)` at the top of each controller method.
Zod will throw automatically if validation fails — the error middleware catches it.

### 7.4 Routes
Create in `src/presentation/routes/`. One file per domain area.
Each route file creates an Express Router, applies middleware, and wires controller methods.

Route file structure:
- Import `Router` from Express
- Import the relevant middleware
- Import the controller
- Define routes with middleware chains
- Export the router

Routes to wire (reference `autohub-ai-context.md` Section for the full endpoint table):
- `auth.routes.ts` → `/auth/register`, `/auth/login`, `/auth/me`
- `shop.routes.ts` → `/shops` (GET, POST), `/shops/:shopId` (GET, PATCH)
- `car.routes.ts` → `/cars` (GET, POST), `/cars/:carId` (DELETE)
- `appointment.routes.ts` → all appointment endpoints
- `rating.routes.ts` → `/ratings` (POST)

### 7.5 app.ts
Wire everything together:
- Create Express app
- Apply global middleware: `cors()`, `express.json()`
- Mount all routers under `/api/v1`
- Apply the error middleware last

### 7.6 server.ts
Entry point:
- Load `.env` with `dotenv`
- Import and start the app
- Start the BullMQ notification worker
- Listen on `process.env.PORT`
- Log the port on startup

---

## Step 8 — Dependency Wiring

You need to wire dependencies manually (no IoC container in MVP — keep it simple).

Create `src/infrastructure/container.ts`.
This file instantiates everything in the right order and exports ready-to-use use case instances:

1. Instantiate `PrismaClient`
2. Instantiate all Prisma repositories (pass `prisma`)
3. Instantiate `JwtAuthService`
4. Instantiate `BullMQEventPublisher`
5. Instantiate all use cases (pass the repositories and publisher they need)
6. Export all use cases

Controllers import from `container.ts`. This is the only place where all layers touch.

---

## Step 9 — Build Order Checklist

Follow this exact order to avoid circular dependency issues:

- [ ] Step 1: Project setup, tsconfig, env files
- [ ] Step 2: Create folder structure
- [ ] Step 3: Write Prisma schema, run migration, verify with Prisma Studio
- [ ] Step 4: Domain layer (value objects → events → entities → repository interfaces)
- [ ] Step 5: Application layer (interfaces → DTOs → use cases)
- [ ] Step 6: Infrastructure layer (Prisma client → repositories → auth service → BullMQ)
- [ ] Step 7: Presentation layer (middleware → controllers → routes → app.ts → server.ts)
- [ ] Step 8: Wire container.ts
- [ ] Step 9: Start dev server, test health check endpoint
- [ ] Step 10: Test each endpoint group in Postman (auth → shops → cars → appointments → ratings)

---

## Step 10 — Testing Each Flow in Postman

### Flow 1: Client books an appointment
1. `POST /api/v1/auth/register` (role: CLIENT) → save token
2. `POST /api/v1/cars` → add a car → save carId
3. `GET /api/v1/shops` → pick a shopId
4. `POST /api/v1/appointments` → create appointment → save appointmentId
5. Check the shop owner's email arrived (notification)

### Flow 2: Shop approves the appointment
1. `POST /api/v1/auth/login` (shop user) → save token
2. `GET /api/v1/appointments/my?status=PENDING` → see the booking
3. `PATCH /api/v1/appointments/:id/approve` with negotiatedPrice
4. Check the client's email arrived (notification)

### Flow 3: Rate each other
1. Shop: `PATCH /api/v1/appointments/:id/complete`
2. Client: `POST /api/v1/ratings` (score + comment)
3. Shop: `POST /api/v1/ratings` (score + comment)
4. `GET /api/v1/shops/:shopId` → verify averageRating updated

---

## Common Mistakes to Avoid

- Importing Prisma inside a use case → move it to a repository
- Putting `if` statements with business meaning inside a controller → move to use case or entity
- Returning `password` in any response → always omit it when serializing users
- Approving an appointment without checking capacity → always count approved appointments for that date first
- Creating a rating without checking the appointment is COMPLETED → validate status in the use case
- Not publishing a domain event after a status change → check the events table in `autohub-ai-context.md`

---

## After the API Is Done

Once all flows are working and tested in Postman:

1. Deploy to Railway or Render (connect your GitHub repo, set env vars, done)
2. Use a free Neon.tech PostgreSQL instance for the hosted database
3. Use Upstash for hosted Redis (free tier)
4. Come back to this guide and start the React Native build