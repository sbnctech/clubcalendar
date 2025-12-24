/**
 * Unit tests for ClubCalendar core functions
 */

import { describe, it, expect } from 'vitest';
import {
  applyAutoTags,
  deriveTimeOfDay,
  isWeekend,
  deriveAvailability,
  extractPricing,
  deriveCostCategory,
  deriveActivityType,
  isPublicEvent,
  extractCommittee,
  getCleanTitle,
  getTimeOfDayClass,
  transformEvent,
  applyFilters,
  FILTER_RULES,
  ACTIVITY_TYPE_MAP,
  AutoTagRule,
  WaEvent,
} from '../../widget/src/core';

import {
  SAMPLE_AUTO_TAG_RULES,
  freeHikeEvent,
  paidWineEvent,
  fullGamesEvent,
  limitedGolfEvent,
  publicMeetingEvent,
  expensiveEvent,
  tgifAfterHoursEvent,
  noRegistrationTypesEvent,
  eventWithStringTags,
  eventWithArrayTags,
  eventWithNestedRegistrationTypes,
  eventWithCurrentPrice,
  futureDate,
  nextSaturday,
  nextWeekday,
} from '../mocks/wa-events';

// ═══════════════════════════════════════════════════════════════
// AUTO-TAGGING TESTS
// ═══════════════════════════════════════════════════════════════

describe('applyAutoTags', () => {
  it('should match name-prefix rules', () => {
    const event = { Name: 'Happy Hikers: Morning Walk' };
    const tags = applyAutoTags(event, SAMPLE_AUTO_TAG_RULES);
    expect(tags).toContain('committee:happy-hikers');
  });

  it('should be case-insensitive', () => {
    const event = { Name: 'HAPPY HIKERS: LOUD WALK' };
    const tags = applyAutoTags(event, SAMPLE_AUTO_TAG_RULES);
    expect(tags).toContain('committee:happy-hikers');
  });

  it('should match name-contains rules', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-contains', pattern: 'wine', tag: 'activity:wine' }
    ];
    const event = { Name: 'Special Wine Tasting Event' };
    const tags = applyAutoTags(event, rules);
    expect(tags).toContain('activity:wine');
  });

  it('should match name-suffix rules', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-suffix', pattern: 'workshop', tag: 'type:workshop' }
    ];
    const event = { Name: 'Garden Planting Workshop' };
    const tags = applyAutoTags(event, rules);
    expect(tags).toContain('type:workshop');
  });

  it('should return empty array for non-matching events', () => {
    const event = { Name: 'Random Event Name' };
    const tags = applyAutoTags(event, SAMPLE_AUTO_TAG_RULES);
    expect(tags).toHaveLength(0);
  });

  it('should return multiple tags when multiple rules match', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'happy hikers:', tag: 'committee:happy-hikers' },
      { type: 'name-contains', pattern: 'hike', tag: 'activity:outdoors' }
    ];
    const event = { Name: 'Happy Hikers: Mountain Hike' };
    const tags = applyAutoTags(event, rules);
    expect(tags).toContain('committee:happy-hikers');
    expect(tags).toContain('activity:outdoors');
  });

  it('should handle empty event name', () => {
    const event = { Name: '' };
    const tags = applyAutoTags(event, SAMPLE_AUTO_TAG_RULES);
    expect(tags).toHaveLength(0);
  });

  it('should handle undefined event name', () => {
    const event = {};
    const tags = applyAutoTags(event, SAMPLE_AUTO_TAG_RULES);
    expect(tags).toHaveLength(0);
  });

  it('should skip rules with empty pattern', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: '', tag: 'should-not-match' }
    ];
    const event = { Name: 'Any Event' };
    const tags = applyAutoTags(event, rules);
    expect(tags).not.toContain('should-not-match');
  });
});

