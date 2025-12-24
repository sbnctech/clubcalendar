/**
 * Tests for color contrast and legibility functions
 * Tests parseColor, calculateLuminance, calculateContrastRatio, validateContrast, etc.
 */

import { describe, it, expect } from 'vitest';
import {
  RGBColor,
  ContrastMode,
  CONTRAST_THRESHOLDS,
  parseColor,
  parseHexColor,
  parseRgbColor,
  rgbToHex,
  calculateLuminance,
  calculateContrastRatio,
  checkContrast,
  isLightColor,
  darkenColor,
  lightenColor,
  adjustForContrast,
  validateContrast,
  validateThemeContrast,
  THEME_COLOR_PAIRS,
  DEFAULT_CSS_VARS,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// CONTRAST THRESHOLDS
// ═══════════════════════════════════════════════════════════════

describe('CONTRAST_THRESHOLDS', () => {
  it('should define WCAG AA thresholds', () => {
    expect(CONTRAST_THRESHOLDS.AA_NORMAL).toBe(4.5);
    expect(CONTRAST_THRESHOLDS.AA_LARGE).toBe(3.0);
  });

  it('should define WCAG AAA thresholds', () => {
    expect(CONTRAST_THRESHOLDS.AAA_NORMAL).toBe(7.0);
    expect(CONTRAST_THRESHOLDS.AAA_LARGE).toBe(4.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// parseColor
// ═══════════════════════════════════════════════════════════════

describe('parseColor', () => {
  it('should return null for invalid input', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor(null as unknown as string)).toBeNull();
    expect(parseColor(undefined as unknown as string)).toBeNull();
  });

  it('should parse hex colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should parse rgb colors', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor('rgba(0, 255, 0, 0.5)')).toEqual({ r: 0, g: 255, b: 0, a: 0.5 });
  });

  it('should parse named colors', () => {
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should be case-insensitive', () => {
    expect(parseColor('WHITE')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('RGB(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });
});

// ═══════════════════════════════════════════════════════════════
// parseHexColor
// ═══════════════════════════════════════════════════════════════

describe('parseHexColor', () => {
  describe('3-digit hex (#RGB)', () => {
    it('should parse #fff as white', () => {
      expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse #000 as black', () => {
      expect(parseHexColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse #f00 as red', () => {
      expect(parseHexColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse #abc correctly', () => {
      expect(parseHexColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });
  });

  describe('4-digit hex (#RGBA)', () => {
    it('should parse #ffff as white with full opacity', () => {
      const result = parseHexColor('#ffff');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
      expect(result?.a).toBeCloseTo(1.0, 2);
    });

    it('should parse #0008 as black with ~50% opacity', () => {
      const result = parseHexColor('#0008');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBeCloseTo(0.533, 2);
    });
  });

  describe('6-digit hex (#RRGGBB)', () => {
    it('should parse #ffffff as white', () => {
      expect(parseHexColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse #000000 as black', () => {
      expect(parseHexColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse #2c5aa0 correctly', () => {
      expect(parseHexColor('#2c5aa0')).toEqual({ r: 44, g: 90, b: 160 });
    });

    it('should parse #d4a800 correctly', () => {
      expect(parseHexColor('#d4a800')).toEqual({ r: 212, g: 168, b: 0 });
    });
  });

  describe('8-digit hex (#RRGGBBAA)', () => {
    it('should parse #ffffffff as white with full opacity', () => {
      const result = parseHexColor('#ffffffff');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
      expect(result?.a).toBeCloseTo(1.0, 2);
    });

    it('should parse #00000080 as black with 50% opacity', () => {
      const result = parseHexColor('#00000080');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBeCloseTo(0.502, 2);
    });
  });

  describe('invalid hex', () => {
    it('should return null for invalid length', () => {
      expect(parseHexColor('#ff')).toBeNull();
      expect(parseHexColor('#fffff')).toBeNull();
      expect(parseHexColor('#fffffff')).toBeNull();
    });

    it('should return null for invalid characters', () => {
      expect(parseHexColor('#gggggg')).toBeNull();
      expect(parseHexColor('#xyz')).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// parseRgbColor
// ═══════════════════════════════════════════════════════════════

describe('parseRgbColor', () => {
  describe('rgb() format', () => {
    it('should parse rgb(255, 0, 0)', () => {
      expect(parseRgbColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgb(0, 128, 255)', () => {
      expect(parseRgbColor('rgb(0, 128, 255)')).toEqual({ r: 0, g: 128, b: 255 });
    });

    it('should handle spaces', () => {
      expect(parseRgbColor('rgb( 255 , 255 , 255 )')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('rgba() format', () => {
    it('should parse rgba(255, 0, 0, 0.5)', () => {
      expect(parseRgbColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it('should parse rgba(0, 0, 0, 1)', () => {
      expect(parseRgbColor('rgba(0, 0, 0, 1)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('should parse rgba(255, 255, 255, 0)', () => {
      expect(parseRgbColor('rgba(255, 255, 255, 0)')).toEqual({ r: 255, g: 255, b: 255, a: 0 });
    });
  });

  describe('percentage values', () => {
    it('should parse rgb(100%, 0%, 0%)', () => {
      expect(parseRgbColor('rgb(100%, 0%, 0%)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgb(50%, 50%, 50%)', () => {
      const result = parseRgbColor('rgb(50%, 50%, 50%)');
      // 50% of 255 = 127.5, rounds to 127 or 128 depending on rounding
      expect(result?.r).toBeGreaterThanOrEqual(127);
      expect(result?.r).toBeLessThanOrEqual(128);
      expect(result?.g).toBeGreaterThanOrEqual(127);
      expect(result?.b).toBeGreaterThanOrEqual(127);
    });
  });

  describe('modern syntax (space-separated)', () => {
    it('should parse rgb(255 0 0)', () => {
      expect(parseRgbColor('rgb(255 0 0)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgb(255 128 0 / 0.5)', () => {
      expect(parseRgbColor('rgb(255 128 0 / 0.5)')).toEqual({ r: 255, g: 128, b: 0, a: 0.5 });
    });
  });

  describe('invalid rgb', () => {
    it('should return null for invalid format', () => {
      expect(parseRgbColor('rgb()')).toBeNull();
      expect(parseRgbColor('rgb(255)')).toBeNull();
      // Note: parseRgbColor finds rgb() pattern anywhere in string
      // This is acceptable behavior for parsing CSS values
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// rgbToHex
// ═══════════════════════════════════════════════════════════════

describe('rgbToHex', () => {
  it('should convert white to #ffffff', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });

  it('should convert black to #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('should convert red to #ff0000', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('should convert arbitrary color correctly', () => {
    expect(rgbToHex({ r: 44, g: 90, b: 160 })).toBe('#2c5aa0');
  });

  it('should clamp values outside 0-255', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });

  it('should round decimal values', () => {
    expect(rgbToHex({ r: 127.5, g: 127.5, b: 127.5 })).toBe('#808080');
  });
});

// ═══════════════════════════════════════════════════════════════
// calculateLuminance
// ═══════════════════════════════════════════════════════════════

describe('calculateLuminance', () => {
  it('should return 1 for white', () => {
    expect(calculateLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1.0, 3);
  });

  it('should return 0 for black', () => {
    expect(calculateLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0.0, 3);
  });

  it('should return ~0.2126 for pure red', () => {
    expect(calculateLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 3);
  });

  it('should return ~0.7152 for pure green', () => {
    expect(calculateLuminance({ r: 0, g: 255, b: 0 })).toBeCloseTo(0.7152, 3);
  });

  it('should return ~0.0722 for pure blue', () => {
    expect(calculateLuminance({ r: 0, g: 0, b: 255 })).toBeCloseTo(0.0722, 3);
  });

  it('should calculate mid-gray luminance', () => {
    const lum = calculateLuminance({ r: 128, g: 128, b: 128 });
    expect(lum).toBeGreaterThan(0.1);
    expect(lum).toBeLessThan(0.3);
  });
});

// ═══════════════════════════════════════════════════════════════
// calculateContrastRatio
// ═══════════════════════════════════════════════════════════════

describe('calculateContrastRatio', () => {
  it('should return 21 for black on white', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    expect(calculateContrastRatio(black, white)).toBeCloseTo(21, 0);
  });

  it('should return 21 for white on black', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    expect(calculateContrastRatio(white, black)).toBeCloseTo(21, 0);
  });

  it('should return 1 for same color', () => {
    const gray = { r: 128, g: 128, b: 128 };
    expect(calculateContrastRatio(gray, gray)).toBeCloseTo(1, 2);
  });

  it('should return low ratio for similar colors', () => {
    const lightGray = { r: 200, g: 200, b: 200 };
    const white = { r: 255, g: 255, b: 255 };
    const ratio = calculateContrastRatio(lightGray, white);
    expect(ratio).toBeLessThan(2);
  });

  it('should calculate typical text contrast', () => {
    // Dark gray text on white background
    const darkGray = { r: 51, g: 51, b: 51 }; // #333
    const white = { r: 255, g: 255, b: 255 };
    const ratio = calculateContrastRatio(darkGray, white);
    expect(ratio).toBeGreaterThan(10); // Should easily pass AA
  });
});

// ═══════════════════════════════════════════════════════════════
// checkContrast
// ═══════════════════════════════════════════════════════════════

describe('checkContrast', () => {
  it('should pass all thresholds for black on white', () => {
    const result = checkContrast(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 }
    );
    expect(result.meetsAA).toBe(true);
    expect(result.meetsAAA).toBe(true);
    expect(result.meetsAALarge).toBe(true);
    expect(result.ratio).toBeCloseTo(21, 0);
  });

  it('should fail all thresholds for light gray on white', () => {
    const result = checkContrast(
      { r: 200, g: 200, b: 200 },
      { r: 255, g: 255, b: 255 }
    );
    expect(result.meetsAA).toBe(false);
    expect(result.meetsAAA).toBe(false);
    expect(result.meetsAALarge).toBe(false);
    expect(result.ratio).toBeLessThan(2);
  });

  it('should pass AA but not AAA for medium contrast', () => {
    // Find a color combo that passes AA (4.5:1) but not AAA (7:1)
    const darkish = { r: 100, g: 100, b: 100 };
    const white = { r: 255, g: 255, b: 255 };
    const result = checkContrast(darkish, white);
    expect(result.meetsAA).toBe(true);
    expect(result.meetsAAA).toBe(false);
  });

  it('should pass large text threshold for lower contrast', () => {
    // ~3.5:1 contrast should pass AA Large (3.0) but not AA Normal (4.5)
    // Gray value ~130 gives approximately 3.8:1 contrast on white
    const gray = { r: 130, g: 130, b: 130 };
    const white = { r: 255, g: 255, b: 255 };
    const result = checkContrast(gray, white);
    // Verify ratio is in the expected range (between 3.0 and 4.5)
    expect(result.ratio).toBeGreaterThanOrEqual(3.0);
    expect(result.ratio).toBeLessThan(4.5);
    expect(result.meetsAALarge).toBe(true);
    expect(result.meetsAA).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// isLightColor
// ═══════════════════════════════════════════════════════════════

describe('isLightColor', () => {
  it('should return true for white', () => {
    expect(isLightColor({ r: 255, g: 255, b: 255 })).toBe(true);
  });

  it('should return false for black', () => {
    expect(isLightColor({ r: 0, g: 0, b: 0 })).toBe(false);
  });

  it('should return true for light colors', () => {
    expect(isLightColor({ r: 240, g: 240, b: 240 })).toBe(true);
    expect(isLightColor({ r: 255, g: 255, b: 200 })).toBe(true);
  });

  it('should return false for dark colors', () => {
    expect(isLightColor({ r: 50, g: 50, b: 50 })).toBe(false);
    expect(isLightColor({ r: 0, g: 0, b: 128 })).toBe(false);
  });

  it('should handle mid-gray appropriately', () => {
    // Mid-gray is around the threshold
    const midGray = { r: 128, g: 128, b: 128 };
    // Just check it doesn't throw; the exact result depends on threshold
    expect(typeof isLightColor(midGray)).toBe('boolean');
  });
});

// ═══════════════════════════════════════════════════════════════
// darkenColor
// ═══════════════════════════════════════════════════════════════

describe('darkenColor', () => {
  it('should darken white by 50%', () => {
    const result = darkenColor({ r: 255, g: 255, b: 255 }, 50);
    expect(result.r).toBe(128);
    expect(result.g).toBe(128);
    expect(result.b).toBe(128);
  });

  it('should darken to black at 100%', () => {
    const result = darkenColor({ r: 255, g: 255, b: 255 }, 100);
    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('should not change at 0%', () => {
    const result = darkenColor({ r: 200, g: 100, b: 50 }, 0);
    expect(result.r).toBe(200);
    expect(result.g).toBe(100);
    expect(result.b).toBe(50);
  });

  it('should preserve alpha', () => {
    const result = darkenColor({ r: 255, g: 255, b: 255, a: 0.5 }, 50);
    expect(result.a).toBe(0.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// lightenColor
// ═══════════════════════════════════════════════════════════════

describe('lightenColor', () => {
  it('should lighten black by 50%', () => {
    const result = lightenColor({ r: 0, g: 0, b: 0 }, 50);
    expect(result.r).toBe(128);
    expect(result.g).toBe(128);
    expect(result.b).toBe(128);
  });

  it('should lighten to white at 100%', () => {
    const result = lightenColor({ r: 0, g: 0, b: 0 }, 100);
    expect(result.r).toBe(255);
    expect(result.g).toBe(255);
    expect(result.b).toBe(255);
  });

  it('should not change at 0%', () => {
    const result = lightenColor({ r: 100, g: 150, b: 200 }, 0);
    expect(result.r).toBe(100);
    expect(result.g).toBe(150);
    expect(result.b).toBe(200);
  });

  it('should preserve alpha', () => {
    const result = lightenColor({ r: 0, g: 0, b: 0, a: 0.75 }, 50);
    expect(result.a).toBe(0.75);
  });
});

// ═══════════════════════════════════════════════════════════════
// adjustForContrast
// ═══════════════════════════════════════════════════════════════

describe('adjustForContrast', () => {
  it('should not change colors that already pass', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const result = adjustForContrast(black, white);
    expect(result).toEqual(black);
  });

  it('should darken light text on light background', () => {
    const lightGray = { r: 200, g: 200, b: 200 };
    const white = { r: 255, g: 255, b: 255 };
    const result = adjustForContrast(lightGray, white);

    // Result should be darker
    expect(result.r).toBeLessThan(200);
    expect(result.g).toBeLessThan(200);
    expect(result.b).toBeLessThan(200);

    // And should now pass contrast
    const ratio = calculateContrastRatio(result, white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should lighten dark text on dark background', () => {
    const darkGray = { r: 50, g: 50, b: 50 };
    const black = { r: 0, g: 0, b: 0 };
    const result = adjustForContrast(darkGray, black);

    // Result should be lighter
    expect(result.r).toBeGreaterThan(50);
    expect(result.g).toBeGreaterThan(50);
    expect(result.b).toBeGreaterThan(50);

    // And should now pass contrast
    const ratio = calculateContrastRatio(result, black);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should respect custom minimum ratio', () => {
    const gray = { r: 150, g: 150, b: 150 };
    const white = { r: 255, g: 255, b: 255 };

    // With AA_LARGE threshold (3.0)
    const resultLarge = adjustForContrast(gray, white, 3.0);
    const ratioLarge = calculateContrastRatio(resultLarge, white);
    expect(ratioLarge).toBeGreaterThanOrEqual(3.0);

    // With AAA threshold (7.0)
    const resultAAA = adjustForContrast(gray, white, 7.0);
    const ratioAAA = calculateContrastRatio(resultAAA, white);
    expect(ratioAAA).toBeGreaterThanOrEqual(7.0);
  });
});

// ═══════════════════════════════════════════════════════════════
// validateContrast
// ═══════════════════════════════════════════════════════════════

describe('validateContrast', () => {
  describe('mode: auto', () => {
    it('should pass without correction for good contrast', () => {
      const result = validateContrast('#333', '#fff', 'auto');
      expect(result.passed).toBe(true);
      expect(result.corrected).toBe(false);
      expect(result.foreground).toBe('#333');
    });

    it('should correct low contrast colors', () => {
      const result = validateContrast('#ccc', '#fff', 'auto');
      expect(result.passed).toBe(true);
      expect(result.corrected).toBe(true);
      expect(result.foreground).not.toBe('#ccc');
      expect(result.warning).toContain('Adjusted');
    });
  });

  describe('mode: warn', () => {
    it('should warn but not correct', () => {
      const result = validateContrast('#ccc', '#fff', 'warn');
      expect(result.passed).toBe(false);
      expect(result.corrected).toBe(false);
      expect(result.foreground).toBe('#ccc');
      expect(result.warning).toContain('Low contrast');
    });
  });

  describe('mode: strict', () => {
    it('should fail without correction', () => {
      const result = validateContrast('#ccc', '#fff', 'strict');
      expect(result.passed).toBe(false);
      expect(result.corrected).toBe(false);
      expect(result.warning).toContain('fails WCAG AA');
    });
  });

  describe('mode: off', () => {
    it('should not check or correct', () => {
      const result = validateContrast('#ccc', '#fff', 'off');
      expect(result.passed).toBe(false);
      expect(result.corrected).toBe(false);
      expect(result.warning).toBeUndefined();
    });
  });

  describe('unparseable colors', () => {
    it('should return warning for invalid colors', () => {
      const result = validateContrast('not-a-color', '#fff', 'auto');
      expect(result.passed).toBe(false);
      expect(result.corrected).toBe(false);
      expect(result.warning).toContain('Could not parse');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// THEME_COLOR_PAIRS
// ═══════════════════════════════════════════════════════════════

describe('THEME_COLOR_PAIRS', () => {
  it('should define body text on background', () => {
    const bodyPair = THEME_COLOR_PAIRS.find(p => p.foregroundVar === '--clubcal-body-color');
    expect(bodyPair).toBeDefined();
    expect(bodyPair?.backgroundVar).toBe('--clubcal-body-bg');
  });

  it('should define link text on background', () => {
    const linkPair = THEME_COLOR_PAIRS.find(p => p.foregroundVar === '--clubcal-link-color');
    expect(linkPair).toBeDefined();
    expect(linkPair?.backgroundVar).toBe('--clubcal-body-bg');
  });
});

// ═══════════════════════════════════════════════════════════════
// validateThemeContrast
// ═══════════════════════════════════════════════════════════════

describe('validateThemeContrast', () => {
  it('should pass for default vars', () => {
    const { vars, warnings } = validateThemeContrast(DEFAULT_CSS_VARS, 'auto');
    // Default vars should have good contrast
    expect(vars['--clubcal-body-color']).toBe('#333');
    expect(vars['--clubcal-body-bg']).toBe('#ffffff');
    expect(warnings.length).toBe(0);
  });

  it('should correct low contrast body color', () => {
    const badVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-body-color': '#ddd', // Too light on white
      '--clubcal-body-bg': '#ffffff',
    };

    const { vars, warnings } = validateThemeContrast(badVars, 'auto');
    expect(vars['--clubcal-body-color']).not.toBe('#ddd');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('Body text');
  });

  it('should correct low contrast link color', () => {
    const badVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-link-color': '#aaf', // Too light on white
      '--clubcal-body-bg': '#ffffff',
    };

    const { vars, warnings } = validateThemeContrast(badVars, 'auto');
    expect(vars['--clubcal-link-color']).not.toBe('#aaf');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should not modify when mode is off', () => {
    const badVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-body-color': '#ddd',
    };

    const { vars, warnings } = validateThemeContrast(badVars, 'off');
    expect(vars['--clubcal-body-color']).toBe('#ddd');
    expect(warnings.length).toBe(0);
  });

  it('should throw in strict mode for bad contrast', () => {
    const badVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-body-color': '#ddd',
      '--clubcal-body-bg': '#ffffff',
    };

    expect(() => validateThemeContrast(badVars, 'strict')).toThrow('Contrast validation failed');
  });

  it('should warn but not throw in warn mode', () => {
    const badVars = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-body-color': '#ddd',
    };

    const { vars, warnings } = validateThemeContrast(badVars, 'warn');
    expect(vars['--clubcal-body-color']).toBe('#ddd'); // Not corrected
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('Low contrast');
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Contrast Integration', () => {
  it('should handle light-on-light scenario', () => {
    // Yellow text on white background
    const result = validateContrast('#ffff00', '#ffffff', 'auto');
    expect(result.corrected).toBe(true);
    expect(result.passed).toBe(true);

    // The corrected color should be much darker
    const correctedColor = parseColor(result.foreground);
    expect(correctedColor).not.toBeNull();
    expect(correctedColor!.r).toBeLessThan(200);
  });

  it('should handle dark-on-dark scenario', () => {
    // Dark blue text on black background
    const result = validateContrast('#000033', '#000000', 'auto');
    expect(result.corrected).toBe(true);
    expect(result.passed).toBe(true);

    // The corrected color should be much lighter
    const correctedColor = parseColor(result.foreground);
    expect(correctedColor).not.toBeNull();
    expect(correctedColor!.r).toBeGreaterThan(50);
  });

  it('should preserve hue when adjusting', () => {
    // Light red on white - should darken to darker red, not gray
    const result = validateContrast('#ffaaaa', '#ffffff', 'auto');
    expect(result.corrected).toBe(true);

    const correctedColor = parseColor(result.foreground);
    expect(correctedColor).not.toBeNull();
    // Red channel should still be dominant
    expect(correctedColor!.r).toBeGreaterThanOrEqual(correctedColor!.g);
    expect(correctedColor!.r).toBeGreaterThanOrEqual(correctedColor!.b);
  });

  it('should work with real-world theme colors', () => {
    // Using solid colors that are known to have good contrast
    const realTheme = {
      ...DEFAULT_CSS_VARS,
      '--clubcal-body-color': '#212121', // Dark gray (Material)
      '--clubcal-body-bg': '#ffffff',
      '--clubcal-link-color': '#1565c0', // Darker blue for better contrast
    };

    const { vars, warnings } = validateThemeContrast(realTheme, 'auto');
    // These have good contrast and should pass without warnings
    expect(warnings.length).toBe(0);
    expect(vars['--clubcal-body-color']).toBe('#212121');
  });
});

// ═══════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('should handle transparent colors gracefully', () => {
    const result = parseColor('transparent');
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('should handle inherit/initial keywords', () => {
    const result = validateContrast('inherit', '#fff', 'auto');
    expect(result.warning).toContain('Could not parse');
  });

  it('should handle very long iterative adjustment', () => {
    // A color that needs many iterations
    const nearWhite = { r: 254, g: 254, b: 254 };
    const white = { r: 255, g: 255, b: 255 };
    const result = adjustForContrast(nearWhite, white);

    // Should eventually reach acceptable contrast
    const ratio = calculateContrastRatio(result, white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should handle CSS color functions in rgb format', () => {
    const result = parseRgbColor('rgb(255, 128, 64)');
    expect(result).toEqual({ r: 255, g: 128, b: 64 });
  });
});
