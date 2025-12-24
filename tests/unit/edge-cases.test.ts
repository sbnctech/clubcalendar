/**
 * Edge case and malformed data tests for ClubCalendar
 * Tests handling of missing fields, null values, and unexpected data
 */

import { describe, it, expect } from 'vitest';
import {
  transformEvent,
  extractPricing,
  deriveAvailability,
  deriveTimeOfDay,
  isWeekend,
  deriveCostCategory,
  deriveActivityType,
  isPublicEvent,
  extractCommittee,
  getCleanTitle,
  WaEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// MINIMAL EVENTS (Required fields only)
// ═══════════════════════════════════════════════════════════════

describe('Minimal event data', () => {
  it('should handle event with only Id and Name', () => {
    const minimalEvent: WaEvent = {
      Id: 1,
      Name: 'Minimal Event',
      StartDate: new Date().toISOString(),
    };

    const transformed = transformEvent(minimalEvent, []);

    expect(transformed.id).toBe(1);
    expect(transformed.name).toBe('Minimal Event');
    expect(transformed.location).toBe('');
    expect(transformed.description).toBe('');
    expect(transformed.spotsAvailable).toBeNull();
    expect(transformed.limit).toBeNull();
    expect(transformed.isFree).toBe(true); // No registration types = free
    expect(transformed.isPublic).toBe(true); // No registration = public
  });

  it('should handle event with empty strings', () => {
    const emptyStringsEvent: WaEvent = {
      Id: 2,
      Name: '',
      StartDate: '',
      Location: '',
      Url: '',
    };

    const transformed = transformEvent(emptyStringsEvent, []);

    expect(transformed.name).toBe('');
    expect(transformed.location).toBe('');
    // Should still have a URL (fallback)
    expect(transformed.url).toContain('event-2');
  });
});

// ═══════════════════════════════════════════════════════════════
// NULL AND UNDEFINED VALUES
// ═══════════════════════════════════════════════════════════════

describe('Null and undefined values', () => {
  it('should handle null RegistrationsLimit', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 100,
    };

    const transformed = transformEvent(event, []);
    expect(transformed.spotsAvailable).toBeNull();
    expect(transformed.isFull).toBe(false);
    expect(transformed.tags).toContain('availability:open');
  });

  it('should handle undefined ConfirmedRegistrationsCount', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationsLimit: 20,
      // ConfirmedRegistrationsCount is undefined
    };

    const transformed = transformEvent(event, []);
    expect(transformed.confirmed).toBe(0);
    expect(transformed.spotsAvailable).toBe(20);
  });

  it('should handle null AccessLevel', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      AccessLevel: undefined,
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    };

    const transformed = transformEvent(event, []);
    expect(transformed.accessLevel).toBe('Public'); // Default
  });

  it('should handle null RegistrationTypes', () => {
    const event = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: null,
    } as unknown as WaEvent;

    // Should not throw
    const pricing = extractPricing(event);
    expect(pricing.isFree).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// MALFORMED REGISTRATION TYPES
// ═══════════════════════════════════════════════════════════════

describe('Malformed RegistrationTypes', () => {
  it('should handle empty RegistrationTypes array', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [],
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(0);
    expect(pricing.maxPrice).toBe(0);
    expect(pricing.isFree).toBe(true);
  });

  it('should handle RegistrationType without any price fields', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [
        { Id: 1, Name: 'Member' }, // No price fields
      ],
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(0); // Falls back to 0
    expect(pricing.isFree).toBe(true);
  });

  it('should handle mixed price fields', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [
        { Id: 1, BasePrice: 25 },
        { Id: 2, Price: 35 },
        { Id: 3, CurrentPrice: 45 },
        { Id: 4 }, // No price
      ],
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(0); // From the one with no price
    expect(pricing.maxPrice).toBe(45);
  });

  it('should handle negative prices', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [
        { Id: 1, BasePrice: -10 }, // Weird but possible
        { Id: 2, BasePrice: 20 },
      ],
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(-10);
  });

  it('should handle string prices (type coercion)', () => {
    const event = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [
        { Id: 1, BasePrice: '25' as unknown as number },
      ],
    } as WaEvent;

    // TypeScript says number but runtime could be string
    const pricing = extractPricing(event);
    // Comparison operators work with string numbers
    expect(pricing.minPrice).toBe('25');
  });
});

