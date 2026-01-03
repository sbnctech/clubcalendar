# ClubCalendar Theme Designer Guide

**Version:** 1.04 Client-Side Edition
**For:** Graphic designers customizing ClubCalendar appearance

---

## Quick Start

ClubCalendar automatically inherits colors from your Wild Apricot theme. To customize further, add CSS variables to **Website → CSS** in WA admin.

```css
/* Paste in WA Admin → Website → CSS */
:root {
    --clubcal-primary: #YOUR_COLOR;
    --clubcal-accent: #YOUR_COLOR;
}
```

---

## How Styling Works

| Priority | Source | When Used |
|----------|--------|-----------|
| 1 (highest) | WA Custom CSS | Always wins if defined |
| 2 | Auto-detected from WA | Buttons, headers, links on page |
| 3 (lowest) | Widget defaults | Fallback if nothing else found |

**Auto-Detection:** ClubCalendar scans your WA page for buttons, headers, and links, then extracts their colors automatically. No configuration needed for basic theming.

---

## CSS Variables Reference

### Primary Brand Colors

These control the main visual identity of the calendar.

| Variable | Default | What It Styles | Inherited From WA? |
|----------|---------|----------------|-------------------|
| `--clubcal-primary` | `#2c5aa0` | Header background, active buttons, selected states, calendar today highlight | ✅ Yes - from button backgrounds |
| `--clubcal-primary-dark` | `#1e3d6b` | Gradient bottoms, pressed button states | No |
| `--clubcal-primary-hover` | `#234a80` | Button hover states | No |
| `--clubcal-primary-light` | `#6c9bd1` | Subtle highlights, light accents | No |
| `--clubcal-accent` | `#d4a800` | Secondary actions, highlights, badges, links | ✅ Yes - from link colors |

### Text Colors

| Variable | Default | What It Styles | Inherited From WA? |
|----------|---------|----------------|-------------------|
| `--clubcal-text` | `#333333` | Primary body text, event titles, descriptions | ✅ Yes - from body text |
| `--clubcal-text-muted` | `#666666` | Secondary text, meta info, timestamps | No |
| `--clubcal-text-light` | `#888888` | Placeholder text, disabled states, hints | No |

### Background Colors

| Variable | Default | What It Styles | Inherited From WA? |
|----------|---------|----------------|-------------------|
| `--clubcal-bg-light` | `#f8f9fa` | Filter bar background, card backgrounds, alternating rows | No |
| `--clubcal-bg-hover` | `#f5f5f5` | Hover state on list items, filter buttons | No |
| `--clubcal-bg-active` | `#f0f0f0` | Active/pressed state backgrounds | No |

### Border Colors

| Variable | Default | What It Styles | Inherited From WA? |
|----------|---------|----------------|-------------------|
| `--clubcal-border` | `#dddddd` | Card borders, dividers, input borders | No |
| `--clubcal-border-light` | `#eeeeee` | Subtle dividers, inner borders | No |
| `--clubcal-border-dark` | `#bbbbbb` | Emphasized borders, focus rings | No |

### Status/Feedback Colors

| Variable | Default | What It Styles | Inherited From WA? |
|----------|---------|----------------|-------------------|
| `--clubcal-success` | `#4caf50` | Available spots indicator, confirmation messages | No |
| `--clubcal-success-dark` | `#2e7d32` | Success text on light backgrounds | No |
| `--clubcal-success-bg` | `#e8f5e9` | Success message backgrounds | No |
| `--clubcal-warning` | `#ff9800` | Limited availability, attention needed | No |
| `--clubcal-warning-dark` | `#e65100` | Warning text on light backgrounds | No |
| `--clubcal-warning-bg` | `#fff3e0` | Warning message backgrounds | No |
| `--clubcal-error` | `#dc3545` | Full/closed events, error messages | No |
| `--clubcal-error-dark` | `#c82333` | Error text on light backgrounds | No |
| `--clubcal-error-bg` | `#ffebee` | Error message backgrounds | No |
| `--clubcal-info` | `#2196f3` | Informational badges, help text | No |
| `--clubcal-info-dark` | `#1565c0` | Info text on light backgrounds | No |
| `--clubcal-info-bg` | `#e3f2fd` | Info message backgrounds | No |

---

## Time-of-Day Colors

These color the left edge of calendar events to indicate when they occur.

| Variable | Default | Time Range | Visual |
|----------|---------|------------|--------|
| `--clubcal-morning` | `#FFD54F` (amber) | Before 12:00 PM | ██ |
| `--clubcal-afternoon` | `#F5A623` (orange) | 12:00 PM - 5:00 PM | ██ |
| `--clubcal-evening` | `#37474F` (dark gray) | After 5:00 PM | ██ |
| `--clubcal-allday` | `#66bb6a` (green) | All-day events | ██ |

---

## Quick Filter Dot Colors

Small colored dots appear next to filter buttons to help users identify them quickly.

| Variable | Default | Filter | Visual |
|----------|---------|--------|--------|
| `--clubcal-dot-weekend` | `#9c27b0` (purple) | Weekend Events | ● |
| `--clubcal-dot-openings` | `#4caf50` (green) | Has Openings | ● |
| `--clubcal-dot-afterhours` | `#5c6bc0` (indigo) | After Hours | ● |
| `--clubcal-dot-free` | `#ffc107` (yellow) | Free Events | ● |
| `--clubcal-dot-public` | `#8bc34a` (light green) | Open to Public | ● |
| `--clubcal-dot-newbie` | `#00bcd4` (cyan) | Newbie-Friendly | ● |
| `--clubcal-dot-justopened` | `#e91e63` (pink) | Just Opened | ● |
| `--clubcal-dot-openingsoon` | `#009688` (teal) | Opening Soon | ● |

