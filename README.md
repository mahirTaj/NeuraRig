# NeuraRig 💻⚡

An **AI-powered e-commerce platform** for purchasing computers and accessories, featuring an intelligent PC Builder and virtual assistant.

📂 **Repository:** [github.com/mahirTaj/NeuraRig](https://github.com/mahirTaj/NeuraRig)

---

## 📖 Overview

NeuraRig provides an advanced, user-friendly platform for tech shopping. Beyond browsing products, users can:

* Use an **AI-integrated PC Builder** to configure custom computers.
* Chat with an **AI assistant** for compatibility checks and tailored recommendations.
* Enjoy secure shopping, streamlined checkout, and detailed order tracking.

Admins can manage products, categories, brands, and users through a role-based dashboard.

---

## ✨ Features

### 🛒 User Features

* Product browsing by category (Laptops, Desktops, Components).
* Search, filtering, and sorting by price, brand, and specifications.
* Product details with reviews and ratings.
* Wishlist, cart, and full checkout workflow.
* AI PC Builder with compatibility checker and chatbot guidance.
* Order history and tracking.

### ⚙️ Admin Features

* Product, brand, and category management (add, update, delete).
* Order and user management.
* Role-based authentication and authorization.

---

## 🛠️ Tech Stack

**Frontend**

* React.js
* Tailwind CSS
* React Router

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB with Mongoose

**Other Tools**

* JWT for authentication
* bcrypt for password hashing
* Groq API for AI chatbot/PC Builder integration
* Git & npm

---

## ⚡ Getting Started

### Prerequisites

* Node.js (>= 16)
* MongoDB (local or cloud)

### Installation

```bash
# Clone repo
git clone https://github.com/mahirTaj/NeuraRig.git
cd NeuraRig

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env   # then edit DB URI, JWT secret, etc.

# Run backend
npm run server

# Run frontend
npm start
```

---



