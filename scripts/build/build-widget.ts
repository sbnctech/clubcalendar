#!/usr/bin/env npx tsx
/**
 * ClubCalendar Build Tool
 *
 * Generates custom widget deployments based on organizational profiles.
 *
 * Usage:
 *   npx tsx scripts/build/build-widget.ts <profile-name>
 *   npx tsx scripts/build/build-widget.ts --config path/to/config.json
 *   npx tsx scripts/build/build-widget.ts --interactive
 *
 * Examples:
 *   npx tsx scripts/build/build-widget.ts sbnc
 *   npx tsx scripts/build/build-widget.ts --config my-org-config.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AutoTagRule {
  type: 'name-prefix' | 'name-contains' | 'name-suffix';
  pattern: string;
  tag: string;
}

interface QuickFiltersConfig {
  weekend?: boolean;
  openings?: boolean;
  afterhours?: boolean;
  free?: boolean;
  public?: boolean;
}

interface DropdownFiltersConfig {
  committee?: boolean;
  activity?: boolean;
  price?: boolean;
  eventType?: boolean;
  recurring?: boolean;
  venue?: boolean;
  tags?: boolean;
}

interface TitleParsingConfig {
  enabled?: boolean;
  separator?: string;
  maxSeparatorPosition?: number;
  defaultCategory?: string;
  stripChars?: string;
}

interface BuildConfig {
  // Organization info
  organizationName: string;
  organizationShortName: string;

  // Required
  waAccountId: string;

  // Display
  headerTitle?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showMyEvents?: boolean;
  showEventTags?: boolean;
  showEventDots?: boolean;
  showWaitlistCount?: boolean;

  // Views
  defaultView?: 'dayGridMonth' | 'dayGridWeek' | 'listWeek' | 'listYear';
  pastEventsVisible?: boolean;
  pastEventsDays?: number;

  // Colors
  primaryColor?: string;
  accentColor?: string;

  // Filters
  quickFilters?: QuickFiltersConfig;
  dropdownFilters?: DropdownFiltersConfig;

  // Auto-tagging
  autoTagRules?: AutoTagRule[];

  // Title parsing
  titleParsing?: TitleParsingConfig;

  // Member/Public overrides
  memberConfig?: Partial<BuildConfig>;
  publicConfig?: Partial<BuildConfig>;

  // Theme
  autoTheme?: boolean;
  stylePreset?: 'default' | 'compact' | 'minimal' | 'wa-compatible';
  customCSS?: string;

  // Fallback
  fallbackEventsUrl?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════
// BUILT-IN PROFILES
// ═══════════════════════════════════════════════════════════════

const PROFILES: Record<string, BuildConfig> = {
  sbnc: {
    organizationName: 'Santa Barbara Newcomers Club',
    organizationShortName: 'SBNC',
    waAccountId: '176353',
    headerTitle: 'SBNC Events',
    primaryColor: '#2c5aa0',
    accentColor: '#d4a800',
    autoTagRules: [
      { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
      { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' },
      { type: 'name-prefix', pattern: 'Wine Appreciation:', tag: 'committee:wine' },
      { type: 'name-prefix', pattern: 'Epicurious:', tag: 'committee:epicurious' },
      { type: 'name-prefix', pattern: 'TGIF:', tag: 'committee:tgif' },
      { type: 'name-prefix', pattern: 'Cycling:', tag: 'committee:cycling' },
      { type: 'name-prefix', pattern: 'Golf:', tag: 'committee:golf' },
      { type: 'name-prefix', pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
      { type: 'name-prefix', pattern: 'Local Heritage:', tag: 'committee:local-heritage' },
      { type: 'name-prefix', pattern: 'Wellness:', tag: 'committee:wellness' },
      { type: 'name-prefix', pattern: 'Garden:', tag: 'committee:garden' },
      { type: 'name-prefix', pattern: 'Arts:', tag: 'committee:arts' },
      { type: 'name-prefix', pattern: 'Current Events:', tag: 'committee:current-events' },
      { type: 'name-prefix', pattern: 'Pop-Up:', tag: 'committee:popup' },
      { type: 'name-prefix', pattern: 'Beer Lovers:', tag: 'committee:beer' },
      { type: 'name-prefix', pattern: 'Out to Lunch:', tag: 'committee:out-to-lunch' },
      { type: 'name-prefix', pattern: 'Afternoon Book:', tag: 'committee:book-clubs' },
      { type: 'name-prefix', pattern: 'Evening Book:', tag: 'committee:book-clubs' },
    ],
    quickFilters: {
      weekend: true,
      openings: true,
      afterhours: true,
      free: false,
      public: true,
    },
    publicConfig: {
      organizationName: '',
      organizationShortName: '',
      waAccountId: '',
      showMyEvents: false,
      quickFilters: { public: false },
    },
    memberConfig: {
      organizationName: '',
      organizationShortName: '',
      waAccountId: '',
      showMyEvents: true,
    },
  },

  // Example minimal profile
  minimal: {
    organizationName: 'Example Organization',
    organizationShortName: 'EXAMPLE',
    waAccountId: 'YOUR_ACCOUNT_ID',
    headerTitle: 'Events',
    autoTagRules: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateConfig(config: BuildConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!config.organizationName) {
    errors.push('organizationName is required');
  }
  if (!config.organizationShortName) {
    errors.push('organizationShortName is required');
  }
  if (!config.waAccountId) {
    errors.push('waAccountId is required');
  }
  if (config.waAccountId === 'YOUR_ACCOUNT_ID') {
    errors.push('waAccountId must be set to your actual Wild Apricot account ID');
  }

  // Validate colors
  if (config.primaryColor && !/^#[0-9a-fA-F]{6}$/.test(config.primaryColor)) {
    errors.push('primaryColor must be a valid hex color (e.g., #2c5aa0)');
  }
  if (config.accentColor && !/^#[0-9a-fA-F]{6}$/.test(config.accentColor)) {
    errors.push('accentColor must be a valid hex color (e.g., #d4a800)');
  }

  // Validate auto-tag rules
  if (config.autoTagRules) {
    for (let i = 0; i < config.autoTagRules.length; i++) {
      const rule = config.autoTagRules[i];
      if (!['name-prefix', 'name-contains', 'name-suffix'].includes(rule.type)) {
        errors.push(`autoTagRules[${i}].type must be 'name-prefix', 'name-contains', or 'name-suffix'`);
      }
      if (!rule.pattern) {
        errors.push(`autoTagRules[${i}].pattern is required`);
      }
      if (!rule.tag) {
        errors.push(`autoTagRules[${i}].tag is required`);
      }
    }
  }

  // Validate view
  if (config.defaultView && !['dayGridMonth', 'dayGridWeek', 'listWeek', 'listYear'].includes(config.defaultView)) {
    errors.push('defaultView must be one of: dayGridMonth, dayGridWeek, listWeek, listYear');
  }

  // Warnings
  if (!config.autoTagRules || config.autoTagRules.length === 0) {
    warnings.push('No autoTagRules defined - committee filtering will not work');
  }
  if (!config.headerTitle) {
    warnings.push('No headerTitle specified - will use default "Club Events"');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════
// CODE GENERATION
// ═══════════════════════════════════════════════════════════════

function generateHeader(config: BuildConfig): string {
  const shortName = config.organizationShortName;
  const fullName = config.organizationName;
  const padding = 77 - shortName.length;
  const padding2 = 78 - fullName.length;

  return `<!--
  ╔════════════════════════════════════════════════════════════════════════════╗
  ║  ${shortName} ClubCalendar Widget - INLINE ONLY Edition${' '.repeat(Math.max(0, padding - 35))}║
  ║  ${fullName}${' '.repeat(Math.max(0, padding2))}║
  ╠════════════════════════════════════════════════════════════════════════════╣
  ║                                                                             ║
  ║  INSTALLATION:                                                              ║
  ║  1. Copy this ENTIRE file                                                   ║
  ║  2. Paste into a Wild Apricot Custom HTML gadget                           ║
  ║  3. Save and view the page while logged in                                 ║
  ║                                                                             ║
  ║  NO EXTERNAL DEPENDENCIES:                                                  ║
  ║  - No external server hosting required                                      ║
  ║  - No script src loading required                                          ║
  ║  - Runs entirely within Wild Apricot                                       ║
  ║                                                                             ║
  ║  Generated: ${new Date().toISOString().split('T')[0]}                                                       ║
  ║                                                                             ║
  ╚════════════════════════════════════════════════════════════════════════════╝
-->

<div id="clubcalendar"></div>
`;
}

function generateConfigBlock(config: BuildConfig): string {
  // Build the config object, omitting undefined values
  const configObj: Record<string, any> = {};

  if (config.waAccountId) configObj.waAccountId = config.waAccountId;
  if (config.headerTitle) configObj.headerTitle = config.headerTitle;
  if (config.showMyEvents !== undefined) configObj.showMyEvents = config.showMyEvents;
  if (config.showFilters !== undefined) configObj.showFilters = config.showFilters;
  if (config.showHeader !== undefined) configObj.showHeader = config.showHeader;
  if (config.defaultView) configObj.defaultView = config.defaultView;
  if (config.primaryColor) configObj.primaryColor = config.primaryColor;
  if (config.accentColor) configObj.accentColor = config.accentColor;
  if (config.showEventTags !== undefined) configObj.showEventTags = config.showEventTags;
  if (config.showEventDots !== undefined) configObj.showEventDots = config.showEventDots;
  if (config.showWaitlistCount !== undefined) configObj.showWaitlistCount = config.showWaitlistCount;
  if (config.pastEventsVisible !== undefined) configObj.pastEventsVisible = config.pastEventsVisible;
  if (config.pastEventsDays !== undefined) configObj.pastEventsDays = config.pastEventsDays;
  if (config.autoTheme !== undefined) configObj.autoTheme = config.autoTheme;
  if (config.stylePreset) configObj.stylePreset = config.stylePreset;
  if (config.customCSS) configObj.customCSS = config.customCSS;
  if (config.fallbackEventsUrl) configObj.fallbackEventsUrl = config.fallbackEventsUrl;

  if (config.autoTagRules && config.autoTagRules.length > 0) {
    configObj.autoTagRules = config.autoTagRules;
  }

  if (config.quickFilters) {
    configObj.quickFilters = config.quickFilters;
  }

  if (config.dropdownFilters) {
    configObj.dropdownFilters = config.dropdownFilters;
  }

  if (config.titleParsing) {
    configObj.titleParsing = config.titleParsing;
  }

  if (config.publicConfig && Object.keys(config.publicConfig).length > 0) {
    // Remove the required fields from publicConfig for output
    const { organizationName, organizationShortName, waAccountId, ...rest } = config.publicConfig;
    if (Object.keys(rest).length > 0) {
      configObj.publicConfig = rest;
    }
  }

  if (config.memberConfig && Object.keys(config.memberConfig).length > 0) {
    const { organizationName, organizationShortName, waAccountId, ...rest } = config.memberConfig;
    if (Object.keys(rest).length > 0) {
      configObj.memberConfig = rest;
    }
  }

  // Format as JavaScript object literal
  const configStr = JSON.stringify(configObj, null, 4)
    .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
    .replace(/"/g, "'");            // Use single quotes for strings

  return `<script>
window.CLUBCALENDAR_CONFIG = ${configStr};
</script>

`;
}

function generateBuild(config: BuildConfig, widgetCorePath: string): string {
  const header = generateHeader(config);
  const configBlock = generateConfigBlock(config);
  const widgetCore = fs.readFileSync(widgetCorePath, 'utf-8');

  return header + configBlock + widgetCore;
}

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE MODE
// ═══════════════════════════════════════════════════════════════

async function runInteractive(): Promise<BuildConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ClubCalendar Build Tool - Interactive Mode                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const config: BuildConfig = {
    organizationName: '',
    organizationShortName: '',
    waAccountId: '',
    autoTagRules: [],
  };

  config.organizationName = await question('Organization full name: ');
  config.organizationShortName = await question('Organization short name (e.g., SBNC): ');
  config.waAccountId = await question('Wild Apricot Account ID: ');
  config.headerTitle = await question('Header title [default: "Events"]: ') || 'Events';
  config.primaryColor = await question('Primary color [default: #2c5aa0]: ') || '#2c5aa0';
  config.accentColor = await question('Accent color [default: #d4a800]: ') || '#d4a800';

  const addRules = await question('\nAdd auto-tag rules for committees? (y/n): ');
  if (addRules.toLowerCase() === 'y') {
    console.log('\nEnter committee rules (empty pattern to finish):');
    while (true) {
      const pattern = await question('  Pattern (e.g., "Hiking:"): ');
      if (!pattern) break;
      const tag = await question('  Tag (e.g., "committee:hiking"): ');
      if (tag) {
        config.autoTagRules!.push({ type: 'name-prefix', pattern, tag });
      }
    }
  }

  rl.close();
  return config;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const widgetCorePath = path.join(scriptDir, 'widget-core.html');
  const outputDir = path.join(scriptDir, '../../deploy');

  // Check widget core exists
  if (!fs.existsSync(widgetCorePath)) {
    console.error('Error: widget-core.html not found. Run from repository root.');
    process.exit(1);
  }

  let config: BuildConfig;
  let outputName: string;

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
ClubCalendar Build Tool

Usage:
  npx tsx scripts/build/build-widget.ts <profile-name>
  npx tsx scripts/build/build-widget.ts --config <path/to/config.json>
  npx tsx scripts/build/build-widget.ts --interactive
  npx tsx scripts/build/build-widget.ts --list

Built-in profiles: ${Object.keys(PROFILES).join(', ')}

Options:
  --config <file>    Use a JSON configuration file
  --interactive      Build interactively with prompts
  --list             List available profiles
  --output <file>    Specify output filename
  --validate         Validate config without building
`);
    process.exit(0);
  }

  if (args[0] === '--list') {
    console.log('\nAvailable profiles:\n');
    for (const [name, profile] of Object.entries(PROFILES)) {
      console.log(`  ${name}: ${profile.organizationName}`);
    }
    process.exit(0);
  }

  if (args[0] === '--interactive') {
    config = await runInteractive();
    outputName = config.organizationShortName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  } else if (args[0] === '--config') {
    const configPath = args[1];
    if (!configPath || !fs.existsSync(configPath)) {
      console.error('Error: Config file not found:', configPath);
      process.exit(1);
    }
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    outputName = config.organizationShortName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  } else {
    // Load built-in profile
    const profileName = args[0].toLowerCase();
    if (!PROFILES[profileName]) {
      console.error(`Error: Unknown profile "${profileName}". Use --list to see available profiles.`);
      process.exit(1);
    }
    config = PROFILES[profileName];
    outputName = profileName;
  }

  // Check for --output override
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputName = args[outputIdx + 1].replace('.html', '');
  }

  // Validate
  console.log(`\nValidating configuration for ${config.organizationName}...`);
  const validation = validateConfig(config);

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }

  if (!validation.valid) {
    console.log('\nErrors:');
    validation.errors.forEach(e => console.log(`  ❌ ${e}`));
    process.exit(1);
  }

  // Check for --validate only
  if (args.includes('--validate')) {
    console.log('\n✅ Configuration is valid!');
    process.exit(0);
  }

  // Generate build
  console.log('\nGenerating build...');
  const build = generateBuild(config, widgetCorePath);

  // Write output
  const outputPath = path.join(outputDir, `ClubCalendar_${outputName.toUpperCase()}_EVENTS_PAGE.html`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, build);

  const lines = build.split('\n').length;
  console.log(`\n✅ Build complete!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Lines: ${lines}`);
  console.log(`   Auto-tag rules: ${config.autoTagRules?.length || 0}`);

  // Suggest next steps
  console.log(`\nNext steps:`);
  console.log(`  1. Review the generated file`);
  console.log(`  2. Run certification tests: npm run test:certify:${outputName}`);
  console.log(`  3. Copy contents to WA Custom HTML gadget`);
}

main().catch(console.error);
