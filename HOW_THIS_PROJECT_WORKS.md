# 🏥 MedicAI — The Big Friendly Guide

Hello! 👋
This guide explains your **whole project** in very simple words, like you are
7 years old. By the end, you will understand every part, and you will be able
to build it again **all by yourself**.

Take your time. Read one section, then look at the real files. That's how you
learn. 🌱

---

## 1. What is this app? (The big idea)

MedicAI is a **website where sick people ask questions and doctors answer them.**

Think of it like a **classroom**:
- **Patients** are students who raise their hand and ask a question.
- **Doctors** are teachers who answer.
- Everyone can read the questions and answers.

The app also speaks **two languages**: English and Arabic. 🌍

---

## 2. The three big pieces (The restaurant story 🍽️)

Every website like this has **3 parts**. Imagine a restaurant:

| Part | Restaurant word | In our project | What it does |
|------|-----------------|----------------|--------------|
| 🎨 **Frontend** | The dining room | `frontend/` folder | The pretty part you SEE and CLICK |
| 👨‍🍳 **Backend** | The kitchen | `backend/` folder | The brain that DOES the work |
| 🗄️ **Database** | The fridge | MongoDB | Where all the food (data) is STORED |

How they work together:
1. You (the customer) sit in the **dining room** (frontend) and order food.
2. The waiter takes your order to the **kitchen** (backend).
3. The kitchen gets ingredients from the **fridge** (database).
4. The kitchen cooks and sends the food back to your table.

That's it! The whole app is just these three talking to each other. 🗣️

---

## 3. Tools you need on your computer (Your toolbox 🧰)

Before building, install these free programs:

1. **Node.js** → the engine that runs JavaScript. (Get the "LTS" version.)
   - Test it: open a terminal and type `node --version`
2. **Docker Desktop** → a magic box that runs everything for you.
   - Test it: type `docker --version`
3. **A code editor** → **VS Code** is the best and free.
4. (Already have) **MongoDB** → Docker will give you this, so you don't even
   need to install it separately! 🎉

A **terminal** is the black window where you type commands. On Windows it's
**PowerShell**.

---

## 4. The folder map (Where everything lives 🗺️)

```
medicai-recommendation/
│
├── frontend/              ← 🎨 The part you SEE (the dining room)
│   ├── src/
│   │   ├── App.jsx            ← the main file, decides which page to show
│   │   ├── api.js             ← the "waiter" that talks to the kitchen
│   │   ├── pages/             ← one file per screen (Login, Doctors, etc.)
│   │   ├── context/           ← remembers who is logged in
│   │   └── i18n/              ← the two languages (English + Arabic)
│   ├── vite.config.js        ← settings for the frontend
│   ├── nginx.conf            ← used only inside Docker (see section 9)
│   ├── Dockerfile            ← recipe to box up the frontend
│   └── package.json          ← list of tools the frontend needs
│
├── backend/               ← 👨‍🍳 The BRAIN (the kitchen)
│   ├── server.js             ← the front door, turns everything on
│   ├── database.js           ← connects to MongoDB (the fridge)
│   ├── routes/               ← the different "stations" in the kitchen
│   │   ├── auth.js               → sign up & log in
│   │   ├── profile.js            → see & edit your profile
│   │   ├── questions.js          → ask & answer questions
│   │   └── doctors.js            → see the list of doctors
│   ├── middleware/auth.js    ← the security guard (checks your ticket)
│   ├── utils/localize.js     ← picks English or Arabic words
│   ├── seed.js               ← fills the fridge with starter data
│   ├── seed-content.js       ← the actual starter food (doctors, questions)
│   ├── Dockerfile            ← recipe to box up the backend
│   └── package.json          ← list of tools the backend needs
│
├── docker-compose.yml     ← 🎮 the master remote that starts ALL 3 parts
└── HOW_THIS_PROJECT_WORKS.md ← this guide 📖
```

---

## 5. The Frontend — the part you SEE 🎨

The frontend is built with **React**. React lets us build a screen out of
small LEGO blocks called **components**.

