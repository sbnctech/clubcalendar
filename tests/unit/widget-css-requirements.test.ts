/**
 * CSS Requirements Tests
 *
 * These tests verify that required CSS properties are present in the widget.
 * They read the actual widget HTML file and check for critical styles.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

let widgetContent: string;

beforeAll(() => {
  const widgetPath = path.join(__dirname, '../../deploy/ClubCalendar_SBNC_EVENTS_PAGE.html');
  widgetContent = fs.readFileSync(widgetPath, 'utf-8');
});

describe('Popup CSS Requirements', () => {
  it('popup body must have max-height for scrolling', () => {
    // .clubcal-event-popup-body must have max-height
    expect(widgetContent).toMatch(/\.clubcal-event-popup-body\s*\{[^}]*max-height\s*:/);
  });

  it('popup body must have overflow-y: auto for scrolling', () => {
    // .clubcal-event-popup-body must have overflow-y: auto
    expect(widgetContent).toMatch(/\.clubcal-event-popup-body\s*\{[^}]*overflow-y\s*:\s*auto/);
  });

  it('popup must have reasonable max-width', () => {
    // .clubcal-event-popup must have max-width for mobile responsiveness
    expect(widgetContent).toMatch(/\.clubcal-event-popup\s*\{[^}]*max-width\s*:/);
  });

  it('popup must be fixed position with centering', () => {
    // Popup should be fixed and centered
    expect(widgetContent).toMatch(/\.clubcal-event-popup\s*\{[^}]*position\s*:\s*fixed/);
    expect(widgetContent).toMatch(/\.clubcal-event-popup\s*\{[^}]*transform\s*:\s*translate\s*\(\s*-50%/);
  });
});

describe('Widget Container CSS Requirements', () => {
  it('widget must have clubcalendar-widget class defined', () => {
    expect(widgetContent).toMatch(/\.clubcalendar-widget\s*\{/);
  });

  it('filter buttons must have hover states', () => {
    expect(widgetContent).toMatch(/\.clubcal-action-btn:hover/);
  });

  it('filter buttons must have active state', () => {
    expect(widgetContent).toMatch(/\.clubcal-action-btn\.active/);
  });
});

describe('Mobile Responsive CSS Requirements', () => {
  it('must have mobile breakpoint styles', () => {
    // Should have media query for mobile
    expect(widgetContent).toMatch(/@media[^{]*max-width\s*:\s*\d+px/);
  });

  it('popup must adjust for mobile in media query', () => {
    // Popup should be 95% width on mobile
    expect(widgetContent).toMatch(/\.clubcal-event-popup\s*\{[^}]*width\s*:\s*9[05]%/);
  });
});

describe('Calendar Event Display CSS Requirements', () => {
  it('events must have time-of-day color variables', () => {
    expect(widgetContent).toMatch(/--clubcal-morning/);
    expect(widgetContent).toMatch(/--clubcal-afternoon/);
    expect(widgetContent).toMatch(/--clubcal-evening/);
  });

  it('registered events must have visual indicator border', () => {
    // Should have border styling for registered events
    expect(widgetContent).toMatch(/border.*registered|registered.*border/i);
  });
});
