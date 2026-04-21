import jwt
import base64
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.supabase_client import SUPABASE_JWT_SECRET, SUPABASE_URL
from jwt import PyJWKClient
from pydantic import BaseModel
from uuid import UUID

security = HTTPBearer()

class AuthUser(BaseModel):
    id: UUID

async def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    token = auth.credentials

    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    # Decode token header safely to see algorithm and kid
    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get('alg', '')
    except Exception as header_err:
        raise HTTPException(status_code=401, detail=f"Invalid token format: {str(header_err)}")

    try:
        # If token is asymmetric (ES256 or RS256), fetch Supabase public key via JWKS
        if alg in ['ES256', 'RS256']:
            if not SUPABASE_URL:
                raise HTTPException(status_code=500, detail="SUPABASE_URL is not configured for JWKS")
            
            jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated"
            )
        else:
            # Fallback to HS256 symmetric secret for older projects
            if not SUPABASE_JWT_SECRET:
                raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET missing for HS256")
                
            try:
                secret_bytes = base64.b64decode(SUPABASE_JWT_SECRET)
            except Exception:
                secret_bytes = SUPABASE_JWT_SECRET.encode("utf-8")

            payload = jwt.decode(
                token,
                secret_bytes,
                algorithms=["HS256"],
                audience="authenticated"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing subject claim")

        return AuthUser(id=UUID(user_id))

    except NotImplementedError as e:
        raise HTTPException(status_code=500, detail="Server missing 'cryptography' package required for ES256/RS256 tokens. Run: pip install cryptography")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.PyJWKClientError as e:
         raise HTTPException(status_code=401, detail=f"Failed to fetch public key from Supabase JWKS: {str(e)}")
    except jwt.InvalidAlgorithmError as e:
        raise HTTPException(status_code=401, detail=f"Algorithm mismatch: {str(e)}. Token Header: {unverified_header}")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"UNEXPECTED_AUTH_ERROR: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
