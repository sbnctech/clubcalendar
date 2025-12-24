/**
 * Filter combination tests for ClubCalendar
 * Tests all filter pairs and triples to ensure OR logic works correctly
 */

import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  transformEvent,
  FILTER_RULES,
  TransformedEvent,
  WaEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// TEST EVENT FACTORY
// ═══════════════════════════════════════════════════════════════

function createTestEvent(overrides: Partial<WaEvent> & {
  isSaturday?: boolean;
  hour?: number;
}): WaEvent {
  const { isSaturday, hour, ...waOverrides } = overrides;

  // Create date based on options
  const date = new Date();
  if (isSaturday) {
    // Find next Saturday
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilSaturday);
  } else {
    // Find next Monday
    const daysUntilMonday = (1 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilMonday);
  }
  date.setHours(hour ?? 10, 0, 0, 0);

  return {
    Id: Math.floor(Math.random() * 10000),
    Name: 'Test Event',
    StartDate: date.toISOString(),
    AccessLevel: 'MembersOnly',
    RegistrationEnabled: true,
    RegistrationsLimit: 20,
    ConfirmedRegistrationsCount: 5,
    RegistrationTypes: [{ Id: 1, Name: 'Member', BasePrice: 50 }],
    ...waOverrides,
  };
}

// Create specific test events
const freeWeekendEvent = transformEvent(createTestEvent({
  Name: 'Free Weekend Event',
  isSaturday: true,
  hour: 10,
  RegistrationTypes: [{ Id: 1, BasePrice: 0 }],
}));

const paidWeekendEvent = transformEvent(createTestEvent({
  Name: 'Paid Weekend Event',
  isSaturday: true,
  hour: 10,
  RegistrationTypes: [{ Id: 1, BasePrice: 75 }],
}));

const freeWeekdayEvent = transformEvent(createTestEvent({
  Name: 'Free Weekday Event',
  isSaturday: false,
  hour: 10,
  RegistrationTypes: [{ Id: 1, BasePrice: 0 }],
}));

const paidWeekdayEvent = transformEvent(createTestEvent({
  Name: 'Paid Weekday Event',
  isSaturday: false,
  hour: 10,
  RegistrationTypes: [{ Id: 1, BasePrice: 50 }],
}));

const afterHoursEvent = transformEvent(createTestEvent({
  Name: 'After Hours Event',
  isSaturday: false,
  hour: 18, // 6 PM
  RegistrationTypes: [{ Id: 1, BasePrice: 30 }],
}));

const fullEvent = transformEvent(createTestEvent({
  Name: 'Full Event',
  isSaturday: false,
  hour: 10,
  RegistrationsLimit: 20,
  ConfirmedRegistrationsCount: 20,
  RegistrationTypes: [{ Id: 1, BasePrice: 25 }],
}));

const publicEvent = transformEvent(createTestEvent({
  Name: 'Public Event',
  isSaturday: false,
  hour: 14,
  AccessLevel: 'Public',
  RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
}));

const freeAfterHoursWeekendEvent = transformEvent(createTestEvent({
  Name: 'Free After Hours Weekend',
  isSaturday: true,
  hour: 19,
  RegistrationTypes: [{ Id: 1, BasePrice: 0 }],
}));

const publicFreeWeekendEvent = transformEvent(createTestEvent({
  Name: 'Public Free Weekend',
  isSaturday: true,
  hour: 11,
  AccessLevel: 'Public',
  RegistrationTypes: [],
}));

const allTestEvents: TransformedEvent[] = [
  freeWeekendEvent,
  paidWeekendEvent,
  freeWeekdayEvent,
  paidWeekdayEvent,
  afterHoursEvent,
  fullEvent,
  publicEvent,
  freeAfterHoursWeekendEvent,
  publicFreeWeekendEvent,
];

// ═══════════════════════════════════════════════════════════════
// SINGLE FILTER TESTS
// ═══════════════════════════════════════════════════════════════

