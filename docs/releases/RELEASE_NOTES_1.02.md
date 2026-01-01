# ClubCalendar 1.02 Release Notes

**Release Date:** December 31, 2024

---

## Summary

Version 1.02 standardizes all CDN dependencies on Cloudflare's cdnjs for improved reliability and consistency.

---

## Changes

### CDN Provider Standardization

**Changed:** FullCalendar library now loaded from Cloudflare cdnjs instead of jsDelivr.

| Before | After |
|--------|-------|
| `cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js` | `cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/index.global.min.js` |

**Rationale:**
- Consolidates all CDN dependencies on a single provider (Cloudflare)
- JSZip was already served from cdnjs
- Cloudflare's cdnjs is a well-established, reliable CDN with strong uptime

**Files Updated:**
- Widget templates (`widget-core.html`)
- All deployed widget HTML files
- Widget JavaScript modules
- Documentation

---

## Upgrade Instructions

1. Regenerate your widget using the Builder tool
2. Replace the HTML in your WA Custom HTML gadget
3. No configuration changes required

---

## Version History

- **1.02** (2024-12-31) - CDN standardization (Cloudflare cdnjs)
- **1.01** (2024-12-30) - Stability and reliability update
- **1.0** (2024-12-28) - Initial release
