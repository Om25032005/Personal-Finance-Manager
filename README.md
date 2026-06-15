# WealthFlow - Personal Finance Manager (MERN Stack)

WealthFlow is a production-ready, feature-rich Personal Finance Manager application designed using the MERN stack (MongoDB, Express, React, Node.js). It supports secure user sessions, budget checks with automated email warning notifications, savings target tracking, Excel and PDF statement exports, and intelligent AI-powered financial advisory recommendations.

---

## Technical Stack

* **Frontend**: React, React Router DOM, Axios, Tailwind CSS, Recharts, Lucide Icons
* **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Nodemailer (Email), ExcelJS, PDFKit, Multer
* **Database**: MongoDB (Mongoose ODM)
* **AI Engine**: Google Gemini API integration (with local analytical fallback)

---

## Directory Structure

```text
c:/project/Finance Manager/
├── Backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express controllers (auth, transactions, budgets, goals, reports, AI)
│   ├── middleware/         # Security, upload, and error handling middlewares
│   ├── models/             # Mongoose schemas (User, Income, Expense, Budget, Goal)
│   ├── routes/             # REST route mappings
│   ├── scripts/            # Database seeding scripts for mock data testing
│   ├── utils/              # PDF, Excel, and Gemini AI compilers, mail transporters
│   ├── uploads/            # Local directory for profile avatars
│   ├── .env                # Server configurations file
│   ├── package.json        # Backend dependencies manifest
│   └── server.js           # Server application startup
│
└── Frontend/
    ├── public/             # Static public assets
    ├── src/
    │   ├── components/     # Layout, Toast, and Protected route wrappers
    │   ├── context/        # AuthContext and FinanceContext state containers
    │   ├── pages/          # Application views (Dashboard, Ledger, Inputs, Reports, AI, Settings)
    │   ├── services/       # Axios API client interceptor definitions
    │   ├── App.jsx         # Router core mappings
    │   ├── index.css       # Tailwind imports and premium CSS components
    │   └── main.jsx        # Client bootloader
    ├── index.html          # Shell template page
    ├── package.json        # Client dependencies manifest
    ├── postcss.config.js   # Style processor configurations
    ├── tailwind.config.js  # Theme palette layouts
    └── vite.config.js      # Dev server & reverse proxy mappings
```

---

## Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally or a MongoDB Atlas Connection String

### 1. Configure Backend environment
Navigate to the `Backend` directory:
```bash
cd Backend
```

Create a `.env` file (refer to the `.env` template already created):
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/finance-manager
JWT_SECRET=super_secret_jwt_key_12345
JWT_EXPIRE=30d

# Mail Settings (Optional - if left empty, emails will log to the console)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="Personal Finance Manager" <noreply@financemanager.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gemini API Key (Optional - if left empty, rule-based suggestions are compiled)
GEMINI_API_KEY=PLACEHOLDER
```

Install backend dependencies and run:
```bash
npm install
npm run dev
```

### 2. Seed Mock Database Data
To instantly populate the database with a test user (`test@test.com` / `password123`) and realistic income/expense logs for the current month:
```bash
npm run seed
# or: node scripts/seed.js
```

### 3. Configure Frontend
Navigate to the `Frontend` directory:
```bash
cd ../Frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## REST API Endpoints

### 1. Authentication
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate credentials and receive token
* `POST /api/auth/forgotpassword` - Request a password reset email link
* `PUT /api/auth/resetpassword/:resettoken` - Reset password using validation token
* `GET /api/auth/me` - Fetch details for current authenticated session

### 2. Income Ledger
* `GET /api/income` - Retrieve user income logs
* `POST /api/income` - Log a new income item
* `PUT /api/income/:id` - Update income record details
* `DELETE /api/income/:id` - Remove income record from DB

### 3. Expense Ledger
* `GET /api/expense` - Retrieve user expense logs
* `POST /api/expense` - Log a new expense (triggers budget threshold comparisons)
* `PUT /api/expense/:id` - Update expense details
* `DELETE /api/expense/:id` - Remove expense record

### 4. Budgets
* `GET /api/budget` - List active budgets
* `POST /api/budget` - Create or update monthly category budget
* `DELETE /api/budget/:id` - Delete budget ceiling
* `GET /api/budget/status/:month` - Get utilization stats percentage for a month (`YYYY-MM`)

### 5. Savings Goals
* `GET /api/goal` - List active goals
* `POST /api/goal` - Establish a new target milestones
* `PUT /api/goal/:id` - Update goal values (triggers congratulations emails if target met)
* `DELETE /api/goal/:id` - Delete milestone

### 6. Transactions Feed
* `GET /api/transactions` - Returns unified, paginated, sorted list of income + expenses
  * *Query Filters*: `type` (all/income/expense), `category`, `startDate`, `endDate`, `search` (description match), `page`, `limit`

### 7. Statements & Exports
* `GET /api/reports/summary/:month` - JSON monthly statistics summary
* `GET /api/reports/export/pdf/:month` - Stream generated PDF statement download
* `GET /api/reports/export/excel/:month` - Stream generated Excel spreadsheet download

### 8. AI Advisor
* `GET /api/ai/insights/:month` - Compile financial recommendations (analyzes savings-rates, budget breaches, high-expense category weights)

### 9. Profile
* `PUT /api/profile` - Update name/email
* `PUT /api/profile/password` - Update password
* `POST /api/profile/avatar` - Upload profile image file (`Multer` processed)
