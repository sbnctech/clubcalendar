# ClubCalendar Build Tools

Tools for generating custom ClubCalendar deployments for different organizations.

## Quick Start

### Build from Built-in Profile

```bash
# List available profiles
npm run build:widget -- --list

# Build SBNC release
npm run build:sbnc
```

### Build from Custom Configuration

```bash
# Build from JSON config
npm run build:widget -- --config path/to/my-org-config.json

# Interactive build
npm run build:interactive
```

### Validate Configuration

```bash
npm run build:widget -- --config my-config.json --validate
```

## Configuration File Format

See `example-config.json` for a complete example.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `organizationName` | string | Full organization name |
| `organizationShortName` | string | Short name (e.g., "SBNC") |
| `waAccountId` | string | Wild Apricot account ID |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `headerTitle` | string | "Events" | Widget header text |
| `primaryColor` | string | "#2c5aa0" | Primary theme color |
| `accentColor` | string | "#d4a800" | Accent theme color |
| `defaultView` | string | "dayGridMonth" | Default calendar view |
| `autoTagRules` | array | [] | Committee tagging rules |
| `quickFilters` | object | all true | Toggle quick filters |
| `dropdownFilters` | object | all true | Toggle dropdown filters |
| `publicConfig` | object | {} | Config overrides for guests |
| `memberConfig` | object | {} | Config overrides for members |

### Auto-Tag Rules

Auto-tag rules derive committee/category tags from event titles:

```json
{
  "autoTagRules": [
    { "type": "name-prefix", "pattern": "Hiking:", "tag": "committee:hiking" },
    { "type": "name-contains", "pattern": "workshop", "tag": "type:workshop" },
    { "type": "name-suffix", "pattern": "social", "tag": "type:social" }
  ]
}
```

Rule types:
- `name-prefix` - Match at start of title (e.g., "Hiking: Morning Walk")
- `name-contains` - Match anywhere in title (e.g., "Spring Workshop Event")
- `name-suffix` - Match at end of title (e.g., "Monthly Happy Hour social")

### Quick Filters

```json
{
  "quickFilters": {
    "weekend": true,      // Saturday/Sunday events
    "openings": true,     // Events with spots available
    "afterhours": true,   // Evening events (after 5pm)
    "free": false,        // Free events (disabled if redundant)
    "public": true        // Public access events
  }
}
```

### Member vs Public Config

Different settings for logged-in members vs anonymous visitors:

```json
{
  "publicConfig": {
    "showMyEvents": false,
    "quickFilters": { "public": false }
  },
  "memberConfig": {
    "showMyEvents": true
  }
}
```

### Event Click Behavior

The widget handles event clicks differently based on user status:

| User Type | Click Behavior |
|-----------|----------------|
| **Public (anonymous)** | Shows popup with title, date/time, description, and "Join SBNC to Participate" button |
| **Member (logged in)** | Navigates directly to WA event details page for registration |

**Important:** Public users never navigate to event detail pages (members-only content). Instead, they see an informative popup encouraging them to join the organization.

## Generating Certification Tests

After creating a custom build, generate certification tests:

```bash
npx tsx scripts/build/generate-certification.ts --config path/to/config.json
```

This creates:
- `tests/certification/<name>-profile.ts` - Profile definition
- `tests/certification/<name>-certification.test.ts` - Certification tests

## Build Pipeline

### Full Build and Test

```bash
# 1. Build the widget
npm run build:widget -- --config my-org-config.json

# 2. Generate certification tests
npx tsx scripts/build/generate-certification.ts --config my-org-config.json

# 3. Run certification tests
npm run test:certify:<name>
```

### CI/CD Integration

```bash
# Build, test, and certify in one command
npm run build:sbnc && npm run certify:sbnc
```

## Files

| File | Description |
|------|-------------|
| `build-widget.ts` | Main build tool |
| `generate-certification.ts` | Test generator |
| `widget-core.html` | Core widget code (extracted template) |
| `example-config.json` | Example configuration |

## Output

Built widgets are written to `deploy/ClubCalendar_<NAME>_EVENTS_PAGE.html`.

Each build is a self-contained HTML file that can be pasted directly into a Wild Apricot Custom HTML gadget.
