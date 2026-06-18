# Candid Backend

## Environment Variables

Create a `.env` file with the following:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_secure_random_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Requirements

```
fastapi
uvicorn
python-dotenv
cloudinary
faiss-cpu
facenet-pytorch
pillow
numpy
httpx
pyjwt
python-multipart
```

## Run

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
