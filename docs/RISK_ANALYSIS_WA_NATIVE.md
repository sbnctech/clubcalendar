# Wild Apricot Native Calendar Risk Analysis

**Prepared for:** SBNC Technology Team
**Date:** January 1, 2026

---

## Executive Summary

This document provides a rigorous analysis of risks associated with continuing to use the native Wild Apricot calendar widget. Each risk is assessed for likelihood, impact, and mitigation strategies.

**Overall Risk Assessment:** LOW (operational) / HIGH (user experience)

The native WA calendar is a stable, vendor-supported solution with low operational risk. However, it presents significant user experience limitations that cannot be mitigated without custom development.

---

## Risk Categories

### 1. Runtime / Technical Risks

#### 1.1 Platform Availability

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Very Low |
| **Impact** | High |
| **Detection** | Immediate |

**What could happen:** Wild Apricot platform experiences downtime, making calendar unavailable.

**Conditions:** WA infrastructure issues, maintenance windows, DDoS attacks.

**Current mitigation:**
- WA is a mature SaaS platform with professional operations
- Scheduled maintenance typically announced in advance
- No SBNC-controlled mitigation possible

**Assessment:** This risk exists regardless of which calendar solution is used. Both ClubCalendar and native calendar depend on WA being available.

---

#### 1.2 Browser Compatibility

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Very Low |
| **Impact** | Low |
| **Detection** | User reports |

**What could happen:** Native calendar doesn't render correctly on certain browsers.

**Conditions:** Outdated browsers, unusual configurations.

**Current mitigation:**
- WA maintains browser compatibility as part of their platform
- Vendor responsibility, not SBNC's

**Assessment:** Low risk. WA handles this as part of their product.

---

### 2. User Experience Risks

#### 2.1 Limited Filtering Capabilities

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Certain (existing limitation) |
| **Impact** | Medium-High |
| **Detection** | User feedback |

**What could happen:** Members cannot effectively filter events to find what interests them.

**Conditions:** This is a permanent limitation of the native calendar.

**Specific limitations:**
- No filtering by time of day (morning/afternoon/evening)
- No filtering by availability (spots remaining)
- No filtering by committee/activity group
- No "weekend only" filter
- No "free events" filter
- Limited category filtering options

**Current mitigation:**
- None available within WA native calendar
- Members must scroll through all events manually
- Some filtering possible via separate event list pages

**Assessment:** This is a fundamental limitation that drives the need for ClubCalendar. Cannot be mitigated without custom development.

---

#### 2.2 Poor Event Discovery

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Certain (existing limitation) |
| **Impact** | Medium |
| **Detection** | Reduced event participation, user feedback |

**What could happen:** Members miss events they would have been interested in because they're difficult to find.

**Conditions:** Permanent limitation.

**Specific issues:**
- Events buried in long scrolling lists
- No visual differentiation by event type
- No quick way to see "what's new" or "just opened"
- Registration status not immediately visible

**Current mitigation:**
- Email announcements for major events
- Newsletter highlights
- Word of mouth

**Assessment:** Ongoing operational burden to compensate for calendar limitations.

---

#### 2.3 No "My Events" Consolidated View

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Certain (existing limitation) |
| **Impact** | Medium |
| **Detection** | User feedback |

**What could happen:** Members cannot easily see all events they've registered for in one place.

**Conditions:** Permanent limitation of calendar widget.

**Specific issues:**
- Must navigate to separate "My registrations" page
- Calendar view doesn't highlight registered events
- Easy to forget about upcoming registered events

**Current mitigation:**
- Email reminders for registered events
- Members must manually check registrations page

**Assessment:** Increases cognitive load on members and likelihood of missed events.

---

#### 2.4 Limited Mobile Experience

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Detection** | User feedback, analytics |

**What could happen:** Calendar is difficult to use on mobile devices.

**Conditions:** Members accessing site from phones/tablets.

**Specific issues:**
- WA's responsive design varies in quality
- Small touch targets
- Difficult to navigate month views on small screens

**Current mitigation:**
- WA has made mobile improvements over time
- Members can use desktop for complex tasks

**Assessment:** Ongoing friction for mobile users.

---

### 3. Operational Risks

#### 3.1 Vendor Lock-in

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Certain (existing condition) |
| **Impact** | Medium |
| **Detection** | N/A |

**What could happen:** SBNC is dependent on WA's product decisions and cannot influence calendar features.

**Conditions:** Permanent condition of using SaaS platform.

**Specific concerns:**
- No control over feature roadmap
- Cannot request specific improvements
- Must accept WA's design decisions
- Pricing changes outside SBNC control

**Current mitigation:**
- Accept platform limitations
- Work around issues with custom solutions (like ClubCalendar)
- Monitor competitive alternatives

