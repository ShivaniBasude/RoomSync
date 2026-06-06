from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True, nullable=False)
    name           = Column(String, nullable=False)
    hashed_password= Column(String, nullable=False)
    role           = Column(String, default="student")  # "admin" or "student"
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    student        = relationship("Student", back_populates="user", uselist=False)
    notifications  = relationship("Notification", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"
    id          = Column(Integer, primary_key=True, index=True)
    number      = Column(String, nullable=False, unique=True)
    floor       = Column(String)
    type        = Column(String, default="Single")
    capacity    = Column(Integer, default=1)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    allocations = relationship("Allocation", back_populates="room")

class Student(Base):
    __tablename__ = "students"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    name        = Column(String, nullable=False)
    roll_no     = Column(String, unique=True, nullable=True)
    course      = Column(String, nullable=True)
    year        = Column(String, nullable=True)
    gender      = Column(String, nullable=True)
    preference  = Column(String, nullable=True)
    phone       = Column(String, nullable=True)
    email       = Column(String, nullable=True)
    status      = Column(String, default="pending")  # pending, allocated, waitlisted
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    user        = relationship("User", back_populates="student")
    allocation  = relationship("Allocation", back_populates="student", uselist=False)
    requests    = relationship("RoomRequest", back_populates="student")
    waitlist    = relationship("WaitlistEntry", back_populates="student", uselist=False)

class Allocation(Base):
    __tablename__ = "allocations"
    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("students.id"), nullable=False)
    room_id      = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    allocated_at = Column(DateTime(timezone=True), server_default=func.now())
    student      = relationship("Student", back_populates="allocation")
    room         = relationship("Room", back_populates="allocations")

class RoomRequest(Base):
    __tablename__ = "room_requests"
    id             = Column(Integer, primary_key=True, index=True)
    student_id     = Column(Integer, ForeignKey("students.id"), nullable=False)
    preferred_type = Column(String, nullable=True)
    preferred_floor= Column(String, nullable=True)
    notes          = Column(Text, nullable=True)
    status         = Column(String, default="pending")  # pending, approved, rejected
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    student        = relationship("Student", back_populates="requests")

class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    message    = Column(String, nullable=False)
    read       = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User", back_populates="notifications")

class WaitlistEntry(Base):
    __tablename__ = "waitlist"
    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    position   = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    student    = relationship("Student", back_populates="waitlist")
