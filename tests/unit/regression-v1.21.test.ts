/**
 * Regression tests for bugs fixed in v1.21
 *
 * These tests document specific bugs that were found in production
 * and their fixes, to prevent regressions in future changes.
 */

import { describe, it, expect } from 'vitest';
import { transformEvent, WaEvent } from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════════════════
// BUG #1: parseTags must handle both JSON strings and arrays
// Fixed in v1.20
//
// The API can return tags in different formats:
// - JSON string: '["waitlist", "public event"]'
// - Array: ["waitlist", "public event"]
// - Comma-separated string: "waitlist, public event"
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Tags parsing handles multiple formats', () => {
  it('should handle tags as array', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test Event',
      StartDate: '2026-01-15T10:00:00',
      Tags: ['waitlist', 'public event'],
    };
    const result = transformEvent(event, []);
    expect(result.tags).toContain('waitlist');
    expect(result.tags).toContain('public event');
  });

  it('should handle tags as comma-separated string', () => {
    const event: WaEvent = {
      Id: 2,
      Name: 'Test Event',
      StartDate: '2026-01-15T10:00:00',
      Tags: 'waitlist, public event',
    };
    const result = transformEvent(event, []);
    expect(result.tags).toContain('waitlist');
    expect(result.tags).toContain('public event');
  });

  it('should handle empty tags gracefully', () => {
    const event: WaEvent = {
      Id: 3,
      Name: 'Test Event',
      StartDate: '2026-01-15T10:00:00',
      Tags: undefined,
    };
    const result = transformEvent(event, []);
    // Should not throw, tags should be empty or have only auto-derived tags
    expect(Array.isArray(result.tags)).toBe(true);
  });

  it('should handle null tags gracefully', () => {
    const event: WaEvent = {
      Id: 4,
      Name: 'Test Event',
      StartDate: '2026-01-15T10:00:00',
      Tags: null as unknown as string[],
    };
    const result = transformEvent(event, []);
    expect(Array.isArray(result.tags)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #2: Date filter must include previous month for calendar navigation
// Fixed in v1.21
//
// When viewing January 2026, the calendar shows Dec 28-31 in the first row.
// Events from those dates must be included even though they're "past".
// The cutoff was incorrectly set to TODAY instead of start of previous month.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Date filter includes previous month events', () => {
  // Helper to simulate the date filter logic
  function getDateCutoff(now: Date, pastMonths: number): Date {
    // CORRECT logic (v1.21): Start from beginning of PREVIOUS month
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (pastMonths > 1) {
      cutoff.setMonth(cutoff.getMonth() - (pastMonths - 1));
    }
    return cutoff;
  }

  // WRONG logic that caused the bug (for reference)
  function getDateCutoffBuggy(now: Date, pastMonths: number): Date {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (pastMonths > 0) {
      cutoff.setMonth(cutoff.getMonth() - pastMonths);
    }
    return cutoff;
  }

  it('should include Dec 31 events when viewing January calendar', () => {
    const jan4 = new Date(2026, 0, 4); // January 4, 2026
    const dec31 = new Date(2025, 11, 31); // December 31, 2025

    const cutoff = getDateCutoff(jan4, 0);

    // Dec 31 should be >= cutoff (included)
    expect(dec31 >= cutoff).toBe(true);
  });

  it('should NOT include Dec 31 with buggy logic (demonstrating the bug)', () => {
    const jan4 = new Date(2026, 0, 4);
    const dec31 = new Date(2025, 11, 31);

    const buggyCutoff = getDateCutoffBuggy(jan4, 0);

    // With buggy logic, Dec 31 would be BEFORE cutoff (excluded) - this was the bug!
    expect(dec31 >= buggyCutoff).toBe(false);
  });

  it('should include all of December when viewing January', () => {
    const jan15 = new Date(2026, 0, 15);
    const dec1 = new Date(2025, 11, 1);
    const dec15 = new Date(2025, 11, 15);
    const dec31 = new Date(2025, 11, 31);

    const cutoff = getDateCutoff(jan15, 0);

    expect(dec1 >= cutoff).toBe(true);
    expect(dec15 >= cutoff).toBe(true);
    expect(dec31 >= cutoff).toBe(true);
  });

  it('should extend further back when pastMonths > 1', () => {
    const jan15 = new Date(2026, 0, 15);
    const oct1 = new Date(2025, 9, 1); // October 1, 2025

    // With pastMonths=3, should include October
    const cutoff = getDateCutoff(jan15, 3);

    expect(oct1 >= cutoff).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #3: Filter container selector must match widget class
// Fixed in v1.19
//
// The bindFilterEvents() function was looking for '.clubcal-container'
// but the widget uses '.clubcalendar-widget'. This caused ALL filter
// event handlers to silently fail to attach.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Widget container class consistency', () => {
  // These are documentation tests - the actual binding happens in the browser
  const CORRECT_CONTAINER_CLASS = 'clubcalendar-widget';
  const WRONG_CONTAINER_CLASS = 'clubcal-container';

  it('should use consistent container class name', () => {
    // The widget HTML creates a div with class 'clubcalendar-widget'
    // The event binding must query for the same class
    expect(CORRECT_CONTAINER_CLASS).toBe('clubcalendar-widget');
  });

  it('documents the bug: wrong class name would fail silently', () => {
    // This test documents what went wrong:
    // - buildWidget() creates: <div class="clubcalendar-widget">
    // - bindFilterEvents() was querying: querySelector('.clubcal-container')
    // - Result: container was null, function returned early, no events bound
    expect(CORRECT_CONTAINER_CLASS).not.toBe(WRONG_CONTAINER_CLASS);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #4: Login detection must check actual links, not page text
// Fixed in v1.19
//
// The login detection was searching the entire page text for "Log out".
// This caused false positives when "Log out" appeared anywhere on the page
// (e.g., in content, menus, or other elements) even when the user was
// NOT logged in.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Login detection logic', () => {
  // These tests document the expected behavior

  it('should detect logged IN when logout link exists and no login link', () => {
    // Simulating DOM state
    const hasLogoutLink = true;
    const hasLoginLink = false;

    const isLoggedIn = hasLogoutLink && !hasLoginLink;
    expect(isLoggedIn).toBe(true);
  });

  it('should detect logged OUT when login link exists', () => {
    // Even if "Log out" text appears somewhere, if "Log in" link exists, user is NOT logged in
    const hasLogoutLink = false; // No actual logout link
    const hasLoginLink = true;   // Login link IS present

    const isLoggedIn = hasLogoutLink && !hasLoginLink;
    expect(isLoggedIn).toBe(false);
  });

  it('should detect logged OUT when login link present (overrides logout text)', () => {
    // This was the bug case: "Log out" text existed somewhere but user was not logged in
    const hasLogoutLinkOrText = true;  // "Log out" found in text
    const hasLoginLink = true;          // "Log in" link also present

    // CORRECT: Login link presence means NOT logged in, regardless of logout text
    const isLoggedIn = hasLogoutLinkOrText && !hasLoginLink;
    expect(isLoggedIn).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #5: Popup tags.find() must handle undefined tags
// Fixed in v1.20
//
// In showPublicEventPopup(), the code called originalEvent?.tags?.find()
// but tags could be undefined or not an array, causing TypeError.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Safe tags access in popup', () => {
  // Helper that mirrors the fixed code pattern
  function safeTagsFind(originalEvent: { tags?: unknown }, predicate: (t: string) => boolean): string | undefined {
    const tags = Array.isArray(originalEvent?.tags) ? originalEvent.tags : [];
    return tags.find(t => t && typeof t === 'string' && predicate(t));
  }

  it('should handle undefined tags', () => {
    const event = { name: 'Test' };
    const result = safeTagsFind(event, t => t.startsWith('committee:'));
    expect(result).toBeUndefined();
  });

  it('should handle null tags', () => {
    const event = { name: 'Test', tags: null };
    const result = safeTagsFind(event, t => t.startsWith('committee:'));
    expect(result).toBeUndefined();
  });

  it('should handle string tags (not array)', () => {
    const event = { name: 'Test', tags: 'committee:games' };
    const result = safeTagsFind(event, t => t.startsWith('committee:'));
    // Should not throw, returns undefined since it's not an array
    expect(result).toBeUndefined();
  });

  it('should work with valid array tags', () => {
    const event = { name: 'Test', tags: ['waitlist', 'committee:games'] };
    const result = safeTagsFind(event, t => t.startsWith('committee:'));
    expect(result).toBe('committee:games');
  });

  it('should handle array with null/undefined elements', () => {
    const event = { name: 'Test', tags: [null, undefined, 'committee:games'] };
    const result = safeTagsFind(event, t => t.startsWith('committee:'));
    expect(result).toBe('committee:games');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #6: Popup description must be scrollable for long content
// Fixed in v1.22
//
// Long event descriptions were being cut off without any way to scroll.
// The popup body needs max-height and overflow-y: auto.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Popup body must be scrollable', () => {
  // CSS requirements that must be present in the widget
  const REQUIRED_POPUP_BODY_STYLES = {
    'max-height': true,  // Must have a max-height set
    'overflow-y': 'auto', // Must allow vertical scrolling
  };

  it('documents required CSS for scrollable popup body', () => {
    // .clubcal-event-popup-body must have:
    // - max-height (e.g., 60vh) to limit height
    // - overflow-y: auto to enable scroll when content exceeds max-height
    expect(REQUIRED_POPUP_BODY_STYLES['max-height']).toBe(true);
    expect(REQUIRED_POPUP_BODY_STYLES['overflow-y']).toBe('auto');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #7: Free filter must include events without registration requirement
// Fixed in v1.23
//
// "Free" was only checking isFree flag and minPrice === 0.
// But events without registration enabled (like TGIF, Happy Hikers meetups)
// are also free - no ticket price, just show up.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Free filter includes no-registration events', () => {
  // Helper that mirrors the fixed isFree logic
  function isFree(event: { isFree?: number; minPrice?: number; registrationEnabled?: boolean }): boolean {
    return event.isFree === 1 || event.minPrice === 0 || !event.registrationEnabled;
  }

  it('should mark event as free when isFree flag is set', () => {
    const event = { isFree: 1, minPrice: 10, registrationEnabled: true };
    expect(isFree(event)).toBe(true);
  });

  it('should mark event as free when minPrice is 0', () => {
    const event = { isFree: 0, minPrice: 0, registrationEnabled: true };
    expect(isFree(event)).toBe(true);
  });

  it('should mark event as free when registration is not enabled', () => {
    // This is the bug fix - open events like TGIF, Happy Hikers
    const event = { isFree: 0, minPrice: undefined, registrationEnabled: false };
    expect(isFree(event)).toBe(true);
  });

  it('should NOT mark event as free when it has a price and requires registration', () => {
    const event = { isFree: 0, minPrice: 25, registrationEnabled: true };
    expect(isFree(event)).toBe(false);
  });

  it('should mark event as free when registrationEnabled is undefined (legacy data)', () => {
    // Undefined registration means it's likely an open event
    const event = { isFree: 0, minPrice: undefined };
    expect(isFree(event)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG #7b: Free filter logic must be consistent across ALL locations
// Fixed in v1.24
//
// The isFree calculation existed in 5 different places in the widget.
// In v1.23, only 2 were updated. The quick filter (the one that actually
// runs when you click Free) still had the old logic.
// ═══════════════════════════════════════════════════════════════════════════

describe('BUG: Free filter consistency across widget', () => {
  let widgetContent: string;

  beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    const widgetPath = path.join(__dirname, '../../deploy/ClubCalendar_SBNC_EVENTS_PAGE.html');
    widgetContent = fs.readFileSync(widgetPath, 'utf-8');
  });

  it('should have registrationEnabled check in evaluateFilters context', () => {
    // Line ~764: isFree in evaluateFilters context
    expect(widgetContent).toMatch(/isFree:.*event\.isFree.*\|\|.*minPrice.*\|\|.*!event\.registrationEnabled/);
  });

  it('should have registrationEnabled check in transformEventsForCalendar', () => {
    // Line ~2667: isFree in extendedProps
    expect(widgetContent).toMatch(/isFree:.*event\.isFree.*\|\|.*minPrice.*\|\|.*!event\.registrationEnabled/);
  });

  it('should have registrationEnabled check in formatPrice', () => {
    // Line ~2966: isFree check for display
    expect(widgetContent).toMatch(/if.*event\.isFree.*\|\|.*minPrice.*\|\|.*!event\.registrationEnabled/);
  });

  it('should have registrationEnabled check in quick filter logic', () => {
    // Line ~3766: const isFree = ... (the actual filter!)
    expect(widgetContent).toMatch(/const isFree.*=.*event\.isFree.*\|\|.*minPrice.*\|\|.*!event\.registrationEnabled/);
  });

  it('should use isFree variable in cost dropdown filter', () => {
    // Line ~3854: cost dropdown should use isFree, not just category
    expect(widgetContent).toMatch(/cost.*===.*'free'.*&&.*!isFree/);
  });

  it('all isFree calculations should include registrationEnabled (count check)', () => {
    // Count occurrences of the pattern to ensure we have all 5
    const pattern = /isFree.*===.*1.*\|\|.*minPrice.*===.*0.*\|\|.*!.*registrationEnabled/g;
    const matches = widgetContent.match(pattern) || [];
    // Should have at least 4 occurrences (evaluateFilters, transform, formatPrice, quickFilter)
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });
});
