# ClubCalendar CSS Customization Guide

**Version:** 1.02
**Date:** January 1, 2026
**For:** Alan and theme designers

---

## Overview

ClubCalendar uses CSS custom properties (variables) for all colors and styling. This allows you to customize the widget appearance through Wild Apricot's **Custom CSS** feature without modifying the widget code.

To customize, add CSS variable overrides in **WA Admin → Settings → Theme/Layout → Custom CSS**.

---

## How to Override Colors

Add any of these variables to your WA Custom CSS:

```css
:root {
    --clubcal-primary: #YOUR_COLOR;
    --clubcal-accent: #YOUR_COLOR;
    /* etc. */
}
```

---

## All CSS Variables with Default Values

### Primary Brand Colors

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-primary` | `#2c5aa0` | Main brand color (buttons, headers, active states) |
| `--clubcal-primary-dark` | `#1e3d6b` | Darker variant for gradients and hover states |
| `--clubcal-primary-hover` | `#234a80` | Button hover background |
| `--clubcal-primary-light` | `#6c9bd1` | Light variant for subtle accents |
| `--clubcal-accent` | `#d4a800` | Secondary/accent color (gold) |

### Text Colors

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-text` | `#333333` | Primary text color |
| `--clubcal-text-muted` | `#666666` | Secondary/muted text |
| `--clubcal-text-light` | `#888888` | Light text (placeholders, hints) |

### Background Colors

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-bg-light` | `#f8f9fa` | Light background (filter bars, cards) |
| `--clubcal-bg-hover` | `#f5f5f5` | Hover state background |
| `--clubcal-bg-active` | `#f0f0f0` | Active/selected state background |

### Border Colors

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-border` | `#dddddd` | Standard borders |
| `--clubcal-border-light` | `#eeeeee` | Light borders (dividers) |
| `--clubcal-border-dark` | `#bbbbbb` | Emphasized borders |

### Status Colors

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-success` | `#4caf50` | Success state (green) |
| `--clubcal-success-dark` | `#2e7d32` | Dark success text |
| `--clubcal-success-bg` | `#e8f5e9` | Success background |
| `--clubcal-warning` | `#ff9800` | Warning state (orange) |
| `--clubcal-warning-dark` | `#e65100` | Dark warning text |
| `--clubcal-warning-bg` | `#fff3e0` | Warning background |
| `--clubcal-error` | `#dc3545` | Error state (red) |
| `--clubcal-error-dark` | `#c82333` | Dark error text |
| `--clubcal-error-bg` | `#ffebee` | Error background |
| `--clubcal-info` | `#2196f3` | Info state (blue) |
| `--clubcal-info-dark` | `#1565c0` | Dark info text |
| `--clubcal-info-bg` | `#e3f2fd` | Info background |

### Time of Day Colors (Calendar Event Bars)

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-morning` | `#ff9800` | Morning events (before noon) |
| `--clubcal-afternoon` | `#42a5f5` | Afternoon events (noon-5pm) |
| `--clubcal-evening` | `#5c6bc0` | Evening events (after 5pm) |
| `--clubcal-allday` | `#66bb6a` | All-day events |

### Quick Filter Dot Colors

These colored dots appear next to quick filter buttons to help users identify filters.

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-dot-justopened` | `#e91e63` | "Just Opened" filter (pink) |
| `--clubcal-dot-openingsoon` | `#009688` | "Opening Soon" filter (teal) |
| `--clubcal-dot-openings` | `#4caf50` | "Has Openings" filter (green) |
| `--clubcal-dot-newbie` | `#00bcd4` | "Newbie-Friendly" filter (cyan) |
| `--clubcal-dot-public` | `#8bc34a` | "Open to Public" filter (light green) |
| `--clubcal-dot-weekend` | `#9c27b0` | "Weekend" filter (purple) |
| `--clubcal-dot-free` | `#ffc107` | "Free" filter (yellow/amber) |
| `--clubcal-dot-afterhours` | `#5c6bc0` | "After Hours" filter (indigo) |

### Member Availability Indicator Colors

These dots show whether events are available to the current user.

| Variable | Default | Purpose |
|----------|---------|---------|
| `--clubcal-avail-public` | `#4caf50` | Public event (green) |
| `--clubcal-avail-available` | `#2196f3` | Available to member (blue) |
| `--clubcal-avail-limited` | `#ff9800` | Limited availability (orange) |
| `--clubcal-avail-waitlist` | `#f44336` | Waitlist only (red) |
| `--clubcal-avail-unavailable` | `#9e9e9e` | Not available (gray) |

---

## Example: SBNC Theme

```css
/* SBNC Custom Theme - add to WA Custom CSS */
:root {
    /* Match SBNC brand colors */
    --clubcal-primary: #2c5aa0;
    --clubcal-primary-dark: #1e3d6b;
    --clubcal-accent: #d4a800;

    /* Slightly warmer text */
    --clubcal-text: #2d3436;

    /* Softer backgrounds */
    --clubcal-bg-light: #f5f6f7;
}
```

---

## Example: Dark Mode (Experimental)

```css
/* Dark mode theme - add to WA Custom CSS */
:root {
    --clubcal-primary: #64b5f6;
    --clubcal-primary-dark: #1976d2;
    --clubcal-accent: #ffd54f;

    --clubcal-text: #e0e0e0;
    --clubcal-text-muted: #9e9e9e;

    --clubcal-bg-light: #2d2d2d;
    --clubcal-bg-hover: #3d3d3d;
    --clubcal-bg-active: #4d4d4d;

    --clubcal-border: #555555;
    --clubcal-border-light: #444444;
}

/* Force dark background on calendar */
.clubcal-container {
    background: #1e1e1e !important;
}
```

---

## Notes

- All variables use the `--clubcal-` prefix to avoid conflicts with WA or FullCalendar styles
- Variables are defined in `:root` so they're available globally
- If a variable isn't set in your custom CSS, the default value shown above is used
- The widget is designed to look good with the defaults - only customize what you need
- Test changes in WA's preview mode before publishing

---

## Filter Dot Toggle

Currently, filter dots are always shown when quick filters are enabled. There is no configuration option to hide them. If hiding dots is needed, contact the developer to add a `showQuickFilterDots` config option.

---

*Document maintained for ClubCalendar theme customization*
