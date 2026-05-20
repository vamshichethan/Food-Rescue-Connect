# 🍕 Food Rescue Connect

> A real-time, AI-driven logistics and matching platform bridging the gap between food donors, volunteers, and NGOs to minimize food waste and support communities.

---

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&style=flat-square)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&style=flat-square)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Food Rescue Connect is designed to solve one of society's most pressing issues: food waste. By integrating real-time geolocation matching, socket-based chat/coordination, automated route optimization, and AI-driven demand & wastage predictions, this platform elevates the food recovery pipeline into an intelligent, high-efficiency logistics ecosystem.

---

## 🗺️ Table of Contents
1. [👥 User Roles & Permissions](#-user-roles--permissions)
2. [💡 Core Features](#-core-features)
3. [⚙️ System Architecture](#️-system-architecture)
4. [🛠️ Tech Stack](#️-tech-stack)
5. [🚀 10-Phase Roadmap](#-10-phase-roadmap)
6. [🔥 Placement Boosters (AI & Real-time)](#-placement-boosters-ai--real-time)
7. [💻 Local Development Setup](#-local-development-setup)
8. [📊 Impact & Analytics Dashboard](#-impact--analytics-dashboard)
9. [📈 Production Deployment & Scaling](#-production-deployment--scaling)

---

## 👥 User Roles & Permissions

The application features a secure, role-based access control (RBAC) mechanism defining four primary user personas:

```
┌────────────────────────────────────────────────────────┐
│                   Food Rescue Connect                  │
└───────┬───────────────┬────────────────┬───────┬───────┘
        │               │                │       │
┌───────▼───────┐┌──────▼───────┐┌───────▼──────┐┌▼──────┐
│     Donor     ││ NGO/Receiver ││  Volunteer   ││ Admin │
└───────────────┘└──────────────┘└──────────────┘└───────┘
```

| Role | Core Purpose | Primary Actions |
| :--- | :--- | :--- |
| **Donor** (Restaurants, Hotels, Individuals) | Provide surplus edible food | Upload listings, specify expiry/quantity, select packaging types, track volunteer pickup. |
| **NGO / Receiver** | Receive and distribute food | Set rescue range preferences, receive automated notifications, accept matching listings, manage inventory. |
| **Volunteer** | Provide transport & logistics | Claim delivery tasks, view optimized routing, communicate status (picked up, en route, completed). |
| **Admin** | Monitor, audit & manage system | Access global analytics (CO₂ saved, meals rescued), manage users, resolve disputes, oversee platform health. |

---

## 💡 Core Features

### 🟢 Real-Time Food Matching
* **Multi-Criteria Optimization:** Match listings based on distance, volume, packaging type, and expiry window.
* **Proximity Alerts:** Automatically alert the nearest NGOs (within a 5km radius) when fresh food is posted.
* **Instant Handshakes:** Instantaneous connection through WebSockets when an NGO accepts a donation.

### 📍 Maps & Live Tracking
* **Interactive Live Maps:** Map interfaces showing active donation points, volunteer routes, and drop-off hubs.
* **Route Optimization:** Multi-stop routing algorithm using OpenStreetMap/Google Maps API to minimize transport time.
* **Real-Time Progress:** Live tracking of volunteer movements showing real-time ETA updates.

### 🔔 Smart Notification System
* **Instant Alerts:** Web socket and push notifications for urgent pickups.
* **Status Updates:** Immediate alerts to donors when food is matched, picked up, and safely delivered.

### 🧠 AI Analytics & Predictions
* **Food Wastage Predictor:** Analyzes historical pickup patterns to flag listings at high risk of expiring before pickup.
* **NGO Recommendation:** Suggests the best distribution center based on historic consumption rates.
* **Demand Forecasting:** Predicts weekly food surplus patterns in specific zones to allocate volunteer squads proactively.

---

## ⚙️ System Architecture

```mermaid
graph TD
    %% Clients
    Donor[Donor Client - Next.js] <--> |WebSockets / API| Gateway[API Gateway / Express Server]
    NGO[NGO Client - Next.js] <--> |WebSockets / API| Gateway
    Vol[Volunteer Client - Next.js] <--> |WebSockets / API| Gateway
    
    %% Core Services
    Gateway --> |JWT Auth & Verification| DB[(MongoDB Atlas)]
    Gateway <--> |Real-time Updates| SocketServer[Socket.io Engine]
    
    %% Third-party APIs
    Gateway --> |Route Planning| MapsAPI[Google Maps / OSM]
    Gateway --> |Push Notifications| FCM[Firebase Cloud Messaging]
    
    %% AI/ML Service
    Gateway <--> |Predictive Analytics API| AIService[Python FastAPI Service]
    AIService --> |Model Inference| MLModel[XGBoost & Scikit-Learn Model]
    AIService --> |Feature Data| DB
```

---

## 🛠️ Tech Stack

### Frontend & UI
* **Framework:** Next.js 14 (App Router) with TypeScript
* **Styling:** Tailwind CSS & Shadcn UI
* **State Management:** React Context / Zustand
* **Maps Integration:** React Leaflet / Google Maps Javascript API

### Backend & Databases
* **Server Runtime:** Node.js
* **Backend Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Real-time Engine:** Socket.io
* **Authentication:** JSON Web Tokens (JWT) + Google OAuth

### AI / ML Microservice
* **Framework:** FastAPI (Python 3.10+)
* **Libraries:** Scikit-learn, XGBoost, Pandas, NumPy
* **Deployment:** Dockerized containment

---

## 🚀 10-Phase Roadmap

### 📋 Phase 1 — Project Planning & Requirements
- [ ] Define precise database models for Users, Food Listings, Donations, and Volunteers.
- [ ] Map complete API endpoint routes and payload structures.
- [ ] Wireframe key navigation pathways for all 4 roles.

### 🎨 Phase 2 — UI/UX Design
- [ ] Design custom dashboard templates for Donor, NGO, and Volunteer roles.
- [ ] Establish design tokens (consistent spacing, curated warm color palette, typography).
- [ ] Create detailed Figma prototypes focusing on high-fidelity responsive mockups.

### 🏗️ Phase 3 — Frontend Foundation
- [ ] Scaffold Next.js application with TypeScript and Tailwind CSS.
- [ ] Implement global layouts including Navbars, Sidebars, and Footer components.
- [ ] Build reusable UI blocks (cards, buttons, modal windows, forms with validation).

### 🔒 Phase 4 — Backend & Database Setup
- [ ] Initialize Node.js & Express server with absolute path routing.
- [ ] Set up MongoDB Atlas cluster and mongoose schemas.
- [ ] Implement standard RESTful controllers for base CRUD operations.

### 🛡️ Phase 5 — Authentication & Role-Based Access Control
- [ ] Set up JWT verification middleware.
- [ ] Implement password hashing using bcrypt.
- [ ] Create role guards for API endpoints (`/api/donor/*`, `/api/ngo/*`, `/api/volunteer/*`).

### ⚡ Phase 6 — Real-Time Food Matching
- [ ] Build geo-indexing queries in MongoDB.
- [ ] Develop the Haversine formula backend helper to calculate distances dynamically.
- [ ] Integrate Socket.io server-side for broadcast alerts to nearby NGOs.

### 🗺️ Phase 7 — Maps & Tracking System
- [ ] Render interactive map UI on the Volunteer interface.
- [ ] Add Leaflet/OSM map overlays for active route paths.
- [ ] Integrate live geolocation tracking sending latitude/longitude updates over WebSockets.

### 💬 Phase 8 — Multi-channel Notifications
- [ ] Add support for Firebase Cloud Messaging (FCM) for background alerts.
- [ ] Set up Nodemailer for transactional emails (e.g. signup, recovery, pickup completions).
- [ ] Implement in-app persistent notification logs.

### 🔮 Phase 9 — AI/ML Features (Placement Booster)
- [ ] Create FastAPI microservice backend.
- [ ] Train an XGBoost model using historical delivery times, distance, and expiry to forecast the probability of food spoilage.
- [ ] Integrate recommendation endpoint indicating the best NGO based on current storage capacity and active needs.

### 🐳 Phase 10 — Deployment, Scaling & Monitoring
- [ ] Write optimized multi-stage Dockerfiles for Frontend, Backend, and ML services.
- [ ] Set up continuous integration and deployment (CI/CD) pipelines to Vercel and Render.
- [ ] Add Prometheus/Grafana or Winston logging for exception monitoring and rate-limiting.

---

## 🔥 Placement Boosters (AI & Real-time)

This project stands out from standard full-stack CRUD applications by addressing complex real-time coordination and predictive algorithms:

1. **Smart Expiry Risk Prediction:**
   * Uses a trained machine learning model inside a Python microservice to predict the likelihood of a donation going to waste (Expiry Risk Index).
   * **Formula Variables:** Distance, expiry duration, active volunteer density in the area, and historical claiming rates.
   * **Actionable Insight:** If Risk > 70%, the system triggers priority push alerts and escalates matching radius from 5km to 15km.

2. **Real-Time Geolocation Coordination:**
   * Leverages WebSockets via Socket.io to stream real-time coordinate updates from the volunteer's mobile app directly to the donor and receiving NGO's screens.

3. **Dynamic Route Optimization:**
   * Utilizes Open Source Routing Machine (OSRM) or Google Directions API to offer volunteers the fastest path, taking traffic data and multiple drop-offs into account.

---

## 💻 Local Development Setup

### Prerequisites
* Node.js v18+ & npm/yarn
* Python 3.10+ (for ML Service)
* MongoDB Local Instance or Atlas Connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/vamshichethan/Food-Rescue-Connect.git
cd Food-Rescue-Connect
```

### 2. Backend Configuration
Create `/server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
FASTAPI_SERVICE_URL=http://localhost:8000
```
Run Backend:
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Configuration
Create `/client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_MAPS_KEY=your_maps_api_key
```
Run Frontend:
```bash
cd client
npm install
npm run dev
```

### 4. Machine Learning Service Configuration
Create `/ml/.env`:
```env
PORT=8000
DATABASE_URL=your_mongodb_connection_string
```
Run FastAPI service:
```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📊 Impact & Analytics Dashboard

A core highlight of the Admin Panel is the ecological impact tracking:
* 📉 **CO₂ Emissions Avoided:** Calculated based on the weight of salvaged organic food instead of landfill decomposition.
* 🍲 **Meals Reallocated:** Direct metric converting kilograms of collected food into equivalent meals (1 Meal ≈ 0.45 kg).
* 🚛 **Eco-Logistics Efficiency:** Tracks average pickup-to-dropoff duration using optimized routing vs linear routing.

---

## 📈 Production Deployment & Scaling

| Component | Platform | Configuration Detail |
| :--- | :--- | :--- |
| **Frontend** | Vercel | Automatic deployments on `main` branch push. |
| **Backend API** | Render / AWS ECS | Auto-scaling container group with JWT stateless sessions. |
| **ML Engine** | Render / HuggingFace Spaces | FastAPI server hosted as a Dockerized container. |
| **Database** | MongoDB Atlas | Multi-region replica setup with automatic automated backups. |

---
git hub fails 
# github fAILS 
## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details .. india india give me contributor fast 
git hub fails 