// ═══════════════════════════════════════════════════════════════
// MALFORMED DATES
// ═══════════════════════════════════════════════════════════════

describe('Malformed dates', () => {
  it('should handle invalid date string', () => {
    const result = deriveTimeOfDay('not-a-date');
    // Should not throw, returns some value
    expect(['time:morning', 'time:afternoon', 'time:evening']).toContain(result);
  });

  it('should handle empty date string', () => {
    const result = deriveTimeOfDay('');
    expect(['time:morning', 'time:afternoon', 'time:evening', null]).toContain(result);
  });

  it('should handle date with timezone', () => {
    expect(deriveTimeOfDay('2024-06-15T10:00:00Z')).toBe('time:morning');
    expect(deriveTimeOfDay('2024-06-15T10:00:00+05:00')).toBeDefined();
  });

  it('should handle ISO date without time', () => {
    const result = deriveTimeOfDay('2024-06-15');
    expect(['time:morning', 'time:afternoon', 'time:evening']).toContain(result);
  });

  it('should handle very old dates', () => {
    expect(isWeekend('1900-01-01T12:00:00')).toBeDefined();
  });

  it('should handle very future dates', () => {
    expect(isWeekend('2099-12-31T12:00:00')).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// MALFORMED TAGS
// ═══════════════════════════════════════════════════════════════

describe('Malformed Tags', () => {
  it('should handle Tags as comma-separated string', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Tags: 'tag1, tag2, tag3',
    };

    const transformed = transformEvent(event, []);
    expect(transformed.tags).toContain('tag1');
    expect(transformed.tags).toContain('tag2');
    expect(transformed.tags).toContain('tag3');
  });

  it('should handle Tags as array', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Tags: ['tag1', 'tag2', 'tag3'],
    };

    const transformed = transformEvent(event, []);
    expect(transformed.tags).toContain('tag1');
    expect(transformed.tags).toContain('tag2');
    expect(transformed.tags).toContain('tag3');
  });

  it('should handle Tags with empty values', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Tags: 'tag1, , tag2, , ',
    };

    const transformed = transformEvent(event, []);
    expect(transformed.tags).toContain('tag1');
    expect(transformed.tags).toContain('tag2');
    expect(transformed.tags).not.toContain('');
  });

  it('should handle Tags with whitespace', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Tags: '  tag1  ,  tag2  ',
    };

    const transformed = transformEvent(event, []);
    expect(transformed.tags).toContain('tag1');
    expect(transformed.tags).toContain('tag2');
  });
});

// ═══════════════════════════════════════════════════════════════
// EXTREME VALUES
// ═══════════════════════════════════════════════════════════════

describe('Extreme values', () => {
  it('should handle very large registration counts', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationsLimit: 999999,
      ConfirmedRegistrationsCount: 500000,
    };

    const transformed = transformEvent(event, []);
    expect(transformed.spotsAvailable).toBe(499999);
    expect(transformed.tags).toContain('availability:open');
  });

  it('should handle zero limit', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationsLimit: 0,
      ConfirmedRegistrationsCount: 0,
    };

    // Zero limit is falsy, so treated as "no limit" = open
    // This is arguably a bug in the production code, but testing actual behavior
    expect(deriveAvailability(event)).toBe('availability:open');
  });

  it('should handle very long event names', () => {
    const longName = 'A'.repeat(1000) + ': ' + 'B'.repeat(1000);
    const event: WaEvent = {
      Id: 1,
      Name: longName,
      StartDate: new Date().toISOString(),
    };

    const transformed = transformEvent(event, []);
    expect(transformed.name).toBe(longName);
  });

  it('should handle very high prices', () => {
    expect(deriveCostCategory(99999)).toBe('cost:over-100');
    expect(deriveCostCategory(1000000)).toBe('cost:over-100');
  });
});

// ═══════════════════════════════════════════════════════════════
// SPECIAL EVENT NAMES
// ═══════════════════════════════════════════════════════════════

