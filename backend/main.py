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
        new_post_data = post.dict()
        if 'id' in new_post_data: del new_post_data['id']
        
        print(f"DEBUG: Attempting to insert post for user {new_post_data.get('author_id')}")
        
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
