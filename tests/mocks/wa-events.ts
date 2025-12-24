/**
 * Mock WA API event data for testing
 */

import { WaEvent, AutoTagRule } from '../../widget/src/core';

// Sample auto-tag rules (matches production config)
export const SAMPLE_AUTO_TAG_RULES: AutoTagRule[] = [
  { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
  { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
  { type: 'name-prefix', pattern: 'Wine Appreciation:', tag: 'committee:wine' },
  { type: 'name-prefix', pattern: 'Epicurious:', tag: 'committee:epicurious' },
  { type: 'name-prefix', pattern: 'TGIF:', tag: 'committee:tgif' },
  { type: 'name-prefix', pattern: 'Cycling:', tag: 'committee:cycling' },
  { type: 'name-prefix', pattern: 'Golf:', tag: 'committee:golf' },
  { type: 'name-prefix', pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
  { type: 'name-prefix', pattern: 'Wellness:', tag: 'committee:wellness' },
  { type: 'name-prefix', pattern: 'Garden:', tag: 'committee:garden' },
  { type: 'name-prefix', pattern: 'Current Events:', tag: 'committee:current-events' },
];

// Helper to create future dates for testing
export function futureDate(daysFromNow: number, hour: number = 10, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// Helper to create past dates for testing
export function pastDate(daysAgo: number, hour: number = 10, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// Helper to get next Saturday
export function nextSaturday(hour: number = 10): string {
  const date = new Date();
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

// Helper to get next weekday (Monday-Friday)
export function nextWeekday(hour: number = 10): string {
  const date = new Date();
  let daysToAdd = 1;
  const currentDay = date.getDay();
  if (currentDay === 5) daysToAdd = 3; // Friday -> Monday
  if (currentDay === 6) daysToAdd = 2; // Saturday -> Monday
  date.setDate(date.getDate() + daysToAdd);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

// ═══════════════════════════════════════════════════════════════
// SAMPLE EVENTS
// ═══════════════════════════════════════════════════════════════

export const freeHikeEvent: WaEvent = {
  Id: 1001,
  Name: 'Happy Hikers: Morning Trail Walk',
  StartDate: futureDate(3, 9, 0), // Morning
  EndDate: futureDate(3, 12, 0),
  Location: 'Elings Park Trailhead',
  AccessLevel: 'Public',
  RegistrationEnabled: true,
  RegistrationsLimit: 20,
  ConfirmedRegistrationsCount: 8,
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 0 }
  ],
  Details: {
    DescriptionHtml: '<p>Join us for a beautiful morning hike!</p>'
  }
};

export const paidWineEvent: WaEvent = {
  Id: 1002,
  Name: 'Wine Appreciation: Pinot Noir Tasting',
  StartDate: futureDate(7, 18, 30), // Evening
  EndDate: futureDate(7, 21, 0),
  Location: 'Wine Cask Restaurant',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 30,
  ConfirmedRegistrationsCount: 28,
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 45 },
    { Id: 2, Name: 'Guest', BasePrice: 55 }
  ],
  Details: {
    DescriptionHtml: '<p>Explore wonderful Pinot Noirs from around the world.</p>'
  }
};

export const fullGamesEvent: WaEvent = {
  Id: 1003,
  Name: 'Games!: Board Game Night',
  StartDate: futureDate(5, 19, 0), // Evening
  EndDate: futureDate(5, 22, 0),
  Location: 'Community Center',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 24,
  ConfirmedRegistrationsCount: 24, // FULL
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 5 }
  ]
};

export const limitedGolfEvent: WaEvent = {
  Id: 1004,
  Name: 'Golf: Weekly Round at Sandpiper',
  StartDate: nextSaturday(8), // Weekend morning
  EndDate: nextSaturday(12),
  Location: 'Sandpiper Golf Course',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 16,
  ConfirmedRegistrationsCount: 13, // 3 spots left = limited
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 85 }
  ]
};

export const publicMeetingEvent: WaEvent = {
  Id: 1005,
  Name: 'Current Events: Monthly Discussion',
  StartDate: futureDate(10, 14, 0), // Afternoon
  EndDate: futureDate(10, 16, 0),
  Location: 'Library Meeting Room',
  AccessLevel: 'Public',
  RegistrationEnabled: false, // No registration required
  RegistrationTypes: []
};

