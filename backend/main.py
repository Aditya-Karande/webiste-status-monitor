from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import requests
import time
from datetime import datetime, timezone
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["website_monitor"]
collection = db["checks"]

class URLRequest(BaseModel):
    url: str

@app.get("/")
def root():
    return {"message": "Website Monitor API is running"}

@app.post("/check")
def check_url(body: URLRequest):
    url = body.url

    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return {"error": "Invalid URL"}

    start = time.time()
    try:
        resp = requests.get(url, timeout=10, allow_redirects=True,
                            headers={"User-Agent": "WebMonitor/1.0"})
        response_time = round((time.time() - start) * 1000, 2)
        is_healthy = 200 <= resp.status_code < 400

        result = {
            "url": url,
            "status": "healthy" if is_healthy else "unhealthy",
            "status_code": resp.status_code,
            "response_time_ms": response_time,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except requests.exceptions.Timeout:
        result = {
            "url": url,
            "status": "timeout",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        result = {
            "url": url,
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    collection.insert_one({**result})
    return result

@app.get("/history")
def get_history(limit: int = 20):
    docs = list(collection.find({}, {"_id": 0})
                           .sort("timestamp", -1)
                           .limit(limit))
    return docs