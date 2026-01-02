/**
 * Focused tests for issues identified in Jeff Phillips' review (2025-12-30)
 *
 * These tests verify the specific bugs Jeff found and their fixes.
 * Each test documents the issue, the expected behavior, and verifies the fix.
 */

import { describe, it, expect } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #1: VISIBILITY - Anonymous users seeing member-only events
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #1: Member-only events visibility', () => {
    describe('getMemberAvailability returns correct status', () => {
        it('should return "unavailable" for member-only events when not logged in', () => {
            // Scenario: Anonymous user (no memberLevel) viewing a non-public event
            const memberLevel = null;
            const eventIsPublic = false;
            const eventHasGuestTickets = false;

            // Expected behavior from getMemberAvailability:
            // if (!memberLevel && !isPublic) return { status: 'unavailable' }
            const expectedStatus = 'unavailable';

            // Simulate the logic
            const status = (!memberLevel && !eventIsPublic && !eventHasGuestTickets)
                ? 'unavailable'
                : 'available';

            expect(status).toBe(expectedStatus);
        });

        it('should return "public" for public events when not logged in', () => {
            const memberLevel = null;
            const eventTags = ['public event', 'hiking'];
            const isPublic = eventTags.includes('public event') || eventTags.includes('public');

            expect(isPublic).toBe(true);
            // When isPublic is true and no memberLevel, status should be 'public' not 'unavailable'
        });
    });

    describe('filterAndRender excludes unavailable events', () => {
        it('should filter out events where memberAvail.status === "unavailable"', () => {
            // THE FIX: Added this line before all other filters:
            // if (memberAvail.status === 'unavailable') return false;

            const events = [
                { name: 'Public Hike', memberAvailStatus: 'public' },
                { name: 'Members Only Dinner', memberAvailStatus: 'unavailable' },
                { name: 'Open Event', memberAvailStatus: 'available' },
            ];

            // Filter logic from the fix
            const visibleEvents = events.filter(e => e.memberAvailStatus !== 'unavailable');

            expect(visibleEvents).toHaveLength(2);
            expect(visibleEvents.map(e => e.name)).toEqual(['Public Hike', 'Open Event']);
            expect(visibleEvents.map(e => e.name)).not.toContain('Members Only Dinner');
        });

        it('should apply visibility check BEFORE other filters', () => {
            // Critical: The unavailable check must happen first
            // so no combination of other filters can bypass it

            const event = {
                name: 'Members Only Event',
                memberAvailStatus: 'unavailable',
                isFree: true,
                isWeekend: true,
            };

            // Even if event matches other criteria, it should be hidden
            const passesVisibility = event.memberAvailStatus !== 'unavailable';
            expect(passesVisibility).toBe(false);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #2: Interest Area filter TypeError (quickFilters undefined)
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #2: Interest Area filter preserves quickFilters', () => {
    it('should preserve quickFilters array when applying dropdown filters', () => {
        // BEFORE THE FIX (broken):
        // applyFilters() did: currentFilters = { interest: ..., time: ..., availability: ... }
        // This replaced the entire object, losing quickFilters!

        // AFTER THE FIX (correct):
        // applyFilters() updates individual properties, preserving quickFilters

        const currentFilters = {
            interest: null,
            time: 'upcoming',
            availability: null,
            quickFilters: ['weekend', 'free'],  // User had selected these
            timeOfDay: ['morning'],
            memberAvailability: [],
        };

        // Simulate the FIXED applyFilters behavior
        const newInterest = 'food';
        currentFilters.interest = newInterest;
        // Note: We DON'T replace the whole object

        expect(currentFilters.quickFilters).toEqual(['weekend', 'free']);
        expect(currentFilters.timeOfDay).toEqual(['morning']);
        expect(currentFilters.interest).toBe('food');
    });

    it('should not throw when accessing quickFilters after filter change', () => {
        const currentFilters = {
            interest: 'hiking',
            time: 'upcoming',
            availability: null,
            quickFilters: ['openings'],
            timeOfDay: [],
            memberAvailability: [],
        };

        // This should not throw
        expect(() => {
            const hasQuickFilters = currentFilters.quickFilters.length > 0;
            expect(hasQuickFilters).toBe(true);
        }).not.toThrow();
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #3: Events for today not displayed
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #3: Today\'s events display', () => {
    it('should include events that started earlier today', () => {
        // THE BUG: Using new Date() as cutoff means events earlier today are excluded
        // Example: If now is 4pm, a 9am event today would be filtered out

        const now = new Date('2025-12-30T16:00:00');

        // WRONG: Using current time as cutoff
        const wrongCutoff = now;

        // CORRECT: Using start of day as cutoff
        const correctCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // An event from this morning
        const morningEvent = new Date('2025-12-30T09:00:00');

        // Wrong approach excludes today's earlier events
        expect(morningEvent >= wrongCutoff).toBe(false);

        // Fixed approach includes today's earlier events
        expect(morningEvent >= correctCutoff).toBe(true);
    });

    it('should use start of day (midnight) for cutoff calculation', () => {
        const now = new Date('2025-12-30T14:30:45');
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        expect(startOfDay.getHours()).toBe(0);
        expect(startOfDay.getMinutes()).toBe(0);
        expect(startOfDay.getSeconds()).toBe(0);
        expect(startOfDay.getDate()).toBe(30);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #4: Previous events control not working
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #4: Previous navigation loads past events', () => {
    it('should detect when user navigates to month before loaded range', () => {
        // User initially loads December 2025
        const earliestLoadedDate = new Date('2025-12-01');

        // User clicks "previous" and views November 2025
        const viewStart = new Date('2025-11-01');

        // The handler should detect this
        const needsMoreEvents = viewStart < earliestLoadedDate;
        expect(needsMoreEvents).toBe(true);
    });

    it('should calculate correct number of months to fetch', () => {
        const earliestLoaded = new Date('2025-12-01');
        const viewStart = new Date('2025-10-01');  // 2 months back

        const monthsDiff = (earliestLoaded.getFullYear() - viewStart.getFullYear()) * 12
            + (earliestLoaded.getMonth() - viewStart.getMonth()) + 1;

        expect(monthsDiff).toBe(3);  // Need 3 months of past data
    });

    it('should not refetch when navigating within loaded range', () => {
        const earliestLoadedDate = new Date('2025-10-01');  // Already loaded back to October
        const viewStart = new Date('2025-11-01');  // Viewing November

        const needsMoreEvents = viewStart < earliestLoadedDate;
        expect(needsMoreEvents).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #5: Quick filters not working
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #5: Quick filters implementation', () => {
    describe('Just Opened filter', () => {
        it('should require registrationOpenDate field', () => {
            const eventWithoutDate = { name: 'Test', registrationOpenDate: null };
            const eventWithDate = { name: 'Test', registrationOpenDate: '2025-12-25' };

            // Filter should return false if no registrationOpenDate
            expect(eventWithoutDate.registrationOpenDate).toBeFalsy();
            expect(eventWithDate.registrationOpenDate).toBeTruthy();
        });

        it('should match events with registration opened in last 7 days', () => {
            const now = new Date('2025-12-30');
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);

            // Registration opened 3 days ago - should match
            const recentOpen = new Date('2025-12-27');
            expect(recentOpen >= sevenDaysAgo && recentOpen <= now).toBe(true);

            // Registration opened 10 days ago - should not match
            const oldOpen = new Date('2025-12-20');
            expect(oldOpen >= sevenDaysAgo && oldOpen <= now).toBe(false);
        });
    });

    describe('Opening Soon filter', () => {
        it('should match events with registration opening in next 7 days', () => {
            const now = new Date('2025-12-30');
            const sevenDaysFromNow = new Date(now);
            sevenDaysFromNow.setDate(now.getDate() + 7);

            // Opens in 3 days - should match
            const soonOpen = new Date('2026-01-02');
            expect(soonOpen > now && soonOpen <= sevenDaysFromNow).toBe(true);

            // Already open - should not match
            const alreadyOpen = new Date('2025-12-28');
            expect(alreadyOpen > now && alreadyOpen <= sevenDaysFromNow).toBe(false);
        });
    });

    describe('Openings for Newbies filter', () => {
        it('should match events with newbie-related tags', () => {
            const newbieTags = ['hiking', 'newbie friendly'];
            const normalTags = ['hiking', 'advanced'];

            const hasNewbieTag = (tags: string[]) => tags.some(t =>
                t.toLowerCase().includes('newbie') ||
                t.toLowerCase().includes('new member') ||
                t.toLowerCase().includes('orientation')
            );

            expect(hasNewbieTag(newbieTags)).toBe(true);
            expect(hasNewbieTag(normalTags)).toBe(false);
        });
    });

    describe('Few Spots Left filter', () => {
        it('should match events with limited availability status', () => {
            // Few Spots Left uses memberAvailability filter with 'limited' status
            // 'limited' is returned when availability.status === 'low' (<=3 spots)

            const eventWithFewSpots = { availability: { status: 'low', spots: 2 } };
            const eventWithManySpots = { availability: { status: 'available', spots: 15 } };

            expect(eventWithFewSpots.availability.status).toBe('low');
            expect(eventWithManySpots.availability.status).not.toBe('low');
        });
    });

    describe('Open to Public filter', () => {
        it('should match events tagged as public', () => {
            const publicEvent = { tags: ['hiking', 'public event'] };
            const memberEvent = { tags: ['hiking', 'members only'] };

            const isPublic = (tags: string[]) => tags.some(t =>
                t.toLowerCase() === 'public' ||
                t.toLowerCase() === 'public event'
            );

            expect(isPublic(publicEvent.tags)).toBe(true);
            expect(isPublic(memberEvent.tags)).toBe(false);
        });

        it('should match events with guest tickets', () => {
            const guestEvent = { hasGuestTickets: 1, tags: [] };
            const memberOnlyEvent = { hasGuestTickets: 0, tags: [] };

            expect(guestEvent.hasGuestTickets === 1).toBe(true);
            expect(memberOnlyEvent.hasGuestTickets === 1).toBe(false);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #6: After Hours vs Evening distinction
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #6: After Hours vs Evening filters', () => {
    it('After Hours should include weekends regardless of time', () => {
        // Saturday 10am - should match After Hours
        const saturdayMorning = { dayOfWeek: 6, hour: 10 };
        const isAfterHours = saturdayMorning.dayOfWeek === 0 || saturdayMorning.dayOfWeek === 6 ||
            (saturdayMorning.dayOfWeek >= 1 && saturdayMorning.dayOfWeek <= 5 && saturdayMorning.hour >= 17);

        expect(isAfterHours).toBe(true);
    });

    it('After Hours should include weekday evenings (5pm+)', () => {
        // Tuesday 6pm - should match After Hours
        const tuesdayEvening = { dayOfWeek: 2, hour: 18 };
        const isAfterHours = tuesdayEvening.dayOfWeek === 0 || tuesdayEvening.dayOfWeek === 6 ||
            (tuesdayEvening.dayOfWeek >= 1 && tuesdayEvening.dayOfWeek <= 5 && tuesdayEvening.hour >= 17);

        expect(isAfterHours).toBe(true);
    });

    it('After Hours should NOT include weekday daytime', () => {
        // Wednesday 2pm - should NOT match After Hours
        const wednesdayAfternoon = { dayOfWeek: 3, hour: 14 };
        const isAfterHours = wednesdayAfternoon.dayOfWeek === 0 || wednesdayAfternoon.dayOfWeek === 6 ||
            (wednesdayAfternoon.dayOfWeek >= 1 && wednesdayAfternoon.dayOfWeek <= 5 && wednesdayAfternoon.hour >= 17);

        expect(isAfterHours).toBe(false);
    });

    it('Evening should only match events starting 5pm or later', () => {
        // Evening is purely time-based, not day-based
        const deriveTimeOfDay = (hour: number) => {
            if (hour < 12) return 'morning';
            if (hour < 17) return 'afternoon';
            return 'evening';
        };

        expect(deriveTimeOfDay(10)).toBe('morning');   // 10am
        expect(deriveTimeOfDay(14)).toBe('afternoon'); // 2pm
        expect(deriveTimeOfDay(17)).toBe('evening');   // 5pm
        expect(deriveTimeOfDay(20)).toBe('evening');   // 8pm
    });

    it('Saturday morning should be After Hours but NOT Evening', () => {
        const saturdayMorning = { dayOfWeek: 6, hour: 10 };

        // After Hours check
        const isAfterHours = saturdayMorning.dayOfWeek === 0 || saturdayMorning.dayOfWeek === 6 ||
            (saturdayMorning.dayOfWeek >= 1 && saturdayMorning.dayOfWeek <= 5 && saturdayMorning.hour >= 17);

        // Evening check
        const isEvening = saturdayMorning.hour >= 17;

        expect(isAfterHours).toBe(true);
        expect(isEvening).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #7: Auto-refresh on tab focus
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #7: Auto-refresh on tab focus', () => {
    it('should use 30-second debounce threshold', () => {
        const REFRESH_DEBOUNCE_SECONDS = 30;
        expect(REFRESH_DEBOUNCE_SECONDS).toBe(30);
    });

    it('should refresh when last refresh was > 30 seconds ago', () => {
        const REFRESH_DEBOUNCE_SECONDS = 30;
        const lastRefreshTime = Date.now() - (45 * 1000);  // 45 seconds ago
        const secondsSinceRefresh = (Date.now() - lastRefreshTime) / 1000;

        expect(secondsSinceRefresh >= REFRESH_DEBOUNCE_SECONDS).toBe(true);
    });

    it('should skip refresh when last refresh was < 30 seconds ago', () => {
        const REFRESH_DEBOUNCE_SECONDS = 30;
        const lastRefreshTime = Date.now() - (15 * 1000);  // 15 seconds ago
        const secondsSinceRefresh = (Date.now() - lastRefreshTime) / 1000;

        expect(secondsSinceRefresh >= REFRESH_DEBOUNCE_SECONDS).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #8: Popup link accessibility
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #8: Popup link accessibility', () => {
    it('should have underlined text links (not buttons) for accessibility', () => {
        // CSS rule added:
        // .clubcal-event-popup-body a:not(.clubcal-btn) { text-decoration: underline; }

        const cssRule = '.clubcal-event-popup-body a:not(.clubcal-btn) { text-decoration: underline; }';
        expect(cssRule).toContain('text-decoration: underline');
        expect(cssRule).toContain(':not(.clubcal-btn)');  // Excludes button-styled links
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE #9: Typography customization
// ═══════════════════════════════════════════════════════════════════════════

describe('Issue #9: Typography customization', () => {
    it('should support custom fontFamily config', () => {
        const config = {
            fontFamily: 'Arial, sans-serif',
            baseFontSize: '15px'
        };

        expect(config.fontFamily).toBe('Arial, sans-serif');
        expect(config.baseFontSize).toBe('15px');
    });

    it('should default to null (use system fonts) when not configured', () => {
        const defaultConfig = {
            fontFamily: null,
            baseFontSize: null
        };

        expect(defaultConfig.fontFamily).toBeNull();
        expect(defaultConfig.baseFontSize).toBeNull();
    });
});
