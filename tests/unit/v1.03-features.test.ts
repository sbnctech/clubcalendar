/**
 * Unit tests for ClubCalendar v1.03 Features
 *
 * Tests for:
 * - Search box filter functionality
 * - Member click navigation to event details
 * - Filter state management
 * - Regression tests for existing functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// TEST UTILITIES
// ═══════════════════════════════════════════════════════════════

function createMockEvent(overrides: Partial<{
  id: number;
  name: string;
  description: string;
  location: string;
  tags: string;
  startDate: string;
  endDate: string;
  parentEventId: number | null;
}> = {}) {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  now.setHours(10, 0, 0, 0);

  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Test Event',
    description: 'A test event description',
    location: 'Test Location',
    tags: '',
    startDate: now.toISOString(),
    endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    parentEventId: null,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// SEARCH BOX FILTER LOGIC TESTS
// ═══════════════════════════════════════════════════════════════

describe('Search Box Filter Logic', () => {

  // Simulates the widget's search filter logic
  function searchFilterLogic(events: any[], searchText: string) {
    if (!searchText || !searchText.trim()) {
      return events;
    }

    const searchLower = searchText.toLowerCase().trim();
    return events.filter(event => {
      const nameLower = (event.name || '').toLowerCase();
      const descLower = (event.description || '').toLowerCase();
      const locationLower = (event.location || '').toLowerCase();
      const tagsLower = (event.tags || '').toLowerCase();

      return nameLower.includes(searchLower) ||
             descLower.includes(searchLower) ||
             locationLower.includes(searchLower) ||
             tagsLower.includes(searchLower);
    });
  }

  const testEvents = [
    createMockEvent({ id: 1, name: 'Wine Tasting Evening', location: 'Wine Bar', description: 'Sample fine wines', tags: 'wine,social' }),
    createMockEvent({ id: 2, name: 'Happy Hikers: Mountain Trail', location: 'State Park', description: 'Enjoy beautiful mountain views', tags: 'outdoors,hiking' }),
    createMockEvent({ id: 3, name: 'Games Night', location: 'Community Center', description: 'Board games and cards', tags: 'games,social' }),
    createMockEvent({ id: 4, name: 'Cooking Class: Italian', location: 'Kitchen Studio', description: 'Learn to make pasta with wine pairing', tags: 'food,cooking' }),
    createMockEvent({ id: 5, name: 'Book Club Discussion', location: 'Library', description: 'Discuss this months novel', tags: 'books,discussion' }),
  ];

  describe('Basic Search Functionality', () => {

    it('should return all events for empty search', () => {
      const result = searchFilterLogic(testEvents, '');
      expect(result.length).toBe(testEvents.length);
    });

    it('should return all events for whitespace-only search', () => {
      const result = searchFilterLogic(testEvents, '   ');
      expect(result.length).toBe(testEvents.length);
    });

    it('should return all events for null search', () => {
      const result = searchFilterLogic(testEvents, null as any);
      expect(result.length).toBe(testEvents.length);
    });

    it('should return all events for undefined search', () => {
      const result = searchFilterLogic(testEvents, undefined as any);
      expect(result.length).toBe(testEvents.length);
    });
  });

  describe('Search by Event Name', () => {

    it('should find events by exact word in name', () => {
      // "Tasting" only appears in event 1's name
      const result = searchFilterLogic(testEvents, 'Tasting');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should find events by partial word in name', () => {
      const result = searchFilterLogic(testEvents, 'Hik');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should find events by committee prefix', () => {
      const result = searchFilterLogic(testEvents, 'Happy Hikers');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should find events with colon in name', () => {
      const result = searchFilterLogic(testEvents, 'Italian');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(4);
    });
  });

  describe('Search by Description', () => {

    it('should find events by word in description', () => {
      const result = searchFilterLogic(testEvents, 'pasta');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(4);
    });

    it('should find events by phrase in description', () => {
      const result = searchFilterLogic(testEvents, 'mountain views');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should find multiple events with same word in description', () => {
      // "wine" appears in wine event name AND cooking event description
      const result = searchFilterLogic(testEvents, 'wine');
      expect(result.length).toBe(2);
      expect(result.map(e => e.id).sort()).toEqual([1, 4]);
    });
  });

  describe('Search by Location', () => {

    it('should find events by location', () => {
      const result = searchFilterLogic(testEvents, 'Library');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(5);
    });

    it('should find events by partial location', () => {
      const result = searchFilterLogic(testEvents, 'Park');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should find events by multi-word location', () => {
      const result = searchFilterLogic(testEvents, 'Community Center');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(3);
    });
  });

  describe('Search by Tags', () => {

    it('should find events by tag', () => {
      const result = searchFilterLogic(testEvents, 'outdoors');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should find multiple events with same tag', () => {
      const result = searchFilterLogic(testEvents, 'social');
      expect(result.length).toBe(2);
      expect(result.map(e => e.id).sort()).toEqual([1, 3]);
    });
  });

  describe('Case Insensitivity', () => {

    it('should match regardless of case - lowercase search', () => {
      const result = searchFilterLogic(testEvents, 'wine');
      expect(result.length).toBe(2);
    });

    it('should match regardless of case - uppercase search', () => {
      const result = searchFilterLogic(testEvents, 'WINE');
      expect(result.length).toBe(2);
    });

    it('should match regardless of case - mixed case search', () => {
      const result = searchFilterLogic(testEvents, 'WiNe');
      expect(result.length).toBe(2);
    });
  });

  describe('Combined Field Matching', () => {

    it('should find events across different fields', () => {
      // "mountain" appears in hike event name AND description
      const result = searchFilterLogic(testEvents, 'mountain');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should match event found via any field', () => {
      // Create event with specific values in each field
      const multiFieldEvent = createMockEvent({
        id: 100,
        name: 'Alpha Event',
        description: 'Beta description',
        location: 'Gamma Location',
        tags: 'delta,epsilon'
      });

      const events = [multiFieldEvent];

      expect(searchFilterLogic(events, 'Alpha').length).toBe(1);
      expect(searchFilterLogic(events, 'Beta').length).toBe(1);
      expect(searchFilterLogic(events, 'Gamma').length).toBe(1);
      expect(searchFilterLogic(events, 'delta').length).toBe(1);
    });
  });

  describe('No Matches', () => {

    it('should return empty array for non-matching search', () => {
      const result = searchFilterLogic(testEvents, 'xyz123nonexistent');
      expect(result.length).toBe(0);
    });

    it('should return empty array for very specific non-match', () => {
      const result = searchFilterLogic(testEvents, 'underwater basket weaving');
      expect(result.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {

    it('should handle events without description', () => {
      const noDescEvent = createMockEvent({
        id: 101,
        name: 'No Description Event',
        description: ''
      });

      const events = [noDescEvent];
      const result = searchFilterLogic(events, 'Description');
      expect(result.length).toBe(1); // Matches name
    });

    it('should handle events without location', () => {
      const noLocEvent = createMockEvent({
        id: 102,
        name: 'No Location Event',
        location: ''
      });

      const events = [noLocEvent];
      const result = searchFilterLogic(events, 'Location');
      expect(result.length).toBe(1); // Matches name
    });

    it('should handle events without tags', () => {
      const noTagsEvent = createMockEvent({
        id: 103,
        name: 'No Tags Event',
        tags: ''
      });

      const events = [noTagsEvent];
      const result = searchFilterLogic(events, 'Tags');
      expect(result.length).toBe(1); // Matches name
    });

    it('should handle special characters in search', () => {
      const specialEvent = createMockEvent({
        id: 104,
        name: 'Event (Special!): Test & More',
      });

      const events = [specialEvent];
      expect(searchFilterLogic(events, 'Special!').length).toBe(1);
      expect(searchFilterLogic(events, '(Special').length).toBe(1);
      expect(searchFilterLogic(events, '& More').length).toBe(1);
    });

    it('should handle search with leading/trailing whitespace', () => {
      const result = searchFilterLogic(testEvents, '  Wine  ');
      expect(result.length).toBe(2);
    });

    it('should handle null values in event fields gracefully', () => {
      const nullFieldEvent = {
        id: 105,
        name: null,
        description: null,
        location: null,
        tags: null,
      };

      const events = [nullFieldEvent as any];
      // Should not throw
      expect(() => searchFilterLogic(events, 'test')).not.toThrow();
      expect(searchFilterLogic(events, 'test').length).toBe(0);
    });
  });

  describe('Performance', () => {

    it('should handle large event lists efficiently', () => {
      const manyEvents: any[] = [];
      for (let i = 0; i < 1000; i++) {
        manyEvents.push(createMockEvent({
          id: i,
          name: `Event ${i}: ${i % 10 === 0 ? 'Wine' : 'Other'} Activity`,
          location: `Location ${i}`,
          description: `Description for event ${i}`
        }));
      }

      const start = performance.now();
      const result = searchFilterLogic(manyEvents, 'Wine');
      const elapsed = performance.now() - start;

      expect(result.length).toBe(100); // Every 10th event has "Wine"
      expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SEARCH WITH OTHER FILTERS COMBINATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Search Combined with Other Filters', () => {

  function combinedFilter(events: any[], filters: {
    searchText?: string;
    quickFilters?: string[];
  }) {
    let filtered = events;

    // Apply search filter first
    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(event => {
        const nameLower = (event.name || '').toLowerCase();
        const descLower = (event.description || '').toLowerCase();
        const locationLower = (event.location || '').toLowerCase();
        const tagsLower = (event.tags || '').toLowerCase();

        return nameLower.includes(searchLower) ||
               descLower.includes(searchLower) ||
               locationLower.includes(searchLower) ||
               tagsLower.includes(searchLower);
      });
    }

    // Apply quick filters (simplified - just checks name contains filter word)
    if (filters.quickFilters && filters.quickFilters.length > 0) {
      for (const qf of filters.quickFilters) {
        if (qf === 'free') {
          filtered = filtered.filter(e => e.isFree === true);
        }
        if (qf === 'weekend') {
          filtered = filtered.filter(e => {
            const day = new Date(e.startDate).getDay();
            return day === 0 || day === 6;
          });
        }
      }
    }

    return filtered;
  }

  it('should combine search with free filter', () => {
    // Create events - some free, some paid
    const nextSat = new Date();
    nextSat.setDate(nextSat.getDate() + (6 - nextSat.getDay() + 7) % 7 || 7);

    const events = [
      createMockEvent({ id: 1, name: 'Wine Tasting Free', startDate: nextSat.toISOString() }),
      createMockEvent({ id: 2, name: 'Wine Tasting Paid', startDate: nextSat.toISOString() }),
      createMockEvent({ id: 3, name: 'Hiking Free', startDate: nextSat.toISOString() }),
    ];
    events[0].isFree = true;
    events[1].isFree = false;
    events[2].isFree = true;

    const result = combinedFilter(events, {
      searchText: 'Wine',
      quickFilters: ['free']
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should combine search with weekend filter', () => {
    const nextSat = new Date();
    nextSat.setDate(nextSat.getDate() + (6 - nextSat.getDay() + 7) % 7 || 7);

    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() + (1 - nextMon.getDay() + 7) % 7 || 7);

    const events = [
      createMockEvent({ id: 1, name: 'Wine Weekend', startDate: nextSat.toISOString() }),
      createMockEvent({ id: 2, name: 'Wine Weekday', startDate: nextMon.toISOString() }),
      createMockEvent({ id: 3, name: 'Hiking Weekend', startDate: nextSat.toISOString() }),
    ];

    const result = combinedFilter(events, {
      searchText: 'Wine',
      quickFilters: ['weekend']
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should return empty when search and filter have no overlap', () => {
    const events = [
      createMockEvent({ id: 1, name: 'Wine Event' }),
      createMockEvent({ id: 2, name: 'Hiking Event' }),
    ];
    events[0].isFree = false;
    events[1].isFree = true;

    const result = combinedFilter(events, {
      searchText: 'Wine',
      quickFilters: ['free']
    });

    expect(result.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// MEMBER CLICK NAVIGATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Member Click Navigation Logic', () => {

  // Simulates the widget's click handler logic
  function determineClickAction(config: {
    memberLevel: string;
    audience?: string;
    publicEventClick?: string;
    sidePanel?: boolean;
  }, eventId: number): { action: string; url?: string } {
    const isPublic = config.audience === 'public' || config.memberLevel === 'public';

    if (isPublic) {
      if (config.publicEventClick === 'none') {
        return { action: 'none' };
      } else if (config.publicEventClick === 'popup') {
        return { action: 'popup' };
      } else {
        return { action: 'sidePanel' };
      }
    }

    // Members navigate to event details
    return {
      action: 'navigate',
      url: `https://sbnewcomers.org/event-${eventId}`
    };
  }

  describe('Public User Click Behavior', () => {

    it('should show side panel by default for public users', () => {
      const result = determineClickAction({
        memberLevel: 'public'
      }, 12345);

      expect(result.action).toBe('sidePanel');
      expect(result.url).toBeUndefined();
    });

    it('should show popup when configured for public users', () => {
      const result = determineClickAction({
        memberLevel: 'public',
        publicEventClick: 'popup'
      }, 12345);

      expect(result.action).toBe('popup');
    });

    it('should do nothing when configured as none for public users', () => {
      const result = determineClickAction({
        memberLevel: 'public',
        publicEventClick: 'none'
      }, 12345);

      expect(result.action).toBe('none');
    });

    it('should treat audience=public same as memberLevel=public', () => {
      const result = determineClickAction({
        memberLevel: 'member',
        audience: 'public'
      }, 12345);

      expect(result.action).toBe('sidePanel');
    });
  });

  describe('Member Click Behavior', () => {

    it('should navigate to event details for members', () => {
      const result = determineClickAction({
        memberLevel: 'member'
      }, 12345);

      expect(result.action).toBe('navigate');
      expect(result.url).toBe('https://sbnewcomers.org/event-12345');
    });

    it('should navigate to event details for active members', () => {
      const result = determineClickAction({
        memberLevel: 'active'
      }, 67890);

      expect(result.action).toBe('navigate');
      expect(result.url).toBe('https://sbnewcomers.org/event-67890');
    });

    it('should ignore sidePanel config for members', () => {
      const result = determineClickAction({
        memberLevel: 'member',
        sidePanel: true
      }, 12345);

      // Members always navigate, regardless of sidePanel config
      expect(result.action).toBe('navigate');
    });

    it('should include correct event ID in URL', () => {
      const eventIds = [1, 100, 9999999, 6315056];

      for (const id of eventIds) {
        const result = determineClickAction({
          memberLevel: 'member'
        }, id);

        expect(result.url).toBe(`https://sbnewcomers.org/event-${id}`);
      }
    });
  });

  describe('Edge Cases', () => {

    it('should handle zero event ID', () => {
      const result = determineClickAction({
        memberLevel: 'member'
      }, 0);

      expect(result.url).toBe('https://sbnewcomers.org/event-0');
    });

    it('should handle very large event ID', () => {
      const result = determineClickAction({
        memberLevel: 'member'
      }, 9999999999);

      expect(result.url).toBe('https://sbnewcomers.org/event-9999999999');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER STATE MANAGEMENT TESTS
// ═══════════════════════════════════════════════════════════════

describe('Filter State Management', () => {

  function createFilterState() {
    return {
      interest: null as string | null,
      committee: null as string | null,
      time: 'upcoming',
      availability: null as string | null,
      timeOfDay: [] as string[],
      memberAvailability: [] as string[],
      quickFilters: [] as string[],
      cost: null as string | null,
      searchText: '',
      showPast: false,
      pastMonths: 0
    };
  }

  describe('Search Text State', () => {

    it('should initialize searchText as empty string', () => {
      const state = createFilterState();
      expect(state.searchText).toBe('');
    });

    it('should update searchText correctly', () => {
      const state = createFilterState();
      state.searchText = 'wine';
      expect(state.searchText).toBe('wine');
    });

    it('should clear searchText on filter reset', () => {
      const state = createFilterState();
      state.searchText = 'wine';

      // Simulate clearFilters
      const cleared = createFilterState();
      cleared.showPast = state.showPast;
      cleared.pastMonths = state.pastMonths;

      expect(cleared.searchText).toBe('');
    });
  });

  describe('Combined Filter State', () => {

    it('should maintain all filter states independently', () => {
      const state = createFilterState();
      state.searchText = 'wine';
      state.quickFilters = ['weekend', 'free'];
      state.interest = 'food';

      expect(state.searchText).toBe('wine');
      expect(state.quickFilters).toEqual(['weekend', 'free']);
      expect(state.interest).toBe('food');
    });

    it('should preserve showPast and pastMonths on clear', () => {
      const state = createFilterState();
      state.showPast = true;
      state.pastMonths = 3;
      state.searchText = 'wine';
      state.quickFilters = ['weekend'];

      // Simulate clearFilters - preserves past selection
      const cleared = createFilterState();
      cleared.showPast = state.showPast;
      cleared.pastMonths = state.pastMonths;

      expect(cleared.showPast).toBe(true);
      expect(cleared.pastMonths).toBe(3);
      expect(cleared.searchText).toBe('');
      expect(cleared.quickFilters).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Regression Tests - Existing Functionality', () => {

  describe('Quick Filter Behavior Preserved', () => {

    it('weekend filter should only match Sat/Sun', () => {
      const isWeekend = (dateStr: string) => {
        const day = new Date(dateStr).getDay();
        return day === 0 || day === 6;
      };

      const nextSat = new Date();
      nextSat.setDate(nextSat.getDate() + (6 - nextSat.getDay() + 7) % 7 || 7);

      const nextMon = new Date();
      nextMon.setDate(nextMon.getDate() + (1 - nextMon.getDay() + 7) % 7 || 7);

      expect(isWeekend(nextSat.toISOString())).toBe(true);
      expect(isWeekend(nextMon.toISOString())).toBe(false);
    });

    it('afterhours filter should match weekends or weekday evenings', () => {
      const isAfterHours = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDay();
        const hour = d.getHours();
        const isWeekend = day === 0 || day === 6;
        const isWeekdayEvening = day >= 1 && day <= 5 && hour >= 17;
        return isWeekend || isWeekdayEvening;
      };

      const satMorning = new Date();
      satMorning.setDate(satMorning.getDate() + (6 - satMorning.getDay() + 7) % 7 || 7);
      satMorning.setHours(10, 0, 0, 0);

      const monEvening = new Date();
      monEvening.setDate(monEvening.getDate() + (1 - monEvening.getDay() + 7) % 7 || 7);
      monEvening.setHours(18, 0, 0, 0);

      const monMorning = new Date();
      monMorning.setDate(monMorning.getDate() + (1 - monMorning.getDay() + 7) % 7 || 7);
      monMorning.setHours(10, 0, 0, 0);

      expect(isAfterHours(satMorning.toISOString())).toBe(true); // Weekend
      expect(isAfterHours(monEvening.toISOString())).toBe(true); // Weekday evening
      expect(isAfterHours(monMorning.toISOString())).toBe(false); // Weekday morning
    });
  });

  describe('Parent Event Filtering Preserved', () => {

    function filterParentEventsWithSessions(events: any[]) {
      const parentIds = new Set<string | number>();
      for (const event of events) {
        if (event.parentEventId) {
          parentIds.add(event.parentEventId);
          parentIds.add(String(event.parentEventId));
        }
      }
      if (parentIds.size === 0) return events;
      return events.filter(event => {
        const eventId = event.id;
        return !parentIds.has(eventId) && !parentIds.has(String(eventId));
      });
    }

    it('should filter out parent events when sessions exist', () => {
      const events = [
        createMockEvent({ id: 100, name: 'Parent Event', parentEventId: null }),
        createMockEvent({ id: 101, name: 'Session 1', parentEventId: 100 }),
        createMockEvent({ id: 102, name: 'Session 2', parentEventId: 100 }),
        createMockEvent({ id: 200, name: 'Regular Event', parentEventId: null }),
      ];

      const filtered = filterParentEventsWithSessions(events);

      expect(filtered.length).toBe(3);
      expect(filtered.map(e => e.id).sort()).toEqual([101, 102, 200]);
      expect(filtered.find(e => e.id === 100)).toBeUndefined();
    });

    it('should keep all events when no sessions exist', () => {
      const events = [
        createMockEvent({ id: 100, name: 'Event 1', parentEventId: null }),
        createMockEvent({ id: 200, name: 'Event 2', parentEventId: null }),
      ];

      const filtered = filterParentEventsWithSessions(events);

      expect(filtered.length).toBe(2);
    });
  });

  describe('Multi-day Event Detection Preserved', () => {

    function isMultiDayEvent(eventName: string): boolean {
      const nameLower = eventName.toLowerCase();
      return nameLower.includes('trip') ||
             nameLower.includes('retreat') ||
             nameLower.includes('overnight') ||
             nameLower.includes('getaway') ||
             nameLower.includes('ski') ||
             nameLower.includes('camping') ||
             nameLower.includes('snow sports') ||
             nameLower.includes('adventure') ||
             nameLower.includes('mammoth') ||
             nameLower.includes('vacation') ||
             nameLower.includes('excursion');
    }

    it('should identify trip events as multi-day', () => {
      expect(isMultiDayEvent('Wine Country Day Trip')).toBe(true);
      expect(isMultiDayEvent('Snow Sports Adventure Trip')).toBe(true);
    });

    it('should identify retreat events as multi-day', () => {
      expect(isMultiDayEvent('Annual Members Retreat')).toBe(true);
    });

    it('should identify ski events as multi-day', () => {
      expect(isMultiDayEvent('Mammoth Ski Weekend')).toBe(true);
      expect(isMultiDayEvent('Snow Sports Adventure')).toBe(true);
    });

    it('should NOT identify regular events as multi-day', () => {
      expect(isMultiDayEvent('Wine Tasting Evening')).toBe(false);
      expect(isMultiDayEvent('Happy Hikers: Morning Walk')).toBe(false);
      expect(isMultiDayEvent('Games Night')).toBe(false);
      expect(isMultiDayEvent('Wellness: Add A Little Happiness')).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// ACTIVE FILTERS DISPLAY TESTS
// ═══════════════════════════════════════════════════════════════

describe('Active Filters Display', () => {

  function buildActiveFilterTags(filters: {
    interest?: string;
    committee?: string;
    quickFilters?: string[];
    searchText?: string;
  }): string[] {
    const tags: string[] = [];

    if (filters.interest) {
      tags.push(`Interest: ${filters.interest}`);
    }

    if (filters.committee) {
      tags.push(`Committee: ${filters.committee}`);
    }

    const quickFilterLabels: Record<string, string> = {
      'weekend': 'Weekend',
      'free': 'Free',
      'openings': 'Has Openings',
      'afterhours': 'After Hours'
    };

    (filters.quickFilters || []).forEach(qf => {
      tags.push(quickFilterLabels[qf] || qf);
    });

    if (filters.searchText) {
      tags.push(`Search: "${filters.searchText}"`);
    }

    return tags;
  }

  it('should show search text in active filters', () => {
    const tags = buildActiveFilterTags({ searchText: 'wine' });
    expect(tags).toContain('Search: "wine"');
  });

  it('should not show search tag for empty search', () => {
    const tags = buildActiveFilterTags({ searchText: '' });
    expect(tags.some(t => t.includes('Search'))).toBe(false);
  });

  it('should show all active filters together', () => {
    const tags = buildActiveFilterTags({
      interest: 'food',
      quickFilters: ['weekend', 'free'],
      searchText: 'wine'
    });

    expect(tags).toContain('Interest: food');
    expect(tags).toContain('Weekend');
    expect(tags).toContain('Free');
    expect(tags).toContain('Search: "wine"');
    expect(tags.length).toBe(4);
  });
});
