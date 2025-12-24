/**
 * Tag derivation and helper function tests for ClubCalendar
 * Tests deriveEventType, deriveRecurring, deriveVenueType, isAutoTag, getDisplayTags, mergeConfig
 */

import { describe, it, expect } from 'vitest';
import {
  deriveEventType,
  deriveRecurring,
  deriveVenueType,
  isAutoTag,
  getDisplayTags,
  mergeConfig,
  EVENT_TYPE_KEYWORDS,
  AUTO_TAG_PREFIXES,
  transformEvent,
  WaEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// EVENT TYPE DERIVATION
// ═══════════════════════════════════════════════════════════════

describe('deriveEventType', () => {
  describe('workshop detection', () => {
    it('should detect workshop in title', () => {
      expect(deriveEventType('Garden: Spring Workshop')).toBe('type:workshop');
      expect(deriveEventType('Wine Appreciation: Tasting Workshop')).toBe('type:workshop');
    });

    it('should detect workshop regardless of case', () => {
      expect(deriveEventType('Art WORKSHOP')).toBe('type:workshop');
      expect(deriveEventType('Workshop on Painting')).toBe('type:workshop');
    });
  });

  describe('tasting detection', () => {
    it('should detect tasting events', () => {
      expect(deriveEventType('Wine Appreciation: Monthly Tasting')).toBe('type:tasting');
      expect(deriveEventType('Beer Lovers: Craft Beer Tasting')).toBe('type:tasting');
    });
  });

  describe('trip/tour detection', () => {
    it('should detect day trips', () => {
      expect(deriveEventType('Local Heritage: Day Trip to Mission')).toBe('type:trip');
    });

    it('should detect tours', () => {
      expect(deriveEventType('Arts: Museum Tour')).toBe('type:trip');
    });
  });

  describe('hike detection', () => {
    it('should detect hike events', () => {
      expect(deriveEventType('Happy Hikers: Morning Hike')).toBe('type:hike');
      expect(deriveEventType('Happy Hikers: Beginner Hike at State Park')).toBe('type:hike');
    });
  });

  describe('walk detection', () => {
    it('should detect walk events', () => {
      expect(deriveEventType('Happy Hikers: Nature Walk')).toBe('type:walk');
      expect(deriveEventType('Local Heritage: Historic Walk')).toBe('type:walk');
    });
  });

  describe('happy hour detection', () => {
    it('should detect happy hour events', () => {
      expect(deriveEventType('TGIF: Happy Hour')).toBe('type:happy-hour');
      expect(deriveEventType('Pop-Up: Friday Happy Hour')).toBe('type:happy-hour');
    });
  });

  describe('game night detection', () => {
    it('should detect game night events', () => {
      expect(deriveEventType('Games!: Game Night')).toBe('type:game-night');
      expect(deriveEventType('Games!: Monthly Game Night')).toBe('type:game-night');
    });
  });

  describe('other event types', () => {
    it('should detect discussions', () => {
      expect(deriveEventType('Current Events: Monthly Discussion')).toBe('type:discussion');
    });

    it('should detect lectures', () => {
      expect(deriveEventType('Arts: Guest Lecture')).toBe('type:lecture');
    });

    it('should detect classes', () => {
      expect(deriveEventType('Garden: Pruning Class')).toBe('type:class');
    });

    it('should detect performances', () => {
      expect(deriveEventType('Performing Arts: Theater Performance')).toBe('type:performance');
    });

    it('should detect concerts', () => {
      expect(deriveEventType('Arts: Jazz Concert')).toBe('type:performance');
    });

    it('should detect shows', () => {
      expect(deriveEventType('Arts: Art Show Opening')).toBe('type:performance');
    });
  });

  describe('no match', () => {
    it('should return null for events without type keywords', () => {
      expect(deriveEventType('Wine Appreciation: Monthly Meeting')).toBeNull();
      expect(deriveEventType('General: Board Meeting')).toBeNull();
      expect(deriveEventType('Random Event')).toBeNull();
    });
  });

  describe('focuses on title part (after colon)', () => {
    it('should not match keywords in prefix', () => {
      // "Walk" appears in "Walker" but not in title - should not match
      expect(deriveEventType('Walker Committee: Monthly Meeting')).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// RECURRING DERIVATION
// ═══════════════════════════════════════════════════════════════

describe('deriveRecurring', () => {
  describe('weekly detection', () => {
    it('should detect weekly events', () => {
      expect(deriveRecurring('Games!: Weekly Bridge')).toBe('recurring:weekly');
      expect(deriveRecurring('Cycling: Weekly Ride')).toBe('recurring:weekly');
    });

    it('should be case insensitive', () => {
      expect(deriveRecurring('WEEKLY Meeting')).toBe('recurring:weekly');
    });
  });

  describe('monthly detection', () => {
    it('should detect monthly events', () => {
      expect(deriveRecurring('Wine Appreciation: Monthly Tasting')).toBe('recurring:monthly');
      expect(deriveRecurring('Book Club: Monthly Discussion')).toBe('recurring:monthly');
    });
  });

  describe('daily detection', () => {
    it('should detect daily events', () => {
      expect(deriveRecurring('Fitness: Daily Workout')).toBe('recurring:daily');
    });
  });

  describe('no match', () => {
    it('should return null for non-recurring events', () => {
      expect(deriveRecurring('Wine Appreciation: Spring Tasting')).toBeNull();
      expect(deriveRecurring('Happy Hikers: Trail Walk')).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// VENUE TYPE DERIVATION
// ═══════════════════════════════════════════════════════════════

describe('deriveVenueType', () => {
  describe('outdoor venue detection from event name', () => {
    it('should detect park', () => {
      expect(deriveVenueType('Happy Hikers: Stevens Park Walk')).toBe('venue:outdoor');
    });

    it('should detect beach', () => {
      expect(deriveVenueType('Pop-Up: Beach Bonfire')).toBe('venue:outdoor');
    });

    it('should detect trail', () => {
      expect(deriveVenueType('Happy Hikers: Trail Hike')).toBe('venue:outdoor');
    });

    it('should detect garden in name', () => {
      expect(deriveVenueType('Garden: Open Garden Tour')).toBe('venue:outdoor');
    });

    it('should detect outdoor keyword', () => {
      expect(deriveVenueType('Outdoor Movie Night')).toBe('venue:outdoor');
    });

    it('should detect preserve', () => {
      expect(deriveVenueType('Happy Hikers: Nature Preserve Walk')).toBe('venue:outdoor');
    });

    it('should detect hike (implies outdoor)', () => {
      expect(deriveVenueType('Morning Hike')).toBe('venue:outdoor');
    });
  });

  describe('outdoor venue detection from location', () => {
    it('should detect park in location', () => {
      expect(deriveVenueType('Annual Picnic', 'Alameda Park')).toBe('venue:outdoor');
    });

    it('should detect beach in location', () => {
      expect(deriveVenueType('Summer Social', 'East Beach')).toBe('venue:outdoor');
    });

    it('should combine name and location', () => {
      // "Nature Walk" doesn't trigger, but "State Park" in location does
      expect(deriveVenueType('Nature Walk', 'State Park')).toBe('venue:outdoor');
    });
  });

  describe('no match', () => {
    it('should return null for indoor events', () => {
      expect(deriveVenueType('Wine Appreciation: Monthly Tasting', 'Santa Barbara Club')).toBeNull();
      expect(deriveVenueType('Games!: Game Night', 'Community Center')).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// IS AUTO TAG
// ═══════════════════════════════════════════════════════════════

describe('isAutoTag', () => {
  describe('recognizes all auto-tag prefixes', () => {
    it.each(AUTO_TAG_PREFIXES)('should recognize %s prefix', (prefix) => {
      expect(isAutoTag(`${prefix}test`)).toBe(true);
    });
  });

  describe('specific auto tags', () => {
    it('should recognize time tags', () => {
      expect(isAutoTag('time:morning')).toBe(true);
      expect(isAutoTag('time:afternoon')).toBe(true);
      expect(isAutoTag('time:evening')).toBe(true);
    });

    it('should recognize availability tags', () => {
      expect(isAutoTag('availability:open')).toBe(true);
      expect(isAutoTag('availability:limited')).toBe(true);
      expect(isAutoTag('availability:full')).toBe(true);
    });

    it('should recognize cost tags', () => {
      expect(isAutoTag('cost:free')).toBe(true);
      expect(isAutoTag('cost:under-25')).toBe(true);
      expect(isAutoTag('cost:over-100')).toBe(true);
    });

    it('should recognize activity tags', () => {
      expect(isAutoTag('activity:physical')).toBe(true);
      expect(isAutoTag('activity:social')).toBe(true);
    });

    it('should recognize committee tags', () => {
      expect(isAutoTag('committee:happy-hikers')).toBe(true);
      expect(isAutoTag('committee:wine')).toBe(true);
    });

    it('should recognize type tags', () => {
      expect(isAutoTag('type:workshop')).toBe(true);
      expect(isAutoTag('type:hike')).toBe(true);
    });

    it('should recognize recurring tags', () => {
      expect(isAutoTag('recurring:weekly')).toBe(true);
      expect(isAutoTag('recurring:monthly')).toBe(true);
    });

    it('should recognize venue tags', () => {
      expect(isAutoTag('venue:outdoor')).toBe(true);
    });

    it('should recognize public-event special tag', () => {
      expect(isAutoTag('public-event')).toBe(true);
    });
  });

  describe('manual tags', () => {
    it('should not flag manual WA tags', () => {
      expect(isAutoTag('featured')).toBe(false);
      expect(isAutoTag('members-only')).toBe(false);
      expect(isAutoTag('new-member')).toBe(false);
      expect(isAutoTag('special')).toBe(false);
      expect(isAutoTag('social')).toBe(false);
    });

    it('should not flag tags with similar but different prefixes', () => {
      expect(isAutoTag('timer:5min')).toBe(false);
      expect(isAutoTag('costing:analysis')).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// GET DISPLAY TAGS
// ═══════════════════════════════════════════════════════════════

describe('getDisplayTags', () => {
  const sampleTags = [
    'featured',
    'special-event',
    'time:morning',
    'cost:free',
    'committee:hikers',
    'public-event',
    'new-member',
  ];

  describe('default behavior (hide auto tags)', () => {
    it('should filter out auto-generated tags by default', () => {
      const display = getDisplayTags(sampleTags);
      expect(display).toContain('featured');
      expect(display).toContain('special-event');
      expect(display).toContain('new-member');
      expect(display).not.toContain('time:morning');
      expect(display).not.toContain('cost:free');
      expect(display).not.toContain('committee:hikers');
      expect(display).not.toContain('public-event');
    });

    it('should return only manual tags', () => {
      const display = getDisplayTags(sampleTags);
      expect(display).toEqual(['featured', 'special-event', 'new-member']);
    });
  });

  describe('hidden tags', () => {
    it('should filter out hidden tags', () => {
      const display = getDisplayTags(sampleTags, ['featured', 'new-member']);
      expect(display).not.toContain('featured');
      expect(display).not.toContain('new-member');
      expect(display).toContain('special-event');
    });

    it('should combine hidden tags with auto-tag filtering', () => {
      const display = getDisplayTags(sampleTags, ['special-event']);
      expect(display).toEqual(['featured', 'new-member']);
    });
  });

  describe('showAutoTags option', () => {
    it('should include auto tags when showAutoTags is true', () => {
      const display = getDisplayTags(sampleTags, [], true);
      expect(display).toContain('time:morning');
      expect(display).toContain('cost:free');
      expect(display).toContain('committee:hikers');
      expect(display).toContain('public-event');
    });

    it('should still respect hidden tags when showing auto tags', () => {
      const display = getDisplayTags(sampleTags, ['cost:free'], true);
      expect(display).not.toContain('cost:free');
      expect(display).toContain('time:morning');
    });
  });

  describe('edge cases', () => {
    it('should handle empty tags array', () => {
      expect(getDisplayTags([])).toEqual([]);
    });

    it('should handle all auto tags', () => {
      const autoOnly = ['time:morning', 'cost:free', 'public-event'];
      expect(getDisplayTags(autoOnly)).toEqual([]);
    });

    it('should handle all hidden tags', () => {
      const tags = ['featured', 'special'];
      expect(getDisplayTags(tags, ['featured', 'special'])).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// MERGE CONFIG
// ═══════════════════════════════════════════════════════════════

describe('mergeConfig', () => {
  interface TestConfig {
    stringProp: string;
    numberProp: number;
    boolProp: boolean;
    nestedObj: { a: boolean; b: boolean; c: boolean };
    arrayProp: string[];
  }

  const baseConfig: TestConfig = {
    stringProp: 'default',
    numberProp: 10,
    boolProp: true,
    nestedObj: { a: true, b: true, c: true },
    arrayProp: ['one', 'two'],
  };

  describe('basic merging', () => {
    it('should return base if no overrides', () => {
      expect(mergeConfig(baseConfig, undefined)).toBe(baseConfig);
      expect(mergeConfig(baseConfig, {})).toBe(baseConfig);
    });

    it('should override primitive values', () => {
      const result = mergeConfig(baseConfig, {
        stringProp: 'overridden',
        numberProp: 20,
      });
      expect(result.stringProp).toBe('overridden');
      expect(result.numberProp).toBe(20);
      expect(result.boolProp).toBe(true); // unchanged
    });

    it('should override boolean values', () => {
      const result = mergeConfig(baseConfig, { boolProp: false });
      expect(result.boolProp).toBe(false);
    });
  });

  describe('nested object merging', () => {
    it('should shallow merge nested objects', () => {
      const result = mergeConfig(baseConfig, {
        nestedObj: { b: false },
      });
      expect(result.nestedObj.a).toBe(true); // preserved from base
      expect(result.nestedObj.b).toBe(false); // overridden
      expect(result.nestedObj.c).toBe(true); // preserved from base
    });
  });

  describe('array handling', () => {
    it('should replace arrays entirely', () => {
      const result = mergeConfig(baseConfig, {
        arrayProp: ['three'],
      });
      expect(result.arrayProp).toEqual(['three']);
    });
  });

  describe('immutability', () => {
    it('should not mutate base config', () => {
      const original = { ...baseConfig, nestedObj: { ...baseConfig.nestedObj } };
      mergeConfig(baseConfig, { stringProp: 'changed' });
      expect(baseConfig.stringProp).toBe(original.stringProp);
    });
  });

  describe('real-world config usage', () => {
    interface ClubCalConfig {
      showMyEvents: boolean;
      quickFilters: { weekend: boolean; free: boolean; public: boolean };
      showEventTags: boolean;
    }

    const baseClubConfig: ClubCalConfig = {
      showMyEvents: true,
      quickFilters: { weekend: true, free: true, public: true },
      showEventTags: true,
    };

    it('should apply member config overrides', () => {
      const memberOverrides = {
        quickFilters: { public: false },
      };
      const result = mergeConfig(baseClubConfig, memberOverrides);
      expect(result.quickFilters.weekend).toBe(true);
      expect(result.quickFilters.free).toBe(true);
      expect(result.quickFilters.public).toBe(false);
      expect(result.showMyEvents).toBe(true);
    });

    it('should apply public config overrides', () => {
      const publicOverrides = {
        showMyEvents: false,
        showEventTags: false,
      };
      const result = mergeConfig(baseClubConfig, publicOverrides);
      expect(result.showMyEvents).toBe(false);
      expect(result.showEventTags).toBe(false);
      expect(result.quickFilters.weekend).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION: transformEvent with new derivations
// ═══════════════════════════════════════════════════════════════

describe('transformEvent with new tag derivations', () => {
  function createTestEvent(overrides: Partial<WaEvent> = {}): WaEvent {
    return {
      Id: 1,
      Name: 'Test Event',
      StartDate: new Date().toISOString(),
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationTypes: [],
      ...overrides,
    };
  }

  describe('event type tags', () => {
    it('should add type:workshop tag', () => {
      const event = createTestEvent({ Name: 'Garden: Spring Workshop' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('type:workshop');
    });

    it('should add type:hike tag', () => {
      const event = createTestEvent({ Name: 'Happy Hikers: Morning Hike' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('type:hike');
    });

    it('should add type:tasting tag', () => {
      const event = createTestEvent({ Name: 'Wine Appreciation: Monthly Tasting' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('type:tasting');
    });
  });

  describe('recurring tags', () => {
    it('should add recurring:weekly tag', () => {
      const event = createTestEvent({ Name: 'Games!: Weekly Bridge' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('recurring:weekly');
    });

    it('should add recurring:monthly tag', () => {
      const event = createTestEvent({ Name: 'Wine Appreciation: Monthly Tasting' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('recurring:monthly');
    });
  });

  describe('venue tags', () => {
    it('should add venue:outdoor for park events', () => {
      const event = createTestEvent({
        Name: 'Picnic Event',
        Location: 'Alameda Park'
      });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('venue:outdoor');
    });

    it('should add venue:outdoor for hike events', () => {
      const event = createTestEvent({ Name: 'Happy Hikers: Trail Hike' });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('venue:outdoor');
    });

    it('should add venue:outdoor for beach events', () => {
      const event = createTestEvent({
        Name: 'Beach Bonfire',
        Location: 'East Beach'
      });
      const transformed = transformEvent(event, []);
      expect(transformed.tags).toContain('venue:outdoor');
    });
  });

  describe('combined derivations', () => {
    it('should derive multiple tags from one event', () => {
      const event = createTestEvent({
        Name: 'Happy Hikers: Weekly Trail Hike',
        Location: 'Stevens Park'
      });
      const transformed = transformEvent(event, []);

      // Should have activity (from committee), type (from "hike"), recurring (from "weekly"), venue (from "park")
      expect(transformed.tags).toContain('activity:physical');
      expect(transformed.tags).toContain('type:hike');
      expect(transformed.tags).toContain('recurring:weekly');
      expect(transformed.tags).toContain('venue:outdoor');
    });

    it('should not add duplicate tags', () => {
      const event = createTestEvent({ Name: 'Happy Hikers: Hike at Park' });
      const transformed = transformEvent(event, []);

      // venue:outdoor could be triggered by both "hike" and "park", should only appear once
      const venueCount = transformed.tags.filter(t => t === 'venue:outdoor').length;
      expect(venueCount).toBe(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// EVENT_TYPE_KEYWORDS constant
// ═══════════════════════════════════════════════════════════════

describe('EVENT_TYPE_KEYWORDS constant', () => {
  it('should have expected keywords', () => {
    expect(EVENT_TYPE_KEYWORDS).toHaveProperty('workshop');
    expect(EVENT_TYPE_KEYWORDS).toHaveProperty('tasting');
    expect(EVENT_TYPE_KEYWORDS).toHaveProperty('hike');
    expect(EVENT_TYPE_KEYWORDS).toHaveProperty('walk');
    expect(EVENT_TYPE_KEYWORDS).toHaveProperty('happy hour');
  });

  it('should map to type: prefixed tags', () => {
    for (const tag of Object.values(EVENT_TYPE_KEYWORDS)) {
      expect(tag.startsWith('type:')).toBe(true);
    }
  });
});
