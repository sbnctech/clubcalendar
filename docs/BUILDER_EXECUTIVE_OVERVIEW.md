# ClubCalendar Builder: Executive Technical Overview

## Purpose

The ClubCalendar Builder generates custom, self-contained calendar widgets for organizations using Wild Apricot (WA). Each generated widget is a single HTML file that embeds directly into WA's Custom HTML gadget system—no server infrastructure, no ongoing maintenance burden, no external dependencies at runtime.

---

## Architecture Decisions

### Why a Code Generator?

We chose a **build-time code generation** approach over runtime configuration:

| Approach | Pros | Cons |
|----------|------|------|
| **Runtime config** | Single codebase, instant updates | External config dependency, runtime failures, CORS complexity |
| **Build-time generation** | Zero runtime dependencies, works offline, no config fetch failures | Requires rebuild for changes |

**Decision rationale:** Wild Apricot's Custom HTML gadgets run in constrained iframes. External fetch calls introduce failure modes (network, CORS, hosting). A self-contained HTML file eliminates these risks entirely.

### Single-File Output

Each generated widget is one HTML file containing:

- Embedded CSS (no external stylesheets)
- Embedded JavaScript (no external scripts except FullCalendar CDN)
- Embedded configuration (no runtime config fetch)
- Fallback behavior (graceful degradation if CDN fails)

**Trade-off acknowledged:** Larger file size (~450KB) vs. zero external dependencies. For a calendar widget loaded once per page view, this is acceptable.

### Client-Side Build Tool

The Web Builder runs entirely in the browser:

- No server-side processing
- No user data transmitted anywhere
- ZIP generation via JSZip (client-side)
- Works from file:// URLs for local development

**Security implication:** Configuration data never leaves the user's browser.

---

## Quality Assurance

### Test Coverage

| Test Type | Count | Purpose |
|-----------|-------|---------|
| Unit tests | 855+ | Core logic, configuration validation, edge cases |
| E2E tests | 16 | Browser-based workflow verification |
| Certification tests | Per-build | Verify specific build meets requirements |

### Certification Test System

Each generated build includes organization-specific tests:

```
tests/certification/sbnc-certification.test.ts
tests/certification/enc-certification.test.ts
```

These verify:

- Correct WA account ID embedded
- Auto-tag rules produce expected committee tags
- Filter configurations match requirements
- Expected behaviors defined in profile

**Rationale:** Generic tests catch regressions; certification tests catch configuration errors specific to each deployment.

### Test Execution

```bash
# Full test suite
npm test

# Builder-specific tests
npm test -- --grep "Builder"

# E2E tests (requires Playwright)
npx playwright test tests/e2e/builder.spec.ts

# Organization certification
npm run test:certify:sbnc
```

---

## Maintainability

### Configuration as Code

Saved configurations are JSON files that can be:

- Version controlled alongside source
- Diffed to review changes
- Shared across team members
- Used in CI/CD pipelines

Example workflow:
```bash
git diff orgs/sbnc-config.json  # Review config changes
npm run build:widget -- --config orgs/sbnc-config.json
npm run test:certify:sbnc
```

### Preset System

Built-in presets (SBNC, Example, Minimal) serve as:

- Starting points for new organizations
- Reference implementations
- Regression test fixtures

Adding a new preset requires only adding to the `PRESETS` object—no architectural changes.

### Template Separation

Widget code is maintained in `deploy/builder/widget-core.html`, separate from:

- Builder UI logic
- Configuration handling
- Package generation

Changes to widget behavior don't require changes to the builder, and vice versa.

---

## Security Considerations

### No Server-Side Processing

- Builder runs entirely client-side
- No user data transmitted to any server
- No authentication required
- No API keys or secrets in builder

### Generated Widget Security

- Widgets communicate only with Wild Apricot's API (same-origin in WA context)
- No external data exfiltration possible
- Member-only events filtered client-side (defense in depth—WA API is authoritative)

### Supply Chain

External dependencies in generated widgets:

| Dependency | Source | Risk Mitigation |
|------------|--------|-----------------|
| FullCalendar | CDN (jsdelivr) | Pinned version, fallback on failure |
| JSZip | Bundled in builder | No runtime dependency |

**Fallback behavior:** If FullCalendar CDN fails, widget displays error message with link to WA's native calendar.

---

## Operational Characteristics

### Deployment Model

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Builder Tool   │────▶│  Generated ZIP   │────▶│  WA Custom HTML │
│  (one-time use) │     │  (transferred)   │     │  (production)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- Builder is used once per configuration change
- Generated HTML is copied into Wild Apricot
- No ongoing infrastructure to maintain

### Update Process

1. Make changes to widget code or configuration
2. Run builder (Web UI or CLI)
3. Download new package
4. Replace HTML in WA Custom HTML gadget
5. Verify with certification tests

**Rollback:** Previous HTML can be restored in WA's gadget editor (WA maintains revision history).

### Monitoring

Generated widgets include:

- Console logging for debugging (configurable)
- Error boundaries with user-friendly fallback
- No external analytics or telemetry

---

## Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Manual deployment | Requires copy/paste into WA | Clear installation docs, checklist |
| CDN dependency | FullCalendar loaded from jsdelivr | Fallback UI on failure |
| No hot updates | Config changes require rebuild | Save/load config reduces friction |
| File size (~450KB) | Slower initial load | Single load per page, cached by browser |

---

## Extension Points

### Adding New Organizations

1. Create configuration JSON
2. Generate build via Web Builder or CLI
3. Generate certification tests
4. Add to CI/CD pipeline

### Adding New Features

Widget features require:

1. Update `widget-core.html` template
2. Add configuration options to builder UI
3. Update unit tests
4. Regenerate all organization builds

### Adding New Filter Types

Auto-tag rule types are extensible:

- Current: `name-prefix`, `name-contains`, `name-suffix`
- Adding new types requires updating `applyAutoTags()` in core and builder UI

---

## File Structure

```
clubcalendar/
├── deploy/builder/
│   ├── index.html          # Web Builder UI
│   └── widget-core.html    # Widget template
├── scripts/build/
│   ├── build-widget.ts     # CLI build tool
│   └── generate-certification.ts
├── tests/
│   ├── unit/builder.test.ts
│   ├── e2e/builder.spec.ts
│   └── certification/      # Per-org certification tests
└── docs/
    ├── BUILDER_GUIDE.md    # User documentation
    └── BUILDER_EXECUTIVE_OVERVIEW.md  # This document
```

---

## Recommendations

### For Production Use

- Store organization configs in version control
- Run certification tests in CI before deployment
- Document WA gadget locations for each organization
- Maintain changelog of deployed versions

### For Future Development

- Consider automated WA deployment via API (if WA adds support)
- Evaluate service worker for offline fallback
- Add visual regression testing for generated widgets