export const expensiveEvent: WaEvent = {
  Id: 1006,
  Name: 'Epicurious: Wine Country Day Trip',
  StartDate: nextSaturday(9),
  EndDate: nextSaturday(18),
  Location: 'Santa Ynez Valley',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 40,
  ConfirmedRegistrationsCount: 15,
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 125 },
    { Id: 2, Name: 'Guest', BasePrice: 145 }
  ]
};

export const tgifAfterHoursEvent: WaEvent = {
  Id: 1007,
  Name: 'TGIF: Happy Hour at the Beach',
  StartDate: nextWeekday(17), // 5pm on weekday
  EndDate: nextWeekday(19),
  Location: 'Shoreline Beach Cafe',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: null, // Unlimited
  ConfirmedRegistrationsCount: 35,
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 0 }
  ]
};

export const noRegistrationTypesEvent: WaEvent = {
  Id: 1008,
  Name: 'Wellness: Yoga in the Park',
  StartDate: futureDate(4, 8, 0), // Morning
  Location: 'Alameda Park',
  AccessLevel: 'Public',
  RegistrationEnabled: true,
  RegistrationTypes: [] // No registration types = free
};

export const cancelledEvent: WaEvent = {
  Id: 1009,
  Name: 'CANCELLED - Happy Hikers: Sunset Stroll',
  StartDate: futureDate(2, 17, 0),
  Location: 'Douglas Preserve',
  AccessLevel: 'Public',
  RegistrationEnabled: false,
  RegistrationTypes: []
};

export const eventWithStringTags: WaEvent = {
  Id: 1010,
  Name: 'Garden: Spring Planting Workshop',
  StartDate: futureDate(14, 10, 0),
  Location: 'Community Garden',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 15,
  ConfirmedRegistrationsCount: 5,
  Tags: 'gardening, workshop, outdoor',
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 10 }
  ]
};

export const eventWithArrayTags: WaEvent = {
  Id: 1011,
  Name: 'Performing Arts: Symphony Night',
  StartDate: futureDate(21, 19, 30),
  Location: 'Granada Theatre',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 50,
  ConfirmedRegistrationsCount: 20,
  Tags: ['music', 'cultural', 'evening'],
  RegistrationTypes: [
    { Id: 1, Name: 'Member', BasePrice: 35 },
    { Id: 2, Name: 'Guest', BasePrice: 45 }
  ]
};

// Event with Details.RegistrationTypes instead of top-level
export const eventWithNestedRegistrationTypes: WaEvent = {
  Id: 1012,
  Name: 'Cycling: Coast Ride',
  StartDate: nextSaturday(7),
  Location: 'Leadbetter Beach Parking',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 12,
  ConfirmedRegistrationsCount: 6,
  Details: {
    DescriptionHtml: '<p>Scenic coastal ride</p>',
    RegistrationTypes: [
      { Id: 1, Name: 'Member', BasePrice: 0 }
    ]
  }
};

// Event with CurrentPrice instead of BasePrice
export const eventWithCurrentPrice: WaEvent = {
  Id: 1013,
  Name: 'Pop-Up: Special Dinner',
  StartDate: futureDate(8, 18, 0),
  Location: 'Secret Location',
  AccessLevel: 'MembersOnly',
  RegistrationEnabled: true,
  RegistrationsLimit: 20,
  ConfirmedRegistrationsCount: 10,
  RegistrationTypes: [
    { Id: 1, Name: 'Early Bird', CurrentPrice: 65 },
    { Id: 2, Name: 'Regular', CurrentPrice: 75 }
  ]
};

// All sample events
export const ALL_SAMPLE_EVENTS: WaEvent[] = [
  freeHikeEvent,
  paidWineEvent,
  fullGamesEvent,
  limitedGolfEvent,
  publicMeetingEvent,
  expensiveEvent,
  tgifAfterHoursEvent,
  noRegistrationTypesEvent,
  cancelledEvent,
  eventWithStringTags,
  eventWithArrayTags,
  eventWithNestedRegistrationTypes,
  eventWithCurrentPrice,
];
