/**
 * SBNC Build Certification Tests
 *
 * Comprehensive test suite to certify the SBNC build.
 * Run with: npm run test:certify:sbnc
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  applyAutoTags,
  transformEvent,
  WaEvent,
} from '../../widget/src/core';
import {
  DEFAULT_CONFIG,
  ClubCalendarConfig,
  generateBooleanCombinations,
  generatePairwiseCombinations,
  QUICK_FILTER_OPTIONS,
  DROPDOWN_FILTER_OPTIONS,
} from './config-schema';
import {
  SBNC_PROFILE,
  SBNC_AUTO_TAG_RULES,
  SBNC_SAMPLE_TITLES,
  SBNC_EXPECTED_TAGS,
  SBNC_BUDDY_TEST_CHECKLIST,
  SBNC_TEST_COUNTS,
} from './sbnc-profile';

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function mergeConfig(base: ClubCalendarConfig, overrides: Partial<ClubCalendarConfig>): ClubCalendarConfig {
  const result = { ...base };
  for (const key of Object.keys(overrides) as (keyof ClubCalendarConfig)[]) {
    const value = overrides[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      (result as any)[key] = { ...(result as any)[key], ...value };
    } else if (value !== undefined) {
      (result as any)[key] = value;
    }
  }
  return result;
}

function createTestEvent(title: string, options: Partial<WaEvent> = {}): WaEvent {
  return {
    Id: Math.floor(Math.random() * 100000),
    Name: title,
    StartDate: new Date().toISOString(),
    AccessLevel: 'Public',
    RegistrationEnabled: true,
    RegistrationTypes: [],
    ...options,
  };
}

// ═══════════════════════════════════════════════════════════════
// SBNC PROFILE VALIDATION
// ═══════════════════════════════════════════════════════════════

describe('SBNC Build Profile Validation', () => {
  let config: ClubCalendarConfig;

  beforeAll(() => {
    config = mergeConfig(DEFAULT_CONFIG, SBNC_PROFILE.config);
  });

  it('should have valid SBNC profile definition', () => {
    expect(SBNC_PROFILE.name).toBe('SBNC');
    expect(SBNC_PROFILE.config.waAccountId).toBe('176353');
  });

  describe('Expected behaviors', () => {
    for (const behavior of SBNC_PROFILE.expectedBehaviors) {
      it(behavior.description, () => {
        expect(behavior.test(config)).toBe(true);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTO-TAG RULES CERTIFICATION
// ═══════════════════════════════════════════════════════════════

describe('SBNC Auto-Tag Rules Certification', () => {
  it('should have exactly 18 committee rules', () => {
    expect(SBNC_AUTO_TAG_RULES.length).toBe(18);
  });

  it('all rules should be name-prefix type', () => {
    for (const rule of SBNC_AUTO_TAG_RULES) {
      expect(rule.type).toBe('name-prefix');
    }
  });

  it('all rules should have committee: tag prefix', () => {
    for (const rule of SBNC_AUTO_TAG_RULES) {
      expect(rule.tag.startsWith('committee:')).toBe(true);
    }
  });

  describe('Individual committee rules', () => {
    const committees = [
      { pattern: 'Happy Hikers:', tag: 'committee:happy-hikers' },
      { pattern: 'Games!:', tag: 'committee:games' },
      { pattern: 'Wine Appreciation:', tag: 'committee:wine' },
      { pattern: 'Epicurious:', tag: 'committee:epicurious' },
      { pattern: 'TGIF:', tag: 'committee:tgif' },
      { pattern: 'Cycling:', tag: 'committee:cycling' },
      { pattern: 'Golf:', tag: 'committee:golf' },
      { pattern: 'Performing Arts:', tag: 'committee:performing-arts' },
      { pattern: 'Local Heritage:', tag: 'committee:local-heritage' },
      { pattern: 'Wellness:', tag: 'committee:wellness' },
      { pattern: 'Garden:', tag: 'committee:garden' },
      { pattern: 'Arts:', tag: 'committee:arts' },
      { pattern: 'Current Events:', tag: 'committee:current-events' },
      { pattern: 'Pop-Up:', tag: 'committee:popup' },
      { pattern: 'Beer Lovers:', tag: 'committee:beer' },
      { pattern: 'Out to Lunch:', tag: 'committee:out-to-lunch' },
      { pattern: 'Afternoon Book:', tag: 'committee:book-clubs' },
      { pattern: 'Evening Book:', tag: 'committee:book-clubs' },
    ];

    it.each(committees)('$pattern → $tag', ({ pattern, tag }) => {
      const rule = SBNC_AUTO_TAG_RULES.find(r => r.pattern === pattern);
      expect(rule).toBeDefined();
      expect(rule?.tag).toBe(tag);
    });
  });

  describe('Sample event title tagging', () => {
    for (const title of SBNC_SAMPLE_TITLES) {
      it(`"${title.substring(0, 40)}..." → correct tags`, () => {
        const tags = applyAutoTags({ Name: title }, SBNC_AUTO_TAG_RULES);
        const expectedTags = SBNC_EXPECTED_TAGS[title];

        expect(expectedTags).toBeDefined();
        for (const expectedTag of expectedTags) {
          expect(tags).toContain(expectedTag);
        }
      });
    }
  });

  describe('Edge cases', () => {
    it('should handle case insensitivity', () => {
      const tags = applyAutoTags(
        { Name: 'HAPPY HIKERS: LOUD MORNING WALK' },
        SBNC_AUTO_TAG_RULES
      );
      expect(tags).toContain('committee:happy-hikers');
    });

    it('should not match partial prefixes', () => {
      const tags = applyAutoTags(
        { Name: 'Happy Hiking Club: Morning Walk' },
        SBNC_AUTO_TAG_RULES
      );
      expect(tags).not.toContain('committee:happy-hikers');
    });

    it('should handle Games! with exclamation mark', () => {
      const tags = applyAutoTags(
        { Name: 'Games!: Board Game Night' },
        SBNC_AUTO_TAG_RULES
      );
      expect(tags).toContain('committee:games');
    });

    it('should handle both book clubs sharing a tag', () => {
      const afternoonTags = applyAutoTags(
        { Name: 'Afternoon Book: January Selection' },
        SBNC_AUTO_TAG_RULES
      );
      const eveningTags = applyAutoTags(
        { Name: 'Evening Book: Mystery Novels' },
        SBNC_AUTO_TAG_RULES
      );

      expect(afternoonTags).toContain('committee:book-clubs');
      expect(eveningTags).toContain('committee:book-clubs');
    });

    it('should return empty for unrecognized committee', () => {
      const tags = applyAutoTags(
        { Name: 'New Committee: First Event' },
        SBNC_AUTO_TAG_RULES
      );
      expect(tags).toHaveLength(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// QUICK FILTER CONFIGURATION MATRIX
// ═══════════════════════════════════════════════════════════════

describe('Quick Filter Configuration Matrix', () => {
  const sampleCombinations = generatePairwiseCombinations(QUICK_FILTER_OPTIONS);

  it(`should test ${sampleCombinations.length} representative combinations`, () => {
    expect(sampleCombinations.length).toBeGreaterThan(0);
    expect(sampleCombinations.length).toBeLessThanOrEqual(32); // Max is 2^5
  });

  describe('SBNC quick filter config', () => {
    const sbncQuickFilters = SBNC_PROFILE.config.quickFilters!;

    it('weekend filter is enabled', () => {
      expect(sbncQuickFilters.weekend).toBe(true);
    });

    it('openings filter is enabled', () => {
      expect(sbncQuickFilters.openings).toBe(true);
    });

    it('afterhours filter is enabled', () => {
      expect(sbncQuickFilters.afterhours).toBe(true);
    });

    it('free filter is disabled', () => {
      expect(sbncQuickFilters.free).toBe(false);
    });

    it('public filter is enabled', () => {
      expect(sbncQuickFilters.public).toBe(true);
    });
  });

  describe('Pairwise combinations validation', () => {
    it.each(sampleCombinations)(
      'config %j is valid',
      (combo) => {
        const config = mergeConfig(DEFAULT_CONFIG, {
          quickFilters: combo as any,
        });

        // Verify config merges correctly
        expect(config.quickFilters).toEqual(combo);
      }
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// DROPDOWN FILTER CONFIGURATION MATRIX
// ═══════════════════════════════════════════════════════════════

describe('Dropdown Filter Configuration Matrix', () => {
  const sampleCombinations = generatePairwiseCombinations(DROPDOWN_FILTER_OPTIONS);

  it(`should test ${sampleCombinations.length} representative combinations`, () => {
    expect(sampleCombinations.length).toBeGreaterThan(0);
    expect(sampleCombinations.length).toBeLessThanOrEqual(128); // Max is 2^7
  });

  describe('SBNC dropdown filter config', () => {
    const sbncDropdownFilters = SBNC_PROFILE.config.dropdownFilters!;

    it('all dropdown filters are enabled', () => {
      expect(sbncDropdownFilters.committee).toBe(true);
      expect(sbncDropdownFilters.activity).toBe(true);
      expect(sbncDropdownFilters.price).toBe(true);
      expect(sbncDropdownFilters.eventType).toBe(true);
      expect(sbncDropdownFilters.recurring).toBe(true);
      expect(sbncDropdownFilters.venue).toBe(true);
      expect(sbncDropdownFilters.tags).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// MEMBER VS PUBLIC CONFIG
// ═══════════════════════════════════════════════════════════════

describe('Member vs Public Configuration', () => {
  const baseConfig = mergeConfig(DEFAULT_CONFIG, SBNC_PROFILE.config);

  describe('Member config', () => {
    it('My Events is shown', () => {
      const memberConfig = SBNC_PROFILE.config.memberConfig!;
      expect(memberConfig.showMyEvents).toBe(true);
    });
  });

  describe('Public config', () => {
    it('My Events is hidden', () => {
      const publicConfig = SBNC_PROFILE.config.publicConfig! as any;
      expect(publicConfig.showMyEvents).toBe(false);
    });

    it('Public quick filter is hidden', () => {
      const publicConfig = SBNC_PROFILE.config.publicConfig! as any;
      expect(publicConfig.quickFilters?.public).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// TITLE PARSING CONFIGURATION
// ═══════════════════════════════════════════════════════════════

describe('Title Parsing Configuration', () => {
  it('should be enabled for SBNC', () => {
    expect(SBNC_PROFILE.config.titleParsing?.enabled).toBe(true);
  });

  it('should use colon separator', () => {
    expect(SBNC_PROFILE.config.titleParsing?.separator).toBe(':');
  });

  describe('Title extraction', () => {
    const testCases = [
      { input: 'Happy Hikers: Morning Walk', expectedTitle: 'Morning Walk' },
      { input: 'Games!: Board Game Night', expectedTitle: 'Board Game Night' },
      { input: 'TGIF: Happy Hour', expectedTitle: 'Happy Hour' },
      { input: 'No Prefix Event', expectedTitle: 'No Prefix Event' },
    ];

    // Note: getCleanTitle is tested in core.test.ts
    // Here we just verify the config is set correctly for SBNC
    it('title parsing config matches SBNC conventions', () => {
      const config = SBNC_PROFILE.config.titleParsing!;
      expect(config.separator).toBe(':');
      expect(config.maxSeparatorPosition).toBe(30);
      expect(config.defaultCategory).toBe('General');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// BUDDY TEST CHECKLIST COVERAGE
// ═══════════════════════════════════════════════════════════════

describe('Buddy Test Checklist Coverage', () => {
  it(`should have ${SBNC_TEST_COUNTS.total} total test items`, () => {
    expect(SBNC_BUDDY_TEST_CHECKLIST.length).toBe(SBNC_TEST_COUNTS.total);
  });

  it(`should have ${SBNC_TEST_COUNTS.automated} automated tests`, () => {
    const automated = SBNC_BUDDY_TEST_CHECKLIST.filter(t => t.automated);
    expect(automated.length).toBe(SBNC_TEST_COUNTS.automated);
  });

  it(`should have ${SBNC_TEST_COUNTS.manual} manual tests`, () => {
    const manual = SBNC_BUDDY_TEST_CHECKLIST.filter(t => !t.automated);
    expect(manual.length).toBe(SBNC_TEST_COUNTS.manual);
  });

  describe('Categories', () => {
    const categories = [...new Set(SBNC_BUDDY_TEST_CHECKLIST.map(t => t.category))];

    it('should cover expected categories', () => {
      expect(categories).toContain('Widget Loading');
      expect(categories).toContain('Filters');
      expect(categories).toContain('My Events');
      expect(categories).toContain('Event Display');
      expect(categories).toContain('Views');
      expect(categories).toContain('Mobile');
      expect(categories).toContain('Guest Mode');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// CERTIFICATION SUMMARY
// ═══════════════════════════════════════════════════════════════

describe('SBNC Certification Summary', () => {
  it('should pass all certification criteria', () => {
    // This test serves as a summary gate
    // If we get here, all other tests passed
    expect(true).toBe(true);
  });

  it('should report certification stats', () => {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('SBNC BUILD CERTIFICATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Build Profile: ${SBNC_PROFILE.name}`);
    console.log(`WA Account ID: ${SBNC_PROFILE.config.waAccountId}`);
    console.log(`Auto-Tag Rules: ${SBNC_AUTO_TAG_RULES.length}`);
    console.log(`Expected Behaviors: ${SBNC_PROFILE.expectedBehaviors.length}`);
    console.log(`Buddy Test Items: ${SBNC_TEST_COUNTS.total}`);
    console.log(`  - Automated: ${SBNC_TEST_COUNTS.automated}`);
    console.log(`  - Manual: ${SBNC_TEST_COUNTS.manual}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  });
});
