# Doctor Appointment Management App (Gov-style UI) + Medicines Store + Razorpay (Test)

This is a **clean, runnable** full-stack project:
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React (Vite) + TailwindCSS (Gov-hospital style UI like your screenshots)
- Features included:
  - Auth: signup/login (JWT)
  - User Profile + Appointment booking
  - Doctors directory (search + details)
  - Medicines catalog (search + categories + images)  ✅ +///add here markers
  - Cart + Checkout (Razorpay Orders + signature verification)
  - Orders history + tracking status
  - Chatbot assistance (simple FAQ)
  - WhatsApp alert (optional; uses Twilio WhatsApp if configured) ✅ +\change this markers
  - Forgot Password (Email OTP) ✅ (Gmail App Password required)
  - AI Symptom Checker (Text/Voice/Camera) ✅ (OpenAI API key required)

> IMPORTANT SECURITY NOTE:
> Do **NOT** commit real secrets. Put them in `.env` only.

---

## 1) Prerequisites
- Node.js 18+ (recommended 20+)
- MongoDB Atlas connection string (you already have it)

---

## 2) Project structure
```
doctor-appointment-management-app/
  backend/
  frontend/
```

---

## 3) Backend setup (Express)
```bash
cd backend
cp .env.example .env
npm install
npm run seed   # loads sample doctors + medicines
npm run dev
```

Backend runs at: `http://localhost:8080`

---

## 4) Frontend setup (React)
Open a new terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 5) Where to change keys (IMPORTANT)
Search these markers across the code:
- `+\change this`  → you must change later (Razorpay, WhatsApp, JWT, etc.)
- `+///add here`   → add your product names/images without confusion

Also configure these in `backend/.env`:
- `SMTP_*` for Email OTP
- `OPENAI_API_KEY` for AI Symptom Checker

---

## 6) Add your medicines (products) and images
You have 2 easy options:

### Option A (Recommended): Add in `backend/src/seed/seedData.js`
- Look for: `+///add here`
- Put your medicine name, category, price, and `imageUrl`
- Then run:
```bash
cd backend
npm run seed
```

### Option B: Add using API (Admin)
This starter ships with a simple admin role.
- Create an account
- In MongoDB, set `role: "admin"` for that user
- Then use `/admin/products` screen in frontend

---

## 7) UI notes
- Login page matches your 1st screenshot (gradient + centered card).
- Home page uses section cards + icon grid like your 2nd/3rd screenshots.

---

## 8) Production notes (when you go live)
- Replace Razorpay test keys with live keys (keep the same env variable names).
- Turn on HTTPS.
- Use a real email provider.
- Use Twilio WhatsApp (or Meta WhatsApp Cloud API) for WhatsApp notifications.
- Rotate/replace any secrets you accidentally shared publicly.

---

If you want me to add:
- Admin dashboard with analytics,
- Hospital OPD slots by date,
- SMS OTP login,
tell me your exact workflow and I’ll extend this codebase.
