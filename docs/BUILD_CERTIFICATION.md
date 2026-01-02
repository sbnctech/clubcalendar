# ClubCalendar Build Certification

**Version:** 1.02

**Date:** January 1, 2026

This document describes the build certification framework for ClubCalendar. Any build can be certified by running the certification test suite.

---

## Overview

The certification framework validates that a ClubCalendar build:

1. **Configures correctly** - All settings match the intended profile
2. **Auto-tags correctly** - Committee rules produce expected tags
3. **Filters correctly** - Quick filters and dropdowns work as configured
4. **Displays correctly** - UI adapts to member/guest mode
5. **Runs on live site** - Buddy tests verify actual deployment

---

## Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Unit Tests | 715 | Core library functions |
| E2E Tests | 14 | Widget in simulated WA environment |
| Certification Tests | 87+ | Build-specific validation |
| Buddy Tests (Live) | 17 | Live site integration |

---

## Running Certification Tests

### SBNC Build Certification

```bash
# Run SBNC-specific unit/certification tests
npm run test:certify:sbnc

# Run live buddy tests against WA playground
npm run test:buddy:sbnc

# Run full SBNC certification (both)
npm run certify:sbnc
```

### Full System Certification

```bash
# Run everything: unit tests, E2E, and SBNC certification
npm run certify:full
```

---

## Certification Commands

| Command | Description |
|---------|-------------|
| `npm run test:certify` | All certification test suites |
| `npm run test:certify:sbnc` | SBNC profile certification |
| `npm run test:buddy` | All live buddy tests |
| `npm run test:buddy:sbnc` | SBNC live buddy tests |
| `npm run certify:sbnc` | Complete SBNC certification |
| `npm run certify:full` | Complete system certification |

---

## Build Profiles

A build profile defines the configuration for a specific deployment:

### SBNC Profile

| Setting | Value |
|---------|-------|
| **waAccountId** | `176353` |
| **headerTitle** | "SBNC Events" |
| **primaryColor** | `#2c5aa0` |
| **accentColor** | `#d4a800` |
| **autoTagRules** | 18 committee rules |
| **quickFilters.free** | Disabled |
| **publicConfig.showMyEvents** | Hidden |

### Tested Committee Auto-Tag Rules

| Committee | Pattern | Tag |
|-----------|---------|-----|
| Happy Hikers | `Happy Hikers:` | `committee:happy-hikers` |
| Games! | `Games!:` | `committee:games` |
| Wine Appreciation | `Wine Appreciation:` | `committee:wine` |
| Epicurious | `Epicurious:` | `committee:epicurious` |
| TGIF | `TGIF:` | `committee:tgif` |
| Cycling | `Cycling:` | `committee:cycling` |
| Golf | `Golf:` | `committee:golf` |
| Performing Arts | `Performing Arts:` | `committee:performing-arts` |
| Local Heritage | `Local Heritage:` | `committee:local-heritage` |
| Wellness | `Wellness:` | `committee:wellness` |
| Garden | `Garden:` | `committee:garden` |
| Arts | `Arts:` | `committee:arts` |
| Current Events | `Current Events:` | `committee:current-events` |
| Pop-Up | `Pop-Up:` | `committee:popup` |
| Beer Lovers | `Beer Lovers:` | `committee:beer` |
| Out to Lunch | `Out to Lunch:` | `committee:out-to-lunch` |
| Afternoon Book | `Afternoon Book:` | `committee:book-clubs` |
| Evening Book | `Evening Book:` | `committee:book-clubs` |

---

## Configuration Matrix Testing

The certification framework tests combinations of configurable options:

### Quick Filters (5 options = 32 combinations)

- `weekend` - Filter by Saturday/Sunday events
- `openings` - Filter by events with spots available
- `afterhours` - Filter by evening events (after 5pm)
- `free` - Filter by free events
- `public` - Filter by public access events

### Dropdown Filters (7 options = 128 combinations)

- `committee` - Filter by activity committee
- `activity` - Filter by activity type (Physical, Social, etc.)
- `price` - Filter by price range
- `eventType` - Filter by event type (Workshop, Trip, etc.)
- `recurring` - Filter by recurring pattern
- `venue` - Filter by venue type (Outdoor, etc.)
- `tags` - Filter by WA event tags

