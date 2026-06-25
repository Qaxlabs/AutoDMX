import logging
from datetime import date, datetime, timezone

from fastapi import APIRouter, HTTPException
from supabase import create_client, Client

from backend.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Field name validation — only allow known analytics fields to be incremented.
ALLOWED_ANALYTICS_FIELDS = {
    "dms_sent",
    "comments_triggered",
    "follows_requested",
}


def _today_iso() -> str:
    """Return today's date as an ISO-formatted string (YYYY-MM-DD)."""
    return date.today().isoformat()


async def update_analytics(field: str, increment: int = 1):
    """
    Upsert an analytics row for today and increment the given field.

    Uses a Supabase RPC if available, otherwise falls back to a read-modify-write
    upsert. This is safe under light concurrency but a true atomic increment
    would require a Postgres function — that's the recommended upgrade path
    if the project sees high write volume.
    """
    if field not in ALLOWED_ANALYTICS_FIELDS:
        raise ValueError(
            f"Invalid analytics field '{field}'. "
            f"Allowed: {sorted(ALLOWED_ANALYTICS_FIELDS)}"
        )

    today = _today_iso()

    try:
        # Try an atomic RPC first if it exists in the database.
        try:
            supabase.rpc(
                "increment_analytics",
                {"p_date": today, "p_field": field, "p_increment": increment},
            ).execute()
            return
        except Exception:
            # RPC not defined — fall through to the read-modify-write path.
            pass

        # Read existing row for today (if any)
        existing = (
            supabase
            .table("analytics")
            .select("*")
            .eq("date", today)
            .execute()
        )

        if existing.data:
            row = existing.data[0]
            new_value = (row.get(field) or 0) + increment
            update_data = {
                "dms_sent": row.get("dms_sent", 0),
                "comments_triggered": row.get("comments_triggered", 0),
                "follows_requested": row.get("follows_requested", 0),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            update_data[field] = new_value
            supabase.table("analytics").update(update_data).eq("date", today).execute()
        else:
            insert_data = {
                "date": today,
                "dms_sent": 0,
                "comments_triggered": 0,
                "follows_requested": 0,
            }
            insert_data[field] = increment
            supabase.table("analytics").insert(insert_data).execute()

    except Exception as e:
        logger.error(f"Error updating analytics field '{field}': {str(e)}")
        raise


@router.get("/summary")
async def analytics_summary():
    """
    Return a high-level analytics summary:

      {
        "total_dms_sent":            sum of dms_sent from analytics table,
        "total_leads":               count of contacts table rows,
        "total_comments_triggered":  sum of comments_triggered,
        "total_follows_requested":   sum of follows_requested,
        "today":                     today's analytics row,
        "last_7_days":               last 7 analytics rows ordered by date desc
      }
    """
    try:
        # All analytics rows for the last-7-days window
        last_7 = (
            supabase
            .table("analytics")
            .select("*")
            .order("date", desc=True)
            .limit(7)
            .execute()
        ).data or []

        # Totals across the entire analytics table
        all_analytics = (
            supabase
            .table("analytics")
            .select("dms_sent,comments_triggered,follows_requested")
            .execute()
        ).data or []

        total_dms_sent = sum((row.get("dms_sent") or 0) for row in all_analytics)
        total_comments_triggered = sum(
            (row.get("comments_triggered") or 0) for row in all_analytics
        )
        total_follows_requested = sum(
            (row.get("follows_requested") or 0) for row in all_analytics
        )

        # Total lead count
        contacts_resp = (
            supabase
            .table("contacts")
            .select("id", count="exact")
            .execute()
        )
        total_leads = contacts_resp.count or 0

        # Today's row (or null if no row yet)
        today_str = _today_iso()
        today_row = next(
            (row for row in last_7 if row.get("date") == today_str),
            None,
        )

        return {
            "total_dms_sent": total_dms_sent,
            "total_leads": total_leads,
            "total_comments_triggered": total_comments_triggered,
            "total_follows_requested": total_follows_requested,
            "today": today_row,
            "last_7_days": last_7,
        }
    except Exception as e:
        logger.error(f"Error fetching analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching analytics summary")