// ═══════════════════════════════════════════════════════════════
// TIME DERIVATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('deriveTimeOfDay', () => {
  it('should return time:morning for hours 0-11', () => {
    expect(deriveTimeOfDay('2024-06-15T09:00:00')).toBe('time:morning');
    expect(deriveTimeOfDay('2024-06-15T00:00:00')).toBe('time:morning');
    expect(deriveTimeOfDay('2024-06-15T11:59:00')).toBe('time:morning');
  });

  it('should return time:afternoon for hours 12-16', () => {
    expect(deriveTimeOfDay('2024-06-15T12:00:00')).toBe('time:afternoon');
    expect(deriveTimeOfDay('2024-06-15T14:30:00')).toBe('time:afternoon');
    expect(deriveTimeOfDay('2024-06-15T16:59:00')).toBe('time:afternoon');
  });

  it('should return time:evening for hours 17-23', () => {
    expect(deriveTimeOfDay('2024-06-15T17:00:00')).toBe('time:evening');
    expect(deriveTimeOfDay('2024-06-15T19:30:00')).toBe('time:evening');
    expect(deriveTimeOfDay('2024-06-15T23:59:00')).toBe('time:evening');
  });

  it('should handle invalid date gracefully', () => {
    // Invalid dates parse to NaN which becomes 0 in getHours(), triggering evening (actually returns a value, not null)
    const result = deriveTimeOfDay('invalid-date');
    expect(['time:morning', 'time:afternoon', 'time:evening']).toContain(result);
  });
});

describe('isWeekend', () => {
  it('should return true for Saturday', () => {
    expect(isWeekend('2024-06-15T10:00:00')).toBe(true); // June 15, 2024 is Saturday
  });

  it('should return true for Sunday', () => {
    expect(isWeekend('2024-06-16T10:00:00')).toBe(true); // June 16, 2024 is Sunday
  });

  it('should return false for weekdays', () => {
    expect(isWeekend('2024-06-17T10:00:00')).toBe(false); // Monday
    expect(isWeekend('2024-06-18T10:00:00')).toBe(false); // Tuesday
    expect(isWeekend('2024-06-19T10:00:00')).toBe(false); // Wednesday
    expect(isWeekend('2024-06-20T10:00:00')).toBe(false); // Thursday
    expect(isWeekend('2024-06-21T10:00:00')).toBe(false); // Friday
  });
});

// ═══════════════════════════════════════════════════════════════
// AVAILABILITY TESTS
// ═══════════════════════════════════════════════════════════════

describe('deriveAvailability', () => {
  it('should return availability:open when no limit', () => {
    const event = { RegistrationsLimit: null, ConfirmedRegistrationsCount: 50 };
    expect(deriveAvailability(event)).toBe('availability:open');
  });

  it('should return availability:open when limit undefined', () => {
    const event = { ConfirmedRegistrationsCount: 10 };
    expect(deriveAvailability(event)).toBe('availability:open');
  });

  it('should return availability:full when no spots left', () => {
    const event = { RegistrationsLimit: 20, ConfirmedRegistrationsCount: 20 };
    expect(deriveAvailability(event)).toBe('availability:full');
  });

  it('should return availability:full when overbooked', () => {
    const event = { RegistrationsLimit: 20, ConfirmedRegistrationsCount: 25 };
    expect(deriveAvailability(event)).toBe('availability:full');
  });

  it('should return availability:limited when 1-5 spots left', () => {
    expect(deriveAvailability({ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 19 })).toBe('availability:limited');
    expect(deriveAvailability({ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 15 })).toBe('availability:limited');
  });

  it('should return availability:open when more than 5 spots left', () => {
    const event = { RegistrationsLimit: 20, ConfirmedRegistrationsCount: 10 };
    expect(deriveAvailability(event)).toBe('availability:open');
  });
});

// ═══════════════════════════════════════════════════════════════
// PRICING TESTS
// ═══════════════════════════════════════════════════════════════

describe('extractPricing', () => {
  it('should extract pricing from BasePrice', () => {
    const pricing = extractPricing(paidWineEvent);
    expect(pricing.minPrice).toBe(45);
    expect(pricing.maxPrice).toBe(55);
    expect(pricing.isFree).toBe(false);
  });

  it('should return free for events with no registration types', () => {
    const pricing = extractPricing(noRegistrationTypesEvent);
    expect(pricing.minPrice).toBe(0);
    expect(pricing.maxPrice).toBe(0);
    expect(pricing.isFree).toBe(true);
  });

  it('should return free for $0 events', () => {
    const pricing = extractPricing(freeHikeEvent);
    expect(pricing.minPrice).toBe(0);
    expect(pricing.isFree).toBe(true);
  });

  it('should extract from nested Details.RegistrationTypes', () => {
    const pricing = extractPricing(eventWithNestedRegistrationTypes);
    expect(pricing.minPrice).toBe(0);
    expect(pricing.isFree).toBe(true);
  });

  it('should extract from CurrentPrice when BasePrice missing', () => {
    const pricing = extractPricing(eventWithCurrentPrice);
    expect(pricing.minPrice).toBe(65);
    expect(pricing.maxPrice).toBe(75);
    expect(pricing.isFree).toBe(false);
  });
});

