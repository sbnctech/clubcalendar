# SBNC ClubCalendar v1.33 Deployment Manifest

**Last Updated**: 2026-01-05
**Status**: Production

## Current Deployment Commits

| Component | Repository | Commit |
|-----------|------------|--------|
| Widget | clubcalendar | `662c9796990ca3bbbb4ed700ac9ee1918b4e0587` |
| Server | SBNC-Chatbot | `a51c2f1add7577713cd97bce3c253d5278597866` |

## Widget

- **Version**: 1.33
- **File**: `deploy/ClubCalendar_SBNC_EVENTS_PAGE.html`
- **Git Commit**: `662c979`
- **Deployed To**: https://sbnewcomers.org/events (WA Custom HTML gadget)

### To Reproduce Widget

```bash
git checkout <commit-hash>
# Copy deploy/ClubCalendar_SBNC_EVENTS_PAGE.html to WA Custom HTML gadget
```

## Server

- **Location**: mail.sbnewcomers.org
- **File**: `/var/www/chatbot/backend/app.py`
- **Service**: `sbnc-chatbot.service` (systemd)
- **Port**: 5199 (internal), proxied via Apache

### Server Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/calendar/test/events` | All events with pre-computed fields |
| `/api/calendar/test/event/{id}` | Single event with full description |
| `/api/calendar/test/auth` | Generate auth token for member |
| `/api/calendar/test/my-events` | Member's registered events |

### Pre-Computed Fields (Server → Widget)

- `timeOfDay`: morning/afternoon/evening/allday
- `costCategory`: Free/Under $25/$25-50/$50-100/Over $100
- `isFree`: boolean
- `committee`: extracted from event name prefix

### To Deploy Server Changes

```bash
# From local machine
scp -P 7822 /Users/edf/SBNC-Chatbot/app.py root@mail.sbnewcomers.org:/var/www/chatbot/backend/app.py
ssh -p 7822 root@mail.sbnewcomers.org "systemctl restart sbnc-chatbot.service"
```

## Configuration

- **Config File**: `deploy/v1.05-external-server/orgs/sbnc/config.json`
- **WA Account ID**: 176353
- **API Base**: https://mail.sbnewcomers.org

### Feature Flags

| Feature | Value |
|---------|-------|
| showMyEvents | true |
| showRegistrantCount | true |
| showWaitlist | true |
| showAddToCalendar | **false** |
| realTimeDescriptionFetch | true |

## Dependencies

- **FullCalendar**: 6.1.17 (loaded from cdnjs.cloudflare.com)
- **Python**: 3.x with FastAPI, uvicorn
- **SQLite**: wa.db event cache (synced every 15 min)

## Rollback Procedure

### Widget Rollback

```bash
# Find previous version
git log --oneline deploy/ClubCalendar_SBNC_EVENTS_PAGE.html

# Checkout and deploy
git checkout <previous-commit> -- deploy/ClubCalendar_SBNC_EVENTS_PAGE.html
# Copy to WA Custom HTML gadget
```

### Server Rollback

```bash
# Server keeps no version history - restore from git
git checkout <previous-commit> -- /Users/edf/SBNC-Chatbot/app.py
scp -P 7822 /Users/edf/SBNC-Chatbot/app.py root@mail.sbnewcomers.org:/var/www/chatbot/backend/app.py
ssh -p 7822 root@mail.sbnewcomers.org "systemctl restart sbnc-chatbot.service"
```

## Test Suite

```bash
cd /Users/edf/clubcalendar
npm test  # 945 tests
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.33 | 2026-01-05 | Remove Add to Calendar, real-time description fetch, server pre-computation |
| 1.32 | 2026-01-04 | Fix view toggle, remove list underlines |
| 1.31 | 2026-01-04 | Remove hover tooltip for public |
| 1.30 | 2026-01-04 | Fix cost filter for all levels |
| 1.29 | 2026-01-04 | Cost filter consistency |
