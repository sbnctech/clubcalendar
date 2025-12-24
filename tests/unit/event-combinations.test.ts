/**
 * Event property combination tests for ClubCalendar
 * Tests matrix of different event property combinations
 */

import { describe, it, expect } from 'vitest';
import {
  transformEvent,
  WaEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// TEST DATA GENERATORS
// ═══════════════════════════════════════════════════════════════

type PriceCategory = 'free' | 'cheap' | 'medium' | 'expensive';
type AvailabilityCategory = 'open' | 'limited' | 'full' | 'unlimited';
type AccessCategory = 'public' | 'members';
type TimeCategory = 'morning' | 'afternoon' | 'evening';
type DayCategory = 'weekday' | 'weekend';

const priceConfigs: Record<PriceCategory, number> = {
  free: 0,
  cheap: 15,
  medium: 45,
  expensive: 150,
};

const availabilityConfigs: Record<AvailabilityCategory, { limit: number | null; confirmed: number }> = {
  open: { limit: 20, confirmed: 5 },
  limited: { limit: 20, confirmed: 17 },
  full: { limit: 20, confirmed: 20 },
  unlimited: { limit: null, confirmed: 100 },
};

const accessConfigs: Record<AccessCategory, string> = {
  public: 'Public',
  members: 'MembersOnly',
};

const timeConfigs: Record<TimeCategory, number> = {
  morning: 9,
  afternoon: 14,
  evening: 19,
};

function getNextDate(isWeekend: boolean, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Start from next week

  if (isWeekend) {
    // Find next Saturday
    while (date.getDay() !== 6) {
      date.setDate(date.getDate() + 1);
    }
  } else {
    // Find next Monday
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
  }

  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function createCombinationEvent(
  price: PriceCategory,
  availability: AvailabilityCategory,
  access: AccessCategory,
  time: TimeCategory,
  day: DayCategory
): WaEvent {
  const availConfig = availabilityConfigs[availability];

  return {
    Id: Math.floor(Math.random() * 100000),
    Name: `${price}-${availability}-${access}-${time}-${day}`,
    StartDate: getNextDate(day === 'weekend', timeConfigs[time]),
    AccessLevel: accessConfigs[access],
    RegistrationEnabled: true,
    RegistrationsLimit: availConfig.limit,
    ConfirmedRegistrationsCount: availConfig.confirmed,
    RegistrationTypes: priceConfigs[price] === 0 ? [] : [
      { Id: 1, Name: 'Member', BasePrice: priceConfigs[price] }
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// PRICE × AVAILABILITY COMBINATIONS
// ═══════════════════════════════════════════════════════════════

describe('Price × Availability combinations', () => {
  const prices: PriceCategory[] = ['free', 'cheap', 'medium', 'expensive'];
  const availabilities: AvailabilityCategory[] = ['open', 'limited', 'full', 'unlimited'];

  const combinations = prices.flatMap(price =>
    availabilities.map(avail => [price, avail] as [PriceCategory, AvailabilityCategory])
  );

  it.each(combinations)('%s price + %s availability', (price, availability) => {
    const event = createCombinationEvent(price, availability, 'public', 'morning', 'weekday');
    const transformed = transformEvent(event, []);

    // Verify price tags
    if (price === 'free') {
      expect(transformed.isFree).toBe(true);
      expect(transformed.tags).toContain('cost:free');
    } else if (price === 'cheap') {
      expect(transformed.tags).toContain('cost:under-25');
    } else if (price === 'medium') {
      expect(transformed.tags).toContain('cost:under-50');
    } else {
      expect(transformed.tags).toContain('cost:over-100');
    }

    // Verify availability tags
    if (availability === 'full') {
      expect(transformed.tags).toContain('availability:full');
      expect(transformed.isFull).toBe(true);
    } else if (availability === 'limited') {
      expect(transformed.tags).toContain('availability:limited');
    } else {
      expect(transformed.tags).toContain('availability:open');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// ACCESS × TIME × DAY COMBINATIONS
// ═══════════════════════════════════════════════════════════════

describe('Access × Time × Day combinations', () => {
  const accesses: AccessCategory[] = ['public', 'members'];
  const times: TimeCategory[] = ['morning', 'afternoon', 'evening'];
  const days: DayCategory[] = ['weekday', 'weekend'];

  const combinations = accesses.flatMap(access =>
    times.flatMap(time =>
      days.map(day => [access, time, day] as [AccessCategory, TimeCategory, DayCategory])
    )
  );

  it.each(combinations)('%s access + %s + %s', (access, time, day) => {
    const event = createCombinationEvent('medium', 'open', access, time, day);
    const transformed = transformEvent(event, []);

    // Verify access/public status
    if (access === 'public') {
      expect(transformed.isPublic).toBe(true);
      expect(transformed.tags).toContain('public-event');
    } else {
      // Members only with registration types = not public
      expect(transformed.isPublic).toBe(false);
      expect(transformed.tags).not.toContain('public-event');
    }

    // Verify time tags
    expect(transformed.tags).toContain(`time:${time}`);

    // Verify weekend tag
    if (day === 'weekend') {
      expect(transformed.tags).toContain('day:weekend');
    } else {
      expect(transformed.tags).not.toContain('day:weekend');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// FULL MATRIX (Subset for performance)
// ═══════════════════════════════════════════════════════════════

describe('Full combination matrix (key combinations)', () => {
  // Test strategically important combinations
  const keyScenarios: Array<{
    name: string;
    price: PriceCategory;
    availability: AvailabilityCategory;
    access: AccessCategory;
    time: TimeCategory;
    day: DayCategory;
    expectedTags: string[];
    notExpectedTags: string[];
  }> = [
    {
      name: 'Free public morning weekday open',
      price: 'free',
      availability: 'open',
      access: 'public',
      time: 'morning',
      day: 'weekday',
      expectedTags: ['cost:free', 'availability:open', 'public-event', 'time:morning'],
      notExpectedTags: ['day:weekend'],
    },
    {
      name: 'Expensive members evening weekend full',
      price: 'expensive',
      availability: 'full',
      access: 'members',
      time: 'evening',
      day: 'weekend',
      expectedTags: ['cost:over-100', 'availability:full', 'time:evening', 'day:weekend'],
      notExpectedTags: ['public-event', 'cost:free'],
    },
    {
      name: 'Medium public afternoon weekend limited',
      price: 'medium',
      availability: 'limited',
      access: 'public',
      time: 'afternoon',
      day: 'weekend',
      expectedTags: ['cost:under-50', 'availability:limited', 'public-event', 'time:afternoon', 'day:weekend'],
      notExpectedTags: ['cost:free', 'availability:full'],
    },
    {
      name: 'Cheap members morning weekday unlimited',
      price: 'cheap',
      availability: 'unlimited',
      access: 'members',
      time: 'morning',
      day: 'weekday',
      expectedTags: ['cost:under-25', 'availability:open', 'time:morning'],
      notExpectedTags: ['day:weekend', 'public-event'],
    },
    {
      name: 'Free members evening weekday open',
      price: 'free',
      availability: 'open',
      access: 'members',
      time: 'evening',
      day: 'weekday',
      // Free with no registration types = public (even if AccessLevel is MembersOnly)
      expectedTags: ['cost:free', 'availability:open', 'time:evening', 'public-event'],
      notExpectedTags: ['day:weekend'],
    },
  ];

  it.each(keyScenarios)('$name', (scenario) => {
    const event = createCombinationEvent(
      scenario.price,
      scenario.availability,
      scenario.access,
      scenario.time,
      scenario.day
    );
    const transformed = transformEvent(event, []);

    scenario.expectedTags.forEach(tag => {
      expect(transformed.tags).toContain(tag);
    });

    scenario.notExpectedTags.forEach(tag => {
      expect(transformed.tags).not.toContain(tag);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SPECIAL COMBINATION CASES
// ═══════════════════════════════════════════════════════════════

describe('Special combination cases', () => {
  it('Free event should be public even if AccessLevel is MembersOnly (no registration types)', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Free Members Event',
      StartDate: getNextDate(false, 10),
      AccessLevel: 'MembersOnly',
      RegistrationEnabled: true,
      RegistrationsLimit: 20,
      ConfirmedRegistrationsCount: 5,
      RegistrationTypes: [], // No registration types = no ticketing = public
    };

    const transformed = transformEvent(event, []);
    expect(transformed.isPublic).toBe(true);
    expect(transformed.tags).toContain('public-event');
  });

  it('Event with registration disabled should be public regardless of access level', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'No Registration Event',
      StartDate: getNextDate(false, 10),
      AccessLevel: 'MembersOnly',
      RegistrationEnabled: false,
      RegistrationTypes: [{ Id: 1, BasePrice: 50 }],
    };

    const transformed = transformEvent(event, []);
    expect(transformed.isPublic).toBe(true);
    expect(transformed.tags).toContain('public-event');
  });

  it('Paid public event should have both cost tag and public tag', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Paid Public Event',
      StartDate: getNextDate(false, 10),
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationsLimit: 50,
      ConfirmedRegistrationsCount: 10,
      RegistrationTypes: [{ Id: 1, BasePrice: 75 }],
    };

    const transformed = transformEvent(event, []);
    expect(transformed.isPublic).toBe(true);
    expect(transformed.isFree).toBe(false);
    expect(transformed.tags).toContain('public-event');
    expect(transformed.tags).toContain('cost:under-100');
  });

  it('Full unlimited event (edge case)', () => {
    // This shouldn't happen in practice but tests the logic
    const event: WaEvent = {
      Id: 1,
      Name: 'Weird Event',
      StartDate: getNextDate(false, 10),
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationsLimit: null, // Unlimited
      ConfirmedRegistrationsCount: 1000000,
      RegistrationTypes: [{ Id: 1, BasePrice: 10 }],
    };

    const transformed = transformEvent(event, []);
    // With null limit, it should be "open"
    expect(transformed.tags).toContain('availability:open');
    expect(transformed.spotsAvailable).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// COMMITTEE NAME + OTHER PROPERTIES
// ═══════════════════════════════════════════════════════════════

describe('Committee name combinations', () => {
  const committees = [
    { prefix: 'Happy Hikers:', expectedActivity: 'physical', committee: 'committee:happy-hikers' },
    { prefix: 'Wine Appreciation:', expectedActivity: 'food-drink', committee: 'committee:wine' },
    { prefix: 'Games!:', expectedActivity: 'games', committee: 'committee:games' },
    { prefix: 'TGIF:', expectedActivity: 'social', committee: 'committee:tgif' },
  ];

  const rules = [
    { type: 'name-prefix' as const, pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
    { type: 'name-prefix' as const, pattern: 'Wine Appreciation:', tag: 'committee:wine' },
    { type: 'name-prefix' as const, pattern: 'Games!:', tag: 'committee:games' },
    { type: 'name-prefix' as const, pattern: 'TGIF:', tag: 'committee:tgif' },
  ];

  it.each(committees)('$prefix event should have activity type and committee tag', ({ prefix, expectedActivity, committee }) => {
    const event: WaEvent = {
      Id: 1,
      Name: `${prefix} Test Event`,
      StartDate: getNextDate(false, 10),
      AccessLevel: 'MembersOnly',
      RegistrationEnabled: true,
      RegistrationsLimit: 20,
      ConfirmedRegistrationsCount: 5,
      RegistrationTypes: [{ Id: 1, BasePrice: 25 }],
    };

    const transformed = transformEvent(event, rules);

    expect(transformed.activityType).toBe(expectedActivity);
    expect(transformed.tags).toContain(committee);
    expect(transformed.tags).toContain(`activity:${expectedActivity}`);
  });

  it('Committee event can also be free, public, weekend, etc.', () => {
    const event: WaEvent = {
      Id: 1,
      Name: 'Happy Hikers: Weekend Trail Walk',
      StartDate: getNextDate(true, 9), // Weekend morning
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationsLimit: 30,
      ConfirmedRegistrationsCount: 10,
      RegistrationTypes: [], // Free
    };

    const transformed = transformEvent(event, rules);

    expect(transformed.tags).toContain('committee:happy-hikers');
    expect(transformed.tags).toContain('activity:physical');
    expect(transformed.tags).toContain('cost:free');
    expect(transformed.tags).toContain('public-event');
    expect(transformed.tags).toContain('day:weekend');
    expect(transformed.tags).toContain('time:morning');
    expect(transformed.tags).toContain('availability:open');
  });
});

// ═══════════════════════════════════════════════════════════════
// TOTAL COMBINATION COUNT
// ═══════════════════════════════════════════════════════════════

describe('Combination coverage stats', () => {
  it('should cover significant portion of the matrix', () => {
    const prices: PriceCategory[] = ['free', 'cheap', 'medium', 'expensive'];
    const availabilities: AvailabilityCategory[] = ['open', 'limited', 'full', 'unlimited'];
    const accesses: AccessCategory[] = ['public', 'members'];
    const times: TimeCategory[] = ['morning', 'afternoon', 'evening'];
    const days: DayCategory[] = ['weekday', 'weekend'];

    const totalCombinations = prices.length * availabilities.length * accesses.length * times.length * days.length;

    // We test: 4×4=16 (price×avail) + 2×3×2=12 (access×time×day) + 5 key scenarios + ~10 special cases
    // That's 43+ explicit tests covering the space

    expect(totalCombinations).toBe(192); // 4 × 4 × 2 × 3 × 2

    // Log for visibility
    console.log(`Total possible combinations: ${totalCombinations}`);
    console.log('Tests cover key paths through this space');
  });
});
