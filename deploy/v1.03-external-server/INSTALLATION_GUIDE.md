# ClubCalendar v1.03 Installation Guide

**External Server Edition**
**Date:** January 2, 2026

---

## Overview

ClubCalendar v1.03 runs as a standalone API server on mail.sbnewcomers.org, reading from the shared SQLite database synced from Wild Apricot.

---

## Prerequisites

- SSH access to mail.sbnewcomers.org
- Python 3.8+ on server
- SQLite database (wa.db) with events table
- Wild Apricot admin access

---

## Step 1: Deploy API Server

### 1.1 Upload Files to Server

```bash
# From local machine:
scp builder/calendar_api.py sbnewcom@mail.sbnewcomers.org:/home/sbnewcom/clubcalendar/
scp builder/requirements.txt sbnewcom@mail.sbnewcomers.org:/home/sbnewcom/clubcalendar/
```

### 1.2 Install Dependencies

```bash
# SSH to server:
ssh sbnewcom@mail.sbnewcomers.org

# Install dependencies:
cd /home/sbnewcom/clubcalendar
pip install -r requirements.txt
```

### 1.3 Configure Database Path

Edit `calendar_api.py` line 24:
```python
DB_PATH = Path("/home/sbnewcom/wa.db")  # Adjust to your path
```

### 1.4 Start Server

```bash
# Test run:
python calendar_api.py

# Production (background):
nohup uvicorn calendar_api:app --host 0.0.0.0 --port 8001 > calendar.log 2>&1 &
```

### 1.5 Verify Endpoints

```bash
curl http://localhost:8001/health
curl http://localhost:8001/api/calendar/events
curl http://localhost:8001/api/calendar/events/member
```

---

## Step 2: Deploy Widget to Static Files

### 2.1 Upload Widget

```bash
scp widget/clubcalendar-widget.js sbnewcom@mail.sbnewcomers.org:/home/sbnewcom/static/
```

### 2.2 Configure Web Server

Add to nginx config (or Apache equivalent):
```nginx
location /static/ {
    alias /home/sbnewcom/static/;
}

location /api/calendar/ {
    proxy_pass http://127.0.0.1:8001;
}
```

---

## Step 3: Create WA Config Page

### 3.1 Create Page

1. Log in to Wild Apricot admin
2. Go to **Website > Site pages > Add page**
3. Name: "ClubCalendar Config"
4. URL: `/clubcalendar-config`
5. Access: **Administrators only**

### 3.2 Paste Config HTML

Add Custom HTML gadget with contents of:
`orgs/sbnc/wa-config-page.html`

---

## Step 4: Create WA Events Pages

### 4.1 Public Events Page

1. Create page at `/events-public`
2. Access: **Everyone** (public)
3. Add Custom HTML gadget
4. Paste contents of: `orgs/sbnc/wa-events-public.html`

### 4.2 Member Events Page

1. Create page at `/events`
2. Access: **Members only**
3. Add Custom HTML gadget
4. Paste contents of: `orgs/sbnc/wa-events-member.html`

---

## Step 5: Run Tests

```bash
# On server:
cd /home/sbnewcom/clubcalendar
pytest tests/test_calendar_api.py -v

# Expected: All tests pass
# CRITICAL: All PII protection tests must pass
```

---

## Step 6: Verify Security

### Manual Verification

1. Open `/events-public` in incognito browser (not logged in)
2. Click on an event
3. Verify side panel shows:
   - Event title
   - Date and time
   - Brief description (max 200 chars)
4. Verify side panel does NOT show:
   - Location/venue
   - Registration count
   - Spots available
   - "Register" button

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty events | Check DB_PATH in calendar_api.py |
| 503 error | Database file not found |
| CORS error | Check ALLOWED_ORIGINS in config |
| Widget not loading | Check nginx static file config |

---

## Files Reference

| File | Purpose |
|------|---------|
| `builder/calendar_api.py` | Standalone API server |
| `builder/tests/test_calendar_api.py` | E2E tests |
| `orgs/sbnc/wa-config-page.html` | WA config page HTML |
| `orgs/sbnc/wa-events-public.html` | Public calendar widget |
| `orgs/sbnc/wa-events-member.html` | Member calendar widget |
| `widget/clubcalendar-widget.js` | Widget JavaScript |

---

## Security Checklist

Before going live:

- [ ] Public endpoint returns only public events
- [ ] Public endpoint excludes Location field
- [ ] Public endpoint excludes registration counts
- [ ] Public event detail excludes Location
- [ ] All E2E tests pass
- [ ] Manual verification complete
