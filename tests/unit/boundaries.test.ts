/**
 * Boundary condition tests for ClubCalendar core functions
 * Tests exact threshold values to ensure correct categorization
 */

import { describe, it, expect } from 'vitest';
import {
  deriveCostCategory,
  deriveAvailability,
  deriveTimeOfDay,
  isWeekend,
} from '../../widget/src/core';

// ═══════════════════════════════════════════════════════════════
// COST CATEGORY BOUNDARIES
// ═══════════════════════════════════════════════════════════════

describe('deriveCostCategory boundaries', () => {
  // Test exact boundary at $0
  describe('free boundary ($0)', () => {
    it.each([
      [0, 'cost:free'],
      [0.00, 'cost:free'],
      [0.01, 'cost:under-25'],
    ])('$%d should be %s', (price, expected) => {
      expect(deriveCostCategory(price)).toBe(expected);
    });
  });

  // Test exact boundary at $25
  describe('$25 boundary (under-25 vs under-50)', () => {
    it.each([
      [24, 'cost:under-25'],
      [24.99, 'cost:under-25'],
      [24.999, 'cost:under-25'],
      [25, 'cost:under-50'],
      [25.00, 'cost:under-50'],
      [25.01, 'cost:under-50'],
    ])('$%d should be %s', (price, expected) => {
      expect(deriveCostCategory(price)).toBe(expected);
    });
  });

  // Test exact boundary at $50
  describe('$50 boundary (under-50 vs under-100)', () => {
    it.each([
      [49, 'cost:under-50'],
      [49.99, 'cost:under-50'],
      [50, 'cost:under-100'],
      [50.00, 'cost:under-100'],
      [50.01, 'cost:under-100'],
    ])('$%d should be %s', (price, expected) => {
      expect(deriveCostCategory(price)).toBe(expected);
    });
  });

  // Test exact boundary at $100
  describe('$100 boundary (under-100 vs over-100)', () => {
    it.each([
      [99, 'cost:under-100'],
      [99.99, 'cost:under-100'],
      [100, 'cost:over-100'],
      [100.00, 'cost:over-100'],
      [100.01, 'cost:over-100'],
      [1000, 'cost:over-100'],
      [9999.99, 'cost:over-100'],
    ])('$%d should be %s', (price, expected) => {
      expect(deriveCostCategory(price)).toBe(expected);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// AVAILABILITY BOUNDARIES
// ═══════════════════════════════════════════════════════════════

describe('deriveAvailability boundaries', () => {
  // Test boundary at 0 spots (full)
  describe('full boundary (0 spots)', () => {
    it.each([
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 20 }, 'availability:full'],
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 21 }, 'availability:full'], // Overbooked
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 25 }, 'availability:full'],
      [{ RegistrationsLimit: 1, ConfirmedRegistrationsCount: 1 }, 'availability:full'],
    ])('limit=%d, confirmed=%d should be %s', (event, expected) => {
      expect(deriveAvailability(event)).toBe(expected);
    });
  });

  // Test boundary at 5 spots (limited vs open)
  describe('5 spots boundary (limited vs open)', () => {
    it.each([
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 19 }, 'availability:limited'], // 1 spot
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 18 }, 'availability:limited'], // 2 spots
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 17 }, 'availability:limited'], // 3 spots
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 16 }, 'availability:limited'], // 4 spots
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 15 }, 'availability:limited'], // 5 spots
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 14 }, 'availability:open'],    // 6 spots
      [{ RegistrationsLimit: 20, ConfirmedRegistrationsCount: 10 }, 'availability:open'],    // 10 spots
    ])('with %o should be %s', (event, expected) => {
      expect(deriveAvailability(event)).toBe(expected);
    });
  });

  // Test unlimited capacity
  describe('unlimited capacity', () => {
    it.each([
      [{ RegistrationsLimit: null, ConfirmedRegistrationsCount: 0 }, 'availability:open'],
      [{ RegistrationsLimit: null, ConfirmedRegistrationsCount: 100 }, 'availability:open'],
      [{ RegistrationsLimit: null, ConfirmedRegistrationsCount: 1000 }, 'availability:open'],
      [{ RegistrationsLimit: undefined, ConfirmedRegistrationsCount: 50 }, 'availability:open'],
      [{ ConfirmedRegistrationsCount: 50 }, 'availability:open'], // No limit property at all
    ])('with %o should be %s', (event, expected) => {
      expect(deriveAvailability(event)).toBe(expected);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// TIME OF DAY BOUNDARIES
// ═══════════════════════════════════════════════════════════════

describe('deriveTimeOfDay boundaries', () => {
  // Morning/Afternoon boundary at 12:00
  describe('morning/afternoon boundary (12:00)', () => {
    it.each([
      ['2024-06-15T11:00:00', 'time:morning'],
      ['2024-06-15T11:30:00', 'time:morning'],
      ['2024-06-15T11:59:00', 'time:morning'],
      ['2024-06-15T11:59:59', 'time:morning'],
      ['2024-06-15T12:00:00', 'time:afternoon'],
      ['2024-06-15T12:00:01', 'time:afternoon'],
      ['2024-06-15T12:01:00', 'time:afternoon'],
    ])('%s should be %s', (date, expected) => {
      expect(deriveTimeOfDay(date)).toBe(expected);
    });
  });

  // Afternoon/Evening boundary at 17:00
  describe('afternoon/evening boundary (17:00)', () => {
    it.each([
      ['2024-06-15T16:00:00', 'time:afternoon'],
      ['2024-06-15T16:30:00', 'time:afternoon'],
      ['2024-06-15T16:59:00', 'time:afternoon'],
      ['2024-06-15T16:59:59', 'time:afternoon'],
      ['2024-06-15T17:00:00', 'time:evening'],
      ['2024-06-15T17:00:01', 'time:evening'],
      ['2024-06-15T17:01:00', 'time:evening'],
    ])('%s should be %s', (date, expected) => {
      expect(deriveTimeOfDay(date)).toBe(expected);
    });
  });

  // Edge of day
  describe('edge of day', () => {
    it.each([
      ['2024-06-15T00:00:00', 'time:morning'],  // Midnight
      ['2024-06-15T00:00:01', 'time:morning'],
      ['2024-06-15T23:59:59', 'time:evening'],
    ])('%s should be %s', (date, expected) => {
      expect(deriveTimeOfDay(date)).toBe(expected);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// WEEKEND BOUNDARIES
// ═══════════════════════════════════════════════════════════════

describe('isWeekend boundaries', () => {
  // Friday to Saturday transition
  describe('Friday/Saturday boundary', () => {
    it.each([
      ['2024-06-14T23:59:59', false], // Friday 11:59 PM
      ['2024-06-15T00:00:00', true],  // Saturday midnight
      ['2024-06-15T00:00:01', true],  // Saturday 12:00:01 AM
    ])('%s isWeekend should be %s', (date, expected) => {
      expect(isWeekend(date)).toBe(expected);
    });
  });

  // Sunday to Monday transition
  describe('Sunday/Monday boundary', () => {
    it.each([
      ['2024-06-16T23:59:59', true],  // Sunday 11:59 PM
      ['2024-06-17T00:00:00', false], // Monday midnight
      ['2024-06-17T00:00:01', false], // Monday 12:00:01 AM
    ])('%s isWeekend should be %s', (date, expected) => {
      expect(isWeekend(date)).toBe(expected);
    });
  });

  // All days of week
  describe('all days of week', () => {
    it.each([
      ['2024-06-16T12:00:00', true],  // Sunday
      ['2024-06-17T12:00:00', false], // Monday
      ['2024-06-18T12:00:00', false], // Tuesday
      ['2024-06-19T12:00:00', false], // Wednesday
      ['2024-06-20T12:00:00', false], // Thursday
      ['2024-06-21T12:00:00', false], // Friday
      ['2024-06-22T12:00:00', true],  // Saturday
    ])('%s isWeekend should be %s', (date, expected) => {
      expect(isWeekend(date)).toBe(expected);
    });
  });
});
