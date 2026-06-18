from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Annotated, Optional, List
import os
import shutil
import uuid
import json
import random
import httpx
import jwt as pyjwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

import cloudinary
import cloudinary.uploader

from face_pipeline import get_embeddings, get_single_embedding, average_embeddings
from faiss_index import (
    add_embeddings,
    search_embeddings,
    event_indexes,
    init_event,
    set_image_public,
    save_event,
    event_image_maps,
    load_event
)

load_dotenv()

app = FastAPI()

# =========================
# ☁️ CLOUDINARY CONFIG
# =========================
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dq58hwvm4"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# =========================
# 🔐 AUTH CONFIG
# =========================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET", "changeme_use_a_long_random_string")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 72

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
REDIRECT_URI = "http://localhost:8000/auth/google/callback"
FRONTEND_URL = "http://localhost:5173"

# =========================
# 🔑 JWT HELPERS
# =========================
def create_token(user: dict) -> str:
    payload = {
        "sub": user["google_id"],
        "name": user["name"],
        "email": user["email"],
        "picture": user.get("picture", ""),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")



def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    return decode_token(token)



# Optional — returns None if not logged in instead of raising
def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return get_current_user(request)
    except Exception:
        return None


# =========================
# 🔐 GOOGLE OAUTH ROUTES
# =========================
@app.get("/auth/google")
def google_login():
    params = (
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse(GOOGLE_AUTH_URL + params)



@app.get("/auth/google/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        # Exchange code for tokens
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        # Get user info
        userinfo_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        userinfo = userinfo_res.json()

    user = {
        "google_id": userinfo["sub"],
        "name": userinfo.get("name", ""),
        "email": userinfo.get("email", ""),
        "picture": userinfo.get("picture", ""),
    }

    jwt_token = create_token(user)

    # Redirect to frontend with token in query param
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={jwt_token}")



@app.get("/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return user


# =========================
# 🎉 EVENT ROUTES
# =========================
event_details = {}

@app.post("/create-event")
def create_event(data: dict, user: dict = Depends(get_current_user)):
    event_id = str(random.randint(100000, 999999))
    init_event(event_id)

    event_details[event_id] = {
        "name": data.get("name", "Untitled Event"),
        "location": data.get("location", ""),
        "created_by": user["name"],
        "created_by_email": user["email"],
    }

    event_path = os.path.join("faiss_data", event_id)
    os.makedirs(event_path, exist_ok=True)

    with open(os.path.join(event_path, "event.json"), "w") as f:
        json.dump(event_details[event_id], f)

    return {"event_id": event_id}



@app.get("/event-info/{event_id}")
def get_event_info(event_id: str, user: dict = Depends(get_current_user)):
    if event_id in event_details:
        return event_details[event_id]

    event_path = os.path.join("faiss_data", event_id)
    file_path = os.path.join(event_path, "event.json")

    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            event_details[event_id] = json.load(f)
        return event_details[event_id]

    return {}


@app.get("/contributors/{event_id}")
def get_contributors(event_id: str, user: dict = Depends(get_current_user)):
    load_event(event_id)

    if event_id not in event_image_maps:
        return {"contributors": []}

    contributors = {}
    for item in event_image_maps[event_id]:
        username = item.get("username", "Unknown")
        image_id = item.get("id")

        if username not in contributors:
            contributors[username] = set()
        contributors[username].add(image_id)

    return {
        "contributors": [
            {"name": name, "uploads": len(ids)}
            for name, ids in contributors.items()
        ]
    }


# =========================
# 📤 CLOUDINARY UPLOAD
# =========================
def upload_to_cloudinary(file, event_id):
    file.file.seek(0)
    public_id = f"events/{event_id}/{uuid.uuid4()}"
    result = cloudinary.uploader.upload(
        file.file,
        public_id=public_id,
        resource_type="image"
    )
    return {
        "image_url": result["secure_url"],
        "storage_path": result["public_id"]
    }


# =========================
# 📤 UPLOAD ALBUM
# =========================
@app.post("/upload-album/{event_id}")
async def upload_album(
    event_id: str,
    files: Annotated[list[UploadFile], File()],
    visibilities: str = Form(""),        # JSON array e.g. ["private","public","private"]
    user: dict = Depends(get_current_user),
):
    init_event(event_id)

    # Parse per-photo visibilities sent from frontend
    try:
        vis_list = json.loads(visibilities) if visibilities else []
    except Exception:
        vis_list = []

    username = user["name"]   # 🔒 always from JWT, not from form
    results = []

    for i, file in enumerate(files):
        visibility = vis_list[i] if i < len(vis_list) else "private"

        cloud_data = upload_to_cloudinary(file, event_id)

        temp_path = f"temp_{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as buffer:
            file.file.seek(0)
            shutil.copyfileobj(file.file, buffer)

        embeddings = get_embeddings(temp_path)
        os.remove(temp_path)

        if embeddings is None or len(embeddings) == 0:
            results.append({
                "file_url": cloud_data["image_url"],
                "status": "no face detected"
            })
            continue

        image_id = str(uuid.uuid4())

        add_embeddings(event_id, embeddings, {
            "id": image_id,
            "image_url": cloud_data["image_url"],
            "storage_path": cloud_data["storage_path"],
            "username": username,
            "visibility": visibility,
        })

        results.append({
            "id": image_id,
            "file_url": cloud_data["image_url"],
            "faces_detected": len(embeddings),
            "status": "success",
            "visibility": visibility,
        })

    return {"results": results}


# =========================
# 🔍 MATCH SELFIE (supports multiple selfies for averaging)
# =========================
@app.post("/match/{event_id}")
async def match_selfie(
    event_id: str,
    files: Annotated[list[UploadFile], File(...)],  # Changed to accept multiple files
    user: dict = Depends(get_current_user),
):
    load_event(event_id)

    if event_id not in event_indexes:
        return {"error": "No data for this event"}

    # Extract embeddings from all uploaded selfies
    all_embeddings = []
    selfie_count = 0

    for file in files:
        temp_path = f"selfie_{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        embedding = get_single_embedding(temp_path)
        os.remove(temp_path)


        if embedding is not None:
            all_embeddings.append(embedding)
            selfie_count += 1

    if selfie_count == 0:
        return {"error": "No face detected in any selfie"}

    # Average all embeddings for more robust matching
    query_embedding = average_embeddings(all_embeddings)

    sims, inds = search_embeddings(event_id, query_embedding, k=10)  # Increased k for better recall

    threshold = float(os.getenv("MATCH_THRESH", "0.5"))  # Lowered default threshold for IP (cosine)
    matches = []
    seen_images = set()

    def extract(entry):
        if not isinstance(entry, dict):
            return None, None, "private", None
        username = entry.get("username")
        if "image_url" in entry:
            return entry.get("id"), entry["image_url"], entry.get("visibility", "private"), username
        if "image" in entry:
            image_field = entry["image"]
            if isinstance(image_field, dict):
                return image_field.get("id"), image_field.get("image_url"), image_field.get("visibility", "private"), username
            return None, image_field, entry.get("visibility", "private"), username
        return None, None, "private", username

    for sim, idx in zip(sims, inds):
        if idx < 0 or idx >= len(event_image_maps[event_id]):
            continue
        entry = event_image_maps[event_id][idx]
        image_id, image_url, visibility, username = extract(entry)
        if not image_url:
            continue
        # Only add photo if similarity exceeds threshold
        if sim >= threshold:
            if image_url not in seen_images:
                matches.append({
                    "id": image_id,
                    "image_url": image_url,
                    "score": float(sim),
                    "visibility": visibility,
                    "username": username,
                })
                seen_images.add(image_url)
        # For public photos without match, don't add to "Your Photos" - they'll appear in Public Gallery instead

    return {
        "matches": matches,
        "metadata": {
            "selfies_processed": selfie_count,
            "averaged": True
        }
    }


# =========================
# 👤 GET MY UPLOADED PHOTOS
# =========================
@app.get("/my-photos/{event_id}")
def get_my_photos(event_id: str, user: dict = Depends(get_current_user)):
    load_event(event_id)

    if event_id not in event_image_maps:
        return {"photos": []}


    # Deduplicate by image_url - one entry per photo
    seen_urls = set()
    photos = []
    username = user["name"]

    for entry in event_image_maps[event_id]:
        if entry.get("username") == username:
            image_url = entry.get("image_url")
            if image_url and image_url not in seen_urls:
                seen_urls.add(image_url)
                photos.append({
                    "id": entry.get("id"),
                    "image_url": image_url,
                    "visibility": entry.get("visibility", "private"),
                    "username": username,
                })

    return {"photos": photos}


# =========================
# 📷 GET ALL PUBLIC PHOTOS
# =========================
@app.get("/public-photos/{event_id}")
def get_public_photos(event_id: str, user: dict = Depends(get_current_user)):
    load_event(event_id)

    if event_id not in event_image_maps:
        return {"photos": []}

    # Deduplicate by image_url - one entry per photo (not per face)
    seen_urls = set()
    photos = []
    for entry in event_image_maps[event_id]:
        if entry.get("visibility") == "public":
            image_url = entry.get("image_url")
            if image_url and image_url not in seen_urls:
                seen_urls.add(image_url)
                photos.append({
                    "id": entry.get("id"),
                    "image_url": image_url,
                    "username": entry.get("username"),
                    "visibility": "public",
                })

    return {"photos": photos}



# =========================
# 🌍 MAKE IMAGE PUBLIC
# =========================
@app.post("/make-public/{event_id}")
def make_public(
    event_id: str,
    image_id: str = Form(...),
    user: dict = Depends(get_current_user),
):
    init_event(event_id)
    success = set_image_public(event_id, image_id)
    if not success:
        return {"error": "Image or event not found"}
    save_event(event_id)
    return {"message": "Image is now public"}



# =========================
# 🔒 MAKE IMAGE PRIVATE
# =========================
@app.post("/make-private/{event_id}")
def make_private(
    event_id: str,
    image_id: str = Form(...),
    user: dict = Depends(get_current_user),
):
    init_event(event_id)
    if event_id not in event_image_maps:
        return {"error": "Event not found"}
    for entry in event_image_maps[event_id]:
        if entry.get("id") == image_id:
            entry["visibility"] = "private"
            save_event(event_id)
            return {"message": "Image is now private"}
    return {"error": "Image not found"}



# =========================
# 🌐 CORS
# =========================
from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
