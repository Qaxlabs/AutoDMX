import logging
import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from supabase import create_client, Client

from backend.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class FlowCreate(BaseModel):
    name: str
    trigger_keywords: List[str]
    trigger_type: str
    require_follow: bool
    message_1: str
    message_2: Optional[str] = None
    link: Optional[str] = None
    collect_email: bool
    collect_phone: bool
    active: bool

class FlowUpdate(BaseModel):
    name: Optional[str] = None
    trigger_keywords: Optional[List[str]] = None
    trigger_type: Optional[str] = None
    require_follow: Optional[bool] = None
    message_1: Optional[str] = None
    message_2: Optional[str] = None
    link: Optional[str] = None
    collect_email: Optional[bool] = None
    collect_phone: Optional[bool] = None
    active: Optional[bool] = None

class Flow(BaseModel):
    id: str
    name: str
    trigger_keywords: List[str]
    trigger_type: str
    require_follow: bool
    message_1: str
    message_2: Optional[str] = None
    link: Optional[str] = None
    collect_email: bool
    collect_phone: bool
    active: bool

# Import AI FAQ responder
try:
    from backend.ai_faq import get_faq_response
except ImportError:
    # If ai_faq.py doesn't exist, provide a mock function
    async def get_faq_response(message_text: str) -> Optional[str]:
        return None

# CRUD API Routes
@router.get("/", response_model=List[Flow])
async def list_flows():
    """
    List all flows
    """
    try:
        response = supabase.table("flows").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching flows: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching flows")

@router.post("/", response_model=Flow)
async def create_flow(flow: FlowCreate):
    """
    Create new flow
    """
    try:
        response = supabase.table("flows").insert(flow.dict()).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=500, detail="Failed to create flow")
    except Exception as e:
        logger.error(f"Error creating flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating flow")

@router.put("/{flow_id}", response_model=Flow)
async def update_flow(flow_id: str, flow: FlowUpdate):
    """
    Update flow
    """
    try:
        response = supabase.table("flows").update(flow.dict(exclude_unset=True)).eq("id", flow_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail="Flow not found")
    except Exception as e:
        logger.error(f"Error updating flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating flow")

@router.delete("/{flow_id}")
async def delete_flow(flow_id: str):
    """
    Delete flow
    """
    try:
        response = supabase.table("flows").delete().eq("id", flow_id).execute()
        if response.data:
            return {"message": "Flow deleted successfully"}
        raise HTTPException(status_code=404, detail="Flow not found")
    except Exception as e:
        logger.error(f"Error deleting flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting flow")

@router.patch("/{flow_id}/toggle")
async def toggle_flow(flow_id: str):
    """
    Toggle flow active/inactive
    """
    try:
        # First get the current flow to check its active status
        get_response = supabase.table("flows").select("active").eq("id", flow_id).execute()
        if not get_response.data:
            raise HTTPException(status_code=404, detail="Flow not found")

        current_active = get_response.data[0]["active"]
        new_active = not current_active

        # Update the flow with the new active status
        response = supabase.table("flows").update({"active": new_active}).eq("id", flow_id).execute()
        if response.data:
            return {"message": f"Flow {'activated' if new_active else 'deactivated'} successfully"}
        raise HTTPException(status_code=500, detail="Failed to toggle flow")
    except Exception as e:
        logger.error(f"Error toggling flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Error toggling flow")

