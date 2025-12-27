# Quarantine: Server-Hosted Deployment Docs

**Status:** Archived - Not part of INLINE ONLY path
**Date Quarantined:** 2024-12-26
**Reason:** SBNC now uses INLINE ONLY deployment (no external server)

## Files in this folder

- `Custom_Server_Setup_Guide.md` - Guide for setting up ClubCalendar on a custom server
- `Custom_Server_Setup_Guide.html` - HTML version of above
- `ICS_Calendar_Integration.md` - ICS endpoint for "Add to Calendar" feature (server-dependent)
- `Wild_Apricot_Installation_Guide.md` - Guide for embedding widget (assumes server hosting)
- `Wild_Apricot_Installation_Guide.html` - HTML version of above
- `Google_Cloud_Setup_Guide.md` - Google Cloud deployment guide

## Why quarantined?

The INLINE ONLY deployment model does not require:

- An external server (mail.sbnewcomers.org)
- Cron jobs for syncing data
- ICS endpoint for calendar downloads
- Server-side configuration files

All functionality is embedded directly in the Wild Apricot page using the WA native API.

## Can these be deleted?

These docs may be useful for:

- Historical reference
- Other organizations using server-hosted deployment
- Future hybrid deployments

If they're no longer needed after 90 days, they can be safely deleted.

## What replaced this?

See: `docs/INSTALL/SBNC_INLINE_ONLY_INSTALL.md`
