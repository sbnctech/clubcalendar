# ClubCalendar Configuration Quick Reference

**For Non-Technical Admins**

This guide shows you what you can safely change in the calendar configuration.

---

## Where to Find the Configuration

The configuration is at the top of the widget code, between `{` and `}`:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // Settings go here
    headerTitle: 'SBNC Events',
    showFilters: true,
    // ... more settings
};
```

---

## Common Changes

### Change the Calendar Title

Find this line:
```javascript
headerTitle: 'SBNC Events',
```

Change `SBNC Events` to your preferred title. Keep the quotes!

**✓ Correct:** `headerTitle: 'Club Calendar',`
**✗ Wrong:** `headerTitle: Club Calendar,` (missing quotes)

---

### Change the Colors

Find these lines:
```javascript
primaryColor: '#2c5aa0',
accentColor: '#d4a800',
```

Change the hex codes to your preferred colors.

| Color | Hex Code |
|-------|----------|
| SBNC Blue | `#2c5aa0` |
| SBNC Gold | `#d4a800` |
| Dark Gray | `#333333` |
| Forest Green | `#228B22` |
| Navy | `#000080` |

**Tip:** Use a color picker like [htmlcolorcodes.com](https://htmlcolorcodes.com/color-picker/) to find hex codes.

---

### Hide Filters

To hide the filter panel:
```javascript
showFilters: false,
```

To show it:
```javascript
showFilters: true,
```

**Note:** Don't use quotes around `true` or `false`.

---

### Hide "My Events" Tab

To hide the My Events tab:
```javascript
showMyEvents: false,
```

---

### Change Default Calendar View

Options:

| Value | Description |
|-------|-------------|
| `'dayGridMonth'` | Monthly grid view |
| `'timeGridWeek'` | Weekly agenda view |
| `'listMonth'` | List of events |

Example:
```javascript
defaultView: 'listMonth',
```

---

### Show/Hide Specific Filters

#### Quick Filter Buttons

```javascript
quickFilters: {
    weekend: true,      // "Weekend" button
    openings: true,     // "Has Openings" button
    afterhours: true,   // "After Hours" button
    public: true,       // "Public Events" button
    free: false         // "Free" button (hidden by default)
},
```

Set to `false` to hide a button.

#### Dropdown Filters

```javascript
dropdownFilters: {
    committee: true,    // Committee dropdown
    activity: true,     // Activity dropdown
    price: true,        // Price dropdown
    eventType: true,    // Event Type dropdown
    recurring: true,    // Recurring dropdown
    venue: true,        // Venue dropdown
    tags: true          // Tags dropdown
},
```

Set to `false` to hide a dropdown.

---

## Adding a New Activity Committee

Add a new line in the `autoTagRules` section:

```javascript
autoTagRules: [
    // ... existing rules ...
    { type: 'name-prefix', pattern: 'New Committee:', tag: 'committee:new-committee' },
],
```

**Rules:**

- `pattern`: The prefix at the start of event names (include the colon)
- `tag`: Format is `category:value` (use lowercase and hyphens, no spaces)

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Missing comma | Syntax error | Add comma after each line |
| Missing quotes | Syntax error | Put text values in quotes |
| Quotes around true/false | Won't work | `true` not `'true'` |
| Typo in field name | Ignored | Check spelling exactly |
| Invalid color | Shows default | Use `#` followed by 6 letters/numbers |

---

## If Something Breaks

If the calendar stops working after you edit the config:

1. **Check for a yellow error box** - It will tell you what's wrong
2. **Compare to the original** - See `SBNC_CONFIG_EXAMPLE.json`
3. **Undo your change** - Restore the previous value
4. **Ask for help** - Contact SBNC Tech

---

## Testing Your Changes

After editing:

1. Save the Custom HTML gadget
2. Refresh the page
3. If the calendar loads, your changes worked!
4. If you see an error message, read it carefully - it tells you what to fix

---

## Full Documentation

For all available options, see:

- `CONFIG_CONTRACT.md` - Complete field reference
- `SBNC_CONFIG_EXAMPLE.json` - Working example config
