# Victor Maingi — Portfolio Backend

Full Node.js + Express backend for the portfolio contact form, with MongoDB storage, email notifications, and a protected admin API.

---

## Project Structure

```
victor_backend/
├── server.js                   ← Main entry point
├── package.json
├── .env.example                ← Copy to .env and fill in values
├── models/
│   ├── Message.js              ← MongoDB schema for contact messages
│   └── Admin.js                ← MongoDB schema for admin user
├── routes/
│   ├── contact.js              ← POST /api/contact (public)
│   └── admin.js                ← Admin routes (protected by JWT)
├── middleware/
│   └── auth.js                 ← JWT verification middleware
├── services/
│   └── emailService.js         ← Nodemailer email sending
├── scripts/
│   └── seedAdmin.js            ← One-time admin account creator
└── frontend-form-update.js     ← Drop into your portfolio HTML
```

---

## Step-by-Step Setup

### 1. Install dependencies
```bash
cd victor_backend
npm install
```

### 2. Set up MongoDB Atlas (free)
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **free cluster** (M0)
3. Under "Database Access" → Add a database user with username + password
4. Under "Network Access" → Add IP address → Allow access from anywhere (0.0.0.0/0)
5. Click "Connect" → "Connect your application" → copy the connection string
6. Replace `<username>` and `<password>` in the string with your values

### 3. Set up Gmail App Password
1. Go to your Google Account → Security
2. Enable **2-Step Verification** if not already on
3. Go to **App Passwords** → Select "Mail" and "Other (Custom name)"
4. Name it "Portfolio Backend" → Generate
5. Copy the 16-character password shown

### 4. Create your .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `EMAIL_USER` — victormaingi44@gmail.com
- `EMAIL_PASS` — your 16-char Gmail App Password
- `JWT_SECRET` — any long random string (e.g. run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` — your admin login credentials

### 5. Create the admin account (run once)
```bash
node scripts/seedAdmin.js
```

### 6. Run the server
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Server runs at: http://localhost:5000

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Submit contact form |

### POST /api/contact — Request Body
```json
{
  "firstName":   "Jane",
  "lastName":    "Doe",
  "email":       "jane@example.com",
  "enquiryType": "Job Opportunity",
  "message":     "Hi Victor, I'd like to discuss..."
}
```

### Protected (require Bearer JWT token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Get JWT token |
| GET | `/api/admin/messages` | List all messages |
| GET | `/api/admin/messages/:id` | View single message (marks as read) |
| PATCH | `/api/admin/messages/:id` | Update status (unread/read/replied) |
| DELETE | `/api/admin/messages/:id` | Delete message |
| GET | `/api/admin/stats` | Dashboard summary stats |

### Admin Login Example
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"victor_admin","password":"ChangeMe_Strong123!"}'
```
Returns a JWT token. Use it in subsequent requests:
```bash
curl http://localhost:5000/api/admin/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Connect to Your Portfolio HTML

Open `victor_portfolio.html` and find the `<script>` block at the bottom.
Find the contact form event listener and replace it with the code in `frontend-form-update.js`.

Set `API_URL` to:
- Development: `http://localhost:5000`
- Production: your deployed URL

---

## Deploying to Production (Free Options)

### Option A — Railway (Recommended, easiest)
1. Push your backend folder to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables from your `.env` file
4. Railway auto-detects Node.js and deploys
5. Copy the generated URL → update `API_URL` in your portfolio HTML

### Option B — Render
1. Push to GitHub
2. Go to https://render.com → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables
6. Free tier spins down after inactivity (slight cold start delay)

### Option C — VPS (DigitalOcean / Hetzner)
1. SSH into your server
2. Install Node.js and PM2: `npm install -g pm2`
3. Clone your repo and install deps
4. Run: `pm2 start server.js --name victor-portfolio`
5. Set up Nginx as a reverse proxy pointing to port 5000

---

## Security Features Built In

- ✅ **Helmet** — secure HTTP headers
- ✅ **CORS** — only your domain can call the API
- ✅ **Rate limiting** — 5 form submissions/hour per IP, 10 login attempts/15min
- ✅ **Input validation** — all fields validated and sanitized server-side
- ✅ **JWT auth** — admin routes protected with signed tokens
- ✅ **Password hashing** — bcrypt with 12 salt rounds
- ✅ **Payload size limit** — 10KB max request body
