# 🍕 PizzaGo - Professional Full-Stack Pizza Delivery MERN Application

A complete, production-ready, full-stack Pizza Delivery Web Application built using the **MERN Stack** (MongoDB, Express, React, Node.js). This project is designed with modular software architecture, secure JWT session authentication, OTP email verification, dynamic custom pizza builders, shopping cart logic, automated PDF invoice generation, real-time status updates via WebSockets, and administrative managers for stocks and analytics.

---

## 🚀 Key Features

* **🛡️ Secure JWT Authentication**: Pre-login OTP email validation, bearer auth filters, and secure password hashing using `bcrypt`.
* **🎨 Custom Pizza Builder Wizard**: Interactively choose crusts, sauces, cheese blends, and toppings with real-time price summation.
* **💳 Razorpay Payment Gateway**: Seamless checkout with integrated test cards. Includes a **Mock Payment Bypass** trigger to facilitate local testing without needing actual API keys.
* **📄 Automated Invoice PDFs**: Auto-compiles and generates professional billing invoices using `pdfkit` upon payment verification.
* **📧 Email confirmation & alerts**: Sends invoices as PDF email attachments and alerts administrators when raw ingredient stocks fall below safety thresholds using a Node-cron schedule.
* **🔔 Real-time Socket Tracking**: Visual checkout status progress bar that receives live status updates from administrators using Socket.io room segmentations.
* **📈 Administrative Dashboards**: High-fidelity managers for analytics (revenue, order counts, stock levels), menu presets configuration, and order status updates.

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js, Express.js
* **Database**: MongoDB Atlas, Mongoose ODM
* **Security & Tokens**: JWT, Bcrypt, Helmet, CORS, Express-Rate-Limit
* **Automation & Sockets**: Socket.io, Node-cron, Nodemailer
* **Cloud & Files**: Cloudinary, Multer, PDFKit, Express-Validator

### Frontend
* **Core**: React.js (Vite compiler), React Router DOM (protected layout routing)
* **State Management**: Redux Toolkit, Redux Persist (LocalStorage caching)
* **Styling & Motion**: Tailwind CSS v4, Framer Motion (animated menus), Lucide React
* **Alerts & Forms**: React Hot Toast, React Hook Form

---

## 📂 Project Structure

```
OIBSIP/
├── WebDev-L4-Pizza Delivery Full Stack Application/
│   ├── backend/                  # Node.js + Express.js API Server
│   │   ├── config/               # Database & Cloud configs
│   │   ├── controllers/          # Business logic handlers
│   │   ├── cron/                 # Low-stock cron alerters
│   │   ├── middlewares/          # Security & upload interceptors
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Cloudinary, PDF invoice & Nodemailer services
│   │   ├── socket/               # WebSocket connections
│   │   └── validators/           # Request schema checkers
│   │
│   └── frontend/                 # Vite + React Client
│       ├── src/
│       │   ├── components/       # UI Components (Header, PizzaModal)
│       │   ├── layouts/          # User & Admin layouts
│       │   ├── pages/            # App Views (Login, Cart, Dashboards)
│       │   ├── redux/            # RTK state slices
│       │   ├── routes/           # Protected route guards
│       │   └── services/         # Axios api clients & socket instances
```

---

## ⚙️ Installation & Local Setup

### Prerequisite
Make sure you have [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) installed on your machine.

---

### Step 1: Configure Backend Environment

1. Navigate to `/backend/` directory.
2. Create a `.env` file containing the following variables:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pizzago

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_token_key
JWT_EXPIRES_IN=7d

# SMTP Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="PizzaGo Delivery" <your_email@gmail.com>

# Cloudinary Storage Configuration (Preset Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Test Credentials (Mock Mode runs if left as is)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# Client Application URL
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@yourdomain.com
```

3. Install backend dependencies and boot server:
```bash
cd backend
npm install
npm start
```
*The server will run on `http://localhost:5000`.*

---

### Step 2: Configure Frontend Client

1. Navigate to `/frontend/` directory.
2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```
3. Run the development server:
```bash
npm run dev
```
*The application client will open on `http://localhost:5173`.*

---

## 🧪 Testing the Application

We have included automated testing scripts inside the backend directory to verify various application modules:

* **Authentication Tests**: `node scratch/test_auth.js`
* **Checkout & Invoice Tests**: `node scratch/test_checkout.js`
* **WebSocket Sockets Broadcast Tests**: `node scratch/test_socket.js`
