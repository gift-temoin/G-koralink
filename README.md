# G KORALINK - Urubuga rwo Kwizigama no Kuguza mu Rwanda

**G KORALINK** ni urubuga rwuzuye kandi rwizewe rwo kwizigama muri Ikibina no kuguza rufite ibintu byose byiteguye gukoreshwa mu buryo bwa kinyamwuga, rwanditse mu **Kinyarwanda**.

---

## 🚀 Ibyo Urubuga Runyura Muri Yo (Overview & Key Features)

- 🇷🇼 **100% Kinyarwanda Interface**: All visible UI elements, buttons, errors, notifications, and navigation are strictly in natural Kinyarwanda.
- 💵 **Rwandan Franc (RWF / Frw)**: Currency and exact financial balance calculations.
- 🔐 **Authentication & Security**: JWT Authentication, role-based authorization (`UMUKORESHA` vs `ADMIN`), protected routes, and direct bcrypt password hashing.
- 📲 **MTN Mobile Money USSD Flow**: Integrated payment instruction overlay displaying `*182*8*1*412512#` and receiver verification (`ENOCK`) with status tracking (`Bitegereje kwemezwa`).
- 📊 **Financial Accuracy & Ledger**: Balances are calculated only from approved transactions. Full audit logging for admin actions.
- 📱 **Mobile-First & Responsive**: Includes bottom navigation bar on mobile devices and responsive sidebars on desktop.

---

## 🛠️ Ikoranabuhanga Ryakoreshejwe (Technology Stack)

### Frontend
- **Framework**: React + Vite (TypeScript)
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **Routing & HTTP**: React Router DOM v6 + Axios

### Backend
- **Framework**: Python 3.13 + FastAPI
- **Database ORM**: SQLAlchemy (SQLite default for zero-config dev, PostgreSQL ready)
- **Validation & Security**: Pydantic v2 + PyJWT + Passlib / Bcrypt
- **Migration**: Alembic

---

## 📁 Imiterere y'Umushinga (Project Structure)

```text
INJIZA/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/   # REST API routers (auth, users, ikibina, savings, loans, notifications, admin)
│   │   ├── auth/            # Auth dependencies & role guards
│   │   ├── core/            # Config & JWT / Bcrypt security
│   │   ├── database/        # Session setup & Seed script
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── main.py          # FastAPI application entry point
│   ├── tests/               # Pytest API test suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Modal, Toast, Skeleton, MoMoPaymentModal, EmptyState
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── layouts/         # UserLayout (Bottom nav) & AdminLayout (Sidebar)
│   │   ├── pages/           # Kwiyandikisha, Injira, Ahabanza, Kwizigama, Amateka, Kuguza, InguzanyoZanjye, Ubutumwa, Umwirondoro, Admin pages
│   │   ├── services/        # Axios API client with Kinyarwanda error handling
│   │   └── types/           # TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## ⚙️ Uko Watangira Gukoresha Urubuga (Installation & Setup)

### 1. Gutangiza Backend (FastAPI)

```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Run database seed (Creates initial admin ENOCK IRADUKUNDA & demo data)
python -m app.database.seed

# Start backend server
uvicorn app.main:app --reload --port 8000
```

> **API Documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

### 2. Gutangiza Frontend (React Vite)

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Konti z'Igerageza (Demo Accounts)

| Urwego (Role) | Nimero ya Telefoni | Ijambobanga | Amazina |
|---|---|---|---|
| **ADMIN** | `0788123456` | `Enock@Koralink2026` | ENOCK IRADUKUNDA |
| **UMUKORESHA** | `0781234567` | `User123456` | Jean Claude MUGISHA |
| **UMUKORESHA** | `0789876543` | `User123456` | Aline UWIMANA |

---

## 🧪 Gupima Backend (Testing)

```bash
cd backend
.\venv\Scripts\python -m pytest tests/test_api.py
```

---

## 📱 MTN Mobile Money Integration Architecture

The application abstracts payment providers via `payment_method` and `payment_reference` transaction records:
1. User clicks **"Zigama"** or **"Wishyura Umwenda"**.
2. Modal displays the USSD code `*182*8*1*412512#` and recipient display verification (`ENOCK`).
3. User submits reference string. Transaction moves to state **`Bitegereje kwemezwa`**.
4. Admin verifies the MoMo transaction in Admin Dashboard and clicks **"Emeza"**, which instantly converts the funds into confirmed user savings or loan repayment ledger entries.
5. Official MTN MoMo API webhooks can be wired directly into `app/api/endpoints/savings.py` by listening to automated payment confirmation events.