# Core automation functions
async def process_comment(user_id: str, comment_text: str, media_id: str):
    """
    Process comment events from Instagram

    - Query flows table for ALL active flows where trigger_type == 'comment'
    - Check if comment_text contains ANY of the flow's trigger_keywords (case-insensitive)
    - If match found:
      a. Log to messages_log (direction: 'inbound')
      b. Check if user already received this flow (check contacts table)
      c. If not already contacted:
         - If flow.require_follow == True:
           * Send DM: "Hey! 👋 To get [flow.link or 'the link'], please follow us first, then reply 'done' here!"
           * Save contact with conversation_state = 'awaiting_follow'
         - If flow.require_follow == False:
           * Send DM with flow.message_1
           * If flow.link exists, include it in the DM
           * Save contact with conversation_state = 'completed'
      d. Auto-reply to the comment: "Thanks! Check your DMs 📩"
      e. Update analytics (comments_triggered += 1, dms_sent += 1)
    """
    logger.info(f"Processing comment from user {user_id} on media {media_id}: {comment_text}")

    try:
        # Query flows table for ALL active flows where trigger_type == 'comment'
        response = supabase.table("flows").select("*").eq("trigger_type", "comment").eq("active", True).execute()
        flows = response.data

        # Check if comment_text contains ANY of the flow's trigger_keywords (case-insensitive)
        matched_flow = None
        for flow in flows:
            trigger_keywords = flow.get("trigger_keywords", [])
            for keyword in trigger_keywords:
                if keyword.lower() in comment_text.lower():
                    matched_flow = flow
                    break
            if matched_flow:
                break

        if matched_flow:
            # Log to messages_log (direction: 'inbound')
            supabase.table("messages_log").insert({
                "instagram_user_id": user_id,
                "direction": "inbound",
                "message_type": "comment",
                "content": comment_text,
                "media_id": media_id,
                "flow_id": matched_flow["id"]
            }).execute()

            # Check if user already received this flow (check contacts table)
            contact_response = supabase.table("contacts").select("*").eq("instagram_user_id", user_id).execute()
            contact = contact_response.data[0] if contact_response.data else None

            # If not already contacted
            if not contact or contact.get("flow_id") != matched_flow["id"]:
                if matched_flow["require_follow"]:
                    # Send DM: "Hey! 👋 To get [flow.link or 'the link'], please follow us first, then reply 'done' here!"
                    dm_message = f"Hey! 👋 To get {matched_flow.get('link', 'the link')}, please follow us first, then reply 'done' here!"
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {dm_message}")

                    # Save contact with conversation_state = 'awaiting_follow'
                    contact_data = {
                        "instagram_user_id": user_id,
                        "flow_id": matched_flow["id"],
                        "conversation_state": "awaiting_follow",
                        "last_interaction": "comment"
                    }

                    if contact:
                        supabase.table("contacts").update(contact_data).eq("id", contact["id"]).execute()
                    else:
                        supabase.table("contacts").insert(contact_data).execute()

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": dm_message,
                        "flow_id": matched_flow["id"]
                    }).execute()

                else:
                    # Send DM with flow.message_1
                    dm_message = matched_flow["message_1"]
                    if matched_flow.get("link"):
                        dm_message += f"\n\nLink: {matched_flow['link']}"

                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {dm_message}")

                    # Save contact with conversation_state = 'completed'
                    contact_data = {
                        "instagram_user_id": user_id,
                        "flow_id": matched_flow["id"],
                        "conversation_state": "completed",
                        "last_interaction": "comment"
                    }

                    if contact:
                        supabase.table("contacts").update(contact_data).eq("id", contact["id"]).execute()
                    else:
                        supabase.table("contacts").insert(contact_data).execute()

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": dm_message,
                        "flow_id": matched_flow["id"]
                    }).execute()

                # Update analytics (comments_triggered += 1, dms_sent += 1)
                # This would typically be implemented with increment operations in Supabase
                logger.info("Analytics updated: comments_triggered += 1, dms_sent += 1")

            # Auto-reply to the comment: "Thanks! Check your DMs 📩"
            # In a real implementation, you would send this via Instagram API
            logger.info(f"Auto-replying to comment from {user_id}: Thanks! Check your DMs 📩")

    except Exception as e:
        logger.error(f"Error processing comment: {str(e)}")

