/**
 * ClubCalendar Widget - Core Functions
 *
 * Pure functions extracted for testability.
 * These are used by both the inline widget and unit tests.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AutoTagRule {
  type: 'name-prefix' | 'name-contains' | 'name-suffix';
  pattern: string;
  tag: string;
}

export interface WaEvent {
  Id: number;
  Name: string;
  StartDate: string;
  EndDate?: string;
  Location?: string;
  Url?: string;
  RegistrationUrl?: string;
  Tags?: string | string[];
  AccessLevel?: string;
  RegistrationEnabled?: boolean;
  RegistrationsLimit?: number | null;
  ConfirmedRegistrationsCount?: number;
  RegistrationTypes?: RegistrationType[];
  Details?: {
    DescriptionHtml?: string;
    RegistrationTypes?: RegistrationType[];
  };
}

export interface RegistrationType {
  Id?: number;
  Name?: string;
  BasePrice?: number;
  Price?: number;
  CurrentPrice?: number;
}

export interface TransformedEvent {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  url: string;
  registrationUrl: string;
  tags: string[];
  spotsAvailable: number | null;
  limit: number | null;
  confirmed: number;
  isFull: boolean;
  registrationEnabled: boolean;
  accessLevel: string;
  minPrice: number;
  maxPrice: number;
  isFree: boolean;
  isPublic: boolean;
  activityType: string | null;
}

export interface PricingInfo {
  minPrice: number;
  maxPrice: number;
  isFree: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE MAPPING
// ═══════════════════════════════════════════════════════════════

export const ACTIVITY_TYPE_MAP: Record<string, string> = {
  // Physical/Fitness
  'Happy Hikers': 'activity:physical',
  'Cycling': 'activity:physical',
  'Golf': 'activity:physical',
  // Social
  'TGIF': 'activity:social',
  'Pop-Up': 'activity:social',
  'Out to Lunch': 'activity:social',
  // Food & Drink
  'Epicurious': 'activity:food-drink',
  'Wine Appreciation': 'activity:food-drink',
  'Beer Lovers': 'activity:food-drink',
  // Cultural/Arts
  'Performing Arts': 'activity:arts',
  'Arts': 'activity:arts',
  'Local Heritage': 'activity:arts',
  // Educational
  'Current Events': 'activity:educational',
  'Afternoon Book': 'activity:educational',
  'Evening Book': 'activity:educational',
  // Games/Recreation
  'Games!': 'activity:games',
  'Games': 'activity:games',
  // Wellness
  'Wellness': 'activity:wellness',
  // Garden
  'Garden': 'activity:garden'
};

// ═══════════════════════════════════════════════════════════════
// AUTO-TAGGING
// ═══════════════════════════════════════════════════════════════

/**
 * Apply auto-tagging rules to an event based on its name
 */
export function applyAutoTags(event: { Name?: string }, rules: AutoTagRule[]): string[] {
  const autoTags: string[] = [];
  const eventName = (event.Name || '').toLowerCase();

  for (const rule of rules) {
    const pattern = (rule.pattern || '').toLowerCase();
    if (!pattern || !rule.tag) continue;

    let matched = false;
    if (rule.type === 'name-prefix') matched = eventName.startsWith(pattern);
    else if (rule.type === 'name-contains') matched = eventName.includes(pattern);
    else if (rule.type === 'name-suffix') matched = eventName.endsWith(pattern);

    if (matched) autoTags.push(rule.tag);
  }
  return autoTags;
}

// ═══════════════════════════════════════════════════════════════
// TIME DERIVATION
// ═══════════════════════════════════════════════════════════════

/**
 * Derive time of day tag from start date
 */
export function deriveTimeOfDay(startDateStr: string): string | null {
  try {
    const hour = new Date(startDateStr).getHours();
    if (hour < 12) return 'time:morning';
    if (hour < 17) return 'time:afternoon';
    return 'time:evening';
  } catch (e) {
    return null;
  }
}

/**
 * Check if date falls on a weekend
 */
