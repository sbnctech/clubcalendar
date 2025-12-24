/**
 * Tests for theme detection and CSS system
 * Tests detectThemeStyles, buildCSSVars, STYLE_PRESETS, etc.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DetectedTheme,
  ThemeCSSVars,
  StylePreset,
  DEFAULT_CSS_VARS,
  STYLE_PRESETS,
  THEME_SAMPLE_SELECTORS,
  getComputedStyleSafe,
  findFirstElement,
  detectThemeStyles,
  detectedThemeToCSSVars,
  buildCSSVars,
  generateCSSVarDeclarations,
  getPresetExtraCSS,
  buildWidgetCSS,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// DEFAULT CSS VARS
// ═══════════════════════════════════════════════════════════════

describe('DEFAULT_CSS_VARS', () => {
  it('should define all required CSS variables', () => {
    expect(DEFAULT_CSS_VARS['--clubcal-primary']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-accent']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-heading-font']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-body-font']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-body-color']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-body-bg']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-card-radius']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-card-shadow']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-card-border']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-button-radius']).toBeDefined();
    expect(DEFAULT_CSS_VARS['--clubcal-link-color']).toBeDefined();
  });

  it('should have sensible default values', () => {
    expect(DEFAULT_CSS_VARS['--clubcal-primary']).toBe('#2c5aa0');
    expect(DEFAULT_CSS_VARS['--clubcal-accent']).toBe('#d4a800');
    expect(DEFAULT_CSS_VARS['--clubcal-body-color']).toBe('#333');
    expect(DEFAULT_CSS_VARS['--clubcal-body-bg']).toBe('#ffffff');
    expect(DEFAULT_CSS_VARS['--clubcal-card-radius']).toBe('8px');
    expect(DEFAULT_CSS_VARS['--clubcal-button-radius']).toBe('20px');
  });
});

// ═══════════════════════════════════════════════════════════════
// STYLE PRESETS
// ═══════════════════════════════════════════════════════════════

describe('STYLE_PRESETS', () => {
  it('should define all preset types', () => {
    expect(STYLE_PRESETS['default']).toBeDefined();
    expect(STYLE_PRESETS['compact']).toBeDefined();
    expect(STYLE_PRESETS['minimal']).toBeDefined();
    expect(STYLE_PRESETS['wa-compatible']).toBeDefined();
  });

  describe('default preset', () => {
    it('should be empty (uses DEFAULT_CSS_VARS)', () => {
      const preset = STYLE_PRESETS['default'];
      // Should have no overrides (or only extraCSS)
      const keys = Object.keys(preset).filter(k => k !== 'extraCSS');
      expect(keys.length).toBe(0);
    });
  });

  describe('compact preset', () => {
    it('should have smaller radii', () => {
      const preset = STYLE_PRESETS['compact'];
      expect(preset['--clubcal-card-radius']).toBe('4px');
      expect(preset['--clubcal-button-radius']).toBe('4px');
    });

    it('should have extra CSS for compact sizing', () => {
      expect(STYLE_PRESETS['compact'].extraCSS).toContain('padding: 8px');
      expect(STYLE_PRESETS['compact'].extraCSS).toContain('font-size: 12px');
    });
  });

  describe('minimal preset', () => {
    it('should have no shadow and subtle border', () => {
      const preset = STYLE_PRESETS['minimal'];
      expect(preset['--clubcal-card-shadow']).toBe('none');
      expect(preset['--clubcal-card-border']).toBe('1px solid #eee');
    });

    it('should have extra CSS for minimal styling', () => {
      expect(STYLE_PRESETS['minimal'].extraCSS).toContain('border: 1px solid #eee');
    });
  });

  describe('wa-compatible preset', () => {
    it('should inherit fonts', () => {
      const preset = STYLE_PRESETS['wa-compatible'];
      expect(preset['--clubcal-body-font']).toBe('inherit');
      expect(preset['--clubcal-heading-font']).toBe('inherit');
    });

    it('should have extra CSS for WA integration', () => {
      expect(STYLE_PRESETS['wa-compatible'].extraCSS).toContain('font-family: inherit');
      expect(STYLE_PRESETS['wa-compatible'].extraCSS).toContain('box-sizing: border-box');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// THEME SAMPLE SELECTORS
// ═══════════════════════════════════════════════════════════════

describe('THEME_SAMPLE_SELECTORS', () => {
  it('should define selectors for each element type', () => {
    expect(THEME_SAMPLE_SELECTORS.heading).toBeDefined();
    expect(THEME_SAMPLE_SELECTORS.button).toBeDefined();
    expect(THEME_SAMPLE_SELECTORS.card).toBeDefined();
    expect(THEME_SAMPLE_SELECTORS.link).toBeDefined();
    expect(THEME_SAMPLE_SELECTORS.body).toBeDefined();
  });

  it('should include common WA selectors', () => {
    expect(THEME_SAMPLE_SELECTORS.heading).toContain('.wa-heading');
    expect(THEME_SAMPLE_SELECTORS.button).toContain('.wa-button');
    expect(THEME_SAMPLE_SELECTORS.card).toContain('.wa-card');
  });

  it('should include fallback selectors', () => {
    expect(THEME_SAMPLE_SELECTORS.heading).toContain('h1');
    expect(THEME_SAMPLE_SELECTORS.heading).toContain('h2');
    expect(THEME_SAMPLE_SELECTORS.body).toContain('body');
  });
});

// ═══════════════════════════════════════════════════════════════
// getComputedStyleSafe
// ═══════════════════════════════════════════════════════════════

describe('getComputedStyleSafe', () => {
  it('should return null for null element', () => {
    expect(getComputedStyleSafe(null, 'color')).toBeNull();
  });

  // Note: Full DOM testing requires jsdom setup
  // These tests verify the function handles edge cases
  it('should handle undefined window gracefully', () => {
    // In Node without jsdom, window may be undefined
    // The function should handle this
    expect(() => getComputedStyleSafe(null, 'color')).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// findFirstElement
// ═══════════════════════════════════════════════════════════════

describe('findFirstElement', () => {
  it('should return null for empty selector list', () => {
    expect(findFirstElement([])).toBeNull();
  });

  // Note: Full DOM testing requires jsdom setup
  it('should handle missing document gracefully', () => {
    // The function checks for document availability
    expect(() => findFirstElement(['div'])).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// detectThemeStyles
// ═══════════════════════════════════════════════════════════════

describe('detectThemeStyles', () => {
  it('should return DetectedTheme with all null values when no elements found', () => {
    const detected = detectThemeStyles();

    // All properties should be null when no DOM elements are present
    expect(detected.headingFont).toBeNull();
    expect(detected.headingColor).toBeNull();
    expect(detected.bodyFont).toBeNull();
    expect(detected.bodyColor).toBeNull();
    expect(detected.bodyBg).toBeNull();
    expect(detected.buttonRadius).toBeNull();
    expect(detected.buttonBg).toBeNull();
    expect(detected.buttonColor).toBeNull();
    expect(detected.cardRadius).toBeNull();
    expect(detected.cardShadow).toBeNull();
    expect(detected.cardBorder).toBeNull();
    expect(detected.linkColor).toBeNull();
    expect(detected.linkHoverColor).toBeNull();
  });

  it('should return a complete DetectedTheme interface', () => {
    const detected = detectThemeStyles();

    // Verify the structure
    expect(detected).toHaveProperty('headingFont');
    expect(detected).toHaveProperty('headingColor');
    expect(detected).toHaveProperty('bodyFont');
    expect(detected).toHaveProperty('bodyColor');
    expect(detected).toHaveProperty('bodyBg');
    expect(detected).toHaveProperty('buttonRadius');
    expect(detected).toHaveProperty('buttonBg');
    expect(detected).toHaveProperty('buttonColor');
    expect(detected).toHaveProperty('cardRadius');
    expect(detected).toHaveProperty('cardShadow');
    expect(detected).toHaveProperty('cardBorder');
    expect(detected).toHaveProperty('linkColor');
    expect(detected).toHaveProperty('linkHoverColor');
  });
});

// ═══════════════════════════════════════════════════════════════
// detectedThemeToCSSVars
// ═══════════════════════════════════════════════════════════════

describe('detectedThemeToCSSVars', () => {
  it('should return empty object for all null values', () => {
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

    const vars = detectedThemeToCSSVars(detected);
    expect(Object.keys(vars).length).toBe(0);
  });

  it('should convert detected heading font', () => {
    const detected: DetectedTheme = {
      headingFont: 'Arial, sans-serif',
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

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-heading-font']).toBe('Arial, sans-serif');
  });

  it('should convert detected body styles', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: 'Georgia, serif',
      bodyColor: '#222',
      bodyBg: '#f5f5f5',
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: null,
      cardShadow: null,
      cardBorder: null,
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-body-font']).toBe('Georgia, serif');
    expect(vars['--clubcal-body-color']).toBe('#222');
    expect(vars['--clubcal-body-bg']).toBe('#f5f5f5');
  });

  it('should convert detected card styles', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: null,
      bodyColor: null,
      bodyBg: null,
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: '12px',
      cardShadow: '0 2px 8px rgba(0,0,0,0.15)',
      cardBorder: '2px solid #ddd',
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-card-radius']).toBe('12px');
    expect(vars['--clubcal-card-shadow']).toBe('0 2px 8px rgba(0,0,0,0.15)');
    expect(vars['--clubcal-card-border']).toBe('2px solid #ddd');
  });

  it('should skip "none" values for shadow and border', () => {
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
      cardShadow: 'none',
      cardBorder: 'none',
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-card-shadow']).toBeUndefined();
    expect(vars['--clubcal-card-border']).toBeUndefined();
  });

  it('should convert detected button and link styles', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: null,
      bodyColor: null,
      bodyBg: null,
      buttonRadius: '4px',
      buttonBg: '#0066cc',
      buttonColor: '#fff',
      cardRadius: null,
      cardShadow: null,
      cardBorder: null,
      linkColor: '#0066cc',
      linkHoverColor: '#004499',
    };

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-button-radius']).toBe('4px');
    expect(vars['--clubcal-link-color']).toBe('#0066cc');
  });

  it('should convert all detected values', () => {
    const detected: DetectedTheme = {
      headingFont: 'Helvetica, sans-serif',
      headingColor: '#111',
      bodyFont: 'Georgia, serif',
      bodyColor: '#333',
      bodyBg: '#fafafa',
      buttonRadius: '6px',
      buttonBg: '#007bff',
      buttonColor: '#fff',
      cardRadius: '10px',
      cardShadow: '0 1px 4px rgba(0,0,0,0.1)',
      cardBorder: '1px solid #ccc',
      linkColor: '#007bff',
      linkHoverColor: '#0056b3',
    };

    const vars = detectedThemeToCSSVars(detected);
    expect(vars['--clubcal-heading-font']).toBe('Helvetica, sans-serif');
    expect(vars['--clubcal-body-font']).toBe('Georgia, serif');
    expect(vars['--clubcal-body-color']).toBe('#333');
    expect(vars['--clubcal-body-bg']).toBe('#fafafa');
    expect(vars['--clubcal-button-radius']).toBe('6px');
    expect(vars['--clubcal-card-radius']).toBe('10px');
    expect(vars['--clubcal-card-shadow']).toBe('0 1px 4px rgba(0,0,0,0.1)');
    expect(vars['--clubcal-card-border']).toBe('1px solid #ccc');
    expect(vars['--clubcal-link-color']).toBe('#007bff');
  });
});

// ═══════════════════════════════════════════════════════════════
// buildCSSVars
// ═══════════════════════════════════════════════════════════════

describe('buildCSSVars', () => {
  it('should return defaults when no options provided', () => {
    const vars = buildCSSVars({});
    expect(vars).toEqual(DEFAULT_CSS_VARS);
  });

  it('should apply primary color', () => {
    const vars = buildCSSVars({ primaryColor: '#ff0000' });
    expect(vars['--clubcal-primary']).toBe('#ff0000');
    expect(vars['--clubcal-link-color']).toBe('#ff0000');
  });

  it('should apply accent color', () => {
    const vars = buildCSSVars({ accentColor: '#00ff00' });
    expect(vars['--clubcal-accent']).toBe('#00ff00');
  });

  it('should apply preset overrides', () => {
    const vars = buildCSSVars({ preset: 'compact' });
    expect(vars['--clubcal-card-radius']).toBe('4px');
    expect(vars['--clubcal-button-radius']).toBe('4px');
  });

  it('should apply minimal preset', () => {
    const vars = buildCSSVars({ preset: 'minimal' });
    expect(vars['--clubcal-card-shadow']).toBe('none');
    expect(vars['--clubcal-card-border']).toBe('1px solid #eee');
  });

  it('should apply wa-compatible preset', () => {
    const vars = buildCSSVars({ preset: 'wa-compatible' });
    expect(vars['--clubcal-body-font']).toBe('inherit');
    expect(vars['--clubcal-heading-font']).toBe('inherit');
  });

  it('should apply detected theme when autoTheme is true', () => {
    const detected: DetectedTheme = {
      headingFont: 'CustomFont, sans-serif',
      headingColor: null,
      bodyFont: 'BodyFont, serif',
      bodyColor: '#444',
      bodyBg: null,
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: '16px',
      cardShadow: null,
      cardBorder: null,
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = buildCSSVars({ autoTheme: true, detectedTheme: detected });
    expect(vars['--clubcal-heading-font']).toBe('CustomFont, sans-serif');
    expect(vars['--clubcal-body-font']).toBe('BodyFont, serif');
    expect(vars['--clubcal-body-color']).toBe('#444');
    expect(vars['--clubcal-card-radius']).toBe('16px');
  });

  it('should NOT apply detected theme when autoTheme is false', () => {
    const detected: DetectedTheme = {
      headingFont: 'CustomFont, sans-serif',
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

    const vars = buildCSSVars({ autoTheme: false, detectedTheme: detected });
    expect(vars['--clubcal-heading-font']).toBe(DEFAULT_CSS_VARS['--clubcal-heading-font']);
  });

  it('should apply explicit cssVars with highest priority', () => {
    const vars = buildCSSVars({
      primaryColor: '#ff0000',
      cssVars: { '--clubcal-primary': '#0000ff' }
    });
    expect(vars['--clubcal-primary']).toBe('#0000ff'); // cssVars wins
  });

  it('should layer: defaults < detected < preset < colors < cssVars', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: null,
      bodyColor: null,
      bodyBg: null,
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: '20px', // Will be overridden by preset
      cardShadow: null,
      cardBorder: null,
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = buildCSSVars({
      autoTheme: true,
      detectedTheme: detected,
      preset: 'compact', // Sets card-radius to 4px
      primaryColor: '#123456',
      cssVars: { '--clubcal-card-radius': '99px' } // Highest priority
    });

    expect(vars['--clubcal-card-radius']).toBe('99px');
    expect(vars['--clubcal-primary']).toBe('#123456');
  });
});

// ═══════════════════════════════════════════════════════════════
// generateCSSVarDeclarations
// ═══════════════════════════════════════════════════════════════

describe('generateCSSVarDeclarations', () => {
  it('should generate valid CSS variable declarations', () => {
    const vars: ThemeCSSVars = { ...DEFAULT_CSS_VARS };
    const css = generateCSSVarDeclarations(vars);

    expect(css).toContain('--clubcal-primary: #2c5aa0;');
    expect(css).toContain('--clubcal-accent: #d4a800;');
    expect(css).toContain('--clubcal-body-color: #333;');
  });

  it('should indent declarations', () => {
    const vars: ThemeCSSVars = { ...DEFAULT_CSS_VARS };
    const css = generateCSSVarDeclarations(vars);
    const lines = css.split('\n');

    // Each line should start with two spaces
    lines.forEach(line => {
      expect(line).toMatch(/^\s{2}--clubcal-/);
    });
  });

  it('should handle custom values', () => {
    const vars: ThemeCSSVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-primary': '#custom123',
      '--clubcal-card-radius': '100px'
    };
    const css = generateCSSVarDeclarations(vars);

    expect(css).toContain('--clubcal-primary: #custom123;');
    expect(css).toContain('--clubcal-card-radius: 100px;');
  });
});

// ═══════════════════════════════════════════════════════════════
// getPresetExtraCSS
// ═══════════════════════════════════════════════════════════════

describe('getPresetExtraCSS', () => {
  it('should return empty string for default preset', () => {
    const css = getPresetExtraCSS('default');
    expect(css).toBe('');
  });

  it('should return extra CSS for compact preset', () => {
    const css = getPresetExtraCSS('compact');
    expect(css).toContain('padding: 8px');
    expect(css).toContain('.clubcal-event-card');
  });

  it('should return extra CSS for minimal preset', () => {
    const css = getPresetExtraCSS('minimal');
    expect(css).toContain('.clubcalendar-header');
    expect(css).toContain('border');
  });

  it('should return extra CSS for wa-compatible preset', () => {
    const css = getPresetExtraCSS('wa-compatible');
    expect(css).toContain('font-family: inherit');
    expect(css).toContain('.clubcalendar-widget');
  });
});

// ═══════════════════════════════════════════════════════════════
// buildWidgetCSS
// ═══════════════════════════════════════════════════════════════

describe('buildWidgetCSS', () => {
  it('should generate :root with CSS variables', () => {
    const css = buildWidgetCSS({ cssVars: DEFAULT_CSS_VARS });

    expect(css).toContain(':root {');
    expect(css).toContain('--clubcal-primary:');
    expect(css).toContain('}');
  });

  it('should include preset extra CSS', () => {
    const css = buildWidgetCSS({
      cssVars: DEFAULT_CSS_VARS,
      preset: 'compact'
    });

    expect(css).toContain(':root {');
    expect(css).toContain('padding: 8px'); // From compact preset
  });

  it('should include custom CSS', () => {
    const customCSS = '.my-custom-class { color: red; }';
    const css = buildWidgetCSS({
      cssVars: DEFAULT_CSS_VARS,
      customCSS
    });

    expect(css).toContain(':root {');
    expect(css).toContain('.my-custom-class { color: red; }');
  });

  it('should combine all CSS sources', () => {
    const customCSS = '/* custom styles */';
    const css = buildWidgetCSS({
      cssVars: DEFAULT_CSS_VARS,
      preset: 'compact',
      customCSS
    });

    expect(css).toContain(':root {');
    expect(css).toContain('padding: 8px'); // preset
    expect(css).toContain('/* custom styles */'); // custom
  });

  it('should not include preset CSS if no preset specified', () => {
    const css = buildWidgetCSS({ cssVars: DEFAULT_CSS_VARS });

    // Should not contain compact-specific padding
    expect(css).not.toContain('padding: 8px');
  });

  it('should maintain correct order (vars, preset, custom)', () => {
    const customCSS = '/* CUSTOM_MARKER */';
    const css = buildWidgetCSS({
      cssVars: DEFAULT_CSS_VARS,
      preset: 'compact',
      customCSS
    });

    const rootIndex = css.indexOf(':root');
    const compactIndex = css.indexOf('padding: 8px');
    const customIndex = css.indexOf('CUSTOM_MARKER');

    expect(rootIndex).toBeLessThan(compactIndex);
    expect(compactIndex).toBeLessThan(customIndex);
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Theme CSS Integration', () => {
  it('should build complete CSS from scratch', () => {
    const vars = buildCSSVars({
      primaryColor: '#3366cc',
      accentColor: '#ffcc00',
      preset: 'minimal'
    });

    const css = buildWidgetCSS({
      cssVars: vars,
      preset: 'minimal',
      customCSS: '.clubcal-event-card { margin-bottom: 20px; }'
    });

    expect(css).toContain('--clubcal-primary: #3366cc');
    expect(css).toContain('--clubcal-accent: #ffcc00');
    expect(css).toContain('--clubcal-card-shadow: none'); // From minimal
    expect(css).toContain('margin-bottom: 20px'); // Custom
  });

  it('should work with autoTheme + preset combination', () => {
    const detected: DetectedTheme = {
      headingFont: 'PageFont, sans-serif',
      headingColor: null,
      bodyFont: null,
      bodyColor: '#555',
      bodyBg: null,
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: null,
      cardShadow: null,
      cardBorder: null,
      linkColor: '#1a73e8',
      linkHoverColor: null,
    };

    const vars = buildCSSVars({
      autoTheme: true,
      detectedTheme: detected,
      preset: 'compact',
      primaryColor: '#1a73e8'
    });

    expect(vars['--clubcal-heading-font']).toBe('PageFont, sans-serif');
    expect(vars['--clubcal-body-color']).toBe('#555');
    expect(vars['--clubcal-card-radius']).toBe('4px'); // Preset overrides
    expect(vars['--clubcal-primary']).toBe('#1a73e8');
    expect(vars['--clubcal-link-color']).toBe('#1a73e8');
  });

  it('should allow cssVars to override everything', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: null,
      bodyColor: null,
      bodyBg: null,
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: '10px',
      cardShadow: null,
      cardBorder: null,
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = buildCSSVars({
      autoTheme: true,
      detectedTheme: detected,
      preset: 'compact', // Sets card-radius to 4px
      cssVars: { '--clubcal-card-radius': '0' } // Override
    });

    expect(vars['--clubcal-card-radius']).toBe('0');
  });
});

