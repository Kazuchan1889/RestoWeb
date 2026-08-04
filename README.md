# Rasto Web — Restaurant Queue Management System

A web-based queue and table management application for restaurants built with Laravel, React, Vite, Tailwind CSS, and PostgreSQL.

## Overview

Rasto Web helps restaurant staff efficiently manage customer arrivals, waiting queues, and table allocations in real time. It features a visual floor plan grid, drag-and-drop table assignment, dining countdown timers, priority queueing, and historical session logs.

## Key Features

- **Real-Time Floor Plan**: Visual grid layout showing table statuses (Available, Dining, Reserved).
- **Drag & Drop Assignment**: Drag incoming customer tickets directly onto compatible empty tables.
- **Priority Queue**: Automatically prioritizes larger parties to maximize table utilization and revenue.
- **Dining Countdown**: Real-time timer indicating remaining dining duration for active sessions.
- **Session History**: Paginated, filterable history log of completed dining sessions.
- **Touchscreen POS Friendly**: Optimized UI layout for quick waiter inputs on POS terminals.

## Table Allocation Logic

- **Tables Configuration**: Table A (2 seats), Table B (4 seats), Table C (6 seats), Table D (8 seats).
- **Automatic Matching**: Customers are automatically seated at the smallest available table that fits their party size.
- **Dining Duration**: Calculated dynamically using `(party_size × 15) + rand(5, 15)` minutes.
- **Manual Transfers**: Waiters can manually reassign or transfer parties between compatible tables.

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: PostgreSQL (Supabase / Local)
- **HTTP Client**: Axios

## Setup & Local Development

### 1. Prerequisites
- PHP >= 8.2 & Composer
- Node.js >= 18 & NPM
- PostgreSQL (or SQLite)

### 2. Installation

```bash
# Clone project repository
git clone https://github.com/Kazuchan1889/RestoWeb.git
cd RestoWeb

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run database migrations and seed default tables
php artisan migrate:fresh --seed
```

### 3. Running Locally

Run both Laravel backend server and Vite dev server concurrently:

```bash
npm run dev
```

The application will be accessible at `http://localhost:8000`.

## Testing

Run backend and frontend tests:

```bash
# Backend Tests (PHPUnit)
php artisan test

# Frontend Tests (Vitest)
npm run test
```

## Production & Deployment

To compile frontend production assets:

```bash
npm run build
```

The project includes `api/index.php` and `vercel.json` for Vercel Serverless Function deployments.

## Project Structure

```
├── app/
│   ├── Http/Controllers/Api/QueueController.php
│   ├── Models/
│   └── Services/QueueService.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ArrivalForm.jsx
│   │   │   ├── HistoryTable.jsx
│   │   │   ├── LiveTimer.jsx
│   │   │   ├── QueueList.jsx
│   │   │   └── RestaurantGrid.jsx
│   │   └── app.jsx
│   └── views/app.blade.php
├── routes/web.php
├── vercel.json
└── vite.config.js
```

## License

MIT License.
