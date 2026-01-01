# ClubCalendar Builder Guide

ClubCalendar provides two ways to create custom widget deployments:

1. **Web Builder** - Browser-based visual tool (recommended for most users)
2. **CLI Build Tools** - Command-line tools for automation and CI/CD

---

## Web Builder

### Access

- **Production:** https://mail.sbnewcomers.org/calendar/builder/
- **Local:** `deploy/builder/index.html`

### Overview

The Web Builder is a 5-step wizard that guides you through configuring a custom ClubCalendar deployment:

| Step | Name | Purpose |
|------|------|---------|
| 1 | Organization | Basic identity (name, WA account ID) |
| 2 | Appearance | Colors, typography, header text |
| 3 | Filters | Enable/disable quick filters and dropdown filters |
| 4 | Committee Rules | Auto-tagging rules for committee filtering |
| 5 | Generate | Review and download package |

### Features

#### Configuration Presets

Load pre-configured settings for known organizations:

- **SBNC** - Santa Barbara Newcomers Club (18 committees)
- **Example** - Generic example configuration
- **Minimal** - Bare minimum configuration

Click **Load Preset** in the toolbar to apply a preset.

#### Save/Load Configuration

- **Save Config** - Downloads current settings as JSON file
- **Load Config** - Uploads a previously saved JSON configuration

This allows you to:

- Version control your configuration
- Share configurations between team members
- Quickly regenerate builds after code updates

#### Generated Package Contents

The download package (`ClubCalendar_<NAME>_Package.zip`) contains:

| File | Description |
|------|-------------|
| `ClubCalendar_<NAME>_EVENTS_PAGE.html` | Widget HTML for WA Custom HTML gadget |
| `config.json` | Configuration backup |
| `INSTALLATION.md` | Step-by-step installation guide |
| `README.md` | Widget overview and features |
| `OPERATOR_CHECKLIST.md` | Post-installation verification checklist |
| `certification-tests/` | Test files for verifying the build |

### Configuration Options

#### Organization (Required)

| Field | Description |
|-------|-------------|
| Organization Name | Full name (e.g., "Santa Barbara Newcomers Club") |
| Short Name | Abbreviation for filenames (e.g., "SBNC") |
| WA Account ID | Wild Apricot account number |
| Header Title | Text shown in widget header (default: "Events") |

#### Appearance

| Field | Default | Description |
|-------|---------|-------------|
| Primary Color | #2c5aa0 | Main theme color (headers, buttons) |
| Accent Color | #d4a800 | Highlight color (hover states) |
| Font Family | system-ui | CSS font-family value |
| Base Font Size | 14px | Root font size |
| Default View | Month | Initial calendar view |

#### Quick Filters

Toggle visibility of quick filter buttons:

- **Weekend** - Saturday/Sunday events
- **Openings Available** - Events with spots left
- **After Hours** - Evenings and weekends
- **Free Events** - No-cost events
- **Open to Public** - Non-member events

#### Dropdown Filters

Toggle visibility of dropdown filter menus:

- **Time of Day** - Morning, Afternoon, Evening
- **Event Type** - Regular, Workshop, Social, etc.
- **Interest Area** - Arts, Sports, Travel, etc.
- **Committee** - Organization-specific groups

#### Auto-Tag Rules

Rules that automatically assign committee tags based on event titles:

| Rule Type | Matches | Example |
|-----------|---------|---------|
| name-prefix | Start of title | "Hiking:" matches "Hiking: Morning Walk" |
| name-contains | Anywhere in title | "workshop" matches "Spring Workshop Event" |
| name-suffix | End of title | "social" matches "Monthly Happy Hour social" |

---

## CLI Build Tools

### Location

`scripts/build/`

### Quick Start

```bash
# List available profiles
npm run build:widget -- --list

# Build from built-in profile
npm run build:sbnc

# Build from custom config
npm run build:widget -- --config path/to/config.json

# Interactive mode
npm run build:interactive
```

### Build Pipeline

```bash
# 1. Build the widget
npm run build:widget -- --config my-org-config.json

# 2. Generate certification tests
npx tsx scripts/build/generate-certification.ts --config my-org-config.json

# 3. Run certification tests
npm run test:certify:<name>
```

### Configuration File Format

Same format as Web Builder exports. See `scripts/build/example-config.json`.

---

## Testing

### Unit Tests

```bash
# Run builder unit tests
npm test -- --grep "Builder"
```

Tests cover:

- Configuration validation
- Preset loading
- Save/load functionality
- Package generation

### E2E Tests

```bash
# Run builder E2E tests
npx playwright test tests/e2e/builder.spec.ts
```

Tests cover:

- Step navigation
- Form field interactions
- Preset loading
- Package download verification

### Certification Tests

After generating a build, run certification tests to verify the configuration:

```bash
npm run test:certify:sbnc
npm run test:certify:enc
```

---

## Workflow Recommendations

### New Organization Setup

1. Open Web Builder
2. Fill in organization details
3. Configure appearance to match website theme
4. Add auto-tag rules for each committee
5. Generate and download package
6. **Save configuration** for future rebuilds

### Updating After Code Changes

1. Open Web Builder
2. **Load saved configuration**
3. Click Generate
4. Download new package
5. Replace widget in Wild Apricot

### CI/CD Integration

```bash
# Automated build and test
npm run build:widget -- --config orgs/sbnc.json && npm run test:certify:sbnc
```

---

## Troubleshooting

### "Required field" validation error

All three organization fields must be filled:

- Organization Name
- Short Name
- WA Account ID

### Package download doesn't start

Ensure your browser allows downloads from the builder URL. Some browsers block downloads from file:// URLs.

### Auto-tag rules not working

- Patterns are case-sensitive
- Prefix patterns should include the colon (e.g., "Hiking:")
- Test with certification tests after building

---

## File Locations

| Path | Description |
|------|-------------|
| `deploy/builder/index.html` | Web Builder source |
| `deploy/builder/widget-core.html` | Widget template |
| `scripts/build/` | CLI build tools |
| `tests/unit/builder.test.ts` | Unit tests |
| `tests/e2e/builder.spec.ts` | E2E tests |
| `tests/certification/` | Generated certification tests |
