/**
 * Event Click Behavior Tests
 *
 * Verifies that event clicks behave correctly for public vs member users:
 * - Public users: popup with "Join SBNC to Participate" button
 * - Members: navigate to /Events/{id} (NOT /event-{id})
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

let widgetContent: string;

beforeAll(() => {
  const widgetPath = path.join(__dirname, '../../scripts/build/widget-core.html');
  widgetContent = fs.readFileSync(widgetPath, 'utf-8');
});

describe('Event Click Behavior - URL Format', () => {
  it('member click should use /Events/{id} format (not /event-{id})', () => {
    // The correct WA event URL format is /Events/{id}
    expect(widgetContent).toContain('sbnewcomers.org/Events/');

    // Should NOT contain the old broken format
    expect(widgetContent).not.toContain('sbnewcomers.org/event-');
  });

  it('handleEventClick should navigate members to /Events/{id}', () => {
    // Check the member navigation code
    expect(widgetContent).toMatch(/window\.location\.href\s*=\s*`https:\/\/sbnewcomers\.org\/Events\/\$\{/);
  });

  it('openEvent action should use /Events/{id} format', () => {
    // Check the openEvent action in delegated events
    expect(widgetContent).toMatch(/window\.open\(`https:\/\/sbnewcomers\.org\/Events\/\$\{eventId\}`/);
  });

  it('calendar integration URLs should use /Events/{id} format', () => {
    // Google Calendar, Outlook, Yahoo all include event links
    const eventUrlMatches = widgetContent.match(/sbnewcomers\.org\/Events\/\$\{event\.id\}/g);
    expect(eventUrlMatches).not.toBeNull();
    expect(eventUrlMatches!.length).toBeGreaterThanOrEqual(3); // At least Google, Outlook, Yahoo
  });
});

describe('Event Click Behavior - Public User Popup', () => {
  it('non-members should get popup, not navigation', () => {
    // Check that non-members (no waContactId) trigger showPublicEventPopup
    // The logic checks: const isMember = !!CONFIG.waContactId
    // Then: if (!isMember) { showPublicEventPopup...
    expect(widgetContent).toMatch(/const isMember\s*=\s*!!CONFIG\.waContactId/);
    expect(widgetContent).toMatch(/if\s*\(\s*!isMember\s*\)\s*\{[\s\S]*showPublicEventPopup/);
  });

  it('public popup should have "Join SBNC to Participate" button', () => {
    expect(widgetContent).toContain('Join SBNC to Participate');
  });

  it('public popup should link to join page', () => {
    expect(widgetContent).toContain('href="https://sbnewcomers.org/join"');
  });

  it('public popup should have close button', () => {
    expect(widgetContent).toMatch(/data-action=["']closePopup["']/);
  });

  it('public popup should display event title', () => {
    // Check that title is escaped and displayed
    expect(widgetContent).toMatch(/escapeHtml\(event\.title\)/);
  });

  it('public popup should display date and time', () => {
    // Check for date/time formatting in public popup
    expect(widgetContent).toContain('toLocaleDateString');
    expect(widgetContent).toContain('toLocaleTimeString');
    // Verify specific format options are used
    expect(widgetContent).toContain("weekday: 'long'");
    expect(widgetContent).toContain("hour: 'numeric'");
  });

  it('public popup should have scrollable description area', () => {
    // Check for scrollable description with reasonable max-height
    expect(widgetContent).toMatch(/clubcal-event-description.*max-height:\s*\d+px.*overflow-y:\s*auto/);
  });
});

describe('Event Click Behavior - Member Navigation', () => {
  it('members should navigate directly to event page', () => {
    // After public check, should navigate
    expect(widgetContent).toMatch(/\/\/\s*For members:\s*navigate directly to event details page/);
  });

  it('member navigation should not show popup', () => {
    // The navigation should be a direct location change, not a popup
    expect(widgetContent).toMatch(/window\.location\.href\s*=\s*`https:\/\/sbnewcomers\.org\/Events\//);
  });
});

describe('Event Click Behavior - URL Validation', () => {
  it('should not have any broken /event- URLs', () => {
    // Make sure no old format URLs remain
    const brokenUrls = widgetContent.match(/sbnewcomers\.org\/event-\$?\{/g);
    expect(brokenUrls).toBeNull();
  });

  it('all event URLs should use consistent /Events/ format', () => {
    // Count all event URL patterns - they should all use /Events/
    const correctUrls = widgetContent.match(/sbnewcomers\.org\/Events\/\$\{/g) || [];
    const incorrectUrls = widgetContent.match(/sbnewcomers\.org\/event-\$\{/g) || [];

    expect(correctUrls.length).toBeGreaterThan(0);
    expect(incorrectUrls.length).toBe(0);
  });
});