// ═══════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('should handle undefined preset gracefully', () => {
    const vars = buildCSSVars({ preset: undefined });
    expect(vars).toEqual(DEFAULT_CSS_VARS);
  });

  it('should handle empty cssVars object', () => {
    const vars = buildCSSVars({ cssVars: {} });
    expect(vars).toEqual(DEFAULT_CSS_VARS);
  });

  it('should handle missing detectedTheme with autoTheme true', () => {
    const vars = buildCSSVars({ autoTheme: true });
    expect(vars).toEqual(DEFAULT_CSS_VARS);
  });

  it('should handle complex font stacks in detected theme', () => {
    const detected: DetectedTheme = {
      headingFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      headingColor: null,
      bodyFont: 'Georgia, "Times New Roman", serif',
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

    const vars = buildCSSVars({ autoTheme: true, detectedTheme: detected });
    expect(vars['--clubcal-heading-font']).toBe('"Helvetica Neue", Helvetica, Arial, sans-serif');
    expect(vars['--clubcal-body-font']).toBe('Georgia, "Times New Roman", serif');
  });

  it('should handle rgba colors in detected theme', () => {
    const detected: DetectedTheme = {
      headingFont: null,
      headingColor: null,
      bodyFont: null,
      bodyColor: 'rgba(0, 0, 0, 0.87)',
      bodyBg: 'rgba(255, 255, 255, 0.95)',
      buttonRadius: null,
      buttonBg: null,
      buttonColor: null,
      cardRadius: null,
      cardShadow: null,
      cardBorder: null,
      linkColor: null,
      linkHoverColor: null,
    };

    const vars = buildCSSVars({ autoTheme: true, detectedTheme: detected });
    expect(vars['--clubcal-body-color']).toBe('rgba(0, 0, 0, 0.87)');
    expect(vars['--clubcal-body-bg']).toBe('rgba(255, 255, 255, 0.95)');
  });
});
