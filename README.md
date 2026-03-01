# Group Expense Tracker

Traditional expense trackers focus on one person. In real life, most day‑to‑day costs are shared — rent with roommates, groceries with a partner, trips with friends, or family bills.

This app helps groups keep those shared expenses clear and fair.

## What you can do

- **Create groups** for households, trips, or any shared budget.
- **Invite members** and mark some as **admins** to manage the group.
- **Add expenses** with:
  - title, amount, category, description, date
  - link each expense to a specific group
- **See expenses by group**, with:
  - mobile‑friendly list
  - clear monthly sections
- **View simple stats** for each group:
  - total spent
  - spending by category
  - who spends the most
  - monthly trends, shown as small charts

## Tech stack

- **Backend**: FastAPI (Python) + MongoDB
  - Async database access (Motor)
  - JWT‑based login and protected routes
- **Frontend**: Next.js (App Router) + React
  - Tailwind CSS for mobile‑first UI
  - Axios for calling the backend
- **Deployment**:
  - Both backend and frontend run in Docker containers
  - `docker-compose` starts backend, frontend, and MongoDB together

## How to run with Docker

From the project root:

```bash
docker-compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

## How to run locally (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # adjust values if needed
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points to http://localhost:8000/api/v1
npm run dev
```

Then visit `http://localhost:3000` in your browser.

