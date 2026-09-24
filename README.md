# Distribution ERP + CRM Portal

A full-stack ERP and CRM operations portal built for wholesale and distribution businesses to manage customers, products, inventory, stock movements, sales challans, and role-based access from a single web portal.

## 🔗 Links

- **Live Demo:** [Distribution ERP + CRM Portal](https://main.d2ejvrp62zka7e.amplifyapp.com/login)
- **GitHub Repository:** [SubratGupta0506/fundstrom-erp](https://github.com/SubratGupta0506/fundstrom-erp)

---

## Overview

Fundstrom ERP is a role-based operations portal I designed and built end-to-end — from relational schema design through authentication, business logic, and deployment. It covers the core workflows a small distribution business needs day to day: managing customers and products, tracking inventory movements, and issuing sales challans, all gated behind role-specific permissions.

The goal was to build something close to a real production tool rather than a toy CRUD app — so the project includes proper validation, negative-stock prevention, draft/confirm/cancel state machines for challans, and snapshotted data integrity for historical records.

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Secure password hashing using bcrypt
- Role-based access control
- Four supported roles:
  - Admin
  - Sales
  - Warehouse
  - Accounts
- Protected API routes
- Role-specific navigation and permissions

### Customer CRM

- Add, edit, and search customers
- Filter by customer type and status
- Customer types: Retail, Wholesale, Distributor
- Customer statuses: Lead, Active, Inactive
- Follow-up date and notes
- Business and GST information
- Customer detail view with pagination

### Product Management

- Add, edit, and search products
- Filter by category
- SKU management
- Unit price, current stock, and minimum stock threshold
- Warehouse and location information
- Low-stock identification
- Pagination

### Inventory & Stock Management

- Stock IN and Stock OUT movements
- Stock movement history with reason and created-by tracking
- Timestamped, product-level movement history
- Prevents negative stock
- Insufficient-stock validation

### Sales Challans

- Create sales challans with multiple products and quantities
- Automatically generated challan numbers
- Draft, confirm, and cancel workflow
- Product snapshot stored with each challan item for historical accuracy
- Total quantity calculation
- Stock deduction on confirmation, blocked if stock is insufficient
- Search, filter, and detail view

### Dashboard

- Total customers, total products, low-stock count
- Draft, confirmed, and cancelled challan counts
- Recent challans and recent stock movements
- Role-based navigation

---

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- HTML5 / CSS3

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs
- Zod (validation)
- JWT
- bcryptjs
- CORS
- dotenv

### Database & ORM
- PostgreSQL
- Prisma ORM
- Prisma Migrations
- `@prisma/adapter-pg`
- `pg`

### Tools & Deployment
- Git / GitHub
- VS Code
- Postman
- AWS Amplify (frontend)
- Render (backend)

---

## Project Structure

```text
fundstrom-erp/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

## Role Permissions

| Module         | Admin | Sales | Warehouse | Accounts |
|----------------|:-----:|:-----:|:---------:|:--------:|
| Dashboard      | ✓     | ✓     | ✓         | ✓        |
| Customers      | ✓     | ✓     | —         | —        |
| Products       | ✓     | —     | ✓         | —        |
| Inventory      | ✓     | —     | ✓         | —        |
| Sales Challans | ✓     | ✓     | —         | ✓        |

The frontend navigation reflects the user's role, while backend APIs enforce authorization independently.

## API Overview

### Authentication
```
POST /api/auth/login
GET  /api/auth/me
```

### Customers
```
POST /api/customers
GET  /api/customers
GET  /api/customers/:id
PUT  /api/customers/:id
```

### Products
```
POST /api/products
GET  /api/products
GET  /api/products/:id
PUT  /api/products/:id
```

### Inventory
```
POST /api/stock/movements
GET  /api/stock/movements
```

### Challans
```
POST /api/challans
GET  /api/challans
GET  /api/challans/:id
PUT  /api/challans/:id/confirm
PUT  /api/challans/:id/cancel
```

### Dashboard
```
GET /api/dashboard
```

### Health Check
```
GET /api/health
```

## Backend Setup

### 1. Navigate to backend
```cmd
cd backend
```

### 2. Install dependencies
```cmd
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the backend directory:

```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/fundstrom_erp"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
```

Do not commit `.env` to GitHub.

### 4. Generate Prisma Client
```cmd
npx prisma generate
```

### 5. Run database migrations
```cmd
npx prisma migrate dev
```

### 6. Start backend
```cmd
npm run dev
```

Backend runs on:
```
http://localhost:5000
```

Health check:
```
http://localhost:5000/api/health
```

## Frontend Setup

Open another terminal.

### 1. Navigate to frontend
```cmd
cd frontend
```

### 2. Install dependencies
```cmd
npm install
```

### 3. Start frontend
```cmd
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

## Demo Accounts

The application includes four demo accounts for evaluation purposes.

| Role      | Email                     | Password       |
|-----------|----------------------------|----------------|
| Admin     | admin@fundstrom.com       | Admin@123      |
| Sales     | sales@fundstrom.com       | Sales@123      |
| Warehouse | warehouse@fundstrom.com   | Warehouse@123  |
| Accounts  | accounts@fundstrom.com    | Accounts@123   |

The login interface provides demo-role shortcuts for easier testing.

## Business Rules

### Stock
- Stock cannot become negative.
- Stock IN increases available stock.
- Stock OUT decreases available stock.
- OUT movement greater than available stock is rejected.
- Stock changes are recorded in the stock movement history.

### Challans
- A challan can be created as a Draft.
- Confirming a challan deducts the required quantities from inventory.
- A challan cannot be confirmed if sufficient stock is unavailable.
- Cancelled challans do not deduct stock.
- Product information is stored as a snapshot in challan items.

## Validation & Error Handling

The backend implements:

- Request validation using Zod
- Authentication and authorization errors
- Invalid ID validation
- Duplicate SKU protection
- Duplicate/invalid data handling
- Insufficient-stock validation
- Route-not-found handling
- Centralized error handling
- Appropriate HTTP status codes

## Security

- Passwords are hashed using bcrypt.
- JWT tokens are used for authentication.
- Protected routes require authentication.
- Role-based authorization is enforced at the API level.
- Environment variables are excluded from version control.
- Database credentials are not stored in source code.

## Development Commands

### Backend
```
npm run dev
npm run build
npm start
```

### Frontend
```
npm run dev
npm run build
npm run preview
```

## What This Project Demonstrates

- Full-stack ownership: relational schema design, REST API development, and a React frontend, built and deployed independently
- Role-based access control implemented at both the UI and API layers
- State management using React Context API and useReducer for auth/session handling
- Business-rule-driven backend logic (stock integrity, challan lifecycle, data snapshotting)
- Production-style practices: validation, centralized error handling, and environment-based configuration
- Deployed frontend (AWS Amplify) and backend (Render) as a working, publicly accessible application

## Author

**Subrat Gupta**
[LinkedIn](https://www.linkedin.com/in/subrat-gupta-656a45354) · [GitHub](https://github.com/SubratGupta0506) · [Portfolio](https://subratgupta0506.github.io/SubratGupta/)