**Assessment:** This is an accepted trade-off of using WA. Custom development (like ClubCalendar) provides partial mitigation.

---

#### 3.2 Feature Regression

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Low |
| **Impact** | Medium |
| **Detection** | After WA updates |

**What could happen:** WA updates remove or change features SBNC relies on.

**Conditions:** WA platform updates, product direction changes.

**Historical examples:**
- WA has changed admin interfaces significantly
- Some features deprecated over time
- API changes have broken integrations

**Current mitigation:**
- None (must accept WA changes)
- Can provide feedback through WA forums
- Monitor WA release notes

**Assessment:** SBNC has no control over this risk.

---

#### 3.3 Opaque Platform Behavior

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Low-Medium |
| **Impact** | Medium |
| **Detection** | When issues occur |

**What could happen:** WA systems behave unexpectedly with limited transparency or documentation.

**Conditions:** Rate limiting, security blocks, caching behavior, API quirks.

**Observed issues:**
- Undocumented rate limiting that blocks user accounts
- Security systems with no published documentation
- Support required for resolution (unavailable on holidays/weekends)
- Inconsistent behavior between WA site instances

**Current mitigation:**
- Maintain relationship with WA support
- Document observed behaviors internally
- Accept that some issues may take time to resolve

**Assessment:** This risk affects both native calendar and any custom development on WA. It's an inherent characteristic of the platform.

---

### 4. Data and Privacy Risks

#### 4.1 Data Handling

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Very Low |
| **Impact** | High |
| **Detection** | Audit, breach notification |

**What could happen:** WA experiences data breach or mishandles member data.

**Conditions:** Security incident at WA/Personify.

**Current mitigation:**
- WA is SOC 2 compliant
- Professional security practices
- SBNC has limited visibility into WA's security posture

**Assessment:** Must trust vendor. This risk exists regardless of calendar choice.

---

#### 4.2 Event Visibility Controls

| Attribute | Assessment |
|-----------|------------|
| **Likelihood** | Very Low |
| **Impact** | Medium |
| **Detection** | User reports, audit |

**What could happen:** Event visibility settings don't work as expected.

**Conditions:** WA bugs, misconfiguration.

**Current mitigation:**
- WA has mature access control system
- Event creators must set visibility correctly
- Admin review of event settings

**Assessment:** Low risk with proper event creation procedures.

---

## Risk Summary Matrix

| Risk | Likelihood | Impact | Mitigation Status | Residual Risk |
|------|------------|--------|-------------------|---------------|
| Platform Availability | Very Low | High | Vendor-managed | Very Low |
| Browser Compatibility | Very Low | Low | Vendor-managed | Very Low |
| Limited Filtering | Certain | Medium-High | ❌ None | High |
| Poor Event Discovery | Certain | Medium | ⚠️ Workarounds | Medium-High |
| No "My Events" View | Certain | Medium | ⚠️ Workarounds | Medium |
| Mobile Experience | Medium | Medium | Vendor-managed | Medium |
| Vendor Lock-in | Certain | Medium | ⚠️ Accepted | Medium |
| Feature Regression | Low | Medium | ❌ None | Low-Medium |
| Opaque Platform | Low-Medium | Medium | ⚠️ Workarounds | Low-Medium |
| Data Handling | Very Low | High | Vendor-managed | Very Low |
| Visibility Controls | Very Low | Medium | ✅ Strong | Very Low |

---

## Key Observations

### Risks That Cannot Be Mitigated

The following risks are inherent to the native WA calendar and cannot be addressed without custom development:

1. **Limited filtering capabilities** — Members cannot find events efficiently
2. **Poor event discovery** — Valuable events get buried
3. **No consolidated "My Events"** — Members must navigate multiple pages
4. **Vendor lock-in** — No control over product direction

### Risks Managed by Vendor

The following risks are WA's responsibility:

1. **Platform availability** — WA maintains infrastructure
2. **Browser compatibility** — WA tests across browsers
3. **Security and data handling** — WA maintains compliance
4. **Mobile responsiveness** — WA improves over time

### Operational Burden

Using the native calendar creates ongoing operational work:

- Email campaigns to highlight events that members might miss
- Manual communication about registration openings
- Responding to member frustration about finding events
- Workarounds for mobile users

---

## Conclusion

The native WA calendar presents **low technical risk** but **high user experience risk**.

**Technical risk is low because:**
- WA is a mature, vendor-supported platform
- SBNC has no custom code to maintain
- Security and availability are vendor responsibilities

**User experience risk is high because:**
- Fundamental limitations cannot be addressed
- Members cannot effectively find events of interest
- No path to improvement without custom development
- Ongoing operational burden to compensate

The native calendar is a safe choice from an IT operations perspective but may result in lower member engagement due to poor event discoverability.
