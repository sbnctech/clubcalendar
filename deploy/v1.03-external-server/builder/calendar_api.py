#!/usr/bin/env python3
"""
ClubCalendar API Server v1.03
Standalone FastAPI server for calendar data

Reads from shared SQLite database (wa.db) synced from Wild Apricot.
Separate from chatbot - just shares the database.

Run with: uvicorn calendar_api:app --host 0.0.0.0 --port 8001
"""

import sqlite3
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ============================================================================
# CONFIGURATION
# ============================================================================

# Database path - shared with chatbot sync
import os
DB_PATH = Path(os.environ.get("CLUBCAL_DB_PATH", "./wa.db"))

# CORS - allow WA pages to call this API
ALLOWED_ORIGINS = [
    "https://sbnewcomers.org",
    "https://www.sbnewcomers.org",
    "http://localhost:*",  # For local testing
]

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clubcalendar")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ClubCalendar API",
    description="Calendar data API for SBNC widget",
    version="1.03"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ============================================================================
# DATABASE
# ============================================================================

def get_db_connection() -> sqlite3.Connection:
    """Get database connection."""
    if not DB_PATH.exists():
        raise HTTPException(status_code=503, detail="Database not available")
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================================
# PUBLIC EVENTS ENDPOINT
# ============================================================================

@app.get("/api/calendar/events")
def get_public_events() -> Dict[str, Any]:
    """
    Return public events only.

    PII Protection - EXCLUDES:
    - Location (venue details)
    - Registration counts
    - Organizer contact info
    """
    logger.info("Fetching public events")
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Check for AccessLevel column
        cur.execute("PRAGMA table_info(events)")
        columns = {row[1] for row in cur.fetchall()}
        has_access_level = 'AccessLevel' in columns

        where_clause = "WHERE date(StartDate) >= date('now')"
        if has_access_level:
            where_clause += " AND AccessLevel = 'Public'"

        sql = f"""
        SELECT
            Id, Name, StartDate, EndDate,
            CASE WHEN length(Details) > 200
                 THEN substr(Details, 1, 200) || '...'
                 ELSE Details END as BriefDescription,
            Tags
        FROM events
        {where_clause}
        ORDER BY StartDate ASC
        LIMIT 200
        """

        cur.execute(sql)
        events = [dict(row) for row in cur.fetchall()]

        # Double-check no PII leaked
        for event in events:
            event.pop('Location', None)
            event.pop('ConfirmedRegistrationsCount', None)
            event.pop('RegistrationsLimit', None)

        return {
            "events": events,
            "count": len(events),
            "audience": "public",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    finally:
        conn.close()


# ============================================================================
# MEMBER EVENTS ENDPOINT
# ============================================================================

@app.get("/api/calendar/events/member")
def get_member_events() -> Dict[str, Any]:
    """
    Return all events with full details for members.

    Includes location, availability, registration info.
    """
    logger.info("Fetching member events")
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        sql = """
        SELECT
            Id, Name, StartDate, EndDate, Location, Details, Tags,
            RegistrationEnabled, RegistrationsLimit, ConfirmedRegistrationsCount,
            RegistrationUrl,
            CASE WHEN RegistrationsLimit > 0
                      AND ConfirmedRegistrationsCount >= RegistrationsLimit
                 THEN 1 ELSE 0 END as IsFull,
            CASE WHEN RegistrationsLimit > 0
                 THEN RegistrationsLimit - ConfirmedRegistrationsCount
                 ELSE NULL END as SpotsAvailable
        FROM events
        WHERE date(StartDate) >= date('now', '-7 days')
        ORDER BY StartDate ASC
        LIMIT 500
        """

        cur.execute(sql)
        events = [dict(row) for row in cur.fetchall()]

        return {
            "events": events,
            "count": len(events),
            "audience": "member",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ============================================================================
# EVENT DETAIL ENDPOINT
# ============================================================================

@app.get("/api/calendar/event/{event_id}")
def get_event_detail(
    event_id: int,
    audience: str = Query("public", pattern="^(public|member)$")
) -> Dict[str, Any]:
    """
    Get event details. Filters fields based on audience.
    """
    logger.info(f"Fetching event {event_id} for {audience}")
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM events WHERE Id = ?", (event_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Event not found")

        event = dict(row)

        if audience == "public":
            return {
                "event": {
                    "Id": event.get("Id"),
                    "Name": event.get("Name"),
                    "StartDate": event.get("StartDate"),
                    "EndDate": event.get("EndDate"),
                    "BriefDescription": (event.get("Details") or "")[:200],
                    "Tags": event.get("Tags")
                },
                "audience": "public",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        else:
            limit = event.get("RegistrationsLimit") or 0
            confirmed = event.get("ConfirmedRegistrationsCount") or 0
            return {
                "event": {
                    "Id": event.get("Id"),
                    "Name": event.get("Name"),
                    "StartDate": event.get("StartDate"),
                    "EndDate": event.get("EndDate"),
                    "Location": event.get("Location"),
                    "Details": event.get("Details"),
                    "Tags": event.get("Tags"),
                    "RegistrationEnabled": event.get("RegistrationEnabled"),
                    "RegistrationUrl": event.get("RegistrationUrl"),
                    "RegistrationsLimit": limit,
                    "ConfirmedRegistrationsCount": confirmed,
                    "SpotsAvailable": max(0, limit - confirmed) if limit else None,
                    "IsFull": confirmed >= limit if limit else False
                },
                "audience": "member",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    finally:
        conn.close()


# ============================================================================
# CONFIG ENDPOINT
# ============================================================================

@app.get("/api/calendar/config")
def get_config() -> Dict[str, Any]:
    """Return widget configuration for SBNC."""
    return {
        "organization": {
            "waAccountId": "176353",
            "name": "Santa Barbara Newcomers Club"
        },
        "server": {
            "eventsUrl": "https://mail.sbnewcomers.org/api/calendar/events",
            "memberEventsUrl": "https://mail.sbnewcomers.org/api/calendar/events/member",
            "eventDetailUrl": "https://mail.sbnewcomers.org/api/calendar/event"
        },
        "publicConfig": {
            "headerTitle": "SBNC Public Events",
            "showMyEvents": False,
            "sidePanel": True,
            "showLocation": False,
            "showAvailability": False
        },
        "memberConfig": {
            "headerTitle": "Club Events",
            "showMyEvents": True,
            "sidePanel": False,
            "showLocation": True,
            "showAvailability": True
        },
        "autoTagRules": [
            {"type": "name-prefix", "pattern": "Games!:", "tag": "committee:games"},
            {"type": "name-prefix", "pattern": "Wellness:", "tag": "committee:wellness"},
            {"type": "name-prefix", "pattern": "Happy Hikers:", "tag": "committee:hikers"},
            {"type": "name-prefix", "pattern": "Wine Appreciation:", "tag": "committee:wine"},
            {"type": "name-prefix", "pattern": "Garden:", "tag": "committee:garden"},
            {"type": "name-prefix", "pattern": "TGIF:", "tag": "committee:tgif"},
            {"type": "name-prefix", "pattern": "Epicurious:", "tag": "committee:epicurious"}
        ]
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "version": "1.03"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
