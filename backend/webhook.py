import json
import logging
from fastapi import APIRouter, Request, Response, BackgroundTasks
from backend.config import settings
from backend.flows import process_comment, process_dm

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    Verify webhook subscription with Meta

    Requirements:
    - Receives hub.mode, hub.verify_token, hub.challenge as query params
    - If hub.mode == "subscribe" AND hub.verify_token matches WEBHOOK_VERIFY_TOKEN from config
    - Return hub.challenge as plain text (integer)
    - Else return 403
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == settings.WEBHOOK_VERIFY_TOKEN:
            return Response(content=challenge, media_type="text/plain")

    return Response(content="Verification failed", status_code=403)

@router.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle incoming webhook events from Instagram

    Requirements:
    - Always return 200 immediately (Meta requires fast response)
    - Parse the JSON body
    - Handle TWO event types:
      TYPE A - Comment event (entry[].changes[] where field == "comments")
      TYPE B - Direct Message event (entry[].changes[] where field == "messages")
    - Log all incoming webhook payloads to console for debugging
    """
    # Parse the JSON body
    body = await request.json()

    # Log all incoming webhook payloads to console for debugging
    logger.info(f"Webhook received: {json.dumps(body, indent=2)}")

    # Always return 200 immediately (Meta requires fast response)
    response = Response(content="EVENT_RECEIVED", media_type="text/plain", status_code=200)

    # Process events in the background using FastAPI BackgroundTasks
    background_tasks.add_task(process_events, body)

    return response

async def process_events(body: dict):
    """
    Process events in the background
    """
    try:
        # Check if this is a valid webhook payload
        if "entry" not in body:
            logger.warning("Invalid webhook payload: no 'entry' field")
            return

        # Process each entry
        for entry in body["entry"]:
            if "changes" not in entry:
                continue

            # Process each change in the entry
            for change in entry["changes"]:
                field = change.get("field")

                # TYPE A - Comment event
                if field == "comments":
                    await process_comment_event(change)

                # TYPE B - Direct Message event
                elif field == "messages":
                    await process_message_event(change)

    except Exception as e:
        logger.error(f"Error processing webhook events: {str(e)}")

async def process_comment_event(change: dict):
    """
    Process comment events

    Extract: commenter's instagram_user_id, comment text, media_id
    Call process_comment(user_id, comment_text, media_id) from flows.py
    """
    try:
        # Extract commenter's instagram_user_id, comment text, media_id
        value = change.get("value", {})
        media_id = value.get("media_id")

        # Extract commenter info if available
        commenter_id = None
        comment_text = None

        # Check if this is from the comments data structure
        if "comment_id" in value:
            comment_text = value.get("text", "")

            # Try to get commenter ID from different possible locations
            if "from" in value:
                commenter_id = value["from"].get("id")
            elif "user_id" in value:
                commenter_id = value["user_id"]

        # Log the extracted information
        logger.info(f"Comment event - Media: {media_id}, User: {commenter_id}, Text: {comment_text}")

        # Call process_comment if we have the required information
        if commenter_id and comment_text and media_id:
            await process_comment(commenter_id, comment_text, media_id)
        else:
            logger.warning(f"Incomplete comment data: user_id={commenter_id}, text={comment_text}, media_id={media_id}")

    except Exception as e:
        logger.error(f"Error processing comment event: {str(e)}")

async def process_message_event(change: dict):
    """
    Process direct message events

    Extract: sender's instagram_user_id, message text
    Call process_dm(user_id, message_text) from flows.py
    """
    try:
        # Extract sender's instagram_user_id, message text
        value = change.get("value", {})

        # Extract message info
        sender_id = None
        message_text = None

        # Check if this is from the messages data structure
        if "message" in value:
            message = value["message"]
            message_text = message.get("text", "")

            # Try to get sender ID from different possible locations
            if "from" in message:
                sender_id = message["from"].get("id")
            elif "sender_id" in value:
                sender_id = value["sender_id"]
            elif "user_id" in value:
                sender_id = value["user_id"]

        # Log the extracted information
        logger.info(f"Message event - Sender: {sender_id}, Text: {message_text}")

        # Call process_dm if we have the required information
        if sender_id and message_text:
            await process_dm(sender_id, message_text)
        else:
            logger.warning(f"Incomplete message data: sender_id={sender_id}, text={message_text}")

    except Exception as e:
        logger.error(f"Error processing message event: {str(e)}")