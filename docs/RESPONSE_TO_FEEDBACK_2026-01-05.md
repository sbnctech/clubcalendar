# Response to ClubCalendar Feedback

**Date:** January 5, 2026
**From:** Ed
**To:** Doyle, Jeff, Donna
**Re:** ClubCalendar feedback and path forward

---

## Bottom Line

**Tell me exactly what you want and you'll have it, fully tested, by end of day.**

The calendar widget is built for flexibility. Everything is configurable. I just need clear decisions on a few policy questions so I'm not chasing my tail making changes that get changed again.

---

## What's Easy to Change

1. **Filters** - Add, remove, reorder, regroup. Just tell me which ones you want and in what order.

2. **Dots on events** - Can be removed with a config change if the color coding is confusing.

3. **Click behavior** - Popup, navigation, or popup-for-public + navigation-for-members. Your call.

4. **Text search** - Easy to add. WA's native widget doesn't even have this. ~30 minutes to implement, no performance impact.

5. **CSS styling** - Minimal intentionally since we're getting a new theme from Alan. Once finalized, he can update to match.

6. **After Hours and Weekend filters** - These were specifically requested, which is why I added them. Easy to remove if we don't want them.

7. **Committee prefix in titles** - Show or hide. Config change.

8. **Past events date range** - Currently hardcoded to 7 days. Easy fix to make it configurable.

---

## Jeff's Style Issues

### 1. Today/forward/back buttons invisible unless hover
### 2. Filter buttons invisible when clicked

**Response:** These are CSS specificity issues - Wild Apricot's theme overrides our styles. Known fix: add `!important` declarations with explicit colors. **Deferring all styling issues to Alan** once the new theme is ready.

---

## Jeff's Functional Issues

### 1. Anonymous view showing non-public events

**Response:** This is intentional. We show all events to anonymous visitors so they can see what the club offers - same as the existing WA calendar. This helps with member recruitment: prospective members can browse upcoming events and see the variety of activities before joining. They can view event details but can't register for members-only events.

**Question for the group:** How would you want this to behave differently? Should we hide certain events entirely from non-members? If so, which ones - events marked "Members Only" in WA, or something else? We need a clear policy decision here.

### 2. Not honoring ticket type/group membership visibility

**Response:** The calendar shows all events to everyone - it doesn't filter based on ticket type or group membership. WA handles registration restrictions when you actually register: Newcomers can only register for Newcomer tickets, while Newbies can register for either ticket type. Waitlist is available to everyone.

This is the same as the current WA calendar - you can see all events, but WA controls who can register for what. Is there a specific scenario where you're seeing unexpected behavior?

### 3. Manual contactId prevents broader testing

**Response:** The test page is currently hidden. Once we unhide it and link to it with `?contactId={Contact.Id}`, WA will automatically pass each user's contactId when they click the link. No manual entry needed - same as production. This is a configuration change, not a code change.

We could also set up a dedicated test page with the merge field, but I'm not sure exactly how that would work in WA - do you know how to configure that?

### 4. Missing events (Stride by the Tide)

**Response:** You're right - "Stride by the Tide" sessions are missing. This is a recurring event with 81 sessions (Tuesdays & Thursdays), but WA's API only returns the master event, not individual session instances. WA's frontend renders the sessions dynamically using internal APIs we can't access.

**The fix:** We need to expand recurring events into individual sessions in our sync script. We can detect events that span multiple weeks and generate individual sessions based on the recurrence pattern (parsed from the description or inferred from the start day). This is a server-side fix in `wa_full_sync.py` on mail.sbnewcomers.org.

### 5. Multi-occurrence events showing as single multi-day event

**Response:** Same root cause as #4 - recurring events aren't being expanded into individual sessions. The sync stores the master event with its full date range (e.g., Aug 2025 - Mar 2026), so the calendar renders it as one multi-day bar instead of 81 separate sessions. The recurring event expansion fix addresses both issues.

### 6. Can't see events before 12/29

