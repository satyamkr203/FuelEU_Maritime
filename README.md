# FuelEU Maritime Compliance Platform

A full-stack compliance management system for maritime vessels under the **Fuel EU Maritime Regulation (EU) 2023/1805**. This platform helps track and manage route data, compliance balances (CB), banking operations, and pooling mechanisms.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [AI Agent Usage](#ai-agent-usage)
- [Reference Documentation](#reference-documentation)

---

## 🎯 Overview

This platform implements a minimal yet structured compliance module for Fuel EU Maritime regulation, featuring:

- **Frontend Dashboard**: React + TypeScript + TailwindCSS with four main tabs (Routes, Compare, Banking, Pooling)
- **Backend APIs**: Node.js + TypeScript + PostgreSQL with RESTful endpoints
- **Architecture**: Hexagonal (Ports & Adapters / Clean Architecture) pattern
- **Compliance Calculations**: CB (Compliance Balance), Banking (Article 20), and Pooling (Article 21)

### Key Concepts

- **CB (Compliance Balance)**: The difference between target GHG intensity and actual GHG intensity, multiplied by energy consumption
- **Baseline Route**: A reference route used for comparison with other routes
- **Banking**: System to store surplus compliance or apply stored compliance to deficits (Article 20)
- **Pooling**: Mechanism to redistribute compliance balances among multiple vessels (Article 21)

---

## 🏗️ Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** pattern, ensuring clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  Inbound Adapters                       │
│  (HTTP Controllers - Express Routes)                    │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                      │
│  (Business Logic: computeCB, banking, createPool)       │
├─────────────────────────────────────────────────────────┤
│                  Domain Layer                           │
│  (Entities: Route, ShipCompliance)                      │
├─────────────────────────────────────────────────────────┤
│                  Ports (Interfaces)                     │
│  (RouteRepository, ComplianceRepository)                │
├─────────────────────────────────────────────────────────┤
│                  Outbound Adapters                      │
│  (Prisma Repositories, Database)                        │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
  core/
    domain/          # Domain entities (Route, CB)
    application/     # Use cases (compare, format)
  adapters/
    ui/              # React components and pages
    infrastructure/  # API clients and hooks
  shared/            # Utilities
```

### Backend Architecture

```
src/
  core/
    domain/          # Domain entities (Route, ShipCompliance)
    application/     # Business logic (computeCB, banking, createPool)
    ports/           # Repository interfaces
  adapters/
    inbound/http/    # Express controllers
    outbound/prisma/ # Prisma implementations
  infrastructure/
    db/              # Prisma client
    server/          # Express server setup
  shared/            # Utilities
```

---

## ✨ Features

### 1. Routes Tab
- Display table of all routes with filtering (vesselType, fuelType, year)
- Columns: routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance, totalEmissions
- "Set Baseline" button to mark a route as baseline for comparison

### 2. Compare Tab
- Compare all routes against baseline route
- Display percentage difference and compliance status (✅ / ❌)
- Visual chart (bar/line) comparing GHG intensity values
- Target intensity: **89.3368 gCO₂e/MJ** (2% below 91.16)

### 3. Banking Tab
- View current Compliance Balance (CB) for a ship/year
- Bank positive CB surplus
- Apply banked surplus to cover deficits
- Display KPIs: `cb_before`, `applied`, `cb_after`
- Validation: Disable actions if CB ≤ 0

### 4. Pooling Tab
- Fetch adjusted CB per ship (after banking)
- Create pools with multiple members
- Validation rules:
  - Sum(adjustedCB) ≥ 0
  - Deficit ship cannot exit worse
  - Surplus ship cannot exit negative
- Visual indicators for pool validity (red/green)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript 5.5
- **Build Tool**: Vite 7.2
- **Styling**: TailwindCSS 3.4
- **State Management**: React Query (TanStack Query) 5.0
- **Routing**: React Router DOM 6.16
- **Charts**: Recharts 2.15
- **HTTP Client**: Axios 1.5

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2
- **Language**: TypeScript 5.9
- **ORM**: Prisma 6.19
- **Database**: PostgreSQL
- **Development**: ts-node-dev 2.0

---

## 📁 Project Structure

```
FuelEU_Maritime/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── ui/           # React components and pages
│   │   │   └── infrastructure/  # API clients and hooks
│   │   ├── core/             # Domain and application logic
│   │   └── shared/           # Utilities
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── inbound/http/     # Express controllers
│   │   │   └── outbound/prisma/  # Prisma repositories
│   │   ├── core/                 # Domain, application, ports
│   │   ├── infrastructure/       # Server and DB setup
│   │   └── shared/               # Utilities
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Seed data
│   └── package.json
│
├── postman_api_sc/           # API screenshots
├── README.md                  # This file
├── AGENT_WORKFLOW.md          # AI agent usage documentation
├── REFLECTION.md              # Reflection on AI agent usage
└── ARCHITECTURE_AGENTIC.md    # Architecture and agentic workflows guide
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fueleu_db"
   PORT=4000
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database** (optional, but recommended)
   ```bash
   npm run prisma:seed
   ```

   This will populate the database with 5 sample routes matching the KPIs dataset:
   - R001: Container, HFO, 2024 (Baseline)
   - R002: BulkCarrier, LNG, 2024
   - R003: Tanker, MGO, 2024
   - R004: RoRo, HFO, 2025
   - R005: Container, LNG, 2025

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   
   The frontend is configured to connect to `http://localhost:4000` by default. If your backend runs on a different port, update `frontend/src/adapters/infrastructure/api/apiClient.ts`.

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:4000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is occupied)

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000
```

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/routes` | Get all routes (with optional filters) |
| POST | `/routes/:routeId/baseline` | Set baseline route |
| GET | `/routes/comparison` | Compare routes with baseline |
| GET | `/compliance/cb` | Calculate compliance balance |
| GET | `/compliance/adjusted-cb` | Get adjusted CB with banking |
| GET | `/banking/records` | Get bank records |
| POST | `/banking/bank` | Bank surplus |
| POST | `/banking/apply` | Apply banked amount |
| POST | `/pools` | Create compliance pool |

### Example Requests

**Get all routes:**
```bash
GET /routes?vesselType=Container&year=2024
```

**Set baseline:**
```bash
POST /routes/R001/baseline
```

**Calculate CB:**
```bash
GET /compliance/cb?shipId=R001&year=2024
```

**Bank surplus:**
```bash
POST /banking/bank
Content-Type: application/json

{
  "shipId": "R002",
  "year": 2024,
  "amount": 50000
}
```

**Create pool:**
```bash
POST /pools
Content-Type: application/json

{
  "year": 2024,
  "members": [
    { "shipId": "R001", "cbBefore": 100000 },
    { "shipId": "R002", "cbBefore": -50000 }
  ]
}
```

For detailed API documentation, see [backend/README.md](./backend/README.md).

---

## 📸 Screenshots

API request/response screenshots are available in the `postman_api_sc/` directory:
- `ph_1.png` - Routes endpoint
- `ph_2.png` - Comparison endpoint
- `ph_3.png` - Compliance CB endpoint
- `ph_4.png` - Banking endpoint
- `ph_5.png` - Pooling endpoint

---

## 📊 Core Formulas

### Compliance Balance (CB)

```
CB = (TARGET_INTENSITY - ACTUAL_INTENSITY) × ENERGY_MJ
ENERGY_MJ = FUEL_CONSUMPTION_TONS × 41,000 MJ/t
TARGET_INTENSITY = 89.3368 gCO2e/MJ
```

**Interpretation:**
- **Positive CB**: Surplus compliance (ship exceeds target)
- **Negative CB**: Deficit compliance (ship below target)

### Percentage Difference

```
percentDiff = ((comparison / baseline) - 1) × 100
```

### Compliance Check

```
compliant = ghgIntensity <= TARGET_INTENSITY (89.3368 gCO2e/MJ)
```

---

## 📚 Reference Documentation

This implementation follows the **Fuel EU Maritime Regulation (EU) 2023/1805**:
- **Annex IV**: Calculation methodologies
- **Article 20**: Banking mechanism
- **Article 21**: Pooling mechanism

Reference document: `2025-May-ESSF-SAPS-WS1-FuelEU-calculation-methodologies.pdf`

---


## 📝 Available Scripts

### Backend

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with sample data
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

### Frontend

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
```

---

## 🔧 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` file
- Check database credentials and permissions

### Port Already in Use

- Backend: Change `PORT` in `.env` or use `PORT=4001 npm run dev`
- Frontend: Vite will automatically use the next available port

### Prisma Client Not Generated

```bash
cd backend
npm run prisma:generate
```

### CORS Issues

<<<<<<< HEAD
CORS is enabled in the backend. If you encounter issues, check the `cors` configuration in `backend/src/infrastructure/server.ts`.

---
=======
CORS is enabled in the backend. If you encounter issues, check the `cors` configuration in `backend/src/infrastructure/server.ts`.
>>>>>>> 4a72103 (remove .DS_Store)
