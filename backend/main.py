from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import timedelta
import csv, io, os
from dotenv import load_dotenv

import models, auth
from database import engine, get_db, Base

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RoomSync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Seed admin on startup ────────────────────────────────
@app.on_event("startup")
def seed_admin():
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            admin = models.User(
                email=os.getenv("ADMIN_EMAIL", "admin@roomsync.com"),
                name=os.getenv("ADMIN_NAME", "Administrator"),
                hashed_password=auth.get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")),
                role="admin"
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

# ── Pydantic schemas ─────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    roll_no: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    gender: Optional[str] = None
    preference: Optional[str] = None
    phone: Optional[str] = None

class RoomCreate(BaseModel):
    number: str
    floor: Optional[str] = None
    type: Optional[str] = "Single"
    capacity: Optional[int] = 1

class StudentCreate(BaseModel):
    name: str
    roll_no: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    gender: Optional[str] = None
    preference: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class AllocationCreate(BaseModel):
    student_id: int
    room_id: int

class RequestCreate(BaseModel):
    preferred_type: Optional[str] = None
    preferred_floor: Optional[str] = None
    notes: Optional[str] = None

class RequestUpdate(BaseModel):
    status: str  # approved or rejected

class NotifCreate(BaseModel):
    user_id: int
    message: str

# ── Auth routes ──────────────────────────────────────────
@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token({"sub": str(user.id), "role": user.role})
    student_id = user.student.id if user.student else None
    return {"access_token": token, "token_type": "bearer",
            "role": user.role, "name": user.name, "email": user.email,
            "id": user.id, "student_id": student_id}

@app.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        email=data.email, name=data.name,
        hashed_password=auth.get_password_hash(data.password),
        role="student"
    )
    db.add(user); db.flush()
    student = models.Student(
        user_id=user.id, name=data.name,
        roll_no=data.roll_no, course=data.course, year=data.year,
        gender=data.gender, preference=data.preference,
        phone=data.phone, email=data.email
    )
    db.add(student); db.commit(); db.refresh(user)
    token = auth.create_access_token({"sub": str(user.id), "role": "student"})
    return {"access_token": token, "token_type": "bearer",
            "role": "student", "name": user.name, "email": user.email,
            "id": user.id, "student_id": student.id}

@app.get("/auth/me")
def me(current_user: models.User = Depends(auth.get_current_user)):
    student_id = current_user.student.id if current_user.student else None
    return {"id": current_user.id, "email": current_user.email,
            "name": current_user.name, "role": current_user.role,
            "student_id": student_id}