### The important files:

**`App.jsx` — the boss of pages**
It says: "If the web address is `/doctors`, show the Doctors page. If it's
`/login`, show the Login page." This is called **routing** (like road signs 🚦).

**`pages/` — one file per screen**
Each file is one screen the user can see:
- `Login.jsx` → the log in screen
- `Register.jsx` → the sign up screen
- `Dashboard.jsx` → your home page after logging in
- `Questions.jsx` → the list of all questions
- `QuestionDetail.jsx` → one question + its answers
- `AskQuestion.jsx` → the form to ask a new question
- `Doctors.jsx` → the list of all doctors
- `DoctorProfile.jsx` → one doctor's page
- `Profile.jsx` → edit your own info

**`api.js` — the waiter 🧑‍🍳**
This is SUPER important. Whenever the frontend needs something from the kitchen,
it calls `api(...)`. For example:
```js
api('/doctors')   // means: "Hey kitchen, give me the list of doctors!"
```
It also attaches your **login ticket** (called a *token*) so the kitchen knows
who you are.

**`context/AuthContext.jsx` — the memory 🧠**
This remembers if you are logged in, and who you are, on every page. So you
don't have to log in again when you click around.

**`i18n/` — the two languages 🌍**
- `en.json` = all the English words
- `ar.json` = all the Arabic words
When you switch language, React swaps all the words at once. Magic!

---

## 6. The Backend — the BRAIN 👨‍🍳

The backend is built with **Express** (a tool for Node.js). It waits for
messages from the frontend and answers them.

### How a request flows (step by step):

Let's say the frontend asks: *"Give me all questions."*

1. **`server.js`** is the front door. It hears the knock at `/api/questions`.
2. It sends it to **`routes/questions.js`** (the questions station).
3. That file asks **`database.js`** to get questions from MongoDB.
4. It gets the data, makes it pretty, and sends it back to the frontend.

### The important files:

**`server.js` — the ON switch**
It turns on the whole kitchen, connects to the database, and listens for
requests on **port 5000** (think of a port like a door number 🚪).

**`routes/` — the kitchen stations**
Each file handles one topic. Inside, you see things like:
```js
router.get('/', async (req, res) => { ... })
```
- `router.get` = "when someone ASKS for data" (read)
- `router.post` = "when someone SENDS new data" (create)
- `router.put` = "when someone CHANGES data" (update)
- `req` = the question coming in
- `res` = the answer going out

**`middleware/auth.js` — the security guard 💂**
Some actions (like asking a question) need you to be logged in. The guard
checks your **token** (your ticket). No ticket = no entry!

A **token** is like a wristband at a theme park 🎢. When you log in, you get
one. You show it every time, and the guard knows it's really you.

**`utils/localize.js` — the translator**
If you want Arabic, it swaps `title` for `title_ar`. Simple!

---

## 7. The Database — the FRIDGE 🗄️

We use **MongoDB**. MongoDB stores data as **documents** that look just like
the JSON you see in code. Very friendly!

### Big words made simple:
- **Database** = the whole fridge (ours is called `medicai`)
- **Collection** = a drawer in the fridge (like "users", "questions")
- **Document** = one item in a drawer (like one single user)

We have **3 drawers (collections)**:

**1. `users`** — every person (patients AND doctors)
```js
{
  _id: "64f...",          // a unique ID MongoDB makes automatically
  email: "sarah@x.com",
  password: "scrambled",  // never stored as plain text! (see section 11)
  role: "doctor",         // "doctor" or "patient"
  name: "Dr. Sarah",
  profile: {              // extra info tucked inside
    specialty: "Cardiology",
    bio: "Heart doctor",
    ...
  }
}
```

**2. `questions`** — every question asked
```js
{
  _id: "abc...",
  patient_id: "64f...",   // which user asked it
  title: "Headache help",
  body: "My head hurts...",
  category: "Neurology",
  created_at: <date>
}
```

**3. `answers`** — every answer to a question
```js
{
  _id: "xyz...",
  question_id: "abc...",  // which question it answers
  user_id: "64f...",      // who wrote it
  body: "Drink water...",
  created_at: <date>
}
```

