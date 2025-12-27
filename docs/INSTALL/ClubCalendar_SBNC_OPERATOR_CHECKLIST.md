# ClubCalendar SBNC Operator Checklist

```
Audience: SBNC Technical Staff, Webmaster
Purpose: Step-by-step checklists for publishing and maintaining ClubCalendar
Approach: Inline-only (no external server required)
```

---

## Overview

This document provides operator checklists for publishing, verifying, and rolling back ClubCalendar on the SBNC Wild Apricot website.

**Core Principle:** Every publish action is reversible. If something goes wrong, you can always roll back to the previous version.

---

## Quick Reference

| Phase | Duration | Risk Level | Reversible |
|-------|----------|------------|------------|
| Pre-Publish | 15-30 min | Low | N/A |
| Publish | 5-10 min | Medium | Yes |
| Verify | 10-15 min | Low | N/A |
| Rollback | 5 min | Low | Yes |

---

## Pre-Publish Checklist

Complete these steps BEFORE making any changes visible to members.

### 1. Environment Verification

- [ ] Browser ready: Safari or Chrome with WA admin access
- [ ] Logged into Wild Apricot as admin
- [ ] Test account ready: Incognito window for member view testing
- [ ] Have the source files ready:
  - `docs/INSTALL/SBNC_INLINE_SNIPPET.html` (Events Page code)
  - `docs/INSTALL/ClubCalendar_SBNC_CONFIG_PAGE_FULL.html` (Config Page code)

### 2. Configuration Validation

- [ ] Config JSON syntax valid (no trailing commas, proper quotes)
- [ ] waAccountId is correct: `176353`
- [ ] Timezone is correct: `America/Los_Angeles`
- [ ] Colors match SBNC branding

### 3. Content Review

- [ ] Widget renders correctly in local test (if possible)
- [ ] Committee presets match current SBNC committees
- [ ] Filter settings are appropriate

### 4. Backup Current State

CRITICAL: Always backup before publishing.

- [ ] Screenshot current Events page
- [ ] Copy current Config Page HTML to local file
- [ ] Copy current Events Page HTML to local file
- [ ] Note backup location and timestamp

### 5. Communication

- [ ] Notify Tech Committee of planned change
- [ ] Check calendar: Avoid publishing during events or high-traffic periods
- [ ] Ensure someone with admin access is reachable for rollback

---

## First-Time Install Checklist

Use this checklist for initial ClubCalendar installation.

### 1. Create Config Page

- [ ] Go to WA Admin - Website - Site pages
- [ ] Click Add page
- [ ] Name: "ClubCalendar Config"
- [ ] URL: `/clubcalendar-config` (exact)
- [ ] Access: Everyone (public)
- [ ] Create page
- [ ] Add Custom HTML gadget
- [ ] Switch to HTML mode
- [ ] Paste contents of `ClubCalendar_SBNC_CONFIG_PAGE_FULL.html`
- [ ] Save gadget
- [ ] Save and Publish page
- [ ] View page (not edit mode)
- [ ] Verify green "Configuration Valid" status

### 2. Create Events Page

- [ ] Go to WA Admin - Website - Site pages
- [ ] Create or edit Events page
- [ ] Add Custom HTML gadget
- [ ] Switch to HTML mode
- [ ] Paste contents of `SBNC_INLINE_SNIPPET.html`
- [ ] Save gadget
- [ ] Save and Publish page

### 3. Verify Installation

- [ ] View Events page while logged in
- [ ] Verify events load and display
- [ ] Test filter buttons
- [ ] Test "My Events" tab
- [ ] View in incognito window (logged out)
- [ ] Verify appropriate behavior for non-members

---

## Update Checklist

Use this checklist when updating existing ClubCalendar installation.

### 1. Backup

- [ ] Screenshot current page
- [ ] Save current gadget HTML to backup file
- [ ] Note backup filename with date/time

### 2. Update

- [ ] Edit the appropriate page (Config or Events)
- [ ] Open Custom HTML gadget
- [ ] Switch to HTML mode
- [ ] Make changes or paste new code
- [ ] Save gadget
- [ ] Save and Publish page

### 3. Verify

- [ ] View page (not edit mode)
- [ ] If Config Page: Check for green validation status
- [ ] If Events Page: Verify calendar loads
- [ ] Test key functionality
- [ ] Test in incognito window

---

## Rollback Checklist

Execute these steps if verification fails or issues are reported.

### 1. Immediate Assessment

Determine severity:

- Critical: Widget broken, page unusable - Rollback NOW
- Major: Significant display issues - Rollback within 15 minutes
- Minor: Cosmetic issues - Can schedule fix

### 2. Restore Previous Version

- [ ] Log in to WA Admin
- [ ] Navigate to affected page
- [ ] Click Edit
- [ ] Open Custom HTML gadget
- [ ] Switch to HTML mode
- [ ] Select all and delete
- [ ] Paste backup content
- [ ] Save gadget
- [ ] Save and Publish page

### 3. Verify Rollback

- [ ] View page in incognito window
- [ ] Confirm previous (working) version is restored
- [ ] Check that site is functional

### 4. Post-Rollback Actions

- [ ] Notify Tech Committee of rollback
- [ ] Document what went wrong
- [ ] Schedule investigation for off-peak time

---

## Emergency Remove Calendar

If ClubCalendar must be removed entirely:

### Option A: Hide Widget

- [ ] Edit Events page
- [ ] Open Custom HTML gadget
- [ ] Switch to HTML mode
- [ ] Wrap content in HTML comments:

```html
<!--
[All ClubCalendar code here]
-->
<div style="padding: 20px; text-align: center; background: #f5f5f5;">
    <p>Calendar temporarily unavailable.</p>
    <p>For event information, visit <a href="/Sys/Events">Events</a>.</p>
</div>
```

- [ ] Save and Publish

### Option B: Delete Gadget

- [ ] Edit Events page
- [ ] Delete the Custom HTML gadget containing ClubCalendar
- [ ] Add placeholder text gadget if needed
- [ ] Save and Publish

---

## Monitoring Checklist

Regular checks to ensure ClubCalendar is healthy.

### Weekly

- [ ] Visit Events page, verify calendar loads
- [ ] Check browser console for errors (F12 - Console)
- [ ] Verify events are displaying correctly

### Monthly

- [ ] Test all filter buttons work
- [ ] Test "My Events" tab (logged in)
- [ ] Verify public vs member view behavior
- [ ] Check if any committees need to be added/updated

### After WA Updates

- [ ] Visit Events page, verify calendar still works
- [ ] Check browser console for new errors
- [ ] Test core functionality

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Config page not found" | Config Page missing or wrong URL | Create /clubcalendar-config |
| "Invalid config JSON" | Syntax error in config | Fix JSON (check for trailing commas) |
| No events showing | Not logged in | Log in to WA |
| Loading forever | API error | Check browser console |
| Filters not working | Config not loaded | Refresh page, check config |

---

## Contact Information

| Role | Contact | Use Case |
|------|---------|----------|
| Tech Committee | technology@sbnewcomers.org | Technical issues |
| Webmaster | [Internal contact] | WA admin access |

---

## Document Information

- Repository: github.com/sbnctech/clubcalendar
- Related Docs:
  - WA_EVENTS_PAGE_INLINE.md
  - WA_CONFIG_PAGE_INLINE.md
  - CONFIG_CONTRACT.md

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2024-12-26 | ClubCalendar Team | Initial operator checklist |
