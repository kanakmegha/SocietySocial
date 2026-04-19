import jwt
import base64
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.supabase_client import SUPABASE_JWT_SECRET
from pydantic import BaseModel
from uuid import UUID

security = HTTPBearer()

class AuthUser(BaseModel):
    id: UUID

async def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    token = auth.credentials

    # Ensure secret is present
    if not SUPABASE_JWT_SECRET:
        print("CRITICAL: SUPABASE_JWT_SECRET is not configured!")
        raise HTTPException(status_code=500, detail="Server auth configuration missing")

    # Supabase JWT Secret is base64-encoded — decode to raw bytes for PyJWT HS256
    try:
        secret_bytes = base64.b64decode(SUPABASE_JWT_SECRET)
    except Exception:
        secret_bytes = SUPABASE_JWT_SECRET.encode("utf-8")

    # Decode token header first to see what algorithm is being used
    try:
        unverified_header = jwt.get_unverified_header(token)
        print(f"DEBUG_TOKEN_HEADER: {unverified_header}")
    except Exception as header_err:
        print(f"DEBUG_HEADER_DECODE_FAILED: {header_err}")

    try:
        payload = jwt.decode(
            token,
            secret_bytes,
            algorithms=["HS256", "RS256"],  # Covers both legacy and new Supabase projects
            audience="authenticated"
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing subject claim")

        return AuthUser(id=UUID(user_id))

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidAlgorithmError as e:
        print(f"ALGORITHM_MISMATCH: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Algorithm mismatch: {str(e)}")
    except jwt.InvalidTokenError as e:
        print(f"SYMMETRIC_AUTH_FAILED: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"UNEXPECTED_AUTH_ERROR: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