See how `patient_id` and `question_id` connect the drawers together? That's
how the kitchen knows *which* answer belongs to *which* question. They are like
**name tags** that match. 🏷️

### Why MongoDB and not the old one?
This project used to use **SQLite** (a database that lives in one little file).
We changed it to **MongoDB** because MongoDB is great for storing flexible
documents and is what big real apps often use. The kitchen code had to change
from "ask in SQL language" to "ask in MongoDB language" — but the dining room
(frontend) didn't change at all. 🎉

---

## 8. How the pieces TALK to each other ☎️

The frontend and backend talk using **HTTP requests** (messages over the
internet). Every backend message starts with `/api`.

Examples:
| Frontend does | Backend hears | What happens |
|---------------|---------------|--------------|
| `api('/auth/login')` | `POST /api/auth/login` | check email + password |
| `api('/doctors')` | `GET /api/doctors` | send the doctor list |
| `api('/questions')` | `GET /api/questions` | send all questions |

The answer always comes back as **JSON** (text that looks like the documents
above). The frontend reads it and shows it on screen. 📤📥

---

## 9. Docker — the magic box 📦

Setting up Node, MongoDB, and a web server by hand is hard. **Docker** does it
all for you. Docker puts each part in its own **container** (a sealed lunchbox
that has everything the part needs inside it).

We have **3 containers**:
1. **mongo** → the database 🗄️
2. **backend** → the brain 👨‍🍳
3. **frontend** → the website 🎨 (served by a tiny web server called *nginx*)

**`docker-compose.yml`** is the **remote control** 🎮 that starts all 3 with
ONE command. It also tells them how to find each other:
- The backend finds MongoDB at the address `mongo:27017`.
- The frontend sends `/api` messages to the backend (this is what
  `nginx.conf` sets up — it's the waiter's path to the kitchen inside Docker).

**`Dockerfile`** (one in `frontend/`, one in `backend/`) is the **recipe** that
says how to build each lunchbox. For example, the backend recipe says:
"start with Node, copy my code in, install the tools, then run `npm start`."

---

## 10. How to RUN the project (the easy way) ▶️

This is the simplest way. Just 2 steps!

**Step 1 — start everything:**
```powershell
docker compose up --build
```
Wait until you see `MedicAI API running...`. The first time is slow because
Docker downloads things. ⏳

**Step 2 — fill the fridge with starter data (do this once):**
Open a SECOND terminal and type:
```powershell
docker compose exec backend npm run seed
```
This adds 20 doctors, 6 patients, and lots of questions. All demo accounts use
the password `password123`.

**Now open your browser:** 👉 http://localhost:3000

To **stop** everything: press `Ctrl + C`, or type `docker compose down`.

---

## 11. How to BUILD it from scratch, ALL BY YOURSELF 🏗️

This is the big one! Here is the order to build the project from an empty
folder. Don't rush — do one step, test it, then go to the next.

### 🥇 Step 1: Make the folders
```
medicai-recommendation/
├── frontend/
└── backend/
```

### 🥈 Step 2: Build the database connection (backend)
1. In `backend/`, run `npm init -y` to make a `package.json`.
2. Install tools: `npm install express cors mongodb bcryptjs jsonwebtoken`
3. Write **`database.js`** → connect to MongoDB, export the collections.
   *(This is the fridge door. Build it first so everything else can use it.)*

### 🥉 Step 3: Build the security guard
- Write **`middleware/auth.js`** → makes login tickets (tokens) and checks them.

### 4️⃣ Step 4: Build the kitchen stations (routes), one at a time
Build and **test each one before moving on**:
1. `routes/auth.js` → sign up & log in (start here, you need users first!)
2. `routes/profile.js` → see & edit your own info
3. `routes/questions.js` → ask & answer questions
4. `routes/doctors.js` → list doctors

### 5️⃣ Step 5: Turn on the kitchen
- Write **`server.js`** → connect to the database, then start listening on
  port 5000.
