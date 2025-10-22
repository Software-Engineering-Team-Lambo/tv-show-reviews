# Couch Critics

A TV show review app built with Vue, Fastify, and Prisma. Rate and review your favorite shows!

## What's Inside

- **Backend:** Fastify API with Prisma (MySQL database)
- **Frontend:** Vue 3 with Vite for fast development
- Everything is written in TypeScript

## Getting Started

### 🚀 Quick Start with Dev Container (Easiest!)
#### If you use the dev container, you don't need to do the manual setup below. Just follow these steps:

**Prerequisites:** Docker Desktop + VS Code with Dev Containers extension

1. Open VS Code, press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. Select "Dev Containers: Clone Repository in Container Volume"
3. Paste: `https://github.com/Software-Engineering-Team-Lambo/tv-show-reviews`
4. Wait for setup (a few minutes first time)
5. Run: `cd apps/api && npx prisma migrate dev --name init`
6. Run: `npm run dev`

**Done!** Everything else is automatic. See [.devcontainer/README.md](.devcontainer/README.md) for details.

---

### Manual Setup

### 1. Clone and Install

```bash
git clone https://github.com/Software-Engineering-Team-Lambo/tv-show-reviews
cd tv-show-reviews
npm install
```

### 2. Install Node.js

You need Node.js 24 or later:

- **Easy way with NVM:**
  - **macOS/Linux:** Install [NVM](https://github.com/nvm-sh/nvm), then run `nvm install 24` followed by `nvm use`
  - **Windows:** Install [NVM for Windows](https://github.com/coreybutler/nvm-windows), then run `nvm install 24` followed by `nvm use`
- **Direct install:** Download Node 24 from [nodejs.org](https://nodejs.org/)

### 3. Set Up the Database

Choose one option:

#### Option A: Docker (Recommended - Easier!)

1. Install [Docker](https://www.docker.com/get-started/) if you haven't already
2. Copy the example environment file and edit it:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set secure passwords for MySQL
3. Start the database:
   ```bash
   docker compose up -d
   ```
4. Set up the API environment:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Open `apps/api/.env` and update `DATABASE_URL` to match your credentials:
   ```
   DATABASE_URL="mysql://username:password@127.0.0.1:3306/tv_ratings"
   ```

💡 **Tip:** When you're done working, stop the database with `docker compose down`

#### Option B: Local MySQL

1. Install MySQL on your computer
2. Create a database called `tv_ratings`
3. Copy and update the API environment file:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
4. Update `DATABASE_URL` in `apps/api/.env` with your MySQL credentials

### 4. Initialize the Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 5. Start Developing! 🚀

```bash
npm run dev
```

This starts both the backend API and frontend. Open the link shown in your terminal to see the app!

**Want to run them separately?**

```bash
npm run dev -w=api   # Backend only
npm run dev -w=web   # Frontend only
```

## Development Tips

### Hot Reloading

Your changes appear instantly! Just save and see them in the browser. ✨

If you change the database schema (`apps/api/prisma/schema.prisma`), you'll need to:

```bash
cd apps/api
# can omit in command, but then it'll prompt for one
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

### Installing Packages

Use the `-w` flag to install packages for specific parts:

```bash
npm install -w=api <package-name>   # For backend
npm install -w=web <package-name>   # For frontend
```

## Learn More

- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)
- **Fastify:** [fastify.io/docs](https://www.fastify.io/docs/latest/)
- **Vue 3:** [vuejs.org](https://vuejs.org/)
- **Vite:** [vitejs.dev](https://vitejs.dev/)

## Project Structure

```
apps/
  api/       # Backend API (Fastify + Prisma)
  web/       # Frontend app (Vue + Vite)
```