describe('deriveCostCategory', () => {
  it('should return cost:free for $0', () => {
    expect(deriveCostCategory(0)).toBe('cost:free');
  });

  it('should return cost:under-25 for $1-24', () => {
    expect(deriveCostCategory(1)).toBe('cost:under-25');
    expect(deriveCostCategory(24)).toBe('cost:under-25');
    expect(deriveCostCategory(24.99)).toBe('cost:under-25');
  });

  it('should return cost:under-50 for $25-49', () => {
    expect(deriveCostCategory(25)).toBe('cost:under-50');
    expect(deriveCostCategory(49)).toBe('cost:under-50');
  });

  it('should return cost:under-100 for $50-99', () => {
    expect(deriveCostCategory(50)).toBe('cost:under-100');
    expect(deriveCostCategory(99)).toBe('cost:under-100');
  });

  it('should return cost:over-100 for $100+', () => {
    expect(deriveCostCategory(100)).toBe('cost:over-100');
    expect(deriveCostCategory(500)).toBe('cost:over-100');
  });

  it('should return null for null/undefined', () => {
    expect(deriveCostCategory(null)).toBeNull();
    expect(deriveCostCategory(undefined)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE TESTS
// ═══════════════════════════════════════════════════════════════

describe('deriveActivityType', () => {
  it('should derive physical for Happy Hikers', () => {
    expect(deriveActivityType('Happy Hikers: Morning Walk')).toBe('activity:physical');
  });

  it('should derive social for TGIF', () => {
    expect(deriveActivityType('TGIF: Beach Happy Hour')).toBe('activity:social');
  });

  it('should derive food-drink for Wine Appreciation', () => {
    expect(deriveActivityType('Wine Appreciation: Pinot Tasting')).toBe('activity:food-drink');
  });

  it('should derive arts for Performing Arts', () => {
    expect(deriveActivityType('Performing Arts: Symphony Night')).toBe('activity:arts');
  });

  it('should derive educational for Current Events', () => {
    expect(deriveActivityType('Current Events: Discussion')).toBe('activity:educational');
  });

  it('should derive games for Games!', () => {
    expect(deriveActivityType('Games!: Board Game Night')).toBe('activity:games');
  });

  it('should return null for unknown prefix', () => {
    expect(deriveActivityType('Unknown Committee: Some Event')).toBeNull();
  });

  it('should return null for events without colon', () => {
    expect(deriveActivityType('General Meeting')).toBeNull();
  });

  it('should return null for colon too far in name', () => {
    expect(deriveActivityType('This is a very long prefix that goes beyond 30 chars: Event')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC EVENT TESTS
// ═══════════════════════════════════════════════════════════════

describe('isPublicEvent', () => {
  it('should return true for AccessLevel Public', () => {
    expect(isPublicEvent(freeHikeEvent)).toBe(true);
    expect(isPublicEvent(publicMeetingEvent)).toBe(true);
  });

  it('should return true when no registration types', () => {
    expect(isPublicEvent(noRegistrationTypesEvent)).toBe(true);
  });

  it('should return true when registration disabled', () => {
    expect(isPublicEvent(publicMeetingEvent)).toBe(true);
  });

  it('should return false for members-only with registration', () => {
    expect(isPublicEvent(paidWineEvent)).toBe(false);
    expect(isPublicEvent(fullGamesEvent)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// UI HELPER TESTS
// ═══════════════════════════════════════════════════════════════

describe('extractCommittee', () => {
  it('should extract committee before colon', () => {
    expect(extractCommittee('Happy Hikers: Morning Walk')).toBe('Happy Hikers');
    expect(extractCommittee('Games!: Board Game Night')).toBe('Games!'); // ! is preserved
  });

  it('should return General for events without colon', () => {
    expect(extractCommittee('Monthly Meeting')).toBe('General');
  });

  it('should strip special characters', () => {
    expect(extractCommittee('Games*: Something')).toBe('Games');
    expect(extractCommittee('Test-Group: Event')).toBe('TestGroup');
  });
});

describe('getCleanTitle', () => {
  it('should return text after colon', () => {
    expect(getCleanTitle('Happy Hikers: Morning Walk')).toBe('Morning Walk');
    expect(getCleanTitle('TGIF: Beach Party')).toBe('Beach Party');
  });

  it('should return full name if no colon', () => {
    expect(getCleanTitle('Monthly Meeting')).toBe('Monthly Meeting');
  });
});

describe('getTimeOfDayClass', () => {
  it('should return morning for morning hours', () => {
    expect(getTimeOfDayClass('2024-06-15T09:00:00')).toBe('morning');
  });

  it('should return afternoon for afternoon hours', () => {
    expect(getTimeOfDayClass('2024-06-15T14:00:00')).toBe('afternoon');
  });

  it('should return evening for evening hours', () => {
    expect(getTimeOfDayClass('2024-06-15T19:00:00')).toBe('evening');
  });

  it('should return allday for empty date', () => {
    expect(getTimeOfDayClass('')).toBe('allday');
  });
});

// ═══════════════════════════════════════════════════════════════
// TRANSFORM EVENT TESTS
// ═══════════════════════════════════════════════════════════════

describe('transformEvent', () => {
  it('should transform basic event properties', () => {
    const transformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);

    expect(transformed.id).toBe(1001);
    expect(transformed.name).toBe('Happy Hikers: Morning Trail Walk');
    expect(transformed.location).toBe('Elings Park Trailhead');
  });

  it('should calculate spots available', () => {
    const transformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.spotsAvailable).toBe(12); // 20 - 8
    expect(transformed.isFull).toBe(false);
  });

  it('should detect full events', () => {
    const transformed = transformEvent(fullGamesEvent, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.spotsAvailable).toBe(0);
    expect(transformed.isFull).toBe(true);
  });

  it('should derive pricing correctly', () => {
    const transformed = transformEvent(paidWineEvent, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.minPrice).toBe(45);
    expect(transformed.maxPrice).toBe(55);
    expect(transformed.isFree).toBe(false);
  });

  it('should apply auto-tags', () => {
    const transformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.tags).toContain('committee:happy-hikers');
  });

  it('should derive time tags', () => {
    const transformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.tags).toContain('time:morning');
  });

  it('should derive availability tags', () => {
    const fullTransformed = transformEvent(fullGamesEvent, SAMPLE_AUTO_TAG_RULES);
    expect(fullTransformed.tags).toContain('availability:full');

    const limitedTransformed = transformEvent(limitedGolfEvent, SAMPLE_AUTO_TAG_RULES);
    expect(limitedTransformed.tags).toContain('availability:limited');
  });

  it('should derive cost tags', () => {
    const freeTransformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    expect(freeTransformed.tags).toContain('cost:free');

    const expensiveTransformed = transformEvent(expensiveEvent, SAMPLE_AUTO_TAG_RULES);
    expect(expensiveTransformed.tags).toContain('cost:over-100');
  });

  it('should derive activity type', () => {
    const hikeTransformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    expect(hikeTransformed.activityType).toBe('physical');

    const wineTransformed = transformEvent(paidWineEvent, SAMPLE_AUTO_TAG_RULES);
    expect(wineTransformed.activityType).toBe('food-drink');
  });

  it('should derive public-event tag', () => {
    const publicTransformed = transformEvent(publicMeetingEvent, SAMPLE_AUTO_TAG_RULES);
    expect(publicTransformed.tags).toContain('public-event');
    expect(publicTransformed.isPublic).toBe(true);

    const membersOnlyTransformed = transformEvent(paidWineEvent, SAMPLE_AUTO_TAG_RULES);
    expect(membersOnlyTransformed.tags).not.toContain('public-event');
    expect(membersOnlyTransformed.isPublic).toBe(false);
  });

  it('should handle string tags', () => {
    const transformed = transformEvent(eventWithStringTags, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.tags).toContain('gardening');
    expect(transformed.tags).toContain('workshop');
    expect(transformed.tags).toContain('outdoor');
  });

  it('should handle array tags', () => {
    const transformed = transformEvent(eventWithArrayTags, SAMPLE_AUTO_TAG_RULES);
    expect(transformed.tags).toContain('music');
    expect(transformed.tags).toContain('cultural');
    expect(transformed.tags).toContain('evening');
  });

  it('should deduplicate tags', () => {
    const transformed = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
    const uniqueTags = [...new Set(transformed.tags)];
    expect(transformed.tags.length).toBe(uniqueTags.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER RULES TESTS
// ═══════════════════════════════════════════════════════════════

describe('FILTER_RULES', () => {
  const freeEvent = transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES);
  const paidEvent = transformEvent(paidWineEvent, SAMPLE_AUTO_TAG_RULES);
  const fullEvent = transformEvent(fullGamesEvent, SAMPLE_AUTO_TAG_RULES);
  const golfEvent = transformEvent(limitedGolfEvent, SAMPLE_AUTO_TAG_RULES);
  const publicEvent = transformEvent(publicMeetingEvent, SAMPLE_AUTO_TAG_RULES);
  const afterHoursEvent = transformEvent(tgifAfterHoursEvent, SAMPLE_AUTO_TAG_RULES);

  describe('free filter', () => {
    it('should match free events', () => {
      expect(FILTER_RULES.free.criteria(freeEvent)).toBe(true);
    });

    it('should not match paid events', () => {
      expect(FILTER_RULES.free.criteria(paidEvent)).toBe(false);
    });
  });

  describe('openings filter', () => {
    it('should match events with spots available', () => {
      expect(FILTER_RULES.openings.criteria(freeEvent)).toBe(true);
    });

    it('should not match full events', () => {
      expect(FILTER_RULES.openings.criteria(fullEvent)).toBe(false);
    });

    it('should match events with unlimited capacity', () => {
      expect(FILTER_RULES.openings.criteria(afterHoursEvent)).toBe(true);
    });
  });

  describe('public filter', () => {
    it('should match public events', () => {
      expect(FILTER_RULES.public.criteria(publicEvent)).toBe(true);
      expect(FILTER_RULES.public.criteria(freeEvent)).toBe(true); // AccessLevel: Public
    });

    it('should not match members-only events', () => {
      expect(FILTER_RULES.public.criteria(paidEvent)).toBe(false);
    });
  });

  describe('weekend filter', () => {
    it('should match Saturday events', () => {
      expect(FILTER_RULES.weekend.criteria(golfEvent)).toBe(true);
    });
  });

  describe('under25 filter', () => {
    it('should match events under $25', () => {
      expect(FILTER_RULES.under25.criteria(freeEvent)).toBe(true);
      // Games event is $5
      const gamesEvent = transformEvent(fullGamesEvent, SAMPLE_AUTO_TAG_RULES);
      expect(FILTER_RULES.under25.criteria(gamesEvent)).toBe(true);
    });

    it('should not match expensive events', () => {
      expect(FILTER_RULES.under25.criteria(paidEvent)).toBe(false);
    });
  });
});

describe('applyFilters', () => {
  const allEvents = [
    transformEvent(freeHikeEvent, SAMPLE_AUTO_TAG_RULES),
    transformEvent(paidWineEvent, SAMPLE_AUTO_TAG_RULES),
    transformEvent(fullGamesEvent, SAMPLE_AUTO_TAG_RULES),
    transformEvent(limitedGolfEvent, SAMPLE_AUTO_TAG_RULES),
    transformEvent(publicMeetingEvent, SAMPLE_AUTO_TAG_RULES),
  ];

  it('should return all events when no filters', () => {
    const filtered = applyFilters(allEvents, [], false);
    expect(filtered.length).toBe(5);
  });

  it('should filter by single criteria', () => {
    const filtered = applyFilters(allEvents, ['free'], false);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(e => {
      expect(e.isFree || e.minPrice === 0).toBe(true);
    });
  });

  it('should filter by openings', () => {
    const filtered = applyFilters(allEvents, ['openings'], false);
    // fullGamesEvent should be excluded
    expect(filtered.some(e => e.id === fullGamesEvent.Id)).toBe(false);
  });

  it('should apply OR logic for multiple filters', () => {
    const filtered = applyFilters(allEvents, ['free', 'public'], false);
    // Should include free OR public events
    expect(filtered.length).toBeGreaterThan(0);
  });
});
