
# MyRSS Manager

A self-hosted, full-stack feed aggregator designed to organize YouTube channels and RSS feeds into a customizable Kanban-style board.

![Project Status](https://img.shields.io/badge/status-development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Project Overview

MyRSS provides a unified interface to consume content from various sources. Unlike traditional list-based readers, it utilizes a column-based layout (Kanban) allowing users to categorize content dynamically (e.g., Entertainment, Tech, Politics).

The system relies on a local Dockerized PostgreSQL database and a modern stack using React and Node.js.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Drag & Drop:** @hello-pangea/dnd

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15 (via Docker)
- **ORM:** Prisma

### DevOps
- **Containerization:** Docker & Docker Compose
- **Process Management:** Concurrently

---

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed:

* **Node.js** (v18 or higher)
* **Docker Desktop** (Running)
* **Git**

---

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/my-rss-manager.git](https://github.com/YOUR_USERNAME/my-rss-manager.git)
    cd my-rss-manager
    ```

2.  **Install Dependencies:**
    This project uses a root `package.json` to manage sub-projects. Run the install command in the root directory:
    ```bash
    npm install
    ```
    *If necessary, install dependencies for each service individually:*
    ```bash
    cd my-rss-backend && npm install
    cd ../my-rss-frontend && npm install
    cd ..
    ```

3.  **Environment Configuration:**
    Create a `.env` file in `my-rss-backend/`:
    ```env
    PORT=5001
    DATABASE_URL="postgresql://user:password@localhost:5432/myrss_db?schema=public"
    ```

4.  **Database Setup:**
    Start the Docker container and run Prisma migrations to create the tables:
    ```bash
    cd my-rss-backend
    docker compose up -d
    npx prisma migrate dev --name init
    ```

---

## ▶️ Running the Application

To start the application, you can run the backend and frontend services concurrently using the root manager script:

```bash
# From the root directory
npm run dev

```

Alternatively, you can run them in separate terminals:

**Backend:**

```bash
cd my-rss-backend
npm run dev
# Server running on http://localhost:5001

```

**Frontend:**

```bash
cd my-rss-frontend
npm run dev
# Application running on http://localhost:5002

```

---

## 📂 Project Structure

```text
MyRSS/
├── my-rss-backend/         # Express API & Prisma ORM
│   ├── prisma/             # Database schema & migrations
│   ├── src/                # Controllers, Routes, Services
│   ├── pgdata/             # Persisted Docker volume (Ignored by Git)
│   └── docker-compose.yml  # Database orchestration
│
├── my-rss-frontend/        # React Application
│   ├── src/
│   │   ├── components/     # Columns, Cards, UI elements
│   │   ├── hooks/          # Custom logic (useNavigation, etc.)
│   │   └── types/          # Shared TypeScript interfaces
│   └── vite.config.ts
│
└── package.json            # Root manager scripts

```


## 📝 License

This project is licensed under the MIT License.