export function isWeekend(startDateStr: string): boolean {
  try {
    const day = new Date(startDateStr).getDay();
    return day === 0 || day === 6;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// AVAILABILITY
// ═══════════════════════════════════════════════════════════════

/**
 * Derive availability tag from registration counts
 */
export function deriveAvailability(event: {
  RegistrationsLimit?: number | null;
  ConfirmedRegistrationsCount?: number
}): string {
  const limit = event.RegistrationsLimit;
  const confirmed = event.ConfirmedRegistrationsCount || 0;

  if (!limit) return 'availability:open';

  const spots = limit - confirmed;
  if (spots <= 0) return 'availability:full';
  if (spots <= 5) return 'availability:limited';
  return 'availability:open';
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════

/**
 * Extract pricing info from WA event's RegistrationTypes
 */
export function extractPricing(waEvent: WaEvent): PricingInfo {
  const regTypes = waEvent.RegistrationTypes || waEvent.Details?.RegistrationTypes || [];

  if (!regTypes.length) {
    // No registration types = free event or no registration
    return { minPrice: 0, maxPrice: 0, isFree: true };
  }

  let minPrice = Infinity;
  let maxPrice = 0;

  for (const rt of regTypes) {
    // WA uses BasePrice, Price, or CurrentPrice depending on version
    const price = rt.BasePrice ?? rt.Price ?? rt.CurrentPrice ?? 0;
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;
  }

  if (minPrice === Infinity) minPrice = 0;

  return {
    minPrice: minPrice,
    maxPrice: maxPrice,
    isFree: minPrice === 0
  };
}

/**
 * Derive cost category tag from price
 */
export function deriveCostCategory(minPrice: number | null | undefined): string | null {
  if (minPrice === null || minPrice === undefined) return null;
  if (minPrice === 0) return 'cost:free';
  if (minPrice < 25) return 'cost:under-25';
  if (minPrice < 50) return 'cost:under-50';
  if (minPrice < 100) return 'cost:under-100';
  return 'cost:over-100';
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE
// ═══════════════════════════════════════════════════════════════

/**
 * Derive activity type from committee/event name prefix
 */
export function deriveActivityType(eventName: string): string | null {
  // Extract committee from event name prefix
  const colonIdx = eventName.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) {
    const prefix = eventName.substring(0, colonIdx).trim();
    // Check direct match
    if (ACTIVITY_TYPE_MAP[prefix]) return ACTIVITY_TYPE_MAP[prefix];
    // Check partial match
    for (const [committee, activityTag] of Object.entries(ACTIVITY_TYPE_MAP)) {
      if (prefix.includes(committee) || committee.includes(prefix)) {
        return activityTag;
      }
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// EVENT TYPE DERIVATION
// ═══════════════════════════════════════════════════════════════

/**
 * Keywords that indicate event type/format
 */
export const EVENT_TYPE_KEYWORDS: Record<string, string> = {
  'workshop': 'type:workshop',
  'tasting': 'type:tasting',
  'day trip': 'type:trip',
  'tour': 'type:trip',
  'hike': 'type:hike',
  'walk': 'type:walk',
  'happy hour': 'type:happy-hour',
  'game night': 'type:game-night',
  'discussion': 'type:discussion',
  'lecture': 'type:lecture',
  'class': 'type:class',
  'performance': 'type:performance',
  'concert': 'type:performance',
  'show': 'type:performance',
};

/**
 * Derive event type tag from event name (after the committee prefix)
 */
export function deriveEventType(eventName: string): string | null {
  const nameLower = eventName.toLowerCase();
  // Check title part (after colon if present)
  const colonIdx = eventName.indexOf(':');
  const titlePart = colonIdx > 0 ? eventName.substring(colonIdx + 1).toLowerCase() : nameLower;

  for (const [keyword, tag] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (titlePart.includes(keyword)) {
      return tag;
    }
  }
  return null;
}

/**
 * Derive recurring tag from event name
 */
export function deriveRecurring(eventName: string): string | null {
  const nameLower = eventName.toLowerCase();
  if (nameLower.includes('weekly')) return 'recurring:weekly';
  if (nameLower.includes('monthly')) return 'recurring:monthly';
  if (nameLower.includes('daily')) return 'recurring:daily';
  return null;
}

/**
 * Keywords that indicate outdoor venues
 */
const OUTDOOR_KEYWORDS = ['park', 'beach', 'trail', 'garden', 'outdoor', 'preserve', 'hike'];

/**
 * Derive venue type tag from event name or location
 */
export function deriveVenueType(eventName: string, location?: string): string | null {
  const combined = `${eventName} ${location || ''}`.toLowerCase();
  for (const keyword of OUTDOOR_KEYWORDS) {
    if (combined.includes(keyword)) {
      return 'venue:outdoor';
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// TAG HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Prefixes used by auto-generated tags
 */
export const AUTO_TAG_PREFIXES = [
  'time:', 'availability:', 'day:', 'cost:', 'activity:',
  'committee:', 'type:', 'recurring:', 'venue:'
];

/**
 * Check if a tag is auto-generated (vs manually added in WA)
 */
export function isAutoTag(tag: string): boolean {
  return AUTO_TAG_PREFIXES.some(p => tag.startsWith(p)) || tag === 'public-event';
}

/**
 * Filter tags for display (manual tags only, excluding hidden)
 */
export function getDisplayTags(
  tags: string[],
  hiddenTags: string[] = [],
  showAutoTags: boolean = false
): string[] {
  return tags.filter(tag => {
    if (hiddenTags.includes(tag)) return false;
    if (!showAutoTags && isAutoTag(tag)) return false;
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// CONFIG HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Deep merge config objects (one level deep for nested objects)
 */
export function mergeConfig<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T> | undefined
): T {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const result = { ...base };
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const overrideValue = overrides[key];
    if (
      overrideValue !== null &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = { ...(result[key] as Record<string, unknown>), ...overrideValue } as T[keyof T];
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue as T[keyof T];
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC EVENT DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Determine if an event is public (accessible to non-members)
 * Public = AccessLevel is "Public" OR no registration/ticketing required
 */
export function isPublicEvent(waEvent: WaEvent): boolean {
  const regTypes = waEvent.RegistrationTypes || waEvent.Details?.RegistrationTypes || [];
  const hasNoTicketing = regTypes.length === 0 || waEvent.RegistrationEnabled === false;
  const isPublicAccess = waEvent.AccessLevel === 'Public';
  return isPublicAccess || hasNoTicketing;
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Extract committee name from event name (before the colon)
 */
export function extractCommittee(name: string): string {
  const idx = name.indexOf(':');
  return (idx > 0 && idx < 30) ? name.substring(0, idx).replace(/[*\-()]/g, '').trim() : 'General';
}

/**
 * Get clean title from event name (after the colon)
 */
export function getCleanTitle(name: string): string {
  const idx = name.indexOf(':');
  return (idx > 0 && idx < 30) ? name.substring(idx + 1).trim() : name;
}

/**
 * Get time of day class for styling
 */
export function getTimeOfDayClass(startDate: string): string {
  if (!startDate) return 'allday';
  const hour = new Date(startDate).getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ═══════════════════════════════════════════════════════════════
// FULL EVENT TRANSFORMATION
// ═══════════════════════════════════════════════════════════════

/**
 * Transform a WA API event into a ClubCalendar event
 */
export function transformEvent(waEvent: WaEvent, autoTagRules: AutoTagRule[] = []): TransformedEvent {
  let waTags: string[] = [];
  if (waEvent.Tags) {
    if (typeof waEvent.Tags === 'string') {
      waTags = waEvent.Tags.split(',').map(t => t.trim()).filter(t => t);
    } else {
      waTags = waEvent.Tags;
    }
  }

  const autoTags = applyAutoTags(waEvent, autoTagRules);
  const startDate = waEvent.StartDate || '';
  const eventName = waEvent.Name || '';

  // Time-based tags
  const timeTag = deriveTimeOfDay(startDate);
  if (timeTag) autoTags.push(timeTag);
  autoTags.push(deriveAvailability(waEvent));
  if (isWeekend(startDate)) autoTags.push('day:weekend');

  // Extract and derive pricing
  const pricing = extractPricing(waEvent);
  const costTag = deriveCostCategory(pricing.minPrice);
  if (costTag) autoTags.push(costTag);

  // Derive activity type from committee/event name
  const activityTag = deriveActivityType(eventName);
  if (activityTag) autoTags.push(activityTag);

  // Derive event type (workshop, tasting, trip, etc.)
  const eventTypeTag = deriveEventType(eventName);
  if (eventTypeTag) autoTags.push(eventTypeTag);

  // Derive recurring tag (weekly, monthly, etc.)
  const recurringTag = deriveRecurring(eventName);
  if (recurringTag) autoTags.push(recurringTag);

  // Derive venue type (outdoor, etc.)
  const venueTag = deriveVenueType(eventName, waEvent.Location);
  if (venueTag) autoTags.push(venueTag);

  // Public event detection
  const isPublic = isPublicEvent(waEvent);
  if (isPublic) autoTags.push('public-event');

  const allTags = [...new Set([...waTags, ...autoTags])];
  const limit = waEvent.RegistrationsLimit ?? null;
  const confirmed = waEvent.ConfirmedRegistrationsCount || 0;
  const spotsAvailable = (limit == null) ? null : Math.max(0, limit - confirmed);

  return {
    id: waEvent.Id,
    name: eventName,
    startDate: startDate,
    endDate: waEvent.EndDate || '',
    location: waEvent.Location || '',
    description: waEvent.Details?.DescriptionHtml || '',
    url: waEvent.Url || `https://sbnewcomers.org/event-${waEvent.Id}`,
    registrationUrl: waEvent.RegistrationUrl || '',
    tags: allTags,
    spotsAvailable: spotsAvailable,
    limit: limit,
    confirmed: confirmed,
    isFull: spotsAvailable === 0,
    registrationEnabled: waEvent.RegistrationEnabled !== false,
    accessLevel: waEvent.AccessLevel || 'Public',
    minPrice: pricing.minPrice,
    maxPrice: pricing.maxPrice,
    isFree: pricing.isFree,
    isPublic: isPublic,
    activityType: activityTag ? activityTag.replace('activity:', '') : null
  };
}

// ═══════════════════════════════════════════════════════════════
// FILTER RULES
// ═══════════════════════════════════════════════════════════════

export type FilterCriteria = (event: TransformedEvent) => boolean;

export const FILTER_RULES: Record<string, { criteria: FilterCriteria }> = {
  weekend: {
    criteria: (e) => {
      const d = new Date(e.startDate).getDay();
      return d === 0 || d === 6;
    }
  },
  openings: {
    criteria: (e) => e.spotsAvailable === null || e.spotsAvailable > 0
  },
  free: {
    criteria: (e) => e.isFree === true || e.minPrice === 0 || e.tags.includes('cost:free')
  },
  afterhours: {
    criteria: (e) => {
      const d = new Date(e.startDate);
      const day = d.getDay();
      const hour = d.getHours();
      return day === 0 || day === 6 || (day >= 1 && day <= 5 && hour >= 17);
    }
  },
  under25: {
    criteria: (e) => e.minPrice !== null && e.minPrice < 25
  },
  under50: {
    criteria: (e) => e.minPrice !== null && e.minPrice < 50
  },
  public: {
    criteria: (e) => e.isPublic === true || e.tags.includes('public-event')
  }
};

/**
 * Apply filters to a list of events
 */
export function applyFilters(
  events: TransformedEvent[],
  quickFilters: string[],
  upcomingOnly: boolean = true
): TransformedEvent[] {
  const now = new Date();

  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    if (upcomingOnly && eventDate < now) return false;

    if (quickFilters.length > 0) {
      const matches = quickFilters.some(f => FILTER_RULES[f]?.criteria(event));
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Filter events by search text (matches name, description, location)
 */
export function filterBySearch(
  events: TransformedEvent[],
  searchTerm: string
): TransformedEvent[] {
  if (!searchTerm || !searchTerm.trim()) return events;

  const term = searchTerm.toLowerCase().trim();

  return events.filter(event => {
    const nameMatch = event.name.toLowerCase().includes(term);
    const descMatch = event.description && event.description.toLowerCase().includes(term);
    const locationMatch = event.location && event.location.toLowerCase().includes(term);
    return nameMatch || descMatch || locationMatch;
  });
}

// ═══════════════════════════════════════════════════════════════
// AVAILABILITY DISPLAY
// ═══════════════════════════════════════════════════════════════

export type AvailabilityStatus = 'unlimited' | 'sold-out' | 'limited' | 'open';

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  spots: number | null;
  label: string;
}

/**
 * Get availability information for an event
 */
export function getAvailabilityInfo(spotsAvailable: number | null): AvailabilityInfo {
  if (spotsAvailable === null || spotsAvailable === undefined) {
    return { status: 'unlimited', spots: null, label: '' };
  }

  if (spotsAvailable === 0) {
    return { status: 'sold-out', spots: 0, label: 'Sold Out' };
  }

  if (spotsAvailable <= 5) {
    return {
      status: 'limited',
      spots: spotsAvailable,
      label: `${spotsAvailable} spot${spotsAvailable === 1 ? '' : 's'} left`
    };
  }

  return {
    status: 'open',
    spots: spotsAvailable,
    label: `${spotsAvailable} spots`
  };
}

// ═══════════════════════════════════════════════════════════════
// THEME DETECTION & CSS SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Detected theme styles from page elements
 */
export interface DetectedTheme {
  // Typography
  headingFont: string | null;
  headingColor: string | null;
  bodyFont: string | null;
  bodyColor: string | null;
  bodyBg: string | null;
  // Buttons
  buttonRadius: string | null;
  buttonBg: string | null;
  buttonColor: string | null;
  // Cards/Panels
  cardRadius: string | null;
  cardShadow: string | null;
  cardBorder: string | null;
  // Links
  linkColor: string | null;
  linkHoverColor: string | null;
}

/**
 * CSS variables that can be customized
 */
export interface ThemeCSSVars {
  '--clubcal-primary': string;
  '--clubcal-accent': string;
  '--clubcal-heading-font': string;
  '--clubcal-body-font': string;
  '--clubcal-body-color': string;
  '--clubcal-body-bg': string;
  '--clubcal-card-radius': string;
  '--clubcal-card-shadow': string;
  '--clubcal-card-border': string;
  '--clubcal-button-radius': string;
  '--clubcal-link-color': string;
}

/**
 * Default CSS variable values
 */
export const DEFAULT_CSS_VARS: ThemeCSSVars = {
  '--clubcal-primary': '#2c5aa0',
  '--clubcal-accent': '#d4a800',
  '--clubcal-heading-font': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  '--clubcal-body-font': 'inherit',
  '--clubcal-body-color': '#333',
  '--clubcal-body-bg': '#ffffff',
  '--clubcal-card-radius': '8px',
  '--clubcal-card-shadow': '0 1px 3px rgba(0,0,0,0.1)',
  '--clubcal-card-border': '1px solid #e0e0e0',
  '--clubcal-button-radius': '20px',
  '--clubcal-link-color': '#2c5aa0',
};

/**
 * Style preset definitions
 */
export type StylePreset = 'default' | 'compact' | 'minimal' | 'wa-compatible';

export const STYLE_PRESETS: Record<StylePreset, Partial<ThemeCSSVars> & { extraCSS?: string }> = {
  'default': {
    // Uses DEFAULT_CSS_VARS
  },
  'compact': {
    '--clubcal-card-radius': '4px',
    '--clubcal-button-radius': '4px',
    extraCSS: `
      .clubcal-event-card { padding: 8px; }
      .clubcal-event-card-date { min-width: 50px; padding: 8px; }
      .clubcal-event-card-date .day { font-size: 18px; }
      .clubcal-filter-bar { padding: 10px; gap: 8px; }
      .clubcal-quick-filter { padding: 4px 10px; font-size: 12px; }
    `
  },
  'minimal': {
    '--clubcal-card-shadow': 'none',
    '--clubcal-card-border': '1px solid #eee',
    '--clubcal-button-radius': '4px',
    extraCSS: `
      .clubcalendar-header { border-bottom: 1px solid #eee; }
      .clubcal-filter-bar { background: transparent; border: 1px solid #eee; }
    `
  },
  'wa-compatible': {
    '--clubcal-body-font': 'inherit',
    '--clubcal-heading-font': 'inherit',
    extraCSS: `
      .clubcalendar-widget { font-family: inherit !important; }
      .clubcalendar-widget * { box-sizing: border-box; }
      .clubcalendar-header h2 { font-family: inherit !important; }
      .clubcal-event-card { margin: 0 !important; }
      .clubcal-quick-filter { font-family: inherit !important; }
      .clubcal-dropdown { font-family: inherit !important; }
    `
  }
};

/**
 * Selectors to sample for theme detection
 */
export const THEME_SAMPLE_SELECTORS = {
  heading: ['h1', 'h2', '.wa-heading', '.contentHeader', '.pageTitle'],
  button: ['.wa-button', 'button[type="submit"]', '.btn-primary', 'input[type="submit"]'],
  card: ['.wa-card', '.contentPanel', '.panel', '.gadgetContent', '.box'],
  link: ['a:not([class*="clubcal"])', '.wa-link', 'nav a'],
  body: ['body']
};

/**
 * Extract computed style safely
 */
export function getComputedStyleSafe(
  element: Element | null,
  property: string
): string | null {
  if (!element || typeof window === 'undefined') return null;
  try {
    const computed = window.getComputedStyle(element);
    const value = computed.getPropertyValue(property) || (computed as Record<string, string>)[property];
    return value || null;
  } catch {
    return null;
  }
}

/**
 * Find first matching element from selector list
 */
export function findFirstElement(selectors: string[]): Element | null {
  if (typeof document === 'undefined') return null;
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el) return el;
    } catch {
      // Invalid selector, skip
    }
  }
  return null;
}

/**
 * Detect theme styles from existing page elements
 */
export function detectThemeStyles(): DetectedTheme {
  const detected: DetectedTheme = {
    headingFont: null,
    headingColor: null,
    bodyFont: null,
    bodyColor: null,
    bodyBg: null,
    buttonRadius: null,
    buttonBg: null,
    buttonColor: null,
    cardRadius: null,
    cardShadow: null,
    cardBorder: null,
    linkColor: null,
    linkHoverColor: null,
  };

  // Detect heading styles
  const heading = findFirstElement(THEME_SAMPLE_SELECTORS.heading);
  if (heading) {
    detected.headingFont = getComputedStyleSafe(heading, 'font-family');
    detected.headingColor = getComputedStyleSafe(heading, 'color');
  }

  // Detect body styles
  const body = findFirstElement(THEME_SAMPLE_SELECTORS.body);
  if (body) {
    detected.bodyFont = getComputedStyleSafe(body, 'font-family');
    detected.bodyColor = getComputedStyleSafe(body, 'color');
    detected.bodyBg = getComputedStyleSafe(body, 'background-color');
  }

  // Detect button styles
  const button = findFirstElement(THEME_SAMPLE_SELECTORS.button);
  if (button) {
    detected.buttonRadius = getComputedStyleSafe(button, 'border-radius');
    detected.buttonBg = getComputedStyleSafe(button, 'background-color');
    detected.buttonColor = getComputedStyleSafe(button, 'color');
  }

  // Detect card/panel styles
  const card = findFirstElement(THEME_SAMPLE_SELECTORS.card);
  if (card) {
    detected.cardRadius = getComputedStyleSafe(card, 'border-radius');
    detected.cardShadow = getComputedStyleSafe(card, 'box-shadow');
    detected.cardBorder = getComputedStyleSafe(card, 'border');
  }

  // Detect link styles
  const link = findFirstElement(THEME_SAMPLE_SELECTORS.link);
  if (link) {
    detected.linkColor = getComputedStyleSafe(link, 'color');
  }

  return detected;
}

/**
 * Convert detected theme to CSS variables
 */
export function detectedThemeToCSSVars(detected: DetectedTheme): Partial<ThemeCSSVars> {
  const vars: Partial<ThemeCSSVars> = {};

  if (detected.headingFont) vars['--clubcal-heading-font'] = detected.headingFont;
  if (detected.bodyFont) vars['--clubcal-body-font'] = detected.bodyFont;
  if (detected.bodyColor) vars['--clubcal-body-color'] = detected.bodyColor;
  if (detected.bodyBg) vars['--clubcal-body-bg'] = detected.bodyBg;
  if (detected.cardRadius) vars['--clubcal-card-radius'] = detected.cardRadius;
  if (detected.cardShadow && detected.cardShadow !== 'none') {
    vars['--clubcal-card-shadow'] = detected.cardShadow;
  }
  if (detected.cardBorder && detected.cardBorder !== 'none') {
    vars['--clubcal-card-border'] = detected.cardBorder;
  }
  if (detected.buttonRadius) vars['--clubcal-button-radius'] = detected.buttonRadius;
  if (detected.linkColor) vars['--clubcal-link-color'] = detected.linkColor;

  return vars;
}

/**
 * Build final CSS variables from config, preset, and detected theme
 */
export function buildCSSVars(options: {
  autoTheme?: boolean;
  detectedTheme?: DetectedTheme;
  preset?: StylePreset;
  primaryColor?: string;
  accentColor?: string;
  cssVars?: Partial<ThemeCSSVars>;
}): ThemeCSSVars {
  // Start with defaults
  let vars: ThemeCSSVars = { ...DEFAULT_CSS_VARS };

  // Apply detected theme (if autoTheme enabled)
  if (options.autoTheme && options.detectedTheme) {
    const detected = detectedThemeToCSSVars(options.detectedTheme);
    vars = { ...vars, ...detected };
  }

  // Apply preset overrides
  if (options.preset && STYLE_PRESETS[options.preset]) {
    const presetVars = { ...STYLE_PRESETS[options.preset] };
    delete (presetVars as Record<string, unknown>).extraCSS;
    vars = { ...vars, ...presetVars as Partial<ThemeCSSVars> };
  }

  // Apply primary/accent colors from config
  if (options.primaryColor) {
    vars['--clubcal-primary'] = options.primaryColor;
    vars['--clubcal-link-color'] = options.primaryColor;
  }
  if (options.accentColor) {
    vars['--clubcal-accent'] = options.accentColor;
  }

  // Apply explicit cssVars overrides (highest priority)
  if (options.cssVars) {
    vars = { ...vars, ...options.cssVars };
  }

  return vars;
}

/**
 * Generate CSS variable declarations
 */
export function generateCSSVarDeclarations(vars: ThemeCSSVars): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

/**
 * Get extra CSS from preset
 */
export function getPresetExtraCSS(preset: StylePreset): string {
  return STYLE_PRESETS[preset]?.extraCSS || '';
}

/**
 * Build complete CSS string for the widget
 */
export function buildWidgetCSS(options: {
  cssVars: ThemeCSSVars;
  preset?: StylePreset;
  customCSS?: string;
}): string {
  const parts: string[] = [];

  // CSS variable declarations
  parts.push(`:root {\n${generateCSSVarDeclarations(options.cssVars)}\n}`);

  // Preset extra CSS
  if (options.preset) {
    const presetCSS = getPresetExtraCSS(options.preset);
    if (presetCSS) parts.push(presetCSS);
  }

  // Custom CSS (highest priority)
  if (options.customCSS) {
    parts.push(options.customCSS);
  }

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════
// COLOR CONTRAST & LEGIBILITY
// ═══════════════════════════════════════════════════════════════

/**
 * RGB color components (0-255)
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Contrast check result
 */
export interface ContrastResult {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
}

/**
 * Contrast validation result for a color pair
 */
export interface ContrastValidation {
  foreground: string;
  background: string;
  originalForeground: string;
  ratio: number;
  passed: boolean;
  corrected: boolean;
  warning?: string;
}

/**
 * Contrast mode configuration
 * - 'auto': Automatically correct colors that fail contrast
 * - 'warn': Log warnings but don't correct
 * - 'strict': Throw error if contrast fails
 * - 'off': No contrast checking
 */
export type ContrastMode = 'auto' | 'warn' | 'strict' | 'off';

/**
 * WCAG contrast thresholds
 */
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
};

/**
 * Parse a color string to RGB components
 * Supports: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba()
 */
export function parseColor(color: string): RGBColor | null {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim().toLowerCase();

  // Hex formats: #RGB, #RRGGBB, #RRGGBBAA
  if (trimmed.startsWith('#')) {
    return parseHexColor(trimmed);
  }

  // rgb() and rgba() formats
  if (trimmed.startsWith('rgb')) {
    return parseRgbColor(trimmed);
  }

  // Named colors (common ones)
  const namedColors: Record<string, RGBColor> = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'transparent': { r: 0, g: 0, b: 0, a: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'yellow': { r: 255, g: 255, b: 0 },
    'gray': { r: 128, g: 128, b: 128 },
    'grey': { r: 128, g: 128, b: 128 },
  };

  return namedColors[trimmed] || null;
}

/**
 * Parse hex color format
 */
export function parseHexColor(hex: string): RGBColor | null {
  // Remove # prefix
  const h = hex.replace('#', '');

  let r: number, g: number, b: number, a: number | undefined;

  if (h.length === 3) {
    // #RGB
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 4) {
    // #RGBA
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
    a = parseInt(h[3] + h[3], 16) / 255;
  } else if (h.length === 6) {
    // #RRGGBB
    r = parseInt(h.substring(0, 2), 16);
    g = parseInt(h.substring(2, 4), 16);
    b = parseInt(h.substring(4, 6), 16);
  } else if (h.length === 8) {
    // #RRGGBBAA
    r = parseInt(h.substring(0, 2), 16);
    g = parseInt(h.substring(2, 4), 16);
    b = parseInt(h.substring(4, 6), 16);
    a = parseInt(h.substring(6, 8), 16) / 255;
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return a !== undefined ? { r, g, b, a } : { r, g, b };
}

/**
 * Parse rgb() or rgba() color format
 */
export function parseRgbColor(rgb: string): RGBColor | null {
  // Match rgb(r, g, b) or rgba(r, g, b, a)
  // Also handles rgb(r g b) and rgb(r g b / a) modern syntax
  const match = rgb.match(/rgba?\s*\(\s*(\d+(?:\.\d+)?%?)\s*[,\s]\s*(\d+(?:\.\d+)?%?)\s*[,\s]\s*(\d+(?:\.\d+)?%?)(?:\s*[,\/]\s*(\d*\.?\d+%?))?\s*\)/);

  if (!match) return null;

  const parseComponent = (val: string): number => {
    if (val.endsWith('%')) {
      return Math.round(parseFloat(val) * 2.55);
    }
    return Math.round(parseFloat(val));
  };

  const r = parseComponent(match[1]);
  const g = parseComponent(match[2]);
  const b = parseComponent(match[3]);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  if (match[4]) {
    let a = parseFloat(match[4]);
    if (match[4].endsWith('%')) {
      a = a / 100;
    }
    return { r, g, b, a };
  }

  return { r, g, b };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function calculateLuminance(color: RGBColor): number {
  const sRGBtoLinear = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const rLinear = sRGBtoLinear(color.r);
  const gLinear = sRGBtoLinear(color.g);
  const bLinear = sRGBtoLinear(color.b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors per WCAG 2.1
 * Returns ratio from 1:1 to 21:1
 */
export function calculateContrastRatio(foreground: RGBColor, background: RGBColor): number {
  const lumFg = calculateLuminance(foreground);
  const lumBg = calculateLuminance(background);

  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG thresholds
 */
export function checkContrast(foreground: RGBColor, background: RGBColor): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio,
    meetsAA: ratio >= CONTRAST_THRESHOLDS.AA_NORMAL,
    meetsAAA: ratio >= CONTRAST_THRESHOLDS.AAA_NORMAL,
    meetsAALarge: ratio >= CONTRAST_THRESHOLDS.AA_LARGE,
  };
}

/**
 * Determine if a color is "light" (luminance > 0.5)
 */
export function isLightColor(color: RGBColor): boolean {
  return calculateLuminance(color) > 0.179; // ~mid-gray threshold
}

/**
 * Darken a color by a percentage (0-100)
 */
export function darkenColor(color: RGBColor, percent: number): RGBColor {
  const factor = 1 - percent / 100;
  return {
    r: Math.round(color.r * factor),
    g: Math.round(color.g * factor),
    b: Math.round(color.b * factor),
    a: color.a,
  };
}

/**
 * Lighten a color by a percentage (0-100)
 */
export function lightenColor(color: RGBColor, percent: number): RGBColor {
  const factor = percent / 100;
  return {
    r: Math.round(color.r + (255 - color.r) * factor),
    g: Math.round(color.g + (255 - color.g) * factor),
    b: Math.round(color.b + (255 - color.b) * factor),
    a: color.a,
  };
}

/**
 * Adjust foreground color to meet minimum contrast against background
 * Returns the adjusted color (or original if already passing)
 */
export function adjustForContrast(
  foreground: RGBColor,
  background: RGBColor,
  minRatio: number = CONTRAST_THRESHOLDS.AA_NORMAL
): RGBColor {
  let current = { ...foreground };
  let ratio = calculateContrastRatio(current, background);

  if (ratio >= minRatio) return current;

  const bgIsLight = isLightColor(background);

  // Iteratively adjust until we meet the threshold (max 20 iterations)
  for (let i = 0; i < 20 && ratio < minRatio; i++) {
    if (bgIsLight) {
      // Darken the foreground
      current = darkenColor(current, 10);
    } else {
      // Lighten the foreground
      current = lightenColor(current, 10);
    }
    ratio = calculateContrastRatio(current, background);
  }

  return current;
}

/**
 * Validate and optionally correct contrast between foreground and background
 */
export function validateContrast(
  foregroundColor: string,
  backgroundColor: string,
  mode: ContrastMode = 'auto'
): ContrastValidation {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);

  // If we can't parse colors, return as-is with warning
  if (!fg || !bg) {
    return {
      foreground: foregroundColor,
      background: backgroundColor,
      originalForeground: foregroundColor,
      ratio: 0,
      passed: false,
      corrected: false,
      warning: `Could not parse colors: fg="${foregroundColor}", bg="${backgroundColor}"`,
    };
  }

  const result = checkContrast(fg, bg);

  if (result.meetsAA) {
    return {
      foreground: foregroundColor,
      background: backgroundColor,
      originalForeground: foregroundColor,
      ratio: result.ratio,
      passed: true,
      corrected: false,
    };
  }

  // Contrast fails
  if (mode === 'off') {
    return {
      foreground: foregroundColor,
      background: backgroundColor,
      originalForeground: foregroundColor,
      ratio: result.ratio,
      passed: false,
      corrected: false,
    };
  }

  if (mode === 'strict') {
    return {
      foreground: foregroundColor,
      background: backgroundColor,
      originalForeground: foregroundColor,
      ratio: result.ratio,
      passed: false,
      corrected: false,
      warning: `Contrast ratio ${result.ratio.toFixed(2)}:1 fails WCAG AA (minimum 4.5:1)`,
    };
  }

  if (mode === 'warn') {
    return {
      foreground: foregroundColor,
      background: backgroundColor,
      originalForeground: foregroundColor,
      ratio: result.ratio,
      passed: false,
      corrected: false,
      warning: `Low contrast: ${result.ratio.toFixed(2)}:1 (WCAG AA requires 4.5:1)`,
    };
  }

  // mode === 'auto': correct the color
  const adjusted = adjustForContrast(fg, bg);
  const adjustedHex = rgbToHex(adjusted);
  const newRatio = calculateContrastRatio(adjusted, bg);

  return {
    foreground: adjustedHex,
    background: backgroundColor,
    originalForeground: foregroundColor,
    ratio: newRatio,
    passed: newRatio >= CONTRAST_THRESHOLDS.AA_NORMAL,
    corrected: true,
    warning: `Adjusted color from ${foregroundColor} to ${adjustedHex} for contrast (${result.ratio.toFixed(2)}:1 → ${newRatio.toFixed(2)}:1)`,
  };
}

/**
 * Color pairs to validate in the theme
 */
export const THEME_COLOR_PAIRS: Array<{
  foregroundVar: keyof ThemeCSSVars;
  backgroundVar: keyof ThemeCSSVars;
  description: string;
}> = [
  {
    foregroundVar: '--clubcal-body-color',
    backgroundVar: '--clubcal-body-bg',
    description: 'Body text on background',
  },
  {
    foregroundVar: '--clubcal-link-color',
    backgroundVar: '--clubcal-body-bg',
    description: 'Link text on background',
  },
];

/**
 * Validate and correct all theme color pairs for contrast
 */
export function validateThemeContrast(
  vars: ThemeCSSVars,
  mode: ContrastMode = 'auto'
): { vars: ThemeCSSVars; warnings: string[] } {
  if (mode === 'off') {
    return { vars, warnings: [] };
  }

  const warnings: string[] = [];
  const correctedVars = { ...vars };

  for (const pair of THEME_COLOR_PAIRS) {
    const fg = vars[pair.foregroundVar];
    const bg = vars[pair.backgroundVar];

    const validation = validateContrast(fg, bg, mode);

    if (validation.warning) {
      warnings.push(`${pair.description}: ${validation.warning}`);
    }

    if (validation.corrected) {
      correctedVars[pair.foregroundVar] = validation.foreground;
    }

    if (mode === 'strict' && !validation.passed) {
      throw new Error(`Contrast validation failed: ${pair.description} - ${validation.warning}`);
    }
  }

  return { vars: correctedVars, warnings };
}