The framework uses **pairwise testing** to efficiently test representative combinations without running all 2^12 possibilities.

---

## Buddy Test Checklist

The live buddy test validates these items on the actual WA site:

### Widget Loading

- [ ] Widget displays header
- [ ] Events load and display
- [ ] No console errors

### Filters

- [ ] Committee dropdown populated
- [ ] Quick filters toggle correctly
- [ ] Free filter hidden (SBNC config)

### My Events (Member-Only)

- [ ] My Events tab shows for members
- [ ] Auto-detects current user
- [ ] Registration badges display

### Views

- [ ] Month view displays
- [ ] Week view displays
- [ ] List view displays

### Mobile

- [ ] Adapts to mobile width
- [ ] Filters accessible

### Guest Mode

- [ ] Appropriate content shown
- [ ] My Events tab hidden

---

## Creating a New Build Profile

To certify a new organization's build:

1. **Create profile file** in `tests/certification/`:

```typescript
// tests/certification/neworg-profile.ts
export const NEWORG_PROFILE: BuildProfile = {
  name: 'NewOrg',
  description: 'New Organization - WA Native Mode',
  config: {
    waAccountId: 'XXXXXX',
    headerTitle: 'NewOrg Events',
    autoTagRules: [
      // Define committee rules
    ],
    // ... other config
  },
  expectedBehaviors: [
    // Define validation tests
  ],
};
```

2. **Create certification test** in `tests/certification/`:

```typescript
// tests/certification/neworg-certification.test.ts
import { NEWORG_PROFILE } from './neworg-profile';
// ... tests similar to sbnc-certification.test.ts
```

3. **Create live buddy test** in `tests/certification/`:

```typescript
// tests/certification/neworg-live.spec.ts
const NEWORG_TEST_URL = 'https://neworg.wildapricot.org/Events';
// ... tests similar to sbnc-live.spec.ts
```

4. **Add npm scripts** to package.json:

```json
"test:certify:neworg": "vitest run tests/certification/neworg-certification.test.ts",
"test:buddy:neworg": "playwright test neworg-live.spec.ts --config tests/certification/playwright.config.ts",
"certify:neworg": "npm run test:certify:neworg && npm run test:buddy:neworg"
```

---

## Certification Report Format

When certification tests run, they produce a summary:

```
═══════════════════════════════════════════════════════════════
SBNC BUILD CERTIFICATION SUMMARY
═══════════════════════════════════════════════════════════════
Build Profile: SBNC
WA Account ID: 176353
Auto-Tag Rules: 18
Expected Behaviors: 8
Buddy Test Items: 21
  - Automated: 18
  - Manual: 3
═══════════════════════════════════════════════════════════════
```

---

## Test File Structure

```
tests/certification/
├── config-schema.ts          # Configuration types and matrix generators
├── sbnc-profile.ts           # SBNC build profile definition
├── sbnc-certification.test.ts # SBNC unit certification tests
├── sbnc-live.spec.ts         # SBNC live buddy tests (Playwright)
├── playwright.config.ts      # Playwright config for live tests
└── BUILD_CERTIFICATION.md    # This documentation
```

---

## Interpreting Results

### Passed Tests

All configuration options work as intended.

### Skipped Tests

Tests may be skipped if:

- ClubCalendar widget is not installed (using native WA calendar)
- Feature is disabled in config (e.g., Free quick filter in SBNC)
- Test requires authentication (manual verification needed)

### Failed Tests

Investigation needed:

- Check the specific test output
- Review screenshots/videos in `playwright-report-certification/`
- Verify the build configuration matches the profile

---

## Manual Verification

Some tests cannot be automated due to authentication requirements:

| Test | Requires |
|------|----------|
| My Events tab visibility | Logged-in member |
| Registration badges | Member with registrations |
| My Events auto-detect | WA session cookie |

These should be manually verified during buddy testing sessions.

---

*Document maintained by Ed Forman with AI assistance*
