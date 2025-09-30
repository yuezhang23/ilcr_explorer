# ICLR Rating - Development Monorepo

A full-stack project for exploring and visualizing ICLR paper ratings, predictions, and user interactions.

## Project Structure
- `iclr-node-server-app/`: Node.js + Express backend (MongoDB)
- `iclr-react-web-app/`: React frontend (CRA + TypeScript)

## Prerequisites
- Node.js >= 18
- npm
- MongoDB instance (local or remote)

## Setup
1. Install all dependencies from the repo root:
   ```bash
   npm run install-all
   ```
2. Configure environment as needed:
   - Backend uses `process.env.PORT` (default 4000) and typical DB envs (see `iclr-node-server-app/App.js`).
   - Frontend API base URL can be provided via `REACT_APP_API_BASE` or overridden at runtime in `iclr-react-web-app/public/runtime-config.js`.

## Available Scripts
From the repo root:
- `npm run start` — start backend and frontend together (concurrently)
- `npm run start:backend` — start backend only (delegates to server package)
- `npm run start:frontend` — start frontend only
- `npm run build` — build the frontend for production

Direct commands (explicit):
- Start the backend manually:
  ```bash
  cd iclr-node-server-app && node App.js
  ```
- Start the frontend manually:
  ```bash
  cd iclr-react-web-app && npm start
  ```

## Development Notes
- Backend default port: 4000 (`process.env.PORT || 4000`).
- Frontend dev server default: 3000.
- Ensure the frontend points to the backend API:
  - Option A (build-time): set `REACT_APP_API_BASE` before `npm start`/`npm run build`.
  - Option B (runtime override): edit `iclr-react-web-app/public/runtime-config.js` (`API_BASE`).

## License
ISC