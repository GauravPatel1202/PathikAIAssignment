# Pathik AI - Full Stack Ads Campaign Manager

A full-stack application (React + Flask + PostgreSQL) to manage and publish Google Ads campaigns.

## Features

- **Campaign Management**: Create, view, publish, and disable campaigns.
- **Google Ads Integration**: Seamlessly pushes campaigns to your Google Ads account.
- **AI Ad Copy Generator**: Auto-generates headlines and descriptions based on your campaign name.
- **Live Ad Preview**: Visualizes how your ad will appear on Google Search in real-time.
- **Performance Analytics**: View mocked Impressions, Clicks, Cost, and ROAS data for active campaigns.
- **Premium UI**: Glassmorphic design with smooth animations and responsive layout.
- **Status Tracking**: Track DRAFT vs PUBLISHED status.

## Tech Stack

- **Frontend**: React (Vite), Axios, Lucide Icons, Vanilla CSS
- **Backend**: Python Flask, SQLAlchemy, Google Ads API
- **Database**: PostgreSQL

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL installed and running locally
- Google Ads Developer Credentials (optional for mock mode, required for real publishing)

### 1. Database Setup

Create a PostgreSQL database named `campaign_manager`:

```bash
createdb campaign_manager
```

_Note: Ensure your PostgreSQL user has access. The app defaults to `postgresql://localhost/campaign_manager`. You can override this with the `DATABASE_URL` environment variable._

### 2. Backend Setup

1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment and install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

   _(Note: Dependencies include `flask`, `flask-sqlalchemy`, `flask-cors`, `psycopg2-binary`, `google-ads`, `python-dotenv`)_

3. Configure Environment Variables:
   Create a `.env` file in `backend/` with the following:

   ```env
   DATABASE_URL=postgresql://localhost/campaign_manager

   # Google Ads Credentials (Leave empty to use Mock Mode)
   GOOGLE_ADS_developer_token=INSERT_TOKEN
   GOOGLE_ADS_client_id=INSERT_CLIENT_ID
   GOOGLE_ADS_client_secret=INSERT_CLIENT_SECRET
   GOOGLE_ADS_refresh_token=INSERT_REFRESH_TOKEN
   GOOGLE_ADS_login_customer_id=INSERT_LOGIN_ID
   GOOGLE_ADS_customer_id=INSERT_CUSTOMER_ID
   ```

4. Initialize Database Migrations (First time only):

   ```bash
   flask db upgrade
   ```

   _Note: The migrations are already set up. This command applies the schema to your database. For future schema changes, see `backend/MIGRATION_GUIDE.md`._

5. Run the Backend:
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`.

### 3. Frontend Setup

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## API Documentation

- `POST /api/campaigns`: Create a campaign (Draft). Body: JSON with campaign fields.
- `GET /api/campaigns`: List all campaigns.
- `POST /api/campaigns/<id>/publish`: Publish a draft campaign to Google Ads.
- `POST /api/campaigns/<id>/pause`: Pause an active campaign in Google Ads.

## Docker Setup (Optional)

To run the entire stack with a real PostgreSQL instance using Docker:

1. Ensure Docker Desktop is running.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Access:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## Design Notes

- **Backend**: Uses Flask for lightweight API handling. `GoogleAdsService` encapsulates the complex Google Ads logic, including error handling and object creation (Campaign, Budget, AdGroup, Ad).
- **Frontend**: React functional components with Hooks. Styling is done via global CSS variables for a consistent "glassmorphism" aesthetic.
- **Database**: PostgreSQL used for relational integrity. (Defaults to SQLite for local dev without Docker/Postgres installed).
# PathikAIAssignment
