# 🚀 MedicAI — Deployment Reference

Your app is **live on the internet**. This file remembers everything about it.

---

## 🔗 Your links

| What | Link |
|------|------|
| 🎨 **Your website (share this!)** | https://medicai-recommendation.onrender.com |
| 🧠 Backend (brain) | https://medicai-backend-y2c3.onrender.com |
| 🗄️ Database | MongoDB Atlas (cloud) |
| 📦 Code | https://github.com/YaraAgwa/medicai-recommendation |

## 🔑 Demo logins
Password for everyone: **`password123`**
- Doctor: `sarah.j@medicai.com`
- Patient: `john.s@example.com`

---

## 🏗️ How it's hosted (3 free pieces)

```
🎨 Frontend  → Render "Static Site"   (root dir: frontend, publish: dist)
🧠 Backend   → Render "Web Service"    (Docker, root dir: backend, Free plan)
🗄️ Database  → MongoDB Atlas (M0 free)
```

- The website knows where the brain is via the env var **`VITE_API_URL`**
  = `https://medicai-backend-y2c3.onrender.com/api`
- The brain knows where the database is via env vars on the Render backend:
  - `MONGODB_URI` = the Atlas connection string
  - `MONGODB_DB` = `medicai`
  - `JWT_SECRET` = a long secret (set on Render only — never in the code)

## 😴 The "sleep" behavior
On Render's free plan, the **backend** sleeps after ~15 min of no visitors.
The first visit after that takes ~50 seconds to wake up, then it's fast again.
This is normal for free hosting.

---

## 🔄 How to update the live site later
1. Change code on your computer.
2. Save it to GitHub:
   ```bash
   git add -A
   git commit -m "describe what you changed"
   git push
   ```
3. Render automatically rebuilds and redeploys both sites. ✅ (No extra steps.)

## 🌱 How to re-fill the database (seed) again
Run this from the `backend` folder on your computer (one line):
```bash
MONGODB_URI="<your Atlas connection string>" MONGODB_DB="medicai" node seed.js
```
> ⚠️ Seeding **erases** current data and replaces it with the demo data.

## 🧰 Run it on your own computer (with Docker)
```bash
docker compose up -d
docker compose exec backend npm run seed
```
Then open http://localhost:3000

---

## ⚠️ Security reminder
The database username/password and the old `JWT_SECRET` were shown during setup.
If you ever want to be extra safe, you can:
- Change the database password in **Atlas → Database Access**, then update
  `MONGODB_URI` on the Render backend.
- Generate a new `JWT_SECRET` and update it on the Render backend.

See [HOW_THIS_PROJECT_WORKS.md](HOW_THIS_PROJECT_WORKS.md) for a simple
explanation of the whole project.
