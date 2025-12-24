/**
 * Configuration variation tests for ClubCalendar
 * Tests different auto-tag rule configurations
 */

import { describe, it, expect } from 'vitest';
import {
  applyAutoTags,
  transformEvent,
  AutoTagRule,
  WaEvent,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// TEST HELPER
// ═══════════════════════════════════════════════════════════════

function createEvent(name: string): WaEvent {
  return {
    Id: 1,
    Name: name,
    StartDate: new Date().toISOString(),
    AccessLevel: 'Public',
    RegistrationEnabled: true,
    RegistrationTypes: [],
  };
}

// ═══════════════════════════════════════════════════════════════
// EMPTY RULES CONFIGURATION
// ═══════════════════════════════════════════════════════════════

describe('Empty auto-tag rules', () => {
  const emptyRules: AutoTagRule[] = [];

  it('should return empty tags for any event name', () => {
    expect(applyAutoTags({ Name: 'Happy Hikers: Morning Walk' }, emptyRules)).toEqual([]);
    expect(applyAutoTags({ Name: 'Any Event Name' }, emptyRules)).toEqual([]);
    expect(applyAutoTags({ Name: '' }, emptyRules)).toEqual([]);
  });

  it('should still derive other tags in transformEvent', () => {
    const event = createEvent('Some Event');
    const transformed = transformEvent(event, emptyRules);

    // Should have derived tags but no committee tags
    expect(transformed.tags).not.toContain('committee:');
    expect(transformed.tags.some(t => t.startsWith('time:'))).toBe(true);
    expect(transformed.tags.some(t => t.startsWith('availability:'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// SINGLE RULE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

describe('Single rule configurations', () => {
  describe('prefix rule only', () => {
    const singlePrefixRule: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Test:', tag: 'test-tag' }
    ];

    it('should match exact prefix', () => {
      expect(applyAutoTags({ Name: 'Test: Event' }, singlePrefixRule)).toContain('test-tag');
    });

    it('should not match if prefix is in middle', () => {
      expect(applyAutoTags({ Name: 'Event Test: Something' }, singlePrefixRule)).not.toContain('test-tag');
    });

    it('should not match similar prefixes', () => {
      expect(applyAutoTags({ Name: 'Testing: Event' }, singlePrefixRule)).not.toContain('test-tag');
    });
  });

  describe('contains rule only', () => {
    const singleContainsRule: AutoTagRule[] = [
      { type: 'name-contains', pattern: 'special', tag: 'has-special' }
    ];

    it('should match anywhere in name', () => {
      expect(applyAutoTags({ Name: 'This is special' }, singleContainsRule)).toContain('has-special');
      expect(applyAutoTags({ Name: 'special event' }, singleContainsRule)).toContain('has-special');
      expect(applyAutoTags({ Name: 'very special event here' }, singleContainsRule)).toContain('has-special');
    });

    it('should be case-insensitive', () => {
      expect(applyAutoTags({ Name: 'SPECIAL Event' }, singleContainsRule)).toContain('has-special');
      expect(applyAutoTags({ Name: 'SpEcIaL Event' }, singleContainsRule)).toContain('has-special');
    });
  });

  describe('suffix rule only', () => {
    const singleSuffixRule: AutoTagRule[] = [
      { type: 'name-suffix', pattern: 'workshop', tag: 'type:workshop' }
    ];

    it('should match exact suffix', () => {
      expect(applyAutoTags({ Name: 'Garden Workshop' }, singleSuffixRule)).toContain('type:workshop');
    });

    it('should be case-insensitive', () => {
      expect(applyAutoTags({ Name: 'Garden WORKSHOP' }, singleSuffixRule)).toContain('type:workshop');
    });

    it('should not match if suffix is in middle', () => {
      expect(applyAutoTags({ Name: 'Workshop on Gardening' }, singleSuffixRule)).not.toContain('type:workshop');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// MULTIPLE RULES - SAME TYPE
// ═══════════════════════════════════════════════════════════════

describe('Multiple rules of same type', () => {
  const multiplePrefixRules: AutoTagRule[] = [
    { type: 'name-prefix', pattern: 'Alpha:', tag: 'group:alpha' },
    { type: 'name-prefix', pattern: 'Beta:', tag: 'group:beta' },
    { type: 'name-prefix', pattern: 'Gamma:', tag: 'group:gamma' },
  ];

  it('should match first applicable rule', () => {
    expect(applyAutoTags({ Name: 'Alpha: Event' }, multiplePrefixRules)).toContain('group:alpha');
    expect(applyAutoTags({ Name: 'Beta: Event' }, multiplePrefixRules)).toContain('group:beta');
    expect(applyAutoTags({ Name: 'Gamma: Event' }, multiplePrefixRules)).toContain('group:gamma');
  });

  it('should only match one prefix', () => {
    const tags = applyAutoTags({ Name: 'Alpha: Event' }, multiplePrefixRules);
    expect(tags).toContain('group:alpha');
    expect(tags).not.toContain('group:beta');
    expect(tags).not.toContain('group:gamma');
  });

  it('should return empty for non-matching events', () => {
    const tags = applyAutoTags({ Name: 'Delta: Event' }, multiplePrefixRules);
    expect(tags).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// MULTIPLE RULES - DIFFERENT TYPES
// ═══════════════════════════════════════════════════════════════

describe('Multiple rules of different types', () => {
  const mixedRules: AutoTagRule[] = [
    { type: 'name-prefix', pattern: 'Special:', tag: 'prefix:special' },
    { type: 'name-contains', pattern: 'vip', tag: 'contains:vip' },
    { type: 'name-suffix', pattern: 'members only', tag: 'suffix:members' },
  ];

  it('should apply multiple matching rules', () => {
    // Event that matches all three rules
    const tags = applyAutoTags(
      { Name: 'Special: VIP Event - Members Only' },
      mixedRules
    );
    expect(tags).toContain('prefix:special');
    expect(tags).toContain('contains:vip');
    expect(tags).toContain('suffix:members');
    expect(tags.length).toBe(3);
  });

  it('should apply only matching rules', () => {
    const tags = applyAutoTags({ Name: 'Special: Regular Event' }, mixedRules);
    expect(tags).toContain('prefix:special');
    expect(tags).not.toContain('contains:vip');
    expect(tags).not.toContain('suffix:members');
  });

  it('should match contains without prefix or suffix', () => {
    const tags = applyAutoTags({ Name: 'Regular VIP Event' }, mixedRules);
    expect(tags).not.toContain('prefix:special');
    expect(tags).toContain('contains:vip');
    expect(tags).not.toContain('suffix:members');
  });
});

// ═══════════════════════════════════════════════════════════════
// OVERLAPPING RULES
// ═══════════════════════════════════════════════════════════════

describe('Overlapping rules', () => {
  it('should apply all matching overlapping contains rules', () => {
    const overlappingRules: AutoTagRule[] = [
      { type: 'name-contains', pattern: 'wine', tag: 'topic:wine' },
      { type: 'name-contains', pattern: 'wine tasting', tag: 'topic:wine-tasting' },
      { type: 'name-contains', pattern: 'tasting', tag: 'topic:tasting' },
    ];

    const tags = applyAutoTags({ Name: 'Annual Wine Tasting Event' }, overlappingRules);
    expect(tags).toContain('topic:wine');
    expect(tags).toContain('topic:wine-tasting');
    expect(tags).toContain('topic:tasting');
  });

  it('should handle subset patterns', () => {
    const subsetRules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'H', tag: 'starts-h' },
      { type: 'name-prefix', pattern: 'Ha', tag: 'starts-ha' },
      { type: 'name-prefix', pattern: 'Happy', tag: 'starts-happy' },
      { type: 'name-prefix', pattern: 'Happy Hikers:', tag: 'committee:hikers' },
    ];

    const tags = applyAutoTags({ Name: 'Happy Hikers: Trail Walk' }, subsetRules);
    expect(tags).toContain('starts-h');
    expect(tags).toContain('starts-ha');
    expect(tags).toContain('starts-happy');
    expect(tags).toContain('committee:hikers');
  });
});

// ═══════════════════════════════════════════════════════════════
// CONFLICTING RULES
// ═══════════════════════════════════════════════════════════════

describe('Conflicting/duplicate tags', () => {
  it('should allow same tag from different rules', () => {
    const duplicateTagRules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Hike:', tag: 'outdoors' },
      { type: 'name-contains', pattern: 'trail', tag: 'outdoors' },
    ];

    const tags = applyAutoTags({ Name: 'Hike: Trail Adventure' }, duplicateTagRules);
    // Both rules match and add 'outdoors'
    expect(tags.filter(t => t === 'outdoors').length).toBe(2);
  });

  it('transformEvent should deduplicate tags', () => {
    const duplicateTagRules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Hike:', tag: 'outdoors' },
      { type: 'name-contains', pattern: 'hike', tag: 'outdoors' },
    ];

    const event: WaEvent = {
      Id: 1,
      Name: 'Hike: Morning Hike',
      StartDate: new Date().toISOString(),
      AccessLevel: 'Public',
      RegistrationEnabled: true,
      RegistrationTypes: [],
    };

    const transformed = transformEvent(event, duplicateTagRules);
    const outdoorsCount = transformed.tags.filter(t => t === 'outdoors').length;
    expect(outdoorsCount).toBe(1); // Should be deduplicated
  });
});

// ═══════════════════════════════════════════════════════════════
// SPECIAL CHARACTERS IN PATTERNS
// ═══════════════════════════════════════════════════════════════

describe('Special characters in patterns', () => {
  it('should handle exclamation marks', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Games!:', tag: 'committee:games' }
    ];
    expect(applyAutoTags({ Name: 'Games!: Board Game Night' }, rules)).toContain('committee:games');
  });

  it('should handle parentheses', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-contains', pattern: '(members)', tag: 'members-event' }
    ];
    expect(applyAutoTags({ Name: 'Event (Members) Only' }, rules)).toContain('members-event');
  });

  it('should handle hyphens', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Wine-Lovers:', tag: 'wine' }
    ];
    expect(applyAutoTags({ Name: 'Wine-Lovers: Tasting' }, rules)).toContain('wine');
  });

  it('should handle ampersands', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-contains', pattern: 'food & wine', tag: 'food-and-wine' }
    ];
    expect(applyAutoTags({ Name: 'Annual Food & Wine Festival' }, rules)).toContain('food-and-wine');
  });
});

// ═══════════════════════════════════════════════════════════════
// LARGE RULE SETS
// ═══════════════════════════════════════════════════════════════

describe('Large rule sets', () => {
  // Generate 100 rules
  const largeRuleSet: AutoTagRule[] = Array.from({ length: 100 }, (_, i) => ({
    type: 'name-prefix' as const,
    pattern: `Committee${i}:`,
    tag: `committee:group-${i}`,
  }));

  it('should handle 100 rules efficiently', () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      applyAutoTags({ Name: 'Committee50: Event' }, largeRuleSet);
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete 1000 iterations in under 100ms
  });

  it('should match correct rule from large set', () => {
    const tags = applyAutoTags({ Name: 'Committee50: Event' }, largeRuleSet);
    expect(tags).toContain('committee:group-50');
    expect(tags.length).toBe(1);
  });

  it('should handle no match in large set', () => {
    const tags = applyAutoTags({ Name: 'Unknown: Event' }, largeRuleSet);
    expect(tags).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// INVALID RULES
// ═══════════════════════════════════════════════════════════════

describe('Invalid or malformed rules', () => {
  it('should skip rules with empty pattern', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: '', tag: 'should-not-match' },
      { type: 'name-prefix', pattern: 'Valid:', tag: 'valid-tag' },
    ];
    const tags = applyAutoTags({ Name: 'Valid: Event' }, rules);
    expect(tags).not.toContain('should-not-match');
    expect(tags).toContain('valid-tag');
  });

  it('should skip rules with empty tag', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-prefix', pattern: 'Test:', tag: '' },
    ];
    const tags = applyAutoTags({ Name: 'Test: Event' }, rules);
    expect(tags).toEqual([]);
  });

  it('should handle rules with whitespace pattern', () => {
    const rules: AutoTagRule[] = [
      { type: 'name-contains', pattern: '   ', tag: 'whitespace' },
    ];
    // '   ' (three spaces) won't match 'Any Event Name' (single spaces)
    const tags = applyAutoTags({ Name: 'Any Event Name' }, rules);
    expect(tags).not.toContain('whitespace');

    // But matches if event has three consecutive spaces
    const tagsMatch = applyAutoTags({ Name: 'Event   Name' }, rules);
    expect(tagsMatch).toContain('whitespace');
  });
});
