/**
 * Tests for text search filter functionality
 * Tests filterBySearch function
 */

import { describe, it, expect } from 'vitest';
import {
  filterBySearch,
  transformEvent,
  WaEvent,
  TransformedEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// TEST EVENT FACTORY
// ═══════════════════════════════════════════════════════════════

function createTestEvent(overrides: Partial<WaEvent> = {}): WaEvent {
  const now = new Date();
  now.setDate(now.getDate() + 7); // Future date
  now.setHours(10, 0, 0, 0);

  return {
    Id: Math.floor(Math.random() * 10000),
    Name: 'Test Event',
    StartDate: now.toISOString(),
    AccessLevel: 'Public',
    RegistrationEnabled: true,
    RegistrationTypes: [],
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// TEST EVENTS
// ═══════════════════════════════════════════════════════════════

const wineEvent = transformEvent(createTestEvent({
  Id: 1,
  Name: 'Wine Appreciation: Monthly Tasting',
  Location: 'Community Center',
  Details: { DescriptionHtml: 'Join us for a delightful wine tasting experience.' }
}));

const hikeEvent = transformEvent(createTestEvent({
  Id: 2,
  Name: 'Happy Hikers: Morning Hike',
  Location: 'State Park Trailhead',
  Details: { DescriptionHtml: 'Explore beautiful mountain trails with fellow hikers.' }
}));

const gameNightEvent = transformEvent(createTestEvent({
  Id: 3,
  Name: 'Games!: Board Game Night',
  Location: 'Library Meeting Room',
  Details: { DescriptionHtml: 'Strategy games, card games, and friendly competition.' }
}));

const cookingEvent = transformEvent(createTestEvent({
  Id: 4,
  Name: 'Epicurious: Italian Cooking Class',
  Location: 'Kitchen Studio',
  Details: { DescriptionHtml: 'Learn to make authentic pasta and wine pairings.' }
}));

const lectureEvent = transformEvent(createTestEvent({
  Id: 5,
  Name: 'Current Events: Guest Lecture',
  Location: 'Auditorium',
  Details: { DescriptionHtml: 'Distinguished professor discusses mountain ecosystems.' }
}));

const allEvents: TransformedEvent[] = [
  wineEvent,
  hikeEvent,
  gameNightEvent,
  cookingEvent,
  lectureEvent
];

// ═══════════════════════════════════════════════════════════════
// BASIC SEARCH FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════

describe('filterBySearch', () => {
  describe('empty/null search', () => {
    it('should return all events for empty string', () => {
      const result = filterBySearch(allEvents, '');
      expect(result.length).toBe(allEvents.length);
    });

    it('should return all events for whitespace only', () => {
      const result = filterBySearch(allEvents, '   ');
      expect(result.length).toBe(allEvents.length);
    });

    it('should return all events for null-like values', () => {
      const result = filterBySearch(allEvents, null as unknown as string);
      expect(result.length).toBe(allEvents.length);
    });
  });

  describe('search by event name', () => {
    it('should find events by exact word in name', () => {
      // Search for "Appreciation" which only appears in wine event name
      const result = filterBySearch(allEvents, 'Appreciation');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(wineEvent.id);
    });

    it('should find events by partial word in name', () => {
      const result = filterBySearch(allEvents, 'Hik');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(hikeEvent.id);
    });

    it('should find events by committee prefix', () => {
      const result = filterBySearch(allEvents, 'Epicurious');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(cookingEvent.id);
    });

    it('should find multiple events matching name', () => {
      // Both "Game Night" event and any others with "game" in name
      const result = filterBySearch(allEvents, 'Game');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(gameNightEvent.id);
    });
  });

  describe('search by description', () => {
    it('should find events by word in description', () => {
      const result = filterBySearch(allEvents, 'pasta');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(cookingEvent.id);
    });

    it('should find events by phrase in description', () => {
      const result = filterBySearch(allEvents, 'mountain trails');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(hikeEvent.id);
    });

    it('should find multiple events with same word in description', () => {
      // "wine" appears in wine event name and cooking event description
      const result = filterBySearch(allEvents, 'wine');
      expect(result.length).toBe(2);
      expect(result.map(e => e.id)).toContain(wineEvent.id);
      expect(result.map(e => e.id)).toContain(cookingEvent.id);
    });
  });

  describe('search by location', () => {
    it('should find events by location', () => {
      const result = filterBySearch(allEvents, 'Library');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(gameNightEvent.id);
    });

    it('should find events by partial location', () => {
      const result = filterBySearch(allEvents, 'Park');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(hikeEvent.id);
    });

    it('should find events by common location word', () => {
      // "Community Center" and any others with "Center"
      const result = filterBySearch(allEvents, 'Center');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(wineEvent.id);
    });
  });

  describe('case insensitivity', () => {
    it('should match regardless of case - lowercase search', () => {
      const result = filterBySearch(allEvents, 'wine');
      expect(result.length).toBe(2);
    });

    it('should match regardless of case - uppercase search', () => {
      const result = filterBySearch(allEvents, 'WINE');
      expect(result.length).toBe(2);
    });

    it('should match regardless of case - mixed case search', () => {
      const result = filterBySearch(allEvents, 'WiNe');
      expect(result.length).toBe(2);
    });
  });

  describe('combined field matching', () => {
    it('should find event matching name only', () => {
      const result = filterBySearch(allEvents, 'Tasting');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(wineEvent.id);
    });

    it('should find event matching description only', () => {
      const result = filterBySearch(allEvents, 'professor');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(lectureEvent.id);
    });

    it('should find event matching location only', () => {
      const result = filterBySearch(allEvents, 'Auditorium');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(lectureEvent.id);
    });

    it('should find events matching across different fields', () => {
      // "mountain" appears in hike description and lecture description
      const result = filterBySearch(allEvents, 'mountain');
      expect(result.length).toBe(2);
      expect(result.map(e => e.id)).toContain(hikeEvent.id);
      expect(result.map(e => e.id)).toContain(lectureEvent.id);
    });
  });

  describe('no matches', () => {
    it('should return empty array for non-matching search', () => {
      const result = filterBySearch(allEvents, 'xyz123nonexistent');
      expect(result.length).toBe(0);
    });

    it('should return empty array for very specific non-match', () => {
      const result = filterBySearch(allEvents, 'underwater basket weaving');
      expect(result.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle events without description', () => {
      const eventNoDesc = transformEvent(createTestEvent({
        Id: 100,
        Name: 'No Description Event',
        Location: 'Somewhere',
        Details: {}
      }));

      const events = [eventNoDesc];
      const result = filterBySearch(events, 'Description');
      expect(result.length).toBe(1); // Matches name
    });

    it('should handle events without location', () => {
      const eventNoLoc = transformEvent(createTestEvent({
        Id: 101,
        Name: 'No Location Event',
      }));

      const events = [eventNoLoc];
      const result = filterBySearch(events, 'Location');
      expect(result.length).toBe(1); // Matches name
    });

    it('should handle special characters in search', () => {
      const eventWithSpecial = transformEvent(createTestEvent({
        Id: 102,
        Name: 'Event (Special!): Test',
      }));

      const events = [eventWithSpecial];
      const result = filterBySearch(events, 'Special!');
      expect(result.length).toBe(1);
    });

    it('should handle search with leading/trailing whitespace', () => {
      const result = filterBySearch(allEvents, '  Wine  ');
      expect(result.length).toBe(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION WITH OTHER FILTERS
// ═══════════════════════════════════════════════════════════════

describe('Search filter integration', () => {
  it('should be chainable with other array methods', () => {
    // Filter by search, then sort by name
    const result = filterBySearch(allEvents, 'wine')
      .sort((a, b) => a.name.localeCompare(b.name));

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Epicurious: Italian Cooking Class');
    expect(result[1].name).toBe('Wine Appreciation: Monthly Tasting');
  });

  it('should work with pre-filtered arrays', () => {
    // First filter to events with "wine" in any field
    const wineRelated = filterBySearch(allEvents, 'wine');

    // Then filter those to events in specific location
    const result = filterBySearch(wineRelated, 'Kitchen');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(cookingEvent.id);
  });
});

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE CONSIDERATIONS
// ═══════════════════════════════════════════════════════════════

describe('Search filter performance', () => {
  it('should handle large event lists efficiently', () => {
    // Create 1000 test events
    const manyEvents: TransformedEvent[] = [];
    for (let i = 0; i < 1000; i++) {
      manyEvents.push(transformEvent(createTestEvent({
        Id: i,
        Name: `Event ${i}: ${i % 10 === 0 ? 'Wine' : 'Other'} Activity`,
        Location: `Location ${i}`,
        Details: { DescriptionHtml: `Description for event ${i}` }
      })));
    }

    const start = performance.now();
    const result = filterBySearch(manyEvents, 'Wine');
    const elapsed = performance.now() - start;

    expect(result.length).toBe(100); // Every 10th event has "Wine"
    expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
  });
});
