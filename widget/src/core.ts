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