**Response:** The API currently hardcodes a 7-day lookback (`WHERE StartDate >= now - 7 days`), which is why you can't see events before 12/29. The widget has a "months back" selector but the API ignores it.

**The fix:** Make the API accept a `months_back` parameter and have the widget pass it based on the user's selection. Server-side change in `app.py`. Easy fix, noted for later.

---

## Donna's P1 Issues

### 1. List view + filters don't work

**Response:** This may have been fixed in a later version. The current code (v1.40) properly updates the list view when filters are applied. Can you retest on the current test page? If it's still not working, let me know what specific filters you're applying and I'll investigate further.

### 2. Clicking event does nothing

**Response:** Clicking an event currently shows a popup with event details - this is intentional, not a bug. If the popup isn't appearing, it may be the same CSS issue affecting other buttons.

**Easy change:** We can configure it so that **members go directly to the event page** (navigation) while **public users see a popup** (since they can't register anyway). This gives members the fastest path to registration while still letting prospective members preview events. Just a config change - let me know if you'd prefer that behavior.

---

## Donna's P2 Issues (Design Preferences)

### 1. No text search

**Response:** Easy to add - ~30 minutes to implement with no performance impact. WA's native widget doesn't have this feature, so this would be an improvement. Just say the word.

### 2. Color coding via dots confusing / colors too similar

**Response:** **The dots can easily be removed** - it's a config change. If the color coding is more confusing than helpful, we can turn it off entirely and just use the time-of-day background colors. Let me know your preference.

### 3. Months-back selector is overkill

**Response:** Design preference. Can simplify to a simple toggle (show past events / hide past events) if that's preferred.

### 4. Event titles without committee prefix

**Response:** Committee names show in the filter area when you hover/select. We can restore the prefix to event titles if that's preferred - it's a display option.

### 5. Recategorize filters

**Response:** Happy to reorganize filters based on your suggested groupings. Just need final agreement on which filters we want.

### 6. Remove Openings for Newbies and Openings for Any Member filters

**Response:** Can remove these if they're not useful. **But we need to decide what filters we DO want.** Currently we have:

- Just Opened / Opening Soon
- Morning / Afternoon / Evening / Weekend
- After Hours
- Free / Open to Public / Newbie-friendly

Which of these do you want to keep?

### 7. Colors should match demo site

**Response:** CSS task for Alan once new theme is ready.

---

## Donna's P3 Issues (Nice to Have)

### 1. Remove help icon and hover text

**Response:** Can remove. I added it because the filters aren't self-explanatory, but if we simplify the filters it may not be needed.

### 2. "Discover events" styling

**Response:** CSS task for Alan.

### 3. Arrow button highlighting after click

**Response:** CSS fix for Alan.

### 4. Remove After Hours filter

**Response:** **This filter was specifically requested** - that's why I added it. "After Hours" means weekends OR after 5pm on weekdays. If we don't want it, easy to remove. But I'd like confirmation since it was a requested feature.

---

## Summary of Decisions Needed

Before I make more changes, we need agreement on:

1. **Event visibility policy:** Show all events to public (current behavior) or hide members-only events?

2. **Click behavior:** Popup for everyone (current), or navigation for members + popup for public?

3. **Which filters to keep:**
   - Time of day (Morning/Afternoon/Evening)?
   - Weekend?
   - After Hours?
   - Free?
   - Open to Public?
   - Just Opened / Opening Soon?
   - Openings for Newbies / Any Member?

4. **Dots on events:** Keep or remove?

5. **Committee prefix in titles:** Show or hide?

Once I have clear direction on these, I can make all the changes in one pass instead of iterating back and forth.

---

## Technical Fixes (Not Design Decisions)

These are actual bugs I'll fix regardless of design decisions:

| Issue | Fix | Location |
|-------|-----|----------|
| Recurring events not expanded | Add expansion logic to sync | `wa_full_sync.py` on server |
| Date range hardcoded to 7 days | Add `months_back` parameter | `app.py` on server |
| CSS variables overridden by WA | Add `!important` declarations | Widget CSS (defer to Alan) |

---

Let me know how you'd like to proceed.

— Ed
o 