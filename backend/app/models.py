from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, Boolean, ARRAY
from app.database import Base

# SQLAlchemy Models
class DBProfile(Base):
    __tablename__ = "profiles"
    id: Mapped[UUID] = mapped_column(primary_key=True)
    full_name: Mapped[Optional[str]] = mapped_column(String)
    flat_no: Mapped[Optional[str]] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="resident")
    karma_points: Mapped[int] = mapped_column(Integer, default=0)

class DBPost(Base):
    __tablename__ = "posts"
    id: Mapped[UUID] = mapped_column(primary_key=True, server_default="gen_random_uuid()")
    author_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id"))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

# Pydantic Schemas
class Post(BaseModel):
    id: Optional[UUID] = None
    author_id: UUID
    content: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Profile(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    role: str
    karma_points: int = 0

    class Config:
        from_attributes = True

class Group(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

class RatingRequest(BaseModel):
    staff_id: UUID
    rating: int
    comment: Optional[str] = None
