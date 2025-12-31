/**
 * ClubCalendar Builder Tool Tests
 *
 * Tests configuration validation, file generation, and package creation.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Types matching the builder
interface AutoTagRule {
  type: 'name-prefix' | 'name-contains' | 'name-suffix';
  pattern: string;
  tag: string;
}

interface BuildConfig {
  organizationName: string;
  organizationShortName: string;
  waAccountId: string;
  headerTitle?: string;
  primaryColor?: string;
  accentColor?: string;
  defaultView?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showEventTags?: boolean;
  showEventDots?: boolean;
  showWaitlistCount?: boolean;
  pastEventsVisible?: boolean;
  quickFilters?: Record<string, boolean>;
  dropdownFilters?: Record<string, boolean>;
  autoTagRules?: AutoTagRule[];
  memberConfig?: Partial<BuildConfig>;
  publicConfig?: Partial<BuildConfig>;
}

// Validation logic (extracted from builder)
function validateConfig(config: BuildConfig): { valid: boolean; errors: string[]; warnings: string[] } {
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

// Generate config block (extracted from builder)
function generateConfigBlock(config: BuildConfig): string {
  const configObj: Record<string, any> = {};

  if (config.waAccountId) configObj.waAccountId = config.waAccountId;
  if (config.headerTitle) configObj.headerTitle = config.headerTitle;
  if (config.primaryColor) configObj.primaryColor = config.primaryColor;
  if (config.accentColor) configObj.accentColor = config.accentColor;
  if (config.autoTagRules && config.autoTagRules.length > 0) {
    configObj.autoTagRules = config.autoTagRules;
  }
  if (config.quickFilters) {
    configObj.quickFilters = config.quickFilters;
  }
  if (config.dropdownFilters) {
    configObj.dropdownFilters = config.dropdownFilters;
  }

  const configStr = JSON.stringify(configObj, null, 4)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  return `<script>
window.CLUBCALENDAR_CONFIG = ${configStr};
</script>

`;
}

describe('Builder Configuration Validation', () => {
  describe('Required fields', () => {
    it('should reject empty config', () => {
      const result = validateConfig({} as BuildConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('organizationName is required');
      expect(result.errors).toContain('organizationShortName is required');
      expect(result.errors).toContain('waAccountId is required');
    });

    it('should accept valid minimal config', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject placeholder WA Account ID', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: 'YOUR_ACCOUNT_ID',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('waAccountId must be set to your actual Wild Apricot account ID');
    });
  });

  describe('Color validation', () => {
    it('should accept valid hex colors', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        primaryColor: '#2c5aa0',
        accentColor: '#d4a800',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid primary color', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        primaryColor: 'red',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('primaryColor must be a valid hex color (e.g., #2c5aa0)');
    });

    it('should reject invalid accent color', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        accentColor: '#fff',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('accentColor must be a valid hex color (e.g., #d4a800)');
    });
  });

  describe('Auto-tag rules validation', () => {
    it('should accept valid auto-tag rules', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        autoTagRules: [
          { type: 'name-prefix', pattern: 'Hiking:', tag: 'committee:hiking' },
          { type: 'name-contains', pattern: 'workshop', tag: 'type:workshop' },
          { type: 'name-suffix', pattern: 'social', tag: 'type:social' },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).not.toContain('No autoTagRules defined - committee filtering will not work');
    });

    it('should reject invalid rule type', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        autoTagRules: [
          { type: 'invalid' as any, pattern: 'Test:', tag: 'test' },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be 'name-prefix'");
    });

    it('should reject rule without pattern', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        autoTagRules: [
          { type: 'name-prefix', pattern: '', tag: 'test' },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('autoTagRules[0].pattern is required');
    });

    it('should reject rule without tag', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        autoTagRules: [
          { type: 'name-prefix', pattern: 'Test:', tag: '' },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('autoTagRules[0].tag is required');
    });

    it('should warn when no auto-tag rules defined', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
      });
      expect(result.warnings).toContain('No autoTagRules defined - committee filtering will not work');
    });
  });

  describe('View validation', () => {
    it('should accept valid view options', () => {
      const views = ['dayGridMonth', 'dayGridWeek', 'listWeek', 'listYear'];
      for (const view of views) {
        const result = validateConfig({
          organizationName: 'Test Club',
          organizationShortName: 'TC',
          waAccountId: '123456',
          defaultView: view,
        });
        expect(result.valid).toBe(true);
      }
    });

    it('should reject invalid view', () => {
      const result = validateConfig({
        organizationName: 'Test Club',
        organizationShortName: 'TC',
        waAccountId: '123456',
        defaultView: 'invalidView',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('defaultView must be one of: dayGridMonth, dayGridWeek, listWeek, listYear');
    });
  });
});

describe('Builder Config Block Generation', () => {
  it('should generate valid JavaScript config block', () => {
    const config: BuildConfig = {
      organizationName: 'Test Club',
      organizationShortName: 'TC',
      waAccountId: '123456',
      headerTitle: 'Test Events',
      primaryColor: '#2c5aa0',
    };

    const block = generateConfigBlock(config);
    expect(block).toContain('window.CLUBCALENDAR_CONFIG');
    expect(block).toContain("waAccountId: '123456'");
    expect(block).toContain("headerTitle: 'Test Events'");
    expect(block).toContain("primaryColor: '#2c5aa0'");
  });

  it('should include auto-tag rules in config block', () => {
    const config: BuildConfig = {
      organizationName: 'Test Club',
      organizationShortName: 'TC',
      waAccountId: '123456',
      autoTagRules: [
        { type: 'name-prefix', pattern: 'Hiking:', tag: 'committee:hiking' },
      ],
    };

    const block = generateConfigBlock(config);
    expect(block).toContain('autoTagRules');
    expect(block).toContain('name-prefix');
    expect(block).toContain('Hiking:');
    expect(block).toContain('committee:hiking');
  });

  it('should include quick filters in config block', () => {
    const config: BuildConfig = {
      organizationName: 'Test Club',
      organizationShortName: 'TC',
      waAccountId: '123456',
      quickFilters: {
        weekend: true,
        openings: true,
        free: false,
      },
    };

    const block = generateConfigBlock(config);
    expect(block).toContain('quickFilters');
    expect(block).toContain('weekend: true');
    expect(block).toContain('free: false');
  });

  it('should use single quotes for strings', () => {
    const config: BuildConfig = {
      organizationName: 'Test Club',
      organizationShortName: 'TC',
      waAccountId: '123456',
      headerTitle: 'My Events',
    };

    const block = generateConfigBlock(config);
    expect(block).not.toContain('"My Events"');
    expect(block).toContain("'My Events'");
  });
});

describe('Builder File Structure', () => {
  const builderPath = path.join(__dirname, '../../deploy/builder');
  const widgetCorePath = path.join(__dirname, '../../scripts/build/widget-core.html');

  it('should have builder index.html', () => {
    expect(fs.existsSync(path.join(builderPath, 'index.html'))).toBe(true);
  });

  it('should have widget-core.html in builder folder', () => {
    expect(fs.existsSync(path.join(builderPath, 'widget-core.html'))).toBe(true);
  });

  it('should have widget-core.html in scripts/build', () => {
    expect(fs.existsSync(widgetCorePath)).toBe(true);
  });

  it('builder index.html should contain form elements', () => {
    const html = fs.readFileSync(path.join(builderPath, 'index.html'), 'utf-8');
    expect(html).toContain('id="orgName"');
    expect(html).toContain('id="orgShortName"');
    expect(html).toContain('id="waAccountId"');
    expect(html).toContain('id="primaryColor"');
    expect(html).toContain('id="accentColor"');
  });

  it('builder should include JSZip for package generation', () => {
    const html = fs.readFileSync(path.join(builderPath, 'index.html'), 'utf-8');
    expect(html).toContain('jszip');
  });

  it('builder should have all 5 steps', () => {
    const html = fs.readFileSync(path.join(builderPath, 'index.html'), 'utf-8');
    expect(html).toContain('data-step="1"');
    expect(html).toContain('data-step="2"');
    expect(html).toContain('data-step="3"');
    expect(html).toContain('data-step="4"');
    expect(html).toContain('data-step="5"');
  });
});

describe('Builder Package Contents', () => {
  it('package should include all documented files', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../deploy/builder/index.html'), 'utf-8');

    // Check that the builder generates all expected files
    expect(html).toContain('EVENTS_PAGE.html');
    expect(html).toContain('INSTALLATION.md');
    expect(html).toContain('config.json');
    expect(html).toContain('OPERATOR_CHECKLIST.md');
    expect(html).toContain('certification-tests');
    expect(html).toContain('README.md');
  });

  it('should have generateInstallationDoc function', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../deploy/builder/index.html'), 'utf-8');
    expect(html).toContain('function generateInstallationDoc');
  });

  it('should have generateOperatorChecklist function', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../deploy/builder/index.html'), 'utf-8');
    expect(html).toContain('function generateOperatorChecklist');
  });

  it('should have generateProfileTs function', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../deploy/builder/index.html'), 'utf-8');
    expect(html).toContain('function generateProfileTs');
  });

  it('should have generateTestTs function', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../deploy/builder/index.html'), 'utf-8');
    expect(html).toContain('function generateTestTs');
  });
});

describe('Builder SBNC Profile Compatibility', () => {
  const sbncConfigPath = path.join(__dirname, '../../scripts/build/build-widget.ts');

  it('SBNC profile should have required fields', () => {
    const content = fs.readFileSync(sbncConfigPath, 'utf-8');
    expect(content).toContain("organizationName: 'Santa Barbara Newcomers Club'");
    expect(content).toContain("organizationShortName: 'SBNC'");
    expect(content).toContain("waAccountId: '176353'");
  });

  it('SBNC profile should have 18 auto-tag rules', () => {
    const content = fs.readFileSync(sbncConfigPath, 'utf-8');
    const ruleMatches = content.match(/type: 'name-prefix'/g);
    expect(ruleMatches).not.toBeNull();
    expect(ruleMatches!.length).toBeGreaterThanOrEqual(18);
  });
});
