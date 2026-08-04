import os
import environ
from pathlib import Path
import cloudinary
import cloudinary.api

BASE_DIR = Path(__file__).resolve().parent
env = environ.Env()
env_file = BASE_DIR / ".env"
print(f"Reading env from: {env_file}")
environ.Env.read_env(env_file)

cloud_name = env('CLOUDINARY_CLOUD_NAME', default='NOT_FOUND')
api_key = env('CLOUDINARY_API_KEY', default='NOT_FOUND')
api_secret = env('CLOUDINARY_API_SECRET', default='NOT_FOUND')

print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {api_secret[:4]}...{api_secret[-4:]}")

cloudinary.config(
  cloud_name = cloud_name,
  api_key = api_key,
  api_secret = api_secret,
  secure = True
)

try:
    res = cloudinary.api.ping()
    print("Cloudinary Ping successful:", res)
except Exception as e:
    print("Cloudinary error:", e)