# ── Rooms ────────────────────────────────────────────────
@app.get("/rooms")
def get_rooms(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    rooms = db.query(models.Room).all()
    result = []
    for r in rooms:
        occ = len(r.allocations)
        result.append({"id": r.id, "number": r.number, "floor": r.floor,
                        "type": r.type, "capacity": r.capacity,
                        "occupied": occ, "available": occ < r.capacity})
    return result

@app.post("/rooms")
def create_room(data: RoomCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    if db.query(models.Room).filter(models.Room.number == data.number).first():
        raise HTTPException(status_code=400, detail="Room number already exists")
    room = models.Room(**data.dict())
    db.add(room); db.commit(); db.refresh(room)
    return room

@app.put("/rooms/{room_id}")
def update_room(room_id: int, data: RoomCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    for k, v in data.dict().items(): setattr(room, k, v)
    db.commit(); db.refresh(room)
    return room

@app.delete("/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room); db.commit()
    return {"detail": "Room deleted"}

# ── Students ─────────────────────────────────────────────
@app.get("/students")
def get_students(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    students = db.query(models.Student).all()
    result = []
    for s in students:
        alloc = None
        if s.allocation:
            r = s.allocation.room
            alloc = {"room_id": r.id, "room_number": r.number, "room_type": r.type}
        waitlist_pos = s.waitlist.position if s.waitlist else None
        result.append({
            "id": s.id, "name": s.name, "roll_no": s.roll_no,
            "course": s.course, "year": s.year, "gender": s.gender,
            "preference": s.preference, "phone": s.phone, "email": s.email,
            "status": s.status, "allocation": alloc, "waitlist_position": waitlist_pos
        })
    return result

@app.get("/students/me")
def get_my_student(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    s = current_user.student
    if not s: raise HTTPException(status_code=404, detail="Student profile not found")
    alloc = None
    if s.allocation:
        r = s.allocation.room
        alloc = {"room_id": r.id, "room_number": r.number, "room_type": r.type,
                 "floor": r.floor, "capacity": r.capacity}
    waitlist_pos = s.waitlist.position if s.waitlist else None
    return {"id": s.id, "name": s.name, "roll_no": s.roll_no,
            "course": s.course, "year": s.year, "gender": s.gender,
            "preference": s.preference, "phone": s.phone, "email": s.email,
            "status": s.status, "allocation": alloc, "waitlist_position": waitlist_pos}

@app.post("/students")
def create_student(data: StudentCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    student = models.Student(**data.dict())
    db.add(student); db.commit(); db.refresh(student)
    return student

@app.put("/students/{student_id}")
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s: raise HTTPException(status_code=404, detail="Student not found")
    for k, v in data.dict().items(): setattr(s, k, v)
    db.commit(); db.refresh(s)
    return s

@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s: raise HTTPException(status_code=404, detail="Student not found")
    db.delete(s); db.commit()
    return {"detail": "Student deleted"}

# ── Allocations ──────────────────────────────────────────
@app.get("/allocations")
def get_allocations(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    allocs = db.query(models.Allocation).all()
    return [{"id": a.id, "student_id": a.student_id, "room_id": a.room_id,
             "student_name": a.student.name, "room_number": a.room.number,
             "room_type": a.room.type, "allocated_at": a.allocated_at} for a in allocs]

@app.post("/allocations")
def create_allocation(data: AllocationCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == data.student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    room = db.query(models.Room).filter(models.Room.id == data.room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    if len(room.allocations) >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is full")
    if student.allocation:
        raise HTTPException(status_code=400, detail="Student already allocated")
    alloc = models.Allocation(student_id=data.student_id, room_id=data.room_id)
    db.add(alloc)
    student.status = "allocated"
    if student.waitlist:
        db.delete(student.waitlist); db.flush()
        _reorder_waitlist(db)
    db.commit(); db.refresh(alloc)
    if student.user_id:
        notif = models.Notification(user_id=student.user_id,
            message=f"You have been allocated Room {room.number} ({room.type}).")
        db.add(notif); db.commit()
    return {"id": alloc.id, "student_id": alloc.student_id, "room_id": alloc.room_id,
            "student_name": student.name, "room_number": room.number}

@app.delete("/allocations/{alloc_id}")
def delete_allocation(alloc_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    alloc = db.query(models.Allocation).filter(models.Allocation.id == alloc_id).first()
    if not alloc: raise HTTPException(status_code=404, detail="Allocation not found")
    alloc.student.status = "pending"
    db.delete(alloc); db.commit()
    return {"detail": "Allocation removed"}

def _reorder_waitlist(db):
    entries = db.query(models.WaitlistEntry).order_by(models.WaitlistEntry.created_at).all()
    for i, e in enumerate(entries, 1):
        e.position = i
    db.flush()

# ── Room Requests ────────────────────────────────────────
@app.get("/requests")
def get_requests(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    reqs = db.query(models.RoomRequest).order_by(models.RoomRequest.created_at.desc()).all()
    return [{"id": r.id, "student_id": r.student_id, "student_name": r.student.name,
             "preferred_type": r.preferred_type, "preferred_floor": r.preferred_floor,
             "notes": r.notes, "status": r.status, "created_at": r.created_at} for r in reqs]

@app.post("/requests")
def create_request(data: RequestCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not current_user.student:
        raise HTTPException(status_code=400, detail="No student profile found")
    req = models.RoomRequest(student_id=current_user.student.id, **data.dict())
    db.add(req); db.commit(); db.refresh(req)
    admins = db.query(models.User).filter(models.User.role == "admin").all()
    for admin in admins:
        notif = models.Notification(user_id=admin.id,
            message=f"New room request from {current_user.name}.")
        db.add(notif)
    db.commit()
    return req

@app.get("/requests/me")
def get_my_requests(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not current_user.student: return []
    reqs = db.query(models.RoomRequest).filter(
        models.RoomRequest.student_id == current_user.student.id
    ).order_by(models.RoomRequest.created_at.desc()).all()
    return [{"id": r.id, "preferred_type": r.preferred_type,
             "preferred_floor": r.preferred_floor, "notes": r.notes,
             "status": r.status, "created_at": r.created_at} for r in reqs]

@app.put("/requests/{req_id}")
def update_request(req_id: int, data: RequestUpdate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    req = db.query(models.RoomRequest).filter(models.RoomRequest.id == req_id).first()
    if not req: raise HTTPException(status_code=404, detail="Request not found")
    req.status = data.status
    db.commit()
    if req.student.user_id:
        msg = f"Your room request has been {data.status}."
        notif = models.Notification(user_id=req.student.user_id, message=msg)
        db.add(notif); db.commit()
    return req

# ── Waitlist ─────────────────────────────────────────────
@app.get("/waitlist")
def get_waitlist(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    entries = db.query(models.WaitlistEntry).order_by(models.WaitlistEntry.position).all()
    return [{"id": e.id, "student_id": e.student_id, "student_name": e.student.name,
             "position": e.position, "created_at": e.created_at} for e in entries]

@app.post("/waitlist/{student_id}")
def add_to_waitlist(student_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    if student.waitlist: raise HTTPException(status_code=400, detail="Already on waitlist")
    count = db.query(models.WaitlistEntry).count()
    entry = models.WaitlistEntry(student_id=student_id, position=count + 1)
    student.status = "waitlisted"
    db.add(entry); db.commit(); db.refresh(entry)
    if student.user_id:
        notif = models.Notification(user_id=student.user_id,
            message=f"You have been added to the waitlist at position {entry.position}.")
        db.add(notif); db.commit()
    return entry

@app.delete("/waitlist/{entry_id}")
def remove_from_waitlist(entry_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    entry = db.query(models.WaitlistEntry).filter(models.WaitlistEntry.id == entry_id).first()
    if not entry: raise HTTPException(status_code=404, detail="Entry not found")
    entry.student.status = "pending"
    db.delete(entry); db.flush()
    _reorder_waitlist(db); db.commit()
    return {"detail": "Removed from waitlist"}

# ── Notifications ────────────────────────────────────────
@app.get("/notifications")
def get_notifications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(20).all()
    return [{"id": n.id, "message": n.message, "read": n.read, "created_at": n.created_at} for n in notifs]

@app.put("/notifications/{notif_id}/read")
def mark_read(notif_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    n = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not n: raise HTTPException(status_code=404, detail="Not found")
    n.read = True; db.commit()
    return {"detail": "Marked as read"}

@app.put("/notifications/read-all")
def mark_all_read(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read == False
    ).update({"read": True}); db.commit()
    return {"detail": "All marked as read"}

# ── Analytics ────────────────────────────────────────────
@app.get("/analytics/summary")
def analytics_summary(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    rooms    = db.query(models.Room).all()
    students = db.query(models.Student).all()
    allocs   = db.query(models.Allocation).all()
    total_cap = sum(r.capacity for r in rooms)
    occ_rate  = round((len(allocs) / total_cap * 100), 1) if total_cap > 0 else 0
    type_breakdown = {}
    for r in rooms:
        type_breakdown[r.type] = type_breakdown.get(r.type, 0) + 1
    status_breakdown = {}
    for s in students:
        status_breakdown[s.status] = status_breakdown.get(s.status, 0) + 1
    year_breakdown = {}
    for s in students:
        if s.year:
            year_breakdown[s.year] = year_breakdown.get(s.year, 0) + 1
    available_rooms = sum(1 for r in rooms if len(r.allocations) < r.capacity)
    pending_requests = db.query(models.RoomRequest).filter(models.RoomRequest.status == "pending").count()
    return {
        "total_rooms": len(rooms), "total_students": len(students),
        "allocated": len(allocs), "pending": len([s for s in students if s.status == "pending"]),
        "waitlisted": len([s for s in students if s.status == "waitlisted"]),
        "available_rooms": available_rooms, "total_capacity": total_cap,
        "occupancy_rate": occ_rate, "pending_requests": pending_requests,
        "room_type_breakdown": [{"type": k, "count": v} for k, v in type_breakdown.items()],
        "status_breakdown": [{"status": k, "count": v} for k, v in status_breakdown.items()],
        "year_breakdown": [{"year": k, "count": v} for k, v in year_breakdown.items()],
    }

@app.get("/analytics/export/csv")
def export_csv(db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    students = db.query(models.Student).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID","Name","Roll No","Course","Year","Gender","Preference","Phone","Email","Status","Room Number","Room Type","Floor"])
    for s in students:
        room_num = s.allocation.room.number if s.allocation else ""
        room_type = s.allocation.room.type if s.allocation else ""
        room_floor = s.allocation.room.floor if s.allocation else ""
        writer.writerow([s.id, s.name, s.roll_no or "", s.course or "", s.year or "",
                         s.gender or "", s.preference or "", s.phone or "", s.email or "",
                         s.status, room_num, room_type, room_floor])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=roomsync_export.csv"})
