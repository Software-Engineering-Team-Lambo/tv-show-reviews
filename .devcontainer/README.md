# Dev Container Setup

This dev container automates the entire development environment setup!

## What You Get

✅ Node.js 24 pre-installed  
✅ MySQL database running automatically  
✅ All dependencies installed  
✅ Prisma client generated  
✅ Recommended VS Code extensions installed  
✅ Port forwarding configured  
✅ No manual environment file setup needed

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started

### Option 1: Quick Start (Recommended)

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Dev Containers: Clone Repository in Container Volume"
4. Paste: `https://github.com/Software-Engineering-Team-Lambo/tv-show-reviews`
5. Wait for the container to build (first time takes a few minutes)
6. Run the initial migration:
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   cd ../..
   ```
7. Start developing:
   ```bash
   npm run dev
   ```
   This runs both the backend and frontend. To run them separately:
   ```bash
   npm run dev -w=api   # Backend only
   npm run dev -w=web   # Frontend only
   ```

### Option 2: Local Repository

1. Clone the repo normally
2. Open the folder in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: "Dev Containers: Reopen in Container")
4. Wait for setup to complete
5. Run the initial migration:
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   cd ../..
   ```
6. Start developing:
   ```bash
   npm run dev
   ```

## That's It!

Everything else is automated. Your team members just need Docker and VS Code with the Dev Containers extension.

## Environment Variables & API Keys

The dev container handles the database connection automatically, but you can add other environment variables (like API keys) to `apps/api/.env`:

```env
# apps/api/.env
# DATABASE_URL is set automatically by the dev container - don't add it here

# Add your API keys and other secrets here:
TMDB_API_KEY=your_api_key_here
JWT_SECRET=your_secret_here
```

**How it works:**

- The dev container automatically creates `apps/api/.env` from `.env.example` if it doesn't exist
- All variables in `apps/api/.env` are loaded into the container
- `DATABASE_URL` is overridden automatically to point to the containerized MySQL
- Simple dev passwords (`devpass`, `rootpass`) are used since everything is local-only

**Benefits:**

- ✅ Database connection just works - no configuration needed
- ✅ API keys stay in `.env` (gitignored) for security
- ✅ Easy to add new environment variables anytime
- ✅ Team members can have different API keys without conflicts

## Troubleshooting

- **Container won't start?** Make sure Docker Desktop is running
- **Port already in use?** Close any local MySQL/Node processes
- **Need to rebuild?** Command Palette → "Dev Containers: Rebuild Container"
