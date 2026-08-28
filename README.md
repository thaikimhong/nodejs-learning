# nodejs-learning

A small Express + EJS + MongoDB practice app (product list, product detail, register/login with sessions).

## Tech stack

- Express 5, EJS 6 (`.html` templates)
- Mongoose 9 + MongoDB
- express-session for auth, bcryptjs for password hashing

## Requirements

- **Docker Desktop** — the only thing you strictly need for "Option A" below
- **Node.js 24** (see [.nvmrc](.nvmrc)) — only for "Option B" (running the app outside Docker)

---

## Option A: Run everything in Docker (recommended for other machines)

No Node, no `npm install` — Docker builds and runs the app for you.

```bash
git clone <repo-url>
cd practice
docker compose up -d --build
```

That starts three containers:

| Service       | URL                        | Notes                                    |
|---------------|----------------------------|------------------------------------------|
| app           | http://localhost:3011      | the Express app                          |
| mongodb       | `localhost:27323`          | user `admin` / pass `admin123`           |
| mongo-express | http://localhost:1011      | web UI to browse the database            |

Check status / logs:

```bash
docker compose ps
docker compose logs -f app
```

Stop:

```bash
docker compose down       # keep data
docker compose down -v    # also delete the database volume
```

### Updating the app

When you change source code, `package.json`, or the `Dockerfile`, the running
container keeps the **old** image until you rebuild it:

```bash
git pull                          # if the change came from the repo
docker compose up -d --build      # rebuild the image and recreate the app container
```

`--build` forces a fresh image; `up -d` then swaps only the containers whose image
or config changed (MongoDB keeps running and keeps its data).

Other useful update commands:

```bash
docker compose build app                  # build the image without restarting
docker compose up -d --build --no-deps app # rebuild & restart ONLY the app container
docker compose up -d --force-recreate app  # recreate the container without rebuilding
docker compose pull                        # pull newer mongo / mongo-express images
docker compose logs -f app                 # watch the app after an update
```

Clean up old dangling images from earlier builds:

```bash
docker image prune -f
```

> Editing files does **not** hot-reload inside the container. For a fast
> edit-save-refresh loop use **Option B** instead.

> Inside Docker the app reads `MONGO_URI` from [docker-compose.yml](docker-compose.yml)
> and connects to the `mongodb` service on its internal port `27017`.

---

## Option B: Run the app with Node, MongoDB in Docker

Use this while developing so you get fast restarts.

```bash
# 1. Node 24
nvm use                 # macOS/Linux (nvm install 24 first if needed)
node -v                 # -> v24.x

# 2. install dependencies (node_modules is not committed)
npm install

# 3. start only the database
docker compose up -d mongodb mongo-express

# 4. run the app
npm start
```

Open http://localhost:3011

Outside Docker the app connects to `mongodb://admin:admin123@localhost:27323/practice`
(the port published by the `mongodb` container). Override with an env var if needed:

```bash
MONGO_URI="mongodb://..." npm start      # macOS/Linux
$env:MONGO_URI="mongodb://..."; npm start # Windows PowerShell
```

---

## Project structure

```
src/
  main.js              app entry: express setup, routes, server start
  database/
    mongodb.js         MongoDB connection (reads process.env.MONGO_URI)
    products.js        in-memory product data
  models/
    User.js            Mongoose user schema
  views/               EJS templates (.html)
    partials/navbar.html
public/
  style.css            static assets (served at /)
Dockerfile             builds the app image
docker-compose.yml     app + MongoDB + mongo-express
```

## Available scripts

| Command                | Description                          |
|------------------------|--------------------------------------|
| `npm start`            | run the server (`node src/main.js`)  |
| `npm run start:debug`  | run with `--inspect` for debugging   |

---

## Troubleshooting

**`MongooseServerSelectionError: connect ECONNREFUSED`**
MongoDB isn't reachable. Start it with `docker compose up -d mongodb` and confirm
`docker compose ps` shows it `Up`. Make sure Docker Desktop is running.

**`bind: address already in use` when running `docker compose up`**
Another process holds one of the host ports (`3011`, `27323`, `1011`). Find it with
`lsof -i :27323` (macOS/Linux) and stop it, or change the left-hand port in
[docker-compose.yml](docker-compose.yml).

**`npm install` fails / engine warnings**
Node version too old. Install Node 24 (`nvm install 24 && nvm use`).

**Port 3011 already in use (Option B)**
Stop the other process, or change the port in [src/main.js](src/main.js).
