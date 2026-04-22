import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Get absolute path to .env in backend/ directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

# Debug Print (Safety first, only showing prefix and length)
if SUPABASE_SERVICE_ROLE_KEY:
    print(f"DEBUG: Key starts with {SUPABASE_SERVICE_ROLE_KEY[:10]}... (Length: {len(SUPABASE_SERVICE_ROLE_KEY)})")
    print(f"DEBUG: SUPABASE_URL: {SUPABASE_URL}")
else:
    print("DEBUG: SUPABASE_SERVICE_ROLE_KEY is MISSING!")

# Validation
if not SUPABASE_SERVICE_ROLE_KEY.startswith("ey"):
    print(f"ERROR: Invalid key format. Starts with: {SUPABASE_SERVICE_ROLE_KEY[:5]}")
    # Don't raise here yet, let create_client try so we see the SDK error

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("CRITICAL ERROR: Missing Supabase configuration in environment. API will fail.")
    # Set to placeholders to avoid immediate crash on create_client
    SUPABASE_URL = SUPABASE_URL or "https://placeholder.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY or "eyPlaceholder"

# Centralized client instance
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
