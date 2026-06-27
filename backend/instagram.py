import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
import httpx

from backend.config import settings

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MOCK_MEDIA = [
    {
        "id": "mock_post_1",
        "caption": "Boost your Instagram reach with AutoDMX! Automate DMs easily.",
        "media_type": "IMAGE",
        "thumbnail_url": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
        "media_url": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
        "timestamp": "2026-06-25T12:00:00+0000",
        "permalink": "https://instagram.com"
    },
    {
        "id": "mock_post_2",
        "caption": "Check out this new reel showing how AutoDMX works in 30 seconds.",
        "media_type": "VIDEO",
        "thumbnail_url": "https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=400&q=80",
        "media_url": "https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=400&q=80",
        "timestamp": "2026-06-26T14:30:00+0000",
        "permalink": "https://instagram.com"
    },
    {
        "id": "mock_post_3",
        "caption": "Carousel post with tips to build your Instagram funnel. Swipe left!",
        "media_type": "CAROUSEL_ALBUM",
        "thumbnail_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80",
        "media_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80",
        "timestamp": "2026-06-27T09:15:00+0000",
        "permalink": "https://instagram.com"
    }
]

@router.get("/media")
async def list_media():
    """
    Fetch user's recent posts and reels from Meta Graph API.
    If Meta API credentials are not set or the request fails,
    returns mock data as a graceful fallback.
    """
    account_id = settings.INSTAGRAM_ACCOUNT_ID
    access_token = settings.META_ACCESS_TOKEN

    if not account_id or not access_token:
        logger.warning("Meta API credentials (INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN) are missing. Returning mock data.")
        return {"media": MOCK_MEDIA}

    url = f"https://graph.facebook.com/v19.0/{account_id}/media"
    params = {
        "fields": "id,caption,media_type,thumbnail_url,media_url,timestamp,permalink",
        "access_token": access_token
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code != 200:
                logger.error(f"Meta Graph API error (HTTP {response.status_code}): {response.text}")
                # Fallback to mock data on error so development doesn't block
                return {"media": MOCK_MEDIA}

            data = response.json()
            media_list = data.get("data", [])
            
            # Post-process list to ensure all items have a thumbnail_url
            for item in media_list:
                if not item.get("thumbnail_url"):
                    item["thumbnail_url"] = item.get("media_url")
            
            return {"media": media_list}

    except Exception as e:
        logger.error(f"Failed to fetch media from Meta Graph API: {str(e)}")
        return {"media": MOCK_MEDIA}