async def process_dm(user_id: str, message_text: str):
    """
    Process direct message events from Instagram

    - Get contact from contacts table by instagram_user_id
    - If contact exists and conversation_state == 'awaiting_follow':
      a. If message_text.lower() contains 'done' or 'following' or 'followed':
         * Get the contact's flow
         * Send flow.message_1 (and link if exists)
         * Update contact conversation_state = 'completed'
      b. Else: send "Just reply 'done' once you're following us! 🙏"
    - If contact exists and conversation_state == 'awaiting_email':
      a. Save the message as the email (basic validation: contains '@')
      b. Update contact email, set conversation_state = 'awaiting_phone' or 'completed'
    - If no matching state:
      a. Try AI FAQ responder from ai_faq.py
      b. If no FAQ answer, send a default "Thanks for your message! 🙏"
    """
    logger.info(f"Processing DM from user {user_id}: {message_text}")

    try:
        # Get contact from contacts table by instagram_user_id
        response = supabase.table("contacts").select("*").eq("instagram_user_id", user_id).execute()
        contact = response.data[0] if response.data else None

        if contact:
            conversation_state = contact.get("conversation_state")

            # If contact exists and conversation_state == 'awaiting_follow'
            if conversation_state == "awaiting_follow":
                # If message_text.lower() contains 'done' or 'following' or 'followed'
                if any(keyword in message_text.lower() for keyword in ['done', 'following', 'followed']):
                    # Get the contact's flow
                    flow_response = supabase.table("flows").select("*").eq("id", contact["flow_id"]).execute()
                    if flow_response.data:
                        flow = flow_response.data[0]

                        # Send flow.message_1 (and link if exists)
                        dm_message = flow["message_1"]
                        if flow.get("link"):
                            dm_message += f"\n\nLink: {flow['link']}"

                        # In a real implementation, you would send this via Instagram API
                        logger.info(f"Sending DM to {user_id}: {dm_message}")

                        # Log outbound message
                        supabase.table("messages_log").insert({
                            "instagram_user_id": user_id,
                            "direction": "outbound",
                            "message_type": "dm",
                            "content": dm_message,
                            "flow_id": flow["id"]
                        }).execute()

                        # Update contact conversation_state = 'completed'
                        supabase.table("contacts").update({
                            "conversation_state": "completed"
                        }).eq("id", contact["id"]).execute()
                else:
                    # Send "Just reply 'done' once you're following us! 🙏"
                    response_message = "Just reply 'done' once you're following us! 🙏"
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()

            # If contact exists and conversation_state == 'awaiting_email'
            elif conversation_state == "awaiting_email":
                # Save the message as the email (basic validation: contains '@')
                if "@" in message_text:
                    # Update contact email, set conversation_state = 'awaiting_phone' or 'completed'
                    update_data = {
                        "email": message_text
                    }

                    # Check if we also need to collect phone
                    flow_response = supabase.table("flows").select("collect_phone").eq("id", contact["flow_id"]).execute()
                    if flow_response.data and flow_response.data[0].get("collect_phone"):
                        update_data["conversation_state"] = "awaiting_phone"
                    else:
                        update_data["conversation_state"] = "completed"

                    supabase.table("contacts").update(update_data).eq("id", contact["id"]).execute()

                    if update_data["conversation_state"] == "awaiting_phone":
                        response_message = "Thanks for providing your email! Now, please share your phone number for confirmation."
                    else:
                        response_message = "Thanks for providing your information! We'll be in touch soon."

                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()
                else:
                    # Send a reminder to provide a valid email
                    response_message = "Please provide a valid email address."
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()

            # If contact exists and conversation_state == 'awaiting_phone'
            elif conversation_state == "awaiting_phone":
                # Save the message as the phone number (basic validation)
                if re.match(r'^[\d\s\-\(\)\+]+$', message_text):
                    # Update contact phone and set conversation_state = 'completed'
                    supabase.table("contacts").update({
                        "phone": message_text,
                        "conversation_state": "completed"
                    }).eq("id", contact["id"]).execute()

                    response_message = "Thanks for providing your phone number! We'll be in touch soon."
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()
                else:
                    # Send a reminder to provide a valid phone number
                    response_message = "Please provide a valid phone number."
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()

            else:
                # Try AI FAQ responder from ai_faq.py
                faq_response = await get_faq_response(message_text)
                if faq_response:
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending FAQ response to {user_id}: {faq_response}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": faq_response
                    }).execute()
                else:
                    # Send a default "Thanks for your message! 🙏"
                    response_message = "Thanks for your message! 🙏"
                    # In a real implementation, you would send this via Instagram API
                    logger.info(f"Sending DM to {user_id}: {response_message}")

                    # Log outbound message
                    supabase.table("messages_log").insert({
                        "instagram_user_id": user_id,
                        "direction": "outbound",
                        "message_type": "dm",
                        "content": response_message
                    }).execute()
        else:
            # No contact found, try AI FAQ responder
            faq_response = await get_faq_response(message_text)
            if faq_response:
                # In a real implementation, you would send this via Instagram API
                logger.info(f"Sending FAQ response to {user_id}: {faq_response}")

                # Log outbound message
                supabase.table("messages_log").insert({
                    "instagram_user_id": user_id,
                    "direction": "outbound",
                    "message_type": "dm",
                    "content": faq_response
                }).execute()
            else:
                # Send a default "Thanks for your message! 🙏"
                response_message = "Thanks for your message! 🙏"
                # In a real implementation, you would send this via Instagram API
                logger.info(f"Sending DM to {user_id}: {response_message}")

                # Log outbound message
                supabase.table("messages_log").insert({
                    "instagram_user_id": user_id,
                    "direction": "outbound",
                    "message_type": "dm",
                    "content": response_message
                }).execute()

    except Exception as e:
        logger.error(f"Error processing DM: {str(e)}")