---

## Availability Indicator Colors

These dots show event availability status in the calendar.

| Variable | Default | Meaning | Visual |
|----------|---------|---------|--------|
| `--clubcal-avail-public` | `#4caf50` (green) | Open to public | ● |
| `--clubcal-avail-available` | `#2196f3` (blue) | Spots available | ● |
| `--clubcal-avail-limited` | `#ff9800` (orange) | Few spots left | ● |
| `--clubcal-avail-waitlist` | `#f44336` (red) | Waitlist only | ● |
| `--clubcal-avail-unavailable` | `#9e9e9e` (gray) | Not available | ● |

---

## Visual Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                          --clubcal-primary
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Club Events                              [Month] [List]     │ │
│ │                                          --clubcal-text     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FILTER BAR                                         --clubcal-bg-light
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                      │
│ │ Activity ▼│ │ Time    ▼ │ │ Avail.  ▼ │  --clubcal-border   │
│ └───────────┘ └───────────┘ └───────────┘                      │
│                                                                 │
│ ● Weekend  ● Openings  ● Free          --clubcal-dot-* colors │
├─────────────────────────────────────────────────────────────────┤
│ CALENDAR GRID                                                   │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                    │
│ │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                    │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │
│ │     │     │     │  1  │  2  │  3  │  4  │                    │
│ │     │     │     │     │█████│     │█████│  ← Events          │
│ │     │     │     │     │Morning    │Weekend   --clubcal-morning│
│ ├─────┴─────┴─────┴─────┴─────┴─────┴─────┤                    │
│                                                                 │
│ EVENT COLORS (left border):                                     │
│   ██ Morning (before noon)      --clubcal-morning              │
│   ██ Afternoon (12-5pm)         --clubcal-afternoon            │
│   ██ Evening (after 5pm)        --clubcal-evening              │
│   ██ All-day                    --clubcal-allday               │
├─────────────────────────────────────────────────────────────────┤
│ EVENT POPUP                                    --clubcal-bg-light
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Event Title                              --clubcal-text     │ │
│ │ Sat, Jan 15 • 2:00 PM                   --clubcal-text-muted│ │
│ │ ───────────────────────────────────     --clubcal-border    │ │
│ │ Description text here...                                    │ │
│ │                                                             │ │
│ │ ● 5 spots available                     --clubcal-success   │ │
│ │ ● Waitlist: 3                           --clubcal-warning   │ │
│ │                                                             │ │
│ │ [  Register  ]                          --clubcal-primary   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Customization Examples

### Match a Blue Theme

```css
:root {
    --clubcal-primary: #1565c0;
    --clubcal-primary-dark: #0d47a1;
    --clubcal-primary-hover: #1976d2;
    --clubcal-accent: #ffc107;
}
```

### Match a Green Theme

```css
:root {
    --clubcal-primary: #2e7d32;
    --clubcal-primary-dark: #1b5e20;
    --clubcal-primary-hover: #388e3c;
    --clubcal-accent: #ff9800;
}
```

### Match a Red/Burgundy Theme

```css
:root {
    --clubcal-primary: #c62828;
    --clubcal-primary-dark: #b71c1c;
    --clubcal-primary-hover: #d32f2f;
    --clubcal-accent: #ffd54f;
}
```

### Dark Mode (Experimental)

```css
:root {
    --clubcal-primary: #64b5f6;
    --clubcal-primary-dark: #1976d2;
    --clubcal-accent: #ffd54f;
    --clubcal-text: #e0e0e0;
    --clubcal-text-muted: #9e9e9e;
    --clubcal-bg-light: #2d2d2d;
    --clubcal-bg-hover: #3d3d3d;
    --clubcal-border: #555555;
}

.clubcalendar-container {
    background: #1e1e1e !important;
}
```

### Softer/Muted Colors

```css
:root {
    --clubcal-primary: #5c6bc0;
    --clubcal-accent: #ffb74d;
    --clubcal-text: #37474f;
    --clubcal-text-muted: #78909c;
    --clubcal-border: #cfd8dc;
}
```

---

## Where to Add Custom CSS

1. Log in to Wild Apricot as admin
2. Go to **Website → CSS**
3. Paste your CSS in the Editor
4. Click **Save** to preview
5. Changes apply immediately to all pages

---

## Tips for Designers

1. **Start with primary and accent** - These two colors have the biggest visual impact

2. **Test both views** - Check Month view AND List view

3. **Check event popups** - Click an event to see the detail popup styling

4. **Mobile matters** - Test on phone-width screens

5. **Contrast ratios** - Ensure text is readable (WCAG AA = 4.5:1 minimum)

6. **Don't over-customize** - The defaults are designed to work well together

7. **Use browser DevTools** - Inspect elements to see which variables apply

---

## Disabling Auto-Detection

If auto-detected colors conflict with your design, disable detection entirely:

```javascript
window.CLUBCALENDAR_CONFIG = {
    // ... other settings ...
    disableThemeDetection: true
};
```

Then all colors will use either your Custom CSS overrides or the widget defaults.

---

## Need Help?

- **CSS not applying?** Make sure you're using `:root { }` wrapper
- **Colors look wrong?** Check browser DevTools for CSS specificity conflicts
- **Variable not working?** Verify exact variable name (case-sensitive, includes `--clubcal-` prefix)

---

*Document version: 1.04 | Last updated: January 2026*
