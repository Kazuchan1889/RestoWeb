# Rasto — Restaurant Queue Management System

A full-stack monolith restaurant queue management system built with **Laravel 12**, **React + Vite**, **Tailwind CSS v4**, and **PostgreSQL**.

![License](https://img.shields.io/badge/license-MIT-black)
![PHP](https://img.shields.io/badge/PHP-8.2+-black)
![Node](https://img.shields.io/badge/Node-18+-black)

---

## Features

### Backend (API)
- **4 Restaurant Tables**: A(2 seats), B(4 seats), C(6 seats), D(8 seats)
- **Smart Table Assignment**: Assigns parties to the smallest available table that fits
- **Dining Duration**: `(party_size × 15) + random(5–15)` minutes
- **Priority Queue**: Largest party gets seated first (not FIFO)
- **Auto-Assignment**: When a table is freed, the next eligible waiting party is auto-seated
- **API Endpoints**:
  - `POST /api/arrive` — Register new party
  - `GET /api/status` — Current tables + queue status
  - `POST /api/serve` — Force-complete a dining session
  - `GET /api/history` — Completed sessions with filters & pagination
  - `POST /api/assign` — Manual party-to-table assignment (drag & drop)

### Frontend (Dashboard)
1. **Interactive Floor Plan** — Grid visualization of all 4 tables
2. **Color-coded Status** — Green (available), Red (dining), Blue (cleaning), Yellow (waiting)
3. **Drag & Drop** — Drag waiting parties onto tables with capacity validation
4. **Live Countdown Timer** — Real-time `Date.now()`-based countdown per table
5. **Force Complete** — Button to instantly free a dining table
6. **Priority Queue Visualization** — Queue sorted by largest party first
7. **History Table** — Multi-column sortable dining session history
8. **Search & Filter** — Filter history by customer name, party size, and table

---

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL (or SQLite for quick start)

### Installation

```bash
# Clone and enter project
cd "Full Development"

# Install PHP dependencies
composer install

# Install Node dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
php artisan key:generate

# Configure database in .env
# For PostgreSQL:
#   DB_CONNECTION=pgsql
#   DB_HOST=127.0.0.1
#   DB_PORT=5432
#   DB_DATABASE=rasto
#   DB_USERNAME=postgres
#   DB_PASSWORD=your_password

# For quick start with SQLite (default):
#   DB_CONNECTION=sqlite

# Run migrations and seed tables
php artisan migrate --seed
```

### Run (Single Command)

```bash
npm run dev
```

This starts both **Laravel backend** (`php artisan serve`) and **Vite frontend** simultaneously using `concurrently`.

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Testing

### Backend Tests (PHPUnit — 10 tests)
```bash
php artisan test --filter=QueueSystemTest
```

### Frontend Tests (Vitest — 8 test groups)
```bash
npm run test
```

### Test Coverage
| Area | Tests | Covers |
|------|-------|--------|
| Input Validation | 1 | Name/party_size required, min/max limits |
| Table Selection | 1 | Smallest fitting table assignment |
| Queue Management | 1 | Queueing when no table available |
| Priority Sorting | 1 | Largest party first ordering |
| Duration Calculation | 1 | Formula: `(size×15) + rand(5,15)` |
| Force Complete | 1 | Serve endpoint frees table |
| Auto-Assignment | 1 | Queue → table on freed |
| API Structure | 2 | Status & History response shapes |
| Capacity Validation | 1 | Drag & drop rejects oversized |
| Grid Rendering | 2 | All tables, status labels |
| Drag & Drop | 2 | Draggable items, data transfer |
| Timer | 2 | Countdown format, completion |
| Sort | 2 | Sortable headers, sort callback |
| Filter | 3 | Search, party size, table filters |
| Form | 2 | Disabled/enabled submit button |

---

## CI/CD Pipeline

Located at `.github/workflows/ci.yml`:

1. **Install Dependencies** — Composer + NPM
2. **Run Unit Tests** — PHPUnit (backend) + Vitest (frontend)
3. **Build Frontend** — Vite production build
4. **Deploy Staging** — (Optional) Vercel deployment

---

## Deployment to Vercel

This project includes a `vercel.json` configuration. To deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Build frontend assets
npm run build

# Deploy
vercel --prod
```

> **Note**: For full-stack deployment, consider using a Laravel-compatible hosting platform (e.g., Laravel Forge, Railway) that supports both PHP and Node.js. The Vercel config serves the static frontend build. For the API, you'll need a separate PHP hosting or use Vercel's serverless functions.

---

## Architecture

```
Full Development/
├── app/
│   ├── Http/Controllers/Api/
│   │   └── QueueController.php     # API endpoints
│   ├── Models/
│   │   ├── RestaurantTable.php     # Table model (A, B, C, D)
│   │   ├── Queue.php               # Queue entry model
│   │   └── DiningSession.php       # Dining session model
│   └── Services/
│       └── QueueService.php        # Core business logic
├── database/
│   ├── migrations/                 # Schema definitions
│   └── seeders/
│       └── TableSeeder.php         # Pre-populate tables
├── resources/
│   ├── css/app.css                 # Tailwind v4 + custom theme
│   ├── js/
│   │   ├── app.jsx                 # React entry
│   │   ├── api.js                  # Axios API client
│   │   ├── components/
│   │   │   ├── App.jsx             # Main dashboard
│   │   │   ├── RestaurantGrid.jsx  # Floor plan grid
│   │   │   ├── QueueList.jsx       # Priority queue
│   │   │   ├── LiveTimer.jsx       # Countdown timer
│   │   │   ├── HistoryTable.jsx    # Session history
│   │   │   ├── ArrivalForm.jsx     # New party form
│   │   │   └── Toast.jsx           # Notifications
│   │   └── __tests__/
│   │       └── Dashboard.test.jsx  # Frontend tests
│   └── views/
│       └── app.blade.php           # SPA Blade template
├── tests/Feature/
│   └── QueueSystemTest.php         # Backend tests (10)
├── .github/workflows/ci.yml       # CI/CD pipeline
├── vercel.json                     # Vercel deployment
└── vite.config.js                  # Vite + React + Tailwind
```

---

## Bonus: Revenue Optimization Strategy

### Problem
How to prevent small parties from occupying large tables without making them wait too long?

### Strategy: Time-Bounded Capacity Reservation

The idea is to **reserve large tables for large parties** for a limited time window, after which small parties can be seated at oversized tables if no large party is waiting.

### Pseudocode

```
function assignTable(party):
    # Step 1: Try exact or nearest fit (standard)
    bestTable = findSmallestAvailable(table.capacity >= party.size)
    
    if bestTable AND bestTable.capacity <= party.size * 2:
        # Good fit — seat immediately
        return seat(party, bestTable)
    
    # Step 2: Check if oversized table is the only option
    if bestTable AND bestTable.capacity > party.size * 2:
        # This is a much larger table than needed
        
        # Check reservation window
        waitTime = party.waitingSince - now()
        maxWait = getMaxWait(party.size)  # e.g., 2-person → 10min, 4-person → 8min
        
        if waitTime >= maxWait:
            # Party waited long enough — allow oversized seating
            return seat(party, bestTable)
        
        # Check if any large party in queue could use this table within window
        largePartyETA = estimateNextLargePartyArrival()
        
        if largePartyETA > maxWait:
            # No large party expected soon — allow seating
            return seat(party, bestTable)
        else:
            # Hold table — keep party waiting
            return addToQueue(party)
    
    # No table available at all
    return addToQueue(party)

function getMaxWait(partySize):
    # Smaller parties tolerate slightly longer waits
    # Larger parties get priority anyway
    return max(5, 15 - (partySize * 1.5))  # minutes
```

### Decision Flow Diagram

```
                    ┌─────────────────┐
                    │  Party Arrives   │
                    │  (size = N)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Find smallest   │
                    │ table ≥ N       │
                    └────────┬────────┘
                             │
                   ┌─────────▼─────────┐
                   │ Table capacity    │
                   │  ≤ 2× party?     │
                   └──┬────────────┬──┘
                      │ YES        │ NO (oversized)
                      │            │
                ┌─────▼─────┐ ┌───▼────────────┐
                │  SEAT     │ │ Wait time      │
                │  NOW ✓    │ │ ≥ maxWait?     │
                └───────────┘ └──┬──────────┬──┘
                                 │ YES      │ NO
                                 │          │
                           ┌─────▼────┐ ┌──▼──────────┐
                           │  SEAT    │ │ Large party  │
                           │  NOW ✓   │ │ expected     │
                           └──────────┘ │ soon?        │
                                        └──┬────────┬──┘
                                           │ YES    │ NO
                                           │        │
                                     ┌─────▼────┐ ┌─▼────────┐
                                     │  QUEUE   │ │  SEAT    │
                                     │  WAIT ⏳  │ │  NOW ✓   │
                                     └──────────┘ └──────────┘
```

### Trade-offs

| Aspect | Benefit | Cost |
|--------|---------|------|
| **Revenue** | Large tables reserved for high-revenue parties | Some small-party revenue lost during wait |
| **Wait Time** | Bounded by `maxWait` — never infinite | Still adds 5–10 min for small parties |
| **Fairness** | Time cap prevents extreme unfairness | Priority system may frustrate frequent small parties |
| **Complexity** | Simple to implement and tune | Requires arrival rate estimation for optimal `maxWait` |
| **Throughput** | Higher revenue per table-hour | Slightly lower total throughput in low-traffic periods |

### Key Insight
The **`maxWait` threshold** is the critical tuning parameter. During peak hours, increase it (hold tables longer for big groups). During off-peak, decrease it (seat anyone quickly to maximize utilization). This can be dynamically adjusted based on real-time queue depth and historical arrival patterns.

---

## License

MIT