describe('Special event names', () => {
  it('should handle name with only colon', () => {
    expect(extractCommittee(':')).toBe('General');
    expect(getCleanTitle(':')).toBe(':');
  });

  it('should handle name with multiple colons', () => {
    expect(extractCommittee('Group: Event: Details')).toBe('Group');
    expect(getCleanTitle('Group: Event: Details')).toBe('Event: Details');
  });

  it('should handle name with colon at position 30+', () => {
    const name = 'This is a very long committee name here: Event';
    expect(extractCommittee(name)).toBe('General');
    expect(getCleanTitle(name)).toBe(name);
  });

  it('should handle unicode in names', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Café: Événement Spécial 日本語',
      StartDate: new Date().toISOString(),
    };

    const transformed = transformEvent(event, []);
    expect(transformed.name).toBe('Café: Événement Spécial 日本語');
    expect(extractCommittee(transformed.name)).toBe('Café');
  });

  it('should handle emoji in names', () => {
    const event: WaEvent = {
      Id: 1,
      Name: '🎉 Party: Fun Event 🎈',
      StartDate: new Date().toISOString(),
    };

    const transformed = transformEvent(event, []);
    expect(transformed.name).toContain('🎉');
  });
});

// ═══════════════════════════════════════════════════════════════
// NESTED DETAILS OBJECT
// ═══════════════════════════════════════════════════════════════

describe('Nested Details object', () => {
  it('should prefer top-level RegistrationTypes over Details', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      RegistrationTypes: [{ Id: 1, BasePrice: 50 }],
      Details: {
        RegistrationTypes: [{ Id: 2, BasePrice: 100 }],
      },
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(50); // From top-level
  });

  it('should fall back to Details.RegistrationTypes', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Details: {
        RegistrationTypes: [{ Id: 1, BasePrice: 75 }],
      },
    };

    const pricing = extractPricing(event);
    expect(pricing.minPrice).toBe(75);
  });

  it('should handle empty Details object', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Details: {},
    };

    const pricing = extractPricing(event);
    expect(pricing.isFree).toBe(true);
  });

  it('should handle Details with only DescriptionHtml', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Test',
      StartDate: new Date().toISOString(),
      Details: {
        DescriptionHtml: '<p>Description</p>',
      },
    };

    const transformed = transformEvent(event, []);
    expect(transformed.description).toBe('<p>Description</p>');
  });
});

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE EDGE CASES
// ═══════════════════════════════════════════════════════════════

describe('Activity type edge cases', () => {
  it('should handle partial committee matches', () => {
    // "Happy" DOES match "Happy Hikers" due to partial matching in the code
    // The code does: committee.includes(prefix) || prefix.includes(committee)
    // "Happy Hikers".includes("Happy") = true, so it matches
    expect(deriveActivityType('Happy: Event')).toBe('activity:physical');

    // But completely unrelated prefixes don't match
    expect(deriveActivityType('Cooking: Event')).toBeNull();
  });

  it('should handle similar committee names', () => {
    expect(deriveActivityType('Games!: Event')).toBe('activity:games');
    expect(deriveActivityType('Games: Event')).toBe('activity:games');
  });

  it('should be case-sensitive for activity type mapping', () => {
    // The map uses exact keys, but we do partial matching
    expect(deriveActivityType('happy hikers: Event')).toBeNull(); // Lowercase
  });
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC EVENT EDGE CASES
// ═══════════════════════════════════════════════════════════════

describe('Public event edge cases', () => {
  it('should be public when AccessLevel is exactly "Public"', () => {
    expect(isPublicEvent({
      Id: 1,
      Name: 'Test',
      StartDate: '',
      AccessLevel: 'Public',
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    })).toBe(true);
  });

  it('should not be public for similar access levels', () => {
    expect(isPublicEvent({
      Id: 1,
      Name: 'Test',
      StartDate: '',
      AccessLevel: 'PublicAccess',
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    })).toBe(false);

    expect(isPublicEvent({
      Id: 1,
      Name: 'Test',
      StartDate: '',
      AccessLevel: 'public', // lowercase
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    })).toBe(false);
  });

  it('should be public when RegistrationEnabled is explicitly false', () => {
    expect(isPublicEvent({
      Id: 1,
      Name: 'Test',
      StartDate: '',
      AccessLevel: 'MembersOnly',
      RegistrationEnabled: false,
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    })).toBe(true);
  });
});