describe('Single filter behavior', () => {
  const allFilters = Object.keys(FILTER_RULES);

  it.each(allFilters)('filter "%s" should return subset of events', (filterName) => {
    const filtered = applyFilters(allTestEvents, [filterName], false);
    expect(filtered.length).toBeLessThanOrEqual(allTestEvents.length);
    // Each returned event should match the filter
    filtered.forEach(event => {
      expect(FILTER_RULES[filterName].criteria(event)).toBe(true);
    });
  });

  describe('free filter', () => {
    it('should only return free events', () => {
      const filtered = applyFilters(allTestEvents, ['free'], false);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(e => expect(e.isFree || e.minPrice === 0).toBe(true));
    });
  });

  describe('weekend filter', () => {
    it('should only return weekend events', () => {
      const filtered = applyFilters(allTestEvents, ['weekend'], false);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(e => {
        const day = new Date(e.startDate).getDay();
        expect(day === 0 || day === 6).toBe(true);
      });
    });
  });

  describe('openings filter', () => {
    it('should exclude full events', () => {
      const filtered = applyFilters(allTestEvents, ['openings'], false);
      filtered.forEach(e => expect(e.isFull).toBe(false));
    });

    it('should include unlimited capacity events', () => {
      const unlimitedEvent = transformEvent(createTestEvent({
        Name: 'Unlimited Event',
        RegistrationsLimit: null,
        ConfirmedRegistrationsCount: 100,
      }));
      const filtered = applyFilters([unlimitedEvent], ['openings'], false);
      expect(filtered.length).toBe(1);
    });
  });

  describe('afterhours filter', () => {
    it('should return weekday evening and all weekend events', () => {
      const filtered = applyFilters(allTestEvents, ['afterhours'], false);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(e => {
        const d = new Date(e.startDate);
        const day = d.getDay();
        const hour = d.getHours();
        const isWeekend = day === 0 || day === 6;
        const isWeekdayEvening = day >= 1 && day <= 5 && hour >= 17;
        expect(isWeekend || isWeekdayEvening).toBe(true);
      });
    });
  });

  describe('public filter', () => {
    it('should only return public events', () => {
      const filtered = applyFilters(allTestEvents, ['public'], false);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(e => expect(e.isPublic).toBe(true));
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER PAIR COMBINATIONS (OR logic)
// ═══════════════════════════════════════════════════════════════

describe('Filter pair combinations (OR logic)', () => {
  const filterPairs: [string, string][] = [
    ['free', 'weekend'],
    ['free', 'afterhours'],
    ['free', 'openings'],
    ['free', 'public'],
    ['weekend', 'afterhours'],
    ['weekend', 'openings'],
    ['weekend', 'public'],
    ['afterhours', 'openings'],
    ['afterhours', 'public'],
    ['openings', 'public'],
    ['under25', 'free'],
    ['under50', 'weekend'],
  ];

  it.each(filterPairs)('"%s" OR "%s" should use OR logic', (filter1, filter2) => {
    const filtered = applyFilters(allTestEvents, [filter1, filter2], false);

    // Every result should match at least one filter
    filtered.forEach(event => {
      const matchesFilter1 = FILTER_RULES[filter1].criteria(event);
      const matchesFilter2 = FILTER_RULES[filter2].criteria(event);
      expect(matchesFilter1 || matchesFilter2).toBe(true);
    });

    // Result should be superset of either filter alone
    const filter1Only = applyFilters(allTestEvents, [filter1], false);
    const filter2Only = applyFilters(allTestEvents, [filter2], false);

    // All events from filter1 should be in combined result
    filter1Only.forEach(e => {
      expect(filtered.some(f => f.id === e.id)).toBe(true);
    });

    // All events from filter2 should be in combined result
    filter2Only.forEach(e => {
      expect(filtered.some(f => f.id === e.id)).toBe(true);
    });
  });

  describe('specific pair behaviors', () => {
    it('free + weekend should include both free weekday and paid weekend', () => {
      const filtered = applyFilters(allTestEvents, ['free', 'weekend'], false);

      // Should include free weekday event
      const hasFreeWeekday = filtered.some(e =>
        e.isFree && new Date(e.startDate).getDay() !== 0 && new Date(e.startDate).getDay() !== 6
      );
      expect(hasFreeWeekday).toBe(true);

      // Should include paid weekend event
      const hasPaidWeekend = filtered.some(e => {
        const day = new Date(e.startDate).getDay();
        return !e.isFree && (day === 0 || day === 6);
      });
      expect(hasPaidWeekend).toBe(true);
    });

    it('openings + public should exclude full private events', () => {
      const filtered = applyFilters([fullEvent, publicEvent], ['openings', 'public'], false);

      // Full private event should be excluded (doesn't match either filter)
      expect(filtered.some(e => e.id === fullEvent.id)).toBe(false);

      // Public event should be included
      expect(filtered.some(e => e.id === publicEvent.id)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER TRIPLE COMBINATIONS
// ═══════════════════════════════════════════════════════════════

describe('Filter triple combinations', () => {
  const filterTriples: [string, string, string][] = [
    ['free', 'weekend', 'afterhours'],
    ['free', 'weekend', 'public'],
    ['free', 'openings', 'public'],
    ['weekend', 'afterhours', 'public'],
    ['openings', 'free', 'weekend'],
  ];

  it.each(filterTriples)('"%s" OR "%s" OR "%s" should use OR logic', (f1, f2, f3) => {
    const filtered = applyFilters(allTestEvents, [f1, f2, f3], false);

    filtered.forEach(event => {
      const matches1 = FILTER_RULES[f1].criteria(event);
      const matches2 = FILTER_RULES[f2].criteria(event);
      const matches3 = FILTER_RULES[f3].criteria(event);
      expect(matches1 || matches2 || matches3).toBe(true);
    });
  });

  it('three filters should be more inclusive than two', () => {
    const twoFilters = applyFilters(allTestEvents, ['free', 'weekend'], false);
    const threeFilters = applyFilters(allTestEvents, ['free', 'weekend', 'afterhours'], false);

    expect(threeFilters.length).toBeGreaterThanOrEqual(twoFilters.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// ALL FILTERS ACTIVE
// ═══════════════════════════════════════════════════════════════

describe('All filters active', () => {
  it('should return almost all events when all filters active', () => {
    const allFilters = Object.keys(FILTER_RULES);
    const filtered = applyFilters(allTestEvents, allFilters, false);

    // With OR logic, most events should match at least one filter
    // Only events that match NO filters would be excluded
    expect(filtered.length).toBeGreaterThan(allTestEvents.length / 2);
  });
});

// ═══════════════════════════════════════════════════════════════
// NO FILTERS (EMPTY ARRAY)
// ═══════════════════════════════════════════════════════════════

describe('No filters active', () => {
  it('should return all events when no filters', () => {
    const filtered = applyFilters(allTestEvents, [], false);
    expect(filtered.length).toBe(allTestEvents.length);
  });

  it('should still filter by upcoming when upcomingOnly=true', () => {
    const pastEvent = transformEvent({
      Id: 9999,
      Name: 'Past Event',
      StartDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationTypes: [],
    });

    const eventsWithPast = [...allTestEvents, pastEvent];
    const filtered = applyFilters(eventsWithPast, [], true); // upcomingOnly = true

    expect(filtered.some(e => e.id === 9999)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER EXCLUSIVITY TESTS
// ═══════════════════════════════════════════════════════════════

describe('Filter exclusivity', () => {
  it('an event can match multiple filters simultaneously', () => {
    // freeAfterHoursWeekendEvent should match: free, weekend, afterhours
    expect(FILTER_RULES.free.criteria(freeAfterHoursWeekendEvent)).toBe(true);
    expect(FILTER_RULES.weekend.criteria(freeAfterHoursWeekendEvent)).toBe(true);
    expect(FILTER_RULES.afterhours.criteria(freeAfterHoursWeekendEvent)).toBe(true);
  });

  it('some events match no filters', () => {
    // Create a paid weekday morning members-only full event
    const noMatchEvent = transformEvent(createTestEvent({
      Name: 'No Match Event',
      isSaturday: false,
      hour: 10,
      AccessLevel: 'MembersOnly',
      RegistrationsLimit: 10,
      ConfirmedRegistrationsCount: 10, // Full
      RegistrationTypes: [{ Id: 1, BasePrice: 200 }], // Expensive
    }));

    // Should not match common filters
    expect(FILTER_RULES.free.criteria(noMatchEvent)).toBe(false);
    expect(FILTER_RULES.weekend.criteria(noMatchEvent)).toBe(false);
    expect(FILTER_RULES.openings.criteria(noMatchEvent)).toBe(false);
    expect(FILTER_RULES.public.criteria(noMatchEvent)).toBe(false);
    expect(FILTER_RULES.under25.criteria(noMatchEvent)).toBe(false);
    expect(FILTER_RULES.under50.criteria(noMatchEvent)).toBe(false);
  });
});
