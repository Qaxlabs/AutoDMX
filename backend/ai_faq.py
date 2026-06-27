from typing import Optional, List
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

from backend.config import settings
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for FAQ
class FAQCreate(BaseModel):
    question: str
    answer: str

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None

class FAQ(BaseModel):
    id: str
    question: str
    answer: str

async def get_ai_response(user_message: str) -> Optional[str]:
    """
    Get AI-generated response using Groq API based on FAQs.

    Args:
        user_message (str): The user's message/question

    Returns:
        Optional[str]: AI-generated response or None if no relevant answer found
    """
    try:
        # Fetch all FAQs from Supabase (faqs table — question and answer columns)
        response = supabase.table("faqs").select("question, answer").execute()
        faqs = response.data

        # Build a system prompt
        faqs_text = ""
        for faq in faqs:
            faqs_text += f"\nQ: {faq['question']}\nA: {faq['answer']}"

        system_prompt = f"""You are a helpful Instagram DM assistant. Answer ONLY based on the following FAQs.
If the question is not covered, reply with exactly: UNKNOWN
FAQs:{faqs_text}
Be friendly, brief, and conversational. Max 2 sentences."""

        # Call groq chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message,
                }
            ],
            model="llama3-8b-8192",
            max_tokens=150
        )

        response_text = chat_completion.choices[0].message.content.strip()

        # If response is "UNKNOWN" or empty → return None
        if response_text == "UNKNOWN" or not response_text:
            return None

        # Else return the response text
        return response_text

    except Exception as e:
        logger.error(f"Error getting AI response: {str(e)}")
        return None

# CRUD API ROUTES for FAQs
@router.get("", response_model=List[FAQ])
async def list_faqs():
    """
    List all FAQs
    """
    try:
        response = supabase.table("faqs").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching FAQs")

@router.post("", response_model=FAQ)
async def create_faq(faq: FAQCreate):
    """
    Add new FAQ
    """
    try:
        response = supabase.table("faqs").insert(faq.dict()).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=500, detail="Failed to create FAQ")
    except Exception as e:
        logger.error(f"Error creating FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating FAQ")

@router.put("/{faq_id}", response_model=FAQ)
async def update_faq(faq_id: str, faq: FAQUpdate):
    """
    Update FAQ
    """
    try:
        response = supabase.table("faqs").update(faq.dict(exclude_unset=True)).eq("id", faq_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail="FAQ not found")
    except Exception as e:
        logger.error(f"Error updating FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating FAQ")

@router.delete("/{faq_id}")
async def delete_faq(faq_id: str):
    """
    Delete FAQ
    """
    try:
        response = supabase.table("faqs").delete().eq("id", faq_id).execute()
        if response.data:
            return {"message": "FAQ deleted successfully"}
        raise HTTPException(status_code=404, detail="FAQ not found")
    except Exception as e:
        logger.error(f"Error deleting FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting FAQ")

# Update the get_faq_response function to use the new get_ai_response function
async def get_faq_response(message_text: str) -> Optional[str]:
    """
    Get AI-generated FAQ response for a given message.

    Args:
        message_text (str): The user's message/question

    Returns:
        Optional[str]: AI-generated response or None if no relevant answer found
    """
    logger.info(f"AI FAQ check for message: {message_text}")
    return await get_ai_response(message_text)