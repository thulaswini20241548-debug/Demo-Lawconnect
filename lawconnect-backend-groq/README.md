# LawConnect Backend

Express + MongoDB backend for the LawConnect AI Legal Assistant.

## Stack
- **Node.js + Express** — API server
- **MongoDB Atlas** — user storage
- **JWT** — authentication
- **Anthropic SDK** — Claude AI (LexAI)

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com) (free, no credit card)
- `MONGODB_URI` — from MongoDB Atlas (see below)
- `JWT_SECRET` — any long random string (`openssl rand -hex 32`)
- `FRONTEND_URL` — your frontend URL (for CORS)

### 3. Run locally
```bash
npm run dev   # with nodemon (auto-restart)
npm start     # production
```

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create a free account
2. Create a free **M0** cluster
3. Under **Database Access** → add a user with read/write permissions
4. Under **Network Access** → add `0.0.0.0/0` (allow all IPs, needed for Railway/Render)
5. Click **Connect** → **Drivers** → copy the connection string
6. Paste into `MONGODB_URI` in your `.env` (replace `<password>` with your DB user password)

---

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Go to **Variables** tab → add all variables from `.env.example`
5. Railway auto-detects Node.js and runs `npm start`
6. Your API will be live at `https://your-app.railway.app`

## Deploy to Render

1. Push this folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables in the Render dashboard
7. Deploy

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | `{ email, password }` | Register new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/api/auth/me` | — | Get current user (requires JWT) |

### Chat

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | `{ message, history[] }` | Send message to LexAI (requires JWT) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server + DB status |

---

### Auth Header (for protected routes)
```
Authorization: Bearer <your_jwt_token>
```

### Example: Login then Chat
```js
// 1. Login
const { token } = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'secret123' })
}).then(r => r.json());

// 2. Chat
const { reply } = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'What are my tenant rights in Sri Lanka?',
    history: []   // pass previous messages for multi-turn context
  })
}).then(r => r.json());

console.log(reply);
```
