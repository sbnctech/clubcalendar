# ClubCalendar Troubleshooting Guide

**Version:** 1.04 Client-Side Edition

---

## Quick Diagnosis

Open your browser's developer console (F12 or Cmd+Option+I) and look for errors. This tells you exactly what's wrong.

| Console Error | Problem | Solution |
|---------------|---------|----------|
| `Refused to load script from 'cdnjs.cloudflare.com'` | CDN not whitelisted | [Whitelist the CDN](#calendar-wont-load--blank-screen) |
| `401 Unauthorized` | Invalid Client ID | [Check API credentials](#api-authentication-errors) |
| `403 Forbidden` | Wrong Account ID or not logged in | [Verify credentials](#api-authentication-errors) |
| `Failed to fetch` | Network or CORS issue | [Check network](#network-errors) |
| No errors but blank | JavaScript blocked | [Whitelist the CDN](#calendar-wont-load--blank-screen) |

---

## Calendar Won't Load / Blank Screen

**Symptom:** The calendar area is completely blank or shows a loading spinner forever.

### Cause 1: CDN Not Whitelisted (Most Common)

ClubCalendar loads the FullCalendar library from `cdnjs.cloudflare.com`. Wild Apricot blocks external scripts by default.

**Solution:**

1. Go to **Settings → Security → JavaScript whitelist**
2. Add: `cdnjs.cloudflare.com`
3. Click **Save**
4. Refresh your calendar page

**How to verify:** Open browser console (F12). Look for:
```
Refused to load the script 'https://cdnjs.cloudflare.com/...'
because it violates the following Content Security Policy directive
```

### Cause 2: Trial Account Limitation

Trial accounts cannot modify the JavaScript whitelist.

**Solution:**

- Upgrade to a paid WA plan, OR
- Contact WA support to request whitelist access for trial

### Cause 3: Custom HTML Gadget Not Saved

The widget code wasn't properly saved.

**Solution:**

1. Edit the page
2. Click the edit icon on the Custom HTML gadget
3. Verify the widget code is present
4. Click Save on the gadget
5. Click Publish on the page

---

## "Login Required" Message

**Symptom:** Calendar shows "Please log in to view the calendar" instead of events.

### Cause 1: Page Not Set to Members-Only

The widget requires the page to be restricted to logged-in members.

**Solution:**

1. Edit the page properties
2. Under **Access**, select **Restricted to certain membership levels**
3. Check all appropriate member levels
4. Save

### Cause 2: User Not Logged In

The user hasn't logged into Wild Apricot.

**Solution:**

- Click the login link in the message
- Or navigate to the WA login page first

### Cause 3: Session Expired

The user's login session has timed out.

**Solution:**

- Log out and log back in
- Check "Remember me" for longer sessions

---

## API Authentication Errors

**Symptom:** Console shows 401 or 403 errors. Calendar may be blank or show an error message.

### Cause 1: Invalid Client ID

The Client ID in the widget config doesn't match an authorized application.

**Solution:**

1. Go to **Settings → Security → Authorized applications**
2. Find your ClubCalendar application
3. Copy the correct Client ID
4. Update the widget config:
   ```javascript
   waClientId: 'your-correct-client-id'
   ```
5. Save and refresh

### Cause 2: Wrong Application Type

The API application was created as "Server application" instead of "User authorization".

**Solution:**

1. Go to **Settings → Security → Authorized applications**
2. Delete the existing ClubCalendar application
3. Create a new one:
   - Select **User authorization**
   - Click **Continue**
   - Name it `ClubCalendar`
4. Update the widget with the new Client ID

### Cause 3: Wrong Account ID

The Account ID doesn't match your WA account.

**Solution:**

1. Go to any admin page in WA
2. Look at the URL - the number is your Account ID
3. Update the widget config:
   ```javascript
   waAccountId: '176353'  // Your actual Account ID
   ```

---

## No Events Showing

**Symptom:** Calendar loads but shows no events, even though events exist in WA.

### Cause 1: No Upcoming Events

The calendar only shows future events by default.

**Solution:**

- Check that you have upcoming events in WA
- Try clicking "Show Past Events" if available

### Cause 2: Events Are Restricted

Events may be restricted to certain member levels.

**Solution:**

- Verify the logged-in user has access to view events
- Check event access settings in WA

### Cause 3: API Returns Empty

The API call succeeded but returned no events.

**Solution:**

1. Open browser console (F12)
2. Look for `[ClubCalendar]` log messages
3. Check if events array is empty
4. Verify events exist in WA admin

---

## Styling Issues

**Symptom:** Calendar looks wrong - colors off, layout broken, text hard to read.

### Cause 1: Browser Cache

Old CSS cached in browser.

**Solution:**

- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache

### Cause 2: CSS Conflicts

WA theme CSS conflicts with calendar styles.

**Solution:**

1. Open browser DevTools (F12)
2. Inspect the affected element
3. Look for CSS rules overriding `--clubcal-*` variables
4. Add more specific overrides in **Website → CSS**

### Cause 3: Auto-Detection Failed

Theme auto-detection didn't find suitable colors.

**Solution:**

Add explicit colors in **Website → CSS**:

```css
:root {
    --clubcal-primary: #2c5aa0;
    --clubcal-accent: #d4a800;
    --clubcal-text: #333333;
}
```

### Cause 4: Dark Theme Incompatibility

Your WA site uses a dark theme but calendar defaults are for light themes.

**Solution:**

See the dark mode example in `THEME_DESIGNER_GUIDE.md`.

---

## Network Errors

**Symptom:** Console shows "Failed to fetch" or network-related errors.

### Cause 1: WA API Temporarily Down

Wild Apricot's API may be experiencing issues.

**Solution:**

- Wait a few minutes and try again
- Check [WA Status Page](https://status.wildapricot.com/) for outages

### Cause 2: Browser Extensions Blocking

Ad blockers or privacy extensions may block API calls.

**Solution:**

- Temporarily disable browser extensions
- Add your WA domain to extension whitelist

### Cause 3: Corporate Firewall

Company firewall blocking WA API endpoints.

**Solution:**

- Try from a different network
- Contact IT to whitelist Wild Apricot domains

---

## Filters Not Working

**Symptom:** Clicking filters doesn't change the displayed events.

### Cause 1: No Matching Events

No events match the selected filter criteria.

**Solution:**

- Try different filter combinations
- Click "Clear" to reset all filters

### Cause 2: JavaScript Error

A JavaScript error is preventing filter updates.

**Solution:**

1. Open browser console (F12)
2. Look for red error messages
3. Report the specific error for debugging

---

## Mobile Display Issues

**Symptom:** Calendar looks broken or unusable on phones/tablets.

### Cause 1: Viewport Not Set

WA page missing responsive viewport tag.

**Solution:**

This should be automatic in WA. If broken:
- Check WA theme settings for mobile support
- Try a different WA theme

### Cause 2: Container Too Narrow

The Custom HTML gadget container is too narrow.

**Solution:**

- Use a full-width page layout
- Or adjust page column settings

---

## How to Report Issues

If you can't solve the problem, gather this information:

1. **Browser and version** (Chrome 120, Safari 17, etc.)
2. **Device** (Desktop, iPhone, Android tablet, etc.)
3. **Screenshot** of the problem
4. **Console errors** (F12 → Console tab → screenshot)
5. **Steps to reproduce** (what you clicked)

Send to: technology@sbnewcomers.org

---

## Prevention Checklist

Before going live, verify:

- [ ] `cdnjs.cloudflare.com` is in JavaScript whitelist
- [ ] API application created as "JavaScript application" type
- [ ] Account ID is correct
- [ ] Client ID is correct
- [ ] Page is set to members-only access
- [ ] Widget code is saved in Custom HTML gadget
- [ ] Tested while logged in as a regular member
- [ ] Tested on mobile device
- [ ] Checked browser console for errors

---

*Last updated: January 2026*
