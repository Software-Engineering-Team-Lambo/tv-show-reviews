# Couch Critics TV Show Review Website
Couch Critics is a full-stack web application designed to allow users to search for, rate, and review television shows that they have watched or are currently watching. This website was developed as a collaborative software engineering project at the University of Maryland, Baltimore County (UMBC). The platform leverages modern web frameworks and The Movie Database (TMDB) API to deliver media metadata to users.

## Project Purpose
After discovering the gap in the current digital landscape for a cataloging service purely for TV shows, we felt motivated to build one of our own. Drawing inspiration from platforms such as Letterboxd, MyAnimeList, and IMDb, Couch Critics aims to provide a website that allows users to catalog their ​​completed, in-progress, and planned shows. Additionally, we enable users to post public ratings and reviews in order to foster a community of television enthusiasts. For this purpose, we will curate a searchable collection of television shows and corresponding metadata.

## Project Goal
The primary goal of this project was to build a comprehensive, full-stack TV show review platform. This required designing an intuitive and responsive user interface, engineering an efficient backend, and implementing robust security measures. To simulate a professional software development environment, our team utilized Agile and Scrum methodologies to effectively meet our deadlines.

## Technologies Used
* **Backend:** Fastify API with Prisma ORM (MySQL database)
* **Frontend:** Vue 3 with Vite for fast development
* **Language:** TypeScript across the entire stack
* **Security:** JWT Authentication, Argon2 Password Hashing
* **DevOps:** Docker, Dev Containers, GitHub Actions (CI/CD)
* **External APIs:** The Movie Database (TMDB) API

## Website Functionalities
* **User Accounts:**
    * Sign Up
    * Sign In
* **TV Show Management:**
    * Search Shows
    * Read Show Details
    * Add a Show to the Database
* **Review Management:**
    * Add Show Reviews
    * Delete Reviews
* **Platform Overview:**
    * See All Shows and Reviews

## Key Features
* **Lightning-Fast Search:** Optimized database indexing and query structures that achieve search and response latencies of under 400ms.
* **Secure User Accounts:** Secure user authentication utilizing Argon2 hashing and JSON Web Tokens (JWT) for session management.
* **API Data Usage:** Real-time fetching and display of TV show metadata, images, and summaries.
* **Automated Testing:** Integrated CI/CD pipelines to ensure code reliability and prevent errors during development.

## My Role and Contributions
Working within a cross-functional team, I served primarily as a **Frontend & UI Developer**. My specific contributions included:
* Integrating the TMDB API to dynamically fetch and render high-quality TV show posters across the home screen and individual show pages.
* Extracting and organizing complex API data to seamlessly display essential show information, including descriptions, cast lists, season counts, and release dates.
* Creating a responsive, user-centric interfaces using Vue and TypeScript.
* Writing and maintaining a suite of version-controlled project documentation, including the UI/System Requirements and the Software Design Document (SDD).

<img width="1918" height="906" alt="couch_critics_show_page" src="https://github.com/user-attachments/assets/f8334bf6-8597-4f1c-aa4e-b444d2361605" />
<img width="1918" height="913" alt="couch_critics_homepage" src="https://github.com/user-attachments/assets/29d2387f-a3ca-4e10-8944-2f2caaf712da" />

## Lessons Learned
Through this project, our team learned about the importance of disciplined version control, thorough documentation, and clear communication. By adopting Agile and Scrum methodologies, our team learned how to break down complex features into manageable sprints, conduct effective stand-ups, and adapt to shifting project requirements. Ultimately, taking this platform from conceptual UI and database designs to deploying a fully functioning, full-stack application provided invaluable, hands-on experience with the complete software development life cycle.

## Getting Started

### Quick Start with Dev Container (Easiest!)

#### If you use the dev container, you don't need to do the manual setup below. Just follow these steps:

**Prerequisites:** Docker Desktop + VS Code with Dev Containers extension

1. Open VS Code, clone repository, then press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. Select "Dev Containers: Reopen in Container"
3. Wait for setup (a few minutes first time)
4. Setup TMDB API Key:
   - Sign up at [The Movie Database (TMDB)](https://www.themoviedb.org/)
   - Go to [API Settings](https://www.themoviedb.org/settings/api)
   - Create an API key
   - Open `apps/api/.env` and set your TMDB API key:
     ```
     TMDB_API_KEY="<your_tmdb_api_key_here>"
     ```
5. Run: `cd apps/api && npx prisma migrate dev`
6. Run: `npm run seed`
7. Run: `cd ../..`
8. Run: `npm run dev`

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

#### Option B: Local MySQL

1. Install MySQL on your computer
2. Create a database called `tv_ratings`
3. Copy and update the API environment file:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
4. Update `DATABASE_URL` in `apps/api/.env` with your MySQL credentials

### 4. Setup TMDB API Key

1. Sign up at [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Create an API key
4. Open `apps/api/.env` and set your TMDB API key:
5. For seeding TMDB data, get an API key from [TMDB](https://www.themoviedb.org/settings/api) and add it to `apps/api/.env`:
   ```
   TMDB_API_KEY="<your_tmdb_api_key_here>"
   ```

### 5. Initialize the Database

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
npm run seed
cd ../..
```

### 6. Start Developing!

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