- Test it! Open http://localhost:5000/api/health — you should see
  `{"status":"ok"}`. 🎉

### 6️⃣ Step 6: Add starter data
- Write **`seed.js`** and **`seed-content.js`** → fill the fridge so the app
  isn't empty.

### 7️⃣ Step 7: Build the dining room (frontend)
1. Make the frontend with Vite: `npm create vite@latest frontend -- --template react`
2. Install tools: `npm install react-router-dom react-i18next i18next`
3. Build in this order:
   - `api.js` → the waiter (so pages can talk to the kitchen)
   - `context/AuthContext.jsx` → the login memory
   - `App.jsx` → the page router (road signs)
   - then the `pages/` one by one (Login → Register → Dashboard → the rest)
   - `i18n/` → add the two languages last

### 8️⃣ Step 8: Box it up with Docker
1. Write `backend/Dockerfile` (recipe for the brain)
2. Write `frontend/Dockerfile` + `frontend/nginx.conf` (recipe for the website)
3. Write `docker-compose.yml` (the remote that starts all 3)
4. Run `docker compose up --build` and celebrate! 🎉🎉

**Golden rule:** build the **backend first** (kitchen), test it works, THEN
build the frontend (dining room). A dining room with no kitchen is useless!

---

## 12. Want to CHANGE something? (Common recipes 🛠️)

**➕ Add a new field to a doctor (like "phone number"):**
1. In `routes/auth.js`, add `phone` when creating the doctor's `profile`.
2. In `routes/doctors.js`, include `phone` in what you send back.
3. In `frontend/src/pages/Profile.jsx`, add an input box for it.

**➕ Add a brand new page (like "About Us"):**
1. Make `frontend/src/pages/About.jsx`.
2. In `App.jsx`, add a route: `<Route path="/about" element={<About />} />`.

**➕ Add a new backend action:**
1. Pick the right route file (or make a new one in `routes/`).
2. Add `router.get(...)` or `router.post(...)`.
3. If it's a new file, register it in `server.js` with `app.use(...)`.

**After any change:** restart with `docker compose up --build` to see it.

---

## 13. Dictionary of big words 📚

- **Frontend** = the part you see and click (the dining room)
- **Backend** = the brain that does the work (the kitchen)
- **Database** = where data is stored (the fridge); ours is **MongoDB**
- **Server** = a computer (or program) that answers requests
- **Port** = a numbered door on a computer (frontend = 3000, backend = 5000)
- **API** = the menu of things the backend can do; messages start with `/api`
- **Request** = a message asking for something
- **Response** = the answer that comes back
- **JSON** = a simple text format for data, looks like `{ "name": "Sara" }`
- **Route** = one specific backend action (like `/api/login`)
- **Token** = your login wristband 🎢; proves who you are
- **Hash** = scrambling a password so nobody can read it (we use *bcrypt*)
- **Collection** = a drawer in the database (users, questions, answers)
- **Document** = one item in a drawer (one user)
- **Component** = a LEGO block of the website (a button, a card, a page)
- **Docker** = the magic box that runs everything for you
- **Container** = one sealed lunchbox with one part inside
- **nginx** = a tiny fast web server that serves the website inside Docker
- **Seed** = filling the database with starter data
- **Environment variable** = a setting passed from outside (like `MONGODB_URI`)

---

## 14. If something breaks 🔧

- **Page won't open?** Is Docker running? Type `docker compose ps` to see if
  all 3 containers say "Up".
- **No doctors or questions show?** You forgot to seed! Run
  `docker compose exec backend npm run seed`.
- **"Cannot connect to MongoDB"?** The database container isn't ready yet. Wait
  a few seconds and try again, or restart with `docker compose up`.
- **Changed code but nothing happened?** Rebuild: `docker compose up --build`.
- **Want a totally fresh start?** `docker compose down -v` deletes everything
  (including the data), then `docker compose up --build` rebuilds clean.

---

You did it! 🌟 Read this guide a few times, peek at the real files as you go,
and soon the whole project will feel like your own LEGO set. You can build it. 💪
```
