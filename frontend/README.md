# Group Expense Tracker - Frontend

Next.js App Router frontend with Tailwind, auth, and mobile-first design.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local if API URL differs
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure the backend is running on port 8000.

## Features

- **Auth**: Login, register, JWT in localStorage, protected routes
- **Groups**: List, create, view detail, members, admin add/promote/remove
- **Expenses**: List (paginated), add with category dropdown (predefined + custom)
- **Stats**: Pie chart (category), bar chart (monthly), summary cards
- **UX**: Loading states, error states, toasts, empty states, FAB for add expense
