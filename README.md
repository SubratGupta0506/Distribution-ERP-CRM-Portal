# Fundstrom ERP + CRM Operations Portal

A full-stack ERP and CRM operations portal developed for the Fundstrom Full Stack Developer Assessment.

The application is designed for a wholesale/distribution business to manage customers, products, inventory, stock movements, sales challans, and role-based access from a single web portal.

## 🔗 Links

- **Live Demo:** [fundstrom-erp](https://main.d2ejvrp62zka7e.amplifyapp.com/login)
- **GitHub Repository:** [SubratGupta0506/fundstrom-erp](https://github.com/SubratGupta0506/fundstrom-erp)

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

- Add customers
- Edit customers
- Search customers
- Filter by customer type and status
- Customer types:
  - Retail
  - Wholesale
  - Distributor
- Customer statuses:
  - Lead
  - Active
  - Inactive
- Follow-up date
- Notes
- Business and GST information
- Customer detail view
- Pagination

### Product Management

- Add products
- Edit products
- Search products
- Filter by category
- SKU management
- Unit price
- Current stock
- Minimum stock threshold
- Warehouse and location information
- Low-stock identification
- Pagination

### Inventory & Stock Management

- Stock IN movements
- Stock OUT movements
- Stock movement history
- Movement reason tracking
- Created-by tracking
- Timestamp tracking
- Product-level movement history
- Prevents negative stock
- Insufficient-stock validation

### Sales Challans

- Create sales challans
- Select customers
- Add multiple products
- Specify product quantities
- Automatically generate challan numbers
- Draft challans
- Confirm challans
- Cancel challans
- Product snapshot information stored with challan items
- Total quantity calculation
- Stock deduction on confirmation
- Prevents confirmation when stock is insufficient
- Search and filter challans
- Challan detail view

### Dashboard

- Total customers
- Total products
- Low-stock count
- Draft challans
- Confirmed challans
- Cancelled challans
- Recent challans
- Recent stock movements
- Role-based navigation

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- Zod
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

- Git
- GitHub
- VS Code
- Postman
- AWS Amplify
- Render

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

The application contains four demo accounts for assessment and demonstration purposes.

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
- Authentication errors
- Authorization errors
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

## Assessment Scope

This project was developed according to the Fundstrom Full Stack Developer Assessment requirements, covering:

- Authentication
- Role-based authorization
- Customer CRM
- Product management
- Inventory management
- Stock movement logging
- Sales challans
- Dashboard
- REST APIs
- Validation
- Error handling
- Pagination
- Search/filter functionality
- Responsive frontend
- PostgreSQL database
- Prisma ORM

## Author

Developed as part of the Fundstrom Full Stack Developer Assessment.
