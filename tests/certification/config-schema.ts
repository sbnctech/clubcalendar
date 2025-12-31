/**
 * ClubCalendar Configuration Schema
 *
 * Defines all configurable options for build certification testing.
 * Any build can be certified by testing against this schema.
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════

export interface QuickFiltersConfig {
  weekend: boolean;
  openings: boolean;
  afterhours: boolean;
  free: boolean;
  public: boolean;
}

export interface DropdownFiltersConfig {
  committee: boolean;
  activity: boolean;
  price: boolean;
  eventType: boolean;
  recurring: boolean;
  venue: boolean;
  tags: boolean;
}

export interface TitleParsingConfig {
  enabled: boolean;
  separator: string;
  maxSeparatorPosition: number;
  defaultCategory: string;
  stripChars: string;
}

export interface AutoTagRule {
  type: 'name-prefix' | 'name-contains' | 'name-suffix';
  pattern: string;
  tag: string;
}

export interface ClubCalendarConfig {
  // Required
  waAccountId: string;

  // Display
  headerTitle: string;
  showHeader: boolean;
  showFilters: boolean;
  showMyEvents: boolean;
  showEventTags: boolean;
  showEventDots: boolean;
  showWaitlistCount: boolean;

  // Views
  defaultView: 'dayGridMonth' | 'dayGridWeek' | 'listWeek' | 'listYear';
  pastEventsVisible: boolean;
  pastEventsDays: number;

  // Colors
  primaryColor: string;
  accentColor: string;

  // Filters
  quickFilters: QuickFiltersConfig;
  dropdownFilters: DropdownFiltersConfig;

  // Auto-tagging
  autoTagRules: AutoTagRule[];

  // Title parsing
  titleParsing: TitleParsingConfig;

  // Member/Public overrides
  memberConfig: Partial<ClubCalendarConfig>;
  publicConfig: Partial<ClubCalendarConfig>;

  // Theme
  autoTheme: boolean;
  stylePreset: 'default' | 'compact' | 'minimal' | 'wa-compatible';
  cssVars: Record<string, string>;
  customCSS: string;

  // Fallback
  fallbackContainerId: string;
  fallbackEventsUrl: string;

  // Hidden tags
  hiddenTags: string[];
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_CONFIG: ClubCalendarConfig = {
  waAccountId: '',
  headerTitle: 'Club Events',
  showHeader: true,
  showFilters: true,
  showMyEvents: true,
  showEventTags: true,
  showEventDots: true,
  showWaitlistCount: false,
  defaultView: 'dayGridMonth',
  pastEventsVisible: false,
  pastEventsDays: 14,
  primaryColor: '#2c5aa0',
  accentColor: '#d4a800',
  quickFilters: {
    weekend: true,
    openings: true,
    afterhours: true,
    free: false,
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
  autoTagRules: [],
  titleParsing: {
    enabled: true,
    separator: ':',
    maxSeparatorPosition: 30,
    defaultCategory: 'General',
    stripChars: '*-()',
  },
  memberConfig: {},
  publicConfig: {},
  autoTheme: true,
  stylePreset: 'default',
  cssVars: {},
  customCSS: '',
  fallbackContainerId: 'wa-fallback',
  fallbackEventsUrl: '/events',
  hiddenTags: [],
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DIMENSIONS (for matrix testing)
// ═══════════════════════════════════════════════════════════════

/**
 * All boolean configuration options that can be toggled
 */
export const BOOLEAN_OPTIONS = [
  'showHeader',
  'showFilters',
  'showMyEvents',
  'showEventTags',
  'showEventDots',
  'showWaitlistCount',
  'pastEventsVisible',
  'autoTheme',
] as const;

/**
 * Quick filter options (5 filters = 32 combinations)
 */
export const QUICK_FILTER_OPTIONS = [
  'weekend',
  'openings',
  'afterhours',
  'free',
  'public',
] as const;

/**
 * Dropdown filter options (7 filters = 128 combinations)
 */
export const DROPDOWN_FILTER_OPTIONS = [
  'committee',
  'activity',
  'price',
  'eventType',
  'recurring',
  'venue',
  'tags',
] as const;

/**
 * View options
 */
export const VIEW_OPTIONS = [
  'dayGridMonth',
  'dayGridWeek',
  'listWeek',
  'listYear',
] as const;

/**
 * Style preset options
 */
export const STYLE_PRESETS = [
  'default',
  'compact',
  'minimal',
  'wa-compatible',
] as const;

// ═══════════════════════════════════════════════════════════════
// MATRIX GENERATORS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate all possible boolean combinations for an array of options
 */
export function generateBooleanCombinations(options: readonly string[]): Record<string, boolean>[] {
  const count = Math.pow(2, options.length);
  const combinations: Record<string, boolean>[] = [];

  for (let i = 0; i < count; i++) {
    const combo: Record<string, boolean> = {};
    for (let j = 0; j < options.length; j++) {
      combo[options[j]] = Boolean(i & (1 << j));
    }
    combinations.push(combo);
  }

  return combinations;
}

/**
 * Generate representative sample of combinations (for large matrices)
 * Uses pairwise testing approach - every pair of values tested together
 */
export function generatePairwiseCombinations(options: readonly string[]): Record<string, boolean>[] {
  // For small sets, return all combinations
  if (options.length <= 4) {
    return generateBooleanCombinations(options);
  }

  // For larger sets, use strategic sampling
  const combinations: Record<string, boolean>[] = [];

  // All false
  const allFalse: Record<string, boolean> = {};
  options.forEach(opt => allFalse[opt] = false);
  combinations.push(allFalse);

  // All true
  const allTrue: Record<string, boolean> = {};
  options.forEach(opt => allTrue[opt] = true);
  combinations.push(allTrue);

  // Each option true individually (others false)
  for (const opt of options) {
    const combo: Record<string, boolean> = {};
    options.forEach(o => combo[o] = o === opt);
    combinations.push(combo);
  }

  // Each option false individually (others true)
  for (const opt of options) {
    const combo: Record<string, boolean> = {};
    options.forEach(o => combo[o] = o !== opt);
    combinations.push(combo);
  }

  // Alternating patterns
  const alternate1: Record<string, boolean> = {};
  const alternate2: Record<string, boolean> = {};
  options.forEach((opt, i) => {
    alternate1[opt] = i % 2 === 0;
    alternate2[opt] = i % 2 === 1;
  });
  combinations.push(alternate1, alternate2);

  return combinations;
}

// ═══════════════════════════════════════════════════════════════
// BUILD PROFILE INTERFACE
// ═══════════════════════════════════════════════════════════════

/**
 * A build profile defines a specific configuration to certify
 */
export interface BuildProfile {
  name: string;
  description: string;
  config: Partial<ClubCalendarConfig>;
  expectedBehaviors: ExpectedBehavior[];
  sampleEventTitles?: string[];  // For testing auto-tag rules
}

export interface ExpectedBehavior {
  description: string;
  test: (config: ClubCalendarConfig) => boolean;
}

// ═══════════════════════════════════════════════════════════════
// CERTIFICATION RESULT
// ═══════════════════════════════════════════════════════════════

export interface CertificationResult {
  buildName: string;
  timestamp: string;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestResult[];
}

export interface TestResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}
