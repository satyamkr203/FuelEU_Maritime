# FuelEU Maritime Backend - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [System Workflow](#system-workflow)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Business Logic](#business-logic)
7. [Setup & Installation](#setup--installation)

---

## Overview

The FuelEU Maritime Backend is a compliance management system for maritime vessels under the FuelEU Maritime regulation. It helps track and manage:

- **Routes**: Vessel routes with GHG intensity calculations
- **Compliance**: Ship compliance balances (CB - Compliance Balance)
- **Banking**: Surplus/deficit banking system for GHG emissions
- **Pooling**: Pooling mechanism for compliance sharing between vessels

### Key Concepts

- **CB (Compliance Balance)**: The difference between target GHG intensity and actual GHG intensity, multiplied by energy consumption
- **Baseline Route**: A reference route used for comparison with other routes
- **Banking**: System to store surplus compliance or apply stored compliance to deficits
- **Pooling**: Mechanism to redistribute compliance balances among multiple vessels

---

## Architecture

This application follows **Hexagonal Architecture (Ports & Adapters)** pattern:

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
│  (Prisma Repositories)                                  │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure                         │
│  (Database: PostgreSQL via Prisma)                      │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── src/
│   ├── adapters/
│   │   ├── inbound/http/          # HTTP Controllers (API endpoints)
│   │   └── outbound/prisma/       # Database repositories
│   ├── core/
│   │   ├── application/           # Business logic (use cases)
│   │   ├── domain/                # Domain entities
│   │   └── ports/                 # Repository interfaces
│   ├── infrastructure/
│   │   ├── db/                    # Prisma client setup
│   │   └── server.ts              # Express server configuration
│   └── shared/                    # Shared utilities
└── prisma/
    └── schema.prisma              # Database schema
```

---

## System Workflow

### 1. Route Management Workflow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /routes
       ▼
┌─────────────────┐
│ RoutesController│
└──────┬──────────┘
       │
       │ findAll()
       ▼
┌──────────────────────┐
│ RouteRepository      │
│ (Prisma)             │
└──────┬───────────────┘
       │
       │ Query Database
       ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

### 2. Compliance Calculation Workflow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /compliance/cb?shipId=X&year=Y
       ▼
┌──────────────────────┐
│ ComplianceController │
└──────┬───────────────┘
       │
       │ 1. Fetch Route Data
       ▼
┌──────────────────────┐
│ RouteRepository      │
└──────┬───────────────┘
       │
       │ 2. Compute CB
       ▼
┌──────────────────────┐
│ computeCB()          │
│ CB = (TARGET - ACTUAL)│
│      × ENERGY_MJ     │
└──────┬───────────────┘
       │
       │ 3. Save Snapshot
       ▼
┌──────────────────────┐
│ ShipCompliance Table │
└──────────────────────┘
```

### 3. Banking Workflow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /banking/bank
       │ { shipId, year, amount }
       ▼
┌──────────────────────┐
│ BankingController    │
└──────┬───────────────┘
       │
       │ Create Bank Entry
       │ (Positive amount = surplus)
       ▼
┌──────────────────────┐
│ bank_entries Table   │
└──────────────────────┘

       │
       │ POST /banking/apply
       │ { shipId, year, amount }
       ▼
┌──────────────────────┐
│ Create Negative Entry│
│ (Apply banked amount)│
└──────────────────────┘
```

### 4. Pooling Workflow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /pools
       │ { year, members: [{shipId, cbBefore}] }
       ▼
┌──────────────────────┐
│ PoolsController      │
└──────┬───────────────┘
       │
       │ 1. Separate Surpluses & Deficits
       │ 2. Greedy Allocation Algorithm
       │    - Sort surpluses (desc)
       │    - Sort deficits (asc)
       │    - Transfer from surplus to deficit
       ▼
┌──────────────────────┐
│ pools Table          │
│ pool_members Table   │
└──────────────────────┘
```

### 5. Complete Compliance Flow

```
1. Create/Query Routes
   └─> GET /routes

2. Set Baseline Route
   └─> POST /routes/:routeId/baseline

3. Compare Routes
   └─> GET /routes/comparison

4. Calculate Compliance Balance
   └─> GET /compliance/cb?shipId=X&year=Y

5. Bank Surplus (if CB > 0)
   └─> POST /banking/bank

6. Apply Banked Amount (if CB < 0)
   └─> POST /banking/apply

7. View Adjusted CB (with banking)
   └─> GET /compliance/adjusted-cb?year=Y

8. Create Pool (optional)
   └─> POST /pools
```

---

## API Endpoints

### Base URL
```
http://localhost:4000
```

### Routes Endpoints

#### 1. Get All Routes
**GET** `/routes`

Retrieves all routes with optional filtering.

**Query Parameters:**
- `vesselType` (optional): Filter by vessel type
- `fuelType` (optional): Filter by fuel type
- `year` (optional): Filter by year

**Example Request:**
```bash
GET /routes?vesselType=Container&year=2024
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "routeId": "ROUTE-001",
      "vesselType": "Container",
      "fuelType": "LNG",
      "year": 2024,
      "ghgIntensity": 85.5,
      "fuelConsumption": 1200.5,
      "distance": 5000,
      "totalEmissions": 102600,
      "isBaseline": false
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

#### 2. Set Baseline Route
**POST** `/routes/:routeId/baseline`

Sets a route as the baseline route for comparison. Only one baseline can exist at a time.

**Path Parameters:**
- `routeId` (required): The route ID to set as baseline

**Example Request:**
```bash
POST /routes/ROUTE-001/baseline
```

**Response:**
```json
{
  "message": "Baseline set",
  "data": {
    "id": 1,
    "routeId": "ROUTE-001",
    "vesselType": "Container",
    "fuelType": "LNG",
    "year": 2024,
    "ghgIntensity": 85.5,
    "fuelConsumption": 1200.5,
    "distance": 5000,
    "totalEmissions": 102600,
    "isBaseline": true
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Route not found
- `500`: Server error

---

### Compliance Endpoints

#### 3. Compare Routes with Baseline
**GET** `/routes/comparison`

Compares all routes against the baseline route and checks compliance.

**Response:**
```json
{
  "baseline": {
    "routeId": "ROUTE-001",
    "ghgIntensity": 89.3368
  },
  "comparisons": [
    {
      "routeId": "ROUTE-002",
      "vesselType": "Bulk Carrier",
      "fuelType": "MGO",
      "year": 2024,
      "ghgIntensity": 92.5,
      "percentDiff": 3.54,
      "compliant": false
    },
    {
      "routeId": "ROUTE-003",
      "vesselType": "Tanker",
      "fuelType": "LNG",
      "year": 2024,
      "ghgIntensity": 88.0,
      "percentDiff": -1.50,
      "compliant": true
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `404`: No baseline set
- `500`: Server error

---

#### 4. Calculate Compliance Balance (CB)
**GET** `/compliance/cb`

Calculates and stores a compliance balance snapshot for a ship/route.

**Query Parameters:**
- `shipId` (required): Ship/Route ID
- `year` (required): Year for compliance calculation

**Example Request:**
```bash
GET /compliance/cb?shipId=ROUTE-001&year=2024
```

**Response:**
```json
{
  "shipId": "ROUTE-001",
  "year": 2024,
  "cbBefore": 157680.0,
  "snapshotId": 1
}
```

**CB Calculation Formula:**
```
CB = (TARGET_INTENSITY - ACTUAL_INTENSITY) × ENERGY_MJ
ENERGY_MJ = FUEL_TONS × 41,000 MJ/t
TARGET_INTENSITY = 89.3368 gCO2e/MJ
```

**Status Codes:**
- `200`: Success
- `400`: Missing shipId or year
- `404`: Route not found
- `500`: Server error

---

#### 5. Get Adjusted Compliance Balance
**GET** `/compliance/adjusted-cb`

Retrieves compliance balances adjusted by banking entries for all ships in a given year.

**Query Parameters:**
- `year` (required): Year to query

**Example Request:**
```bash
GET /compliance/adjusted-cb?year=2024
```

**Response:**
```json
{
  "year": 2024,
  "adjusted": [
    {
      "shipId": "ROUTE-001",
      "cbBefore": 157680.0,
      "cbAfter": 200680.0
    },
    {
      "shipId": "ROUTE-002",
      "cbBefore": -50000.0,
      "cbAfter": -30000.0
    }
  ]
}
```

**Note:** `cbAfter = cbBefore + bankedAmount`

**Status Codes:**
- `200`: Success
- `400`: Missing year parameter
- `500`: Server error

---

### Banking Endpoints

#### 6. Get Bank Records
**GET** `/banking/records`

Retrieves all banking entries for a specific ship and year.

**Query Parameters:**
- `shipId` (required): Ship ID
- `year` (required): Year

**Example Request:**
```bash
GET /banking/records?shipId=ROUTE-001&year=2024
```

**Response:**
```json
{
  "shipId": "ROUTE-001",
  "year": 2024,
  "entries": [
    {
      "id": 1,
      "ship_id": "ROUTE-001",
      "year": 2024,
      "amount_gco2eq": 50000.0,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "ship_id": "ROUTE-001",
      "year": 2024,
      "amount_gco2eq": -20000.0,
      "created_at": "2024-02-20T14:15:00Z"
    }
  ],
  "totalBanked": 30000.0
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing shipId or year
- `500`: Server error

---

#### 7. Bank Surplus
**POST** `/banking/bank`

Stores a surplus compliance balance (positive amount) in the banking system.

**Request Body:**
```json
{
  "shipId": "ROUTE-001",
  "year": 2024,
  "amount": 50000.0
}
```

**Example Request:**
```bash
POST /banking/bank
Content-Type: application/json

{
  "shipId": "ROUTE-001",
  "year": 2024,
  "amount": 50000.0
}
```

**Response:**
```json
{
  "message": "Banked",
  "entry": {
    "id": 1,
    "ship_id": "ROUTE-001",
    "year": 2024,
    "amount_gco2eq": 50000.0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields or amount <= 0
- `500`: Server error

---

#### 8. Apply Banked Amount
**POST** `/banking/apply`

Applies a previously banked surplus to cover a deficit (creates negative entry).

**Request Body:**
```json
{
  "shipId": "ROUTE-001",
  "year": 2024,
  "amount": 20000.0
}
```

**Example Request:**
```bash
POST /banking/apply
Content-Type: application/json

{
  "shipId": "ROUTE-001",
  "year": 2024,
  "amount": 20000.0
}
```

**Response:**
```json
{
  "message": "Applied banked amount",
  "applied": 20000.0,
  "entry": {
    "id": 2,
    "ship_id": "ROUTE-001",
    "year": 2024,
    "amount_gco2eq": -20000.0,
    "created_at": "2024-02-20T14:15:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields, amount <= 0, or insufficient banked amount
- `500`: Server error

---

### Pooling Endpoints

#### 9. Create Pool
**POST** `/pools`

Creates a compliance pool and redistributes compliance balances among member ships using a greedy allocation algorithm.

**Request Body:**
```json
{
  "year": 2024,
  "members": [
    {
      "shipId": "ROUTE-001",
      "cbBefore": 50000.0
    },
    {
      "shipId": "ROUTE-002",
      "cbBefore": -30000.0
    },
    {
      "shipId": "ROUTE-003",
      "cbBefore": -20000.0
    }
  ]
}
```

**Example Request:**
```bash
POST /pools
Content-Type: application/json

{
  "year": 2024,
  "members": [
    {"shipId": "ROUTE-001", "cbBefore": 50000.0},
    {"shipId": "ROUTE-002", "cbBefore": -30000.0},
    {"shipId": "ROUTE-003", "cbBefore": -20000.0}
  ]
}
```

**Response:**
```json
{
  "poolId": 1,
  "members": [
    {
      "id": 1,
      "pool_id": 1,
      "ship_id": "ROUTE-001",
      "cb_before": 50000.0,
      "cb_after": 0.0
    },
    {
      "id": 2,
      "pool_id": 1,
      "ship_id": "ROUTE-002",
      "cb_before": -30000.0,
      "cb_after": 0.0
    },
    {
      "id": 3,
      "pool_id": 1,
      "ship_id": "ROUTE-003",
      "cb_before": -20000.0,
      "cb_after": 0.0
    }
  ]
}
```

**Pooling Algorithm:**
1. Validates that total CB >= 0
2. Separates ships into surpluses (CB > 0) and deficits (CB < 0)
3. Sorts surpluses in descending order
4. Sorts deficits in ascending order (most negative first)
5. Greedily transfers from surpluses to deficits until all deficits are covered or surpluses are exhausted

**Status Codes:**
- `200`: Success
- `400`: Missing required fields, invalid members array, or sum < 0
- `500`: Server error

---

### Health Check

#### 10. Health Check
**GET** `/`

Returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "FuelEU-backend"
}
```

**Status Codes:**
- `200`: Service is running

---

## Data Models

### Route
```typescript
{
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;        // gCO2e/MJ
  fuelConsumption: number;      // tons
  distance: number;             // km
  totalEmissions: number;       // gCO2e
  isBaseline: boolean;
}
```

### ShipCompliance
```typescript
{
  id?: number;
  shipId: string;
  year: number;
  cbGco2eq: number;             // Compliance Balance in gCO2e
  createdAt?: Date;
}
```

### BankEntry
```typescript
{
  id: number;
  ship_id: string;
  year: number;
  amount_gco2eq: number;        // Positive = surplus, Negative = applied
  created_at: Date;
}
```

### Pool
```typescript
{
  id: number;
  year: number;
  created_at: Date;
}
```

### PoolMember
```typescript
{
  id: number;
  pool_id: number;
  ship_id: string;
  cb_before: number;            // CB before pooling
  cb_after: number;             // CB after pooling
}
```

---

## Business Logic

### Compliance Balance (CB) Calculation

The Compliance Balance represents the difference between the target GHG intensity and the actual GHG intensity, multiplied by the total energy consumed.

**Formula:**
```
CB = (TARGET_INTENSITY - ACTUAL_INTENSITY) × ENERGY_MJ

Where:
- TARGET_INTENSITY = 89.3368 gCO2e/MJ (FuelEU regulation target)
- ENERGY_MJ = FUEL_CONSUMPTION_TONS × 41,000 MJ/t
- ACTUAL_INTENSITY = route.ghg_intensity (gCO2e/MJ)
```

**Interpretation:**
- **Positive CB**: Surplus compliance (ship exceeds target)
- **Negative CB**: Deficit compliance (ship below target)

### Banking System

The banking system allows ships to:
1. **Store surplus** (positive CB) for future use
2. **Apply stored surplus** to cover deficits (negative CB)

**Banking Rules:**
- Only positive amounts can be banked
- Applied amounts must not exceed available banked amount
- Bank entries are tracked per ship and year

### Pooling Algorithm

The pooling mechanism redistributes compliance balances among multiple ships:

1. **Validation**: Total CB of all members must be >= 0
2. **Separation**: Ships are divided into:
   - Surpluses: Ships with CB > 0
   - Deficits: Ships with CB < 0
3. **Allocation**: Greedy algorithm:
   - Sort surpluses descending (largest first)
   - Sort deficits ascending (most negative first)
   - Transfer from each surplus to deficits until:
     - Surplus is exhausted, or
     - All deficits are covered

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Database**
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fueleu_db"
PORT=4000
```

3. **Run Database Migrations**
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Seed Database (Optional)**
```bash
npm run prisma:seed
```

5. **Start Development Server**
```bash
npm run dev
```

The server will start on `http://localhost:4000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Architecture**: Hexagonal Architecture (Ports & Adapters)

---

## API Summary Table

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | No |
| GET | `/routes` | Get all routes | No |
| POST | `/routes/:routeId/baseline` | Set baseline route | No |
| GET | `/routes/comparison` | Compare routes with baseline | No |
| GET | `/compliance/cb` | Calculate compliance balance | No |
| GET | `/compliance/adjusted-cb` | Get adjusted CB with banking | No |
| GET | `/banking/records` | Get bank records | No |
| POST | `/banking/bank` | Bank surplus | No |
| POST | `/banking/apply` | Apply banked amount | No |
| POST | `/pools` | Create compliance pool | No |

---

## Notes

- All amounts are in **gCO2e** (grams of CO2 equivalent)
- GHG intensity is measured in **gCO2e/MJ**
- Energy conversion: **41,000 MJ per ton of fuel**
- Target intensity: **89.3368 gCO2e/MJ** (FuelEU Maritime regulation)
- The system uses `shipId` and `routeId` interchangeably (same identifier)

---

## License

