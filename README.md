# Couch Critics
This uses Fastify and Prisma for the backend API. The frontend is a Single Page Application (SPA) built with Vue and Vite. Typescript is used throughout for type safety and better autocompletion.

## Getting Started
1. Clone the repository:
    ```bash
    git clone https://github.com/Software-Engineering-Team-Lambo/tv-show-reviews
    cd tv-show-reviews
    ```
2. Install Node.js 24.x or later (use [NVM](https://github.com/nvm-sh/nvm) for easy version management, then run `nvm use`)
    Otherwise you can just install Node 24 if that's easier [nodejs.org](https://nodejs.org/).
    
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up the database
    - **Option A (Docker - recommended):**

        For this to work, you need [Docker](https://www.docker.com/get-started/) installed.
        ```bash
        cp .env.example .env                    # adjust MySQL credentials for security
        ```
        Now, edit the .env file to set secure passwords.
        ```bash
        docker compose up -d                    # start MySQL container
        cp apps/api/.env.example apps/api/.env  # copy backend env file
        ```
        Set `DATABASE_URL` in `apps/api/.env` to match your `.env` credentials (e.g., `mysql://username:password@127.0.0.1:3306/tv_ratings`)
        
        When not working on the project, stop the MySQL container with:
        ```bash
        docker compose down
        ```
    - **Option B (Local MySQL):** Install MySQL locally, create a database, then set `DATABASE_URL` in `apps/api/.env` (look at .env.example for format, or copy to .env and modify as needed)


5. After database is set up do the following:

    - For simplicity in development, use the database user with full privileges (e.g., root) to avoid permission issues in Prisma migrations.
    - Run Prisma migrations:
        ```bash
        cd apps/api
        npx prisma migrate dev --name init
        ```
    - Generate Prisma client:
        ```bash
        npx prisma generate
        ```
6. Start the development servers:
    ``` bash
    # runs the backend API and frontend dev server concurrently
    # /api on the frontend is proxied to the backend
    npm run dev
    ```
    You can also run the backend and frontend separately:
    ```bash
    # Start the backend API server
    npm run dev -w=api
    # Start the frontend dev server
    npm run dev -w=web
6. Start writing code!

Both the backend and frontend support hot-reloading, so changes will reflect immediately. Database schema changes will require running Prisma migrations and regenerating the client, however.

When you start the frontend, it'll give you a link to open in the browser.

## Tech Stack
- **Backend:** Fastify + Prisma (MySQL) in `apps/api` — [Prisma docs](https://www.prisma.io/docs/), [Fastify docs](https://www.fastify.io/docs/latest/)
- **Frontend:** Vue 3 + Vite in `apps/web` — [Vite docs](https://vitejs.dev/), [Vue docs](https://vuejs.org/)

## Workspace Commands
Use `-w` flag to target specific workspace (api or web):
```bash
npm install -w=api <package>  # install package for backend
npm run dev -w=web            # run frontend only
```