# Project Setup Guide

This guide walks through how to get the frontend and backend running on your machine.

---

## Prerequisites

Make sure you have the following installed before anything else:

- [Node.js](https://nodejs.org/) (v18 or higher) — required for the frontend
- [Python](https://www.python.org/downloads/) (v3.10 or higher) — required for the backend

You can verify your installations by opening a terminal and running:

```
node -v
python --version
```

---

## Running the Frontend

1. Open a terminal
2. Navigate to the frontend folder:
   ```
   cd src/frontend
   ```
3. Install dependencies (only needs to be done once):
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```

The frontend will be running at **http://localhost:5173**. The page hot-reloads automatically whenever you save a file, so you don't need to restart it.

---

## Running the Backend

1. Open a **separate** terminal (keep the frontend one running)
2. Install the required Python packages (only needs to be done once):
   ```
   pip install fastapi uvicorn
   ```
3. Navigate to the backend folder:
   ```
   cd src/backend
   ```
4. Start the server:
   ```
   uvicorn main:app --reload
   ```

The backend will be running at **http://localhost:8000**. The `--reload` flag means it restarts automatically when you save changes.

---

## Frontend Code Structure

All frontend source code lives in `src/frontend/src/`. Here is how it should be organized:

```
src/frontend/src/
├── css/               # All stylesheets go here
├── components/        # Reusable UI pieces (buttons, navbars, cards, etc.)
├── pages/             # Top-level page components (Home, About, Dashboard, etc.)
├── assets/            # Images, icons, static files
├── App.jsx            # Root component — wires pages together
└── main.jsx           # Entry point — do not modify this
```

### css/
Any `.css` file goes in here. If a component has its own styles, create a file named after it — e.g., `Navbar.css` alongside a `Navbar.jsx` in `components/`.

### components/
For anything that appears in multiple places or is a self-contained UI element. Examples: a navigation bar, a button, a modal, a card. Each component should be its own file:

```
components/
├── Navbar.jsx
├── Footer.jsx
└── Card.jsx
```

### pages/
Each page of the site gets its own file here. These are the top-level views that the router will switch between:

```
pages/
├── Home.jsx
├── About.jsx
└── Dashboard.jsx
```

A page can import and use components, but components should not import pages.

---

## Quick Reference

| Task              | Command                        | Directory         |
|-------------------|--------------------------------|-------------------|
| Start frontend    | `npm run dev`                  | `src/frontend`    |
| Start backend     | `uvicorn main:app --reload`    | `src/backend`     |
| Install frontend deps | `npm install`              | `src/frontend`    |
| Install backend deps  | `pip install fastapi uvicorn` | anywhere     |
