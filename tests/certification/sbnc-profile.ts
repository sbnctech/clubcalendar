/**
 * SBNC Build Profile
 *
 * Defines the Santa Barbara Newcomers Club configuration for certification.
 */

import { BuildProfile, ClubCalendarConfig } from './config-schema';

// ═══════════════════════════════════════════════════════════════
// SBNC AUTO-TAG RULES
// ═══════════════════════════════════════════════════════════════

export const SBNC_AUTO_TAG_RULES = [
  { type: 'name-prefix' as const, pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
  { type: 'name-prefix' as const, pattern: 'Games!:', tag: 'committee:games' },
  { type: 'name-prefix' as const, pattern: 'Wine Appreciation:', tag: 'committee:wine' },
  { type: 'name-prefix' as const, pattern: 'Epicurious:', tag: 'committee:epicurious' },
  { type: 'name-prefix' as const, pattern: 'TGIF:', tag: 'committee:tgif' },
  { type: 'name-prefix' as const, pattern: 'Cycling:', tag: 'committee:cycling' },
  { type: 'name-prefix' as const, pattern: 'Golf:', tag: 'committee:golf' },
  { type: 'name-prefix' as const, pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
  { type: 'name-prefix' as const, pattern: 'Local Heritage:', tag: 'committee:local-heritage' },
  { type: 'name-prefix' as const, pattern: 'Wellness:', tag: 'committee:wellness' },
  { type: 'name-prefix' as const, pattern: 'Garden:', tag: 'committee:garden' },
  { type: 'name-prefix' as const, pattern: 'Arts:', tag: 'committee:arts' },
  { type: 'name-prefix' as const, pattern: 'Current Events:', tag: 'committee:current-events' },
  { type: 'name-prefix' as const, pattern: 'Pop-Up:', tag: 'committee:popup' },
  { type: 'name-prefix' as const, pattern: 'Beer Lovers:', tag: 'committee:beer' },
  { type: 'name-prefix' as const, pattern: 'Out to Lunch:', tag: 'committee:out-to-lunch' },
  { type: 'name-prefix' as const, pattern: 'Afternoon Book:', tag: 'committee:book-clubs' },
  { type: 'name-prefix' as const, pattern: 'Evening Book:', tag: 'committee:book-clubs' },
];

// ═══════════════════════════════════════════════════════════════
// SAMPLE EVENT TITLES (for testing auto-tag rules)
// ═══════════════════════════════════════════════════════════════

export const SBNC_SAMPLE_TITLES = [
  'Happy Hikers: Morning Trail Walk at Douglas Preserve',
  'Games!: Pop, Play, & Party into 2026 (Registration Opens November 4)',
  'Wine Appreciation: Sparkling Wines for the Holidays',
  'Epicurious: Farm to Table Dinner Experience',
  'TGIF: Happy Hour at The Lark',
  'Cycling: Coastal Ride to Carpinteria',
  'Golf: Monthly Tournament at Sandpiper',
  'Performing Arts: Broadway Under the Stars',
  'Local Heritage: Walking Tour of Historic Downtown',
  'Wellness: Yoga in the Park',
  'Garden: Spring Planting Workshop',
  'Arts: Watercolor Class at the Museum',
  'Current Events: Monthly Discussion Group',
  'Pop-Up: Spontaneous Wine Bar Meetup',
  'Beer Lovers: Craft Brewery Tour',
  'Out to Lunch: El Paseo Restaurant',
  'Afternoon Book: January Selection Discussion',
  'Evening Book: Mystery Novel Club',
];

// ═══════════════════════════════════════════════════════════════
// EXPECTED TAG MAPPINGS
// ═══════════════════════════════════════════════════════════════

export const SBNC_EXPECTED_TAGS: Record<string, string[]> = {
  'Happy Hikers: Morning Trail Walk at Douglas Preserve': ['committee:happy-hikers'],
  'Games!: Pop, Play, & Party into 2026 (Registration Opens November 4)': ['committee:games'],
  'Wine Appreciation: Sparkling Wines for the Holidays': ['committee:wine'],
  'Epicurious: Farm to Table Dinner Experience': ['committee:epicurious'],
  'TGIF: Happy Hour at The Lark': ['committee:tgif'],
  'Cycling: Coastal Ride to Carpinteria': ['committee:cycling'],
  'Golf: Monthly Tournament at Sandpiper': ['committee:golf'],
  'Performing Arts: Broadway Under the Stars': ['committee:performing-arts'],
  'Local Heritage: Walking Tour of Historic Downtown': ['committee:local-heritage'],
  'Wellness: Yoga in the Park': ['committee:wellness'],
  'Garden: Spring Planting Workshop': ['committee:garden'],
  'Arts: Watercolor Class at the Museum': ['committee:arts'],
  'Current Events: Monthly Discussion Group': ['committee:current-events'],
  'Pop-Up: Spontaneous Wine Bar Meetup': ['committee:popup'],
  'Beer Lovers: Craft Brewery Tour': ['committee:beer'],
  'Out to Lunch: El Paseo Restaurant': ['committee:out-to-lunch'],
  'Afternoon Book: January Selection Discussion': ['committee:book-clubs'],
  'Evening Book: Mystery Novel Club': ['committee:book-clubs'],
};

// ═══════════════════════════════════════════════════════════════
// SBNC BUILD PROFILE
// ═══════════════════════════════════════════════════════════════

export const SBNC_PROFILE: BuildProfile = {
  name: 'SBNC',
  description: 'Santa Barbara Newcomers Club - WA Native Mode',
  config: {
    waAccountId: '176353',
    headerTitle: 'SBNC Events',
    showMyEvents: true,
    showFilters: true,
    defaultView: 'dayGridMonth',
    primaryColor: '#2c5aa0',
    accentColor: '#d4a800',
    autoTagRules: SBNC_AUTO_TAG_RULES,
    quickFilters: {
      weekend: true,
      openings: true,
      afterhours: true,
      free: false,  // Disabled - redundant with Price dropdown
      public: true,
    },
    dropdownFilters: {
      committee: true,
      activity: true,
      price: true,
      eventType: true,
      recurring: true,
      venue: true,
      tags: true,
    },
    publicConfig: {
      showMyEvents: false,
      quickFilters: {
        weekend: true,
        openings: true,
        afterhours: true,
        free: false,
        public: false,  // Hidden for guests
      },
    },
    memberConfig: {
      showMyEvents: true,
    },
    titleParsing: {
      enabled: true,
      separator: ':',
      maxSeparatorPosition: 30,
      defaultCategory: 'General',
      stripChars: '*-()',
    },
  },
  sampleEventTitles: SBNC_SAMPLE_TITLES,
  expectedBehaviors: [
    {
      description: 'WA Account ID is set to SBNC (176353)',
      test: (config) => config.waAccountId === '176353',
    },
    {
      description: 'Header title is "SBNC Events"',
      test: (config) => config.headerTitle === 'SBNC Events',
    },
    {
      description: 'Has 18 auto-tag rules for committees',
      test: (config) => config.autoTagRules.length === 18,
    },
    {
      description: 'Free quick filter is disabled',
      test: (config) => config.quickFilters.free === false,
    },
    {
      description: 'My Events tab enabled for members',
      test: (config) => config.showMyEvents === true,
    },
    {
      description: 'Public quick filter hidden for guests',
      test: (config) => {
        const publicConfig = config.publicConfig as any;
        return publicConfig?.quickFilters?.public === false;
      },
    },
    {
      description: 'Title parsing is enabled with colon separator',
      test: (config) => {
        return config.titleParsing.enabled === true &&
               config.titleParsing.separator === ':';
      },
    },
    {
      description: 'All dropdown filters are enabled',
      test: (config) => {
        const df = config.dropdownFilters;
        return df.committee && df.activity && df.price &&
               df.eventType && df.recurring && df.venue && df.tags;
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// LIVE INTEGRATION TEST CHECKLIST (Buddy Test)
// ═══════════════════════════════════════════════════════════════

export interface BuddyTestItem {
  id: string;
  category: string;
  description: string;
  automated: boolean;
  testFn?: string;  // Name of Playwright test function if automated
}

export const SBNC_BUDDY_TEST_CHECKLIST: BuddyTestItem[] = [
  // Widget Loading
  {
    id: 'load-1',
    category: 'Widget Loading',
    description: 'Widget displays "SBNC Events" header',
    automated: true,
    testFn: 'verifyHeader',
  },
  {
    id: 'load-2',
    category: 'Widget Loading',
    description: 'Events load and display in calendar',
    automated: true,
    testFn: 'verifyEventsLoad',
  },
  {
    id: 'load-3',
    category: 'Widget Loading',
    description: 'No console errors on page load',
    automated: true,
    testFn: 'verifyNoErrors',
  },

  // Filters
  {
    id: 'filter-1',
    category: 'Filters',
    description: 'Committee dropdown shows SBNC committees',
    automated: true,
    testFn: 'verifyCommitteeDropdown',
  },
  {
    id: 'filter-2',
    category: 'Filters',
    description: 'Weekend quick filter toggles correctly',
    automated: true,
    testFn: 'verifyQuickFilter',
  },
  {
    id: 'filter-3',
    category: 'Filters',
    description: 'Has Openings quick filter works',
    automated: true,
    testFn: 'verifyOpeningsFilter',
  },
  {
    id: 'filter-4',
    category: 'Filters',
    description: 'After Hours quick filter works',
    automated: true,
    testFn: 'verifyAfterHoursFilter',
  },
  {
    id: 'filter-5',
    category: 'Filters',
    description: 'Free quick filter is NOT shown',
    automated: true,
    testFn: 'verifyFreeFilterHidden',
  },

  // My Events
  {
    id: 'myevents-1',
    category: 'My Events',
    description: 'My Events tab shows for logged-in members',
    automated: false,  // Requires authentication
  },
  {
    id: 'myevents-2',
    category: 'My Events',
    description: 'My Events auto-detects current user',
    automated: false,
  },
  {
    id: 'myevents-3',
    category: 'My Events',
    description: 'Registered events show "Registered" badge',
    automated: false,
  },

  // Event Display
  {
    id: 'display-1',
    category: 'Event Display',
    description: 'Event popup shows details correctly',
    automated: true,
    testFn: 'verifyEventPopup',
  },
  {
    id: 'display-2',
    category: 'Event Display',
    description: 'Spots available count displays',
    automated: true,
    testFn: 'verifySpotsAvailable',
  },
  {
    id: 'display-3',
    category: 'Event Display',
    description: 'Sold Out badge appears on full events',
    automated: true,
    testFn: 'verifySoldOutBadge',
  },

  // Views
  {
    id: 'view-1',
    category: 'Views',
    description: 'Month view displays correctly',
    automated: true,
    testFn: 'verifyMonthView',
  },
  {
    id: 'view-2',
    category: 'Views',
    description: 'Week view displays correctly',
    automated: true,
    testFn: 'verifyWeekView',
  },
  {
    id: 'view-3',
    category: 'Views',
    description: 'List view displays correctly',
    automated: true,
    testFn: 'verifyListView',
  },

  // Mobile
  {
    id: 'mobile-1',
    category: 'Mobile',
    description: 'Widget adapts to mobile screen width',
    automated: true,
    testFn: 'verifyMobileLayout',
  },
  {
    id: 'mobile-2',
    category: 'Mobile',
    description: 'Filters accessible on mobile',
    automated: true,
    testFn: 'verifyMobileFilters',
  },

  // Guest Mode
  {
    id: 'guest-1',
    category: 'Guest Mode',
    description: 'Guest mode shows appropriate error message',
    automated: true,
    testFn: 'verifyGuestError',
  },
  {
    id: 'guest-2',
    category: 'Guest Mode',
    description: 'Public quick filter hidden for guests',
    automated: true,
    testFn: 'verifyPublicFilterHiddenForGuest',
  },
];

// Count automated vs manual tests
export const SBNC_TEST_COUNTS = {
  total: SBNC_BUDDY_TEST_CHECKLIST.length,
  automated: SBNC_BUDDY_TEST_CHECKLIST.filter(t => t.automated).length,
  manual: SBNC_BUDDY_TEST_CHECKLIST.filter(t => !t.automated).length,
};
