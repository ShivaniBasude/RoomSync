# RoomSync 🏨

> Hostel room allocation and management system built for real business use.

---

## 📁 Project Structure

```
RoomSync/
├── backend/
│   ├── app.py              # Flask app entry point
│   ├── models.py           # SQLAlchemy models
│   └── matching.py         # Room allocation logic
│
└── frontend/
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ViewRooms.jsx
        │   └── ViewStudents.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Rooms.jsx
            ├── Students.jsx
            ├── Allocation.jsx
            ├── Analytics.jsx
            ├── Register.jsx
            └── StudentPortal.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/ShivaniBasude/RoomSync.git
cd RoomSync
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask server starts at `http://localhost:5000`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The React app starts at `http://localhost:5173`

---

## 🔐 Default Admin Credentials

```
Email:    admin@roomsync.com
Password: admin123
```

> ⚠️ Change these before deploying to production.

---

## 📡 API Overview

| Method | Endpoint           | Description                  | Auth     |
|--------|--------------------|------------------------------|----------|
| POST   | `/login`           | Admin / student login        | Public   |
| POST   | `/register`        | Student self-registration    | Public   |
| GET    | `/rooms`           | List all rooms               | Admin    |
| POST   | `/rooms`           | Create a room                | Admin    |
| PUT    | `/rooms/:id`       | Update a room                | Admin    |
| DELETE | `/rooms/:id`       | Delete a room                | Admin    |
| GET    | `/students`        | List all students            | Admin    |
| POST   | `/students`        | Add a student                | Admin    |
| PUT    | `/students/:id`    | Update a student             | Admin    |
| DELETE | `/students/:id`    | Delete a student             | Admin    |
| POST   | `/allocate`        | Assign student to room       | Admin    |
| POST   | `/deallocate`      | Remove student from room     | Admin    |
| GET    | `/analytics`       | Occupancy and stats summary  | Admin    |
| GET    | `/waitlist`        | View waitlist                | Admin    |
| POST   | `/waitlist`        | Add student to waitlist      | Admin    |
| GET    | `/notifications`   | List notifications           | Admin    |

---

## 🎨 Design System

| Token         | Value       | Usage                        |
|---------------|-------------|------------------------------|
| `--cream`     | `#FAF8F4`   | Page background              |
| `--ink`       | `#1C1917`   | Primary text                 |
| `--teal`      | `#2D6A4F`   | Primary accent, CTAs         |
| `--gold`      | `#D4A843`   | Highlights, warnings         |
| `--font-display` | DM Serif Display | Headings              |
| `--font-body`    | DM Sans / Inter  | Body text             |

---

## 🗺️ Roadmap

- [ ] Email notifications on allocation
- [ ] Bulk CSV import for students
- [ ] Room swap requests
- [ ] Mobile app (React Native)
- [ ] Multi-hostel / multi-campus support
