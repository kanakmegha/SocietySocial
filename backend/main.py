from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect, Depends, HTTPException, Security, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db, engine, Base
from app.models import DBPost, Post, Profile, DBProfile, RatingRequest, Group
from app.auth import get_current_user
from app.supabase_client import supabase_admin
from uuid import UUID
import asyncio
import json
import os
from datetime import datetime
from typing import List, Optional
# Initialize FastAPI
app = FastAPI(title="Society Social Hub API")

# Admin client is now imported from app.supabase_client

# Initialize DB (in production use migrations)
@app.on_event("startup")
async def startup():
    # Validate JWT Secret
    jwt_secret = os.getenv('SUPABASE_JWT_SECRET', '')
    if not jwt_secret or len(jwt_secret) < 32:
        print('WARNING: JWT Secret looks too short or is missing')
        print(f'DEBUG: Length is {len(jwt_secret)}')
    else:
        print(f'Secret Loaded: {len(jwt_secret)} chars')

    async with engine.begin() as conn:
        # We assume tables exist in Supabase
        pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/alerts")
async def get_alerts():
    print('Alerts endpoint hit!')
    return [
        {
            "id": 1,
            "type": "Critical",
            "title": "Water Leak Detected",
            "content": "A potential leak has been detected in Block B, Floor 4. Tech team is en route.",
            "timestamp": datetime.now().strftime("%H:%M")
        }
    ]

@app.get("/")
async def root():
    return {"message": "Society Social Hub API is running with Supabase"}

@app.get("/feed", response_model=List[Post])
async def get_feed(
    page: int = Query(1, ge=1), 
    page_size: int = Query(10, ge=1),
    db: AsyncSession = Depends(get_db)
):
    try:
        offset = (page - 1) * page_size
        query = select(DBPost).order_by(desc(DBPost.created_at)).offset(offset).limit(page_size)
        result = await db.execute(query)
        posts = result.scalars().all()
        
        # Map to pydantic models
        return [Post.from_orm(p) for p in posts]
    except Exception as e:
        print(f"FEED_FETCH_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feed", response_model=Post)
async def create_post(
    request: Request,
    post: Post,
    user: Profile = Depends(get_current_user)
):
    print(f"DEBUG_HEADERS: {dict(request.headers)}")
    try:
        # Use Supabase Admin client to bypass RLS
        # Convert the Pydantic model directly to JSON-primitive dict to safely serialize UUIDs
        new_post_data = json.loads(post.json(exclude_unset=True))
        if 'id' in new_post_data: del new_post_data['id']
        if 'created_at' in new_post_data and new_post_data['created_at'] is None:
            del new_post_data['created_at']
        
        print(f"DEBUG: Attempting to insert post for user {new_post_data.get('author_id')}")
        author_id_str = new_post_data.get('author_id')
        
        # 1. Foreign Key Safety Check - Ensure profile exists
        profile_res = supabase_admin.table("profiles").select("id").eq("id", author_id_str).execute()
        
        if not profile_res.data:
            print(f"DEBUG: Profile not found for {author_id_str}. Auto-creating default profile.")
            supabase_admin.table("profiles").insert({
                "id": author_id_str,
                "full_name": "New Resident",
                "role": "resident",
                "karma_points": 0
            }).execute()
        
        # 2. Insert the post
        res = supabase_admin.table("posts").insert(new_post_data).execute()
        
        if hasattr(res, 'error') and res.error:
            print(f"SUPABASE_ERROR: {res.error}")
            raise HTTPException(status_code=500, detail=str(res.error))
            
        return Post.from_orm(res.data[0])
    except Exception as e:
        print(f"CRITICAL_SUBMISSION_ERROR: {str(e)}")
        # If the error is 'Invalid API key', it's coming from the Supabase SDK
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile", response_model=Profile)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    query = select(DBProfile).where(DBProfile.id == UUID(user.id))
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile.from_orm(profile)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/contacts")
async def get_contacts():
    return [
        {"role": "Security Gate", "number": "+1 (555) 019-8273"},
        {"role": "Estate Manager", "number": "+1 (555) 012-4829"},
        {"role": "Plumber (On Call)", "number": "+1 (555) 098-1122"}
    ]

@app.get("/notices")
async def get_notices():
    return [
        {"date": "OCT 12", "title": "Elevator Maintenance", "content": "The main lobby elevator will be out of service from 2 AM to 5 AM for routine maintenance."},
        {"date": "OCT 10", "title": "Pool Cleansing", "content": "Weekly deep cleaning of the community pool has been completed."}
    ]
