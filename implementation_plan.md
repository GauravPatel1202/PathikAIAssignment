# Implementation Plan - Pathik AI Full-Stack Assignment

## Objective

Build a full-stack application (React + Flask + PostgreSQL) to manage and publish Google Ads campaigns.

## Phases

### Phase 1: Project Initialization & Setup

- [ ] Create project directory structure (`/backend`, `/frontend`).
- [ ] Initialize Python virtual environment and install dependencies (`flask`, `sqlalchemy`, `psycopg2`, `google-ads`).
- [ ] Initialize React app using Vite (`npm create vite@latest`).
- [ ] Setup PostgreSQL database connection.

### Phase 2: Backend Development (Flask)

- [ ] Define Database Models (`Campaign`).
- [ ] Implement `POST /api/campaigns` (Create Campaign - Local DB).
- [ ] Implement `GET /api/campaigns` (List Campaigns).
- [ ] Implement `POST /api/campaigns/<id>/publish` (Publish to Google Ads).
  - [ ] Create Google Ads Service/Wrapper.
  - [ ] Handle Authentication (YAML/Env variables).
  - [ ] Map local data to Google Ads API objects.
  - [ ] Update status on success.
- [ ] Implement `POST /api/campaigns/<id>/disable` (Optional/Requirement check).

### Phase 3: Frontend Development (React)

- [ ] Setup Global Styles (Civilized CSS/Reset, Premium Design variables).
- [ ] Create `CampaignForm` component.
- [ ] Create `CampaignList` component.
- [ ] Integrate API calls using `axios` or `fetch`.
- [ ] Add Form Validation and Error Handling.

### Phase 4: Integration & Testing

- [ ] Connect Frontend to Backend.
- [ ] Test Campaign Creation (Local).
- [ ] Test Google Ads Publishing (Mock or Real Credentials).
- [ ] Final Polish (UI/UX, Loading states).

### Phase 5: Documentation & cleanup

- [ ] Write `README.md`.
- [ ] Ensure clean code structure.
