/**
 * Tests for new filter types: eventType, recurring, venue
 * These filters match events by their derived type:, recurring:, and venue: tags
 */

import { describe, it, expect } from 'vitest';
import {
  transformEvent,
  applyFilters,
  TransformedEvent,
  WaEvent,
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
// TEST EVENTS WITH SPECIFIC TAGS
// ═══════════════════════════════════════════════════════════════

// Events with type: tags
const workshopEvent = transformEvent(createTestEvent({
  Id: 1,
  Name: 'Garden: Spring Workshop',
}));

const tastingEvent = transformEvent(createTestEvent({
  Id: 2,
  Name: 'Wine Appreciation: Monthly Tasting',
}));

const hikeEvent = transformEvent(createTestEvent({
  Id: 3,
  Name: 'Happy Hikers: Morning Hike',
}));

const walkEvent = transformEvent(createTestEvent({
  Id: 4,
  Name: 'Local Heritage: Historic Walk',
}));

const tripEvent = transformEvent(createTestEvent({
  Id: 5,
  Name: 'Local Heritage: Day Trip to Solvang',
}));

const happyHourEvent = transformEvent(createTestEvent({
  Id: 6,
  Name: 'TGIF: Happy Hour',
}));

const gameNightEvent = transformEvent(createTestEvent({
  Id: 7,
  Name: 'Games!: Game Night',
}));

const lectureEvent = transformEvent(createTestEvent({
  Id: 8,
  Name: 'Current Events: Guest Lecture',
}));

// Events with recurring: tags
const weeklyEvent = transformEvent(createTestEvent({
  Id: 10,
  Name: 'Games!: Weekly Bridge',
}));

const monthlyEvent = transformEvent(createTestEvent({
  Id: 11,
  Name: 'Wine Appreciation: Monthly Tasting',
}));

// Events with venue: tags
const parkEvent = transformEvent(createTestEvent({
  Id: 20,
  Name: 'Happy Hikers: Walk',
  Location: 'Stevens Park',
}));

const beachEvent = transformEvent(createTestEvent({
  Id: 21,
  Name: 'Pop-Up: Beach Bonfire',
  Location: 'East Beach',
}));

const trailEvent = transformEvent(createTestEvent({
  Id: 22,
  Name: 'Happy Hikers: Trail Hike',
}));

// Event without any of the new tags
const regularEvent = transformEvent(createTestEvent({
  Id: 30,
  Name: 'General: Board Meeting',
  Location: 'Community Center',
}));

// ═══════════════════════════════════════════════════════════════
// VERIFY TAG GENERATION
// ═══════════════════════════════════════════════════════════════

describe('Tag generation for new filter types', () => {
  describe('type: tags', () => {
    it('should generate type:workshop tag', () => {
      expect(workshopEvent.tags).toContain('type:workshop');
    });

    it('should generate type:tasting tag', () => {
      expect(tastingEvent.tags).toContain('type:tasting');
    });

    it('should generate type:hike tag', () => {
      expect(hikeEvent.tags).toContain('type:hike');
    });

    it('should generate type:walk tag', () => {
      expect(walkEvent.tags).toContain('type:walk');
    });

    it('should generate type:trip tag', () => {
      expect(tripEvent.tags).toContain('type:trip');
    });

    it('should generate type:happy-hour tag', () => {
      expect(happyHourEvent.tags).toContain('type:happy-hour');
    });

    it('should generate type:game-night tag', () => {
      expect(gameNightEvent.tags).toContain('type:game-night');
    });

    it('should generate type:lecture tag', () => {
      expect(lectureEvent.tags).toContain('type:lecture');
    });
  });

  describe('recurring: tags', () => {
    it('should generate recurring:weekly tag', () => {
      expect(weeklyEvent.tags).toContain('recurring:weekly');
    });

    it('should generate recurring:monthly tag', () => {
      expect(monthlyEvent.tags).toContain('recurring:monthly');
    });
  });

  describe('venue: tags', () => {
    it('should generate venue:outdoor for park location', () => {
      expect(parkEvent.tags).toContain('venue:outdoor');
    });

    it('should generate venue:outdoor for beach location', () => {
      expect(beachEvent.tags).toContain('venue:outdoor');
    });

    it('should generate venue:outdoor for trail in name', () => {
      expect(trailEvent.tags).toContain('venue:outdoor');
    });

    it('should NOT generate venue:outdoor for indoor events', () => {
      expect(regularEvent.tags).not.toContain('venue:outdoor');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER BY EVENT TYPE
// ═══════════════════════════════════════════════════════════════

describe('Filter by event type', () => {
  const allEvents: TransformedEvent[] = [
    workshopEvent,
    tastingEvent,
    hikeEvent,
    walkEvent,
    tripEvent,
    happyHourEvent,
    gameNightEvent,
    lectureEvent,
    regularEvent,
  ];

  /**
   * Helper to filter by event type tag
   * In the widget, this is done in applyFilters by checking event.tags.includes(`type:${eventType}`)
   */
  function filterByEventType(events: TransformedEvent[], eventType: string): TransformedEvent[] {
    return events.filter(e => e.tags.includes(`type:${eventType}`));
  }

  it('should filter for workshop events', () => {
    const filtered = filterByEventType(allEvents, 'workshop');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(workshopEvent.id);
  });

  it('should filter for tasting events', () => {
    const filtered = filterByEventType(allEvents, 'tasting');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(tastingEvent.id);
  });

  it('should filter for hike events', () => {
    const filtered = filterByEventType(allEvents, 'hike');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(hikeEvent.id);
  });

  it('should filter for walk events', () => {
    const filtered = filterByEventType(allEvents, 'walk');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(walkEvent.id);
  });

  it('should filter for trip events', () => {
    const filtered = filterByEventType(allEvents, 'trip');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(tripEvent.id);
  });

  it('should filter for happy-hour events', () => {
    const filtered = filterByEventType(allEvents, 'happy-hour');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(happyHourEvent.id);
  });

  it('should filter for game-night events', () => {
    const filtered = filterByEventType(allEvents, 'game-night');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(gameNightEvent.id);
  });

  it('should filter for lecture events', () => {
    const filtered = filterByEventType(allEvents, 'lecture');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(lectureEvent.id);
  });

  it('should return empty for non-matching type', () => {
    const filtered = filterByEventType(allEvents, 'concert');
    expect(filtered.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER BY RECURRING
// ═══════════════════════════════════════════════════════════════

describe('Filter by recurring', () => {
  const allEvents: TransformedEvent[] = [
    weeklyEvent,
    monthlyEvent,
    regularEvent,
  ];

  function filterByRecurring(events: TransformedEvent[], recurring: string): TransformedEvent[] {
    return events.filter(e => e.tags.includes(`recurring:${recurring}`));
  }

  it('should filter for weekly events', () => {
    const filtered = filterByRecurring(allEvents, 'weekly');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(weeklyEvent.id);
  });

  it('should filter for monthly events', () => {
    const filtered = filterByRecurring(allEvents, 'monthly');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(monthlyEvent.id);
  });

  it('should return empty for daily (no daily events)', () => {
    const filtered = filterByRecurring(allEvents, 'daily');
    expect(filtered.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER BY VENUE
// ═══════════════════════════════════════════════════════════════

describe('Filter by venue', () => {
  const allEvents: TransformedEvent[] = [
    parkEvent,
    beachEvent,
    trailEvent,
    regularEvent,
  ];

  function filterByVenue(events: TransformedEvent[], venue: string): TransformedEvent[] {
    return events.filter(e => e.tags.includes(`venue:${venue}`));
  }

  it('should filter for outdoor events', () => {
    const filtered = filterByVenue(allEvents, 'outdoor');
    expect(filtered.length).toBe(3);
    expect(filtered.map(e => e.id)).toContain(parkEvent.id);
    expect(filtered.map(e => e.id)).toContain(beachEvent.id);
    expect(filtered.map(e => e.id)).toContain(trailEvent.id);
  });

  it('should exclude indoor events', () => {
    const filtered = filterByVenue(allEvents, 'outdoor');
    expect(filtered.map(e => e.id)).not.toContain(regularEvent.id);
  });
});

// ═══════════════════════════════════════════════════════════════
// COMBINED FILTERS
// ═══════════════════════════════════════════════════════════════

describe('Combined new filters', () => {
  // Create an event that has multiple new tags
  const weeklyOutdoorHikeEvent = transformEvent(createTestEvent({
    Id: 100,
    Name: 'Happy Hikers: Weekly Trail Hike',
    Location: 'State Park',
  }));

  it('should have all expected tags on combined event', () => {
    expect(weeklyOutdoorHikeEvent.tags).toContain('type:hike');
    expect(weeklyOutdoorHikeEvent.tags).toContain('recurring:weekly');
    expect(weeklyOutdoorHikeEvent.tags).toContain('venue:outdoor');
  });

  it('should match combined filters (AND logic)', () => {
    const allEvents = [weeklyOutdoorHikeEvent, workshopEvent, weeklyEvent, parkEvent];

    // Filter for weekly + outdoor + hike
    const filtered = allEvents.filter(e =>
      e.tags.includes('type:hike') &&
      e.tags.includes('recurring:weekly') &&
      e.tags.includes('venue:outdoor')
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(weeklyOutdoorHikeEvent.id);
  });

  it('should handle partial matches', () => {
    const allEvents = [weeklyOutdoorHikeEvent, workshopEvent, weeklyEvent, parkEvent];

    // Filter for only type:hike (should match the combined event)
    const hikeFiltered = allEvents.filter(e => e.tags.includes('type:hike'));
    expect(hikeFiltered.length).toBe(1);

    // Filter for only recurring:weekly (should match combined + weeklyEvent)
    const weeklyFiltered = allEvents.filter(e => e.tags.includes('recurring:weekly'));
    expect(weeklyFiltered.length).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// FILTER OPTIONS COVERAGE
// ═══════════════════════════════════════════════════════════════

describe('Filter options coverage', () => {
  const EVENT_TYPE_OPTIONS = [
    'workshop', 'tasting', 'trip', 'hike', 'walk',
    'happy-hour', 'game-night', 'discussion', 'lecture', 'class', 'performance'
  ];

  const RECURRING_OPTIONS = ['weekly', 'monthly', 'daily'];

  const VENUE_OPTIONS = ['outdoor'];

  it('should cover all event type options', () => {
    // Create events for each type
    const eventsByType = EVENT_TYPE_OPTIONS.map((type, i) => {
      let name = '';
      switch (type) {
        case 'workshop': name = 'Garden: Workshop'; break;
        case 'tasting': name = 'Wine: Tasting Event'; break;
        case 'trip': name = 'Heritage: Day Trip'; break;
        case 'hike': name = 'Hikers: Morning Hike'; break;
        case 'walk': name = 'Hikers: Nature Walk'; break;
        case 'happy-hour': name = 'TGIF: Happy Hour'; break;
        case 'game-night': name = 'Games: Game Night'; break;
        case 'discussion': name = 'Book Club: Discussion'; break;
        case 'lecture': name = 'Events: Guest Lecture'; break;
        case 'class': name = 'Garden: Pruning Class'; break;
        case 'performance': name = 'Arts: Dance Performance'; break;
        default: name = 'Event';
      }
      return transformEvent(createTestEvent({ Id: i + 200, Name: name }));
    });

    EVENT_TYPE_OPTIONS.forEach((type, i) => {
      expect(eventsByType[i].tags).toContain(`type:${type}`);
    });
  });

  it('should cover all recurring options', () => {
    const weeklyE = transformEvent(createTestEvent({ Name: 'Weekly Event' }));
    const monthlyE = transformEvent(createTestEvent({ Name: 'Monthly Meeting' }));
    const dailyE = transformEvent(createTestEvent({ Name: 'Daily Standup' }));

    expect(weeklyE.tags).toContain('recurring:weekly');
    expect(monthlyE.tags).toContain('recurring:monthly');
    expect(dailyE.tags).toContain('recurring:daily');
  });

  it('should cover venue options', () => {
    const outdoorE = transformEvent(createTestEvent({
      Name: 'Outdoor Event',
      Location: 'City Park',
    }));

    expect(outdoorE.tags).toContain('venue:outdoor');
  });
});
