# MedicAI - Medical Recommendation Platform

A full-stack web application where **patients** ask health questions and **doctors** (and other patients) provide answers. Built with React and Node.js.

## Features

- **Separate login** for patients and doctors
- **Different profiles** — patients (age, gender, medical history) vs doctors (specialty, hospital, bio)
- **Patients post questions** with categories (Cardiology, Neurology, etc.)
- **Doctors answer** with their specialty shown
- **Patients can also answer** other patients' questions
- **Browse doctors** filtered by specialty
- **8 pre-seeded doctors** across different specialties

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Seed demo data (optional)

```bash
cd backend
npm run seed
```

### 3. Start the backend

```bash
cd backend
npm start
```

API runs at http://localhost:5000

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

App runs at http://localhost:3000

## Demo Accounts

All demo accounts use password: **password123**

| Role    | Email                  |
|---------|------------------------|
| Patient | john.s@example.com     |
| Patient | maria.g@example.com    |
| Doctor  | sarah.j@medicai.com    |
| Doctor  | michael.c@medicai.com  |
| Doctor  | emily.r@medicai.com    |

## Tech Stack

- **Frontend:** React 18, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT tokens

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/patient | Register patient |
| POST | /api/auth/register/doctor | Register doctor |
| POST | /api/auth/login | Login (requires role) |
| GET | /api/profile/me | Get profile |
| PUT | /api/profile/me | Update profile |
| GET | /api/questions | List questions |
| POST | /api/questions | Post question (patient) |
| GET | /api/questions/:id | Question with answers |
| POST | /api/questions/:id/answers | Post answer |
| GET | /api/doctors | List doctors |
| GET | /api/doctors/specialties | List specialties |
