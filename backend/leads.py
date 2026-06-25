import csv
import io
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from supabase import create_client, Client

from backend.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.get("")
@router.get("/")
async def list_leads():
    """
    List all contacts (leads) with their flow names.

    Joins the contacts table with the flows table on flow_id to include
    the flow name for each contact.
    """
    try:
        # Fetch contacts with their flow name via a foreign-key select
        response = (
            supabase
            .table("contacts")
            .select("*, flows(name)")
            .execute()
        )
        contacts = response.data or []

        # Flatten the joined flow name onto each contact for convenience
        leads = []
        for contact in contacts:
            flow_data = contact.pop("flows", None) or {}
            contact["flow_name"] = flow_data.get("name")
            leads.append(contact)

        return {"leads": leads}
    except Exception as e:
        logger.error(f"Error fetching leads: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching leads")


@router.get("/export")
async def export_leads():
    """
    Export all contacts as a CSV file using a StreamingResponse.
    """
    try:
        response = (
            supabase
            .table("contacts")
            .select("*, flows(name)")
            .execute()
        )
        contacts = response.data or []

        # Define the CSV columns. Newest columns appear at the end as needed.
        fieldnames = [
            "id",
            "instagram_user_id",
            "username",
            "flow_id",
            "flow_name",
            "email",
            "phone",
            "conversation_state",
            "last_interaction",
            "created_at",
            "updated_at",
        ]

        def generate_csv():
            buffer = io.StringIO()
            writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

            for contact in contacts:
                flow_data = contact.pop("flows", None) or {}
                contact["flow_name"] = flow_data.get("name")
                writer.writerow(contact)
                yield buffer.getvalue()
                buffer.seek(0)
                buffer.truncate(0)

        return StreamingResponse(
            generate_csv(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads.csv"},
        )
    except Exception as e:
        logger.error(f"Error exporting leads: {str(e)}")
        raise HTTPException(status_code=500, detail="Error exporting leads")


@router.delete("/{contact_id}")
async def delete_lead(contact_id: str):
    """
    Delete a single contact by id.
    """
    try:
        response = (
            supabase
            .table("contacts")
            .delete()
            .eq("id", contact_id)
            .execute()
        )
        if response.data:
            return {"message": "Lead deleted successfully", "id": contact_id}
        raise HTTPException(status_code=404, detail="Lead not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lead {contact_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting lead")
