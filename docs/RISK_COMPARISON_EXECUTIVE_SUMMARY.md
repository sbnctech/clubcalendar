# Calendar Solution Risk Comparison: Executive Summary

**Prepared for:** SBNC Technology Team
**Date:** January 1, 2026

---

## Purpose

This document compares the risk profiles of two calendar solutions for SBNC:

1. **Native WA Calendar** — Wild Apricot's built-in calendar widget
2. **ClubCalendar** — Custom calendar widget developed for SBNC

Both solutions are evaluated across the same risk categories to enable informed decision-making.

---

## Summary Comparison

| Risk Category | Native WA Calendar | ClubCalendar |
|---------------|-------------------|--------------|
| **Overall Risk** | LOW (technical) / HIGH (UX) | LOW-MEDIUM |
| **Technical Complexity** | None (vendor-managed) | Moderate (custom code) |
| **User Experience** | Limited, no path to improve | Enhanced, customizable |
| **Operational Burden** | Ongoing (compensating for UX) | Initial setup, then low |
| **Failure Mode** | Platform-wide outage | Graceful fallback to native |
| **Recovery Time** | Dependent on WA | Minutes (revert to native) |
| **Data Risk** | Vendor-managed | Same (uses WA data) |

---

## Risk-by-Risk Comparison

### Technical / Runtime Risks

| Risk | Native WA | ClubCalendar | Winner |
|------|-----------|--------------|--------|
| CDN/External Dependencies | None | Cloudflare (99.99% SLA) | Native (slightly) |
| Platform API Changes | Low impact | Medium impact | Native |
| JavaScript Errors | N/A (vendor code) | Low (855+ tests) | Native |
| Browser Compatibility | Vendor-managed | Tested, fallback available | Tie |

**Analysis:** Native WA has slight advantage in technical risk because there's no custom code. However, ClubCalendar's automatic fallback means technical failures result in native calendar display—the same outcome as choosing native directly.

---

### User Experience Risks

| Risk | Native WA | ClubCalendar | Winner |
|------|-----------|--------------|--------|
| Event Filtering | ❌ Very Limited | ✅ Comprehensive | ClubCalendar |
| Event Discovery | ❌ Poor | ✅ Enhanced | ClubCalendar |
| "My Events" View | ❌ Not available | ✅ Included | ClubCalendar |
| Mobile Experience | ⚠️ Adequate | ✅ Responsive design | ClubCalendar |
| User Confusion (change) | ✅ None (status quo) | ⚠️ Some adjustment | Native |

**Analysis:** ClubCalendar significantly improves user experience. The only UX risk it introduces is the change itself, which can be mitigated with communication.

---

### Operational Risks

| Risk | Native WA | ClubCalendar | Winner |
|------|-----------|--------------|--------|
| Maintenance Burden | None (vendor) | Low (Builder tool) | Native |
| Knowledge Concentration | None | Medium (mitigatable) | Native |
| Vendor Lock-in | High (no alternative) | Lower (can revert) | ClubCalendar |
| WA Platform Changes | No control | No control + fallback | ClubCalendar |
| Rate Limiting/Blocking | Affects admin functions | Affects widget + fallback | Tie |
| Opaque WA Behavior | Affects all WA usage | Same + documented workarounds | Tie |

**Analysis:** Native WA requires less maintenance but offers no flexibility. ClubCalendar requires initial investment but provides options if issues arise.

---

### Data / Privacy Risks

| Risk | Native WA | ClubCalendar | Winner |
|------|-----------|--------------|--------|
| Data Storage | WA only | WA only (no additional) | Tie |
| Event Visibility | WA controls | WA controls + client filter | ClubCalendar |
| Personal Data | WA responsibility | WA responsibility | Tie |

**Analysis:** Both solutions use the same underlying data. ClubCalendar adds an additional client-side visibility filter as defense in depth.

---

## Failure Scenarios

### Scenario: WA Platform Outage

| Solution | Outcome |
|----------|---------|
| Native WA | Calendar unavailable |
| ClubCalendar | Calendar unavailable |

**Result:** Tie — both depend on WA.

---

### Scenario: ClubCalendar Bug

| Solution | Outcome |
|----------|---------|
| Native WA | N/A |
| ClubCalendar | Fallback to native calendar |

**Result:** ClubCalendar users see native calendar (same as if native was chosen).

---

### Scenario: WA API Changes

| Solution | Outcome |
|----------|---------|
| Native WA | Automatic (WA updates their code) |
| ClubCalendar | Fallback activates; fix deployed via Builder |

**Result:** Native has smoother recovery; ClubCalendar has brief fallback period.

---

### Scenario: Need Feature Improvement

| Solution | Outcome |
|----------|---------|
| Native WA | Request through WA forums; wait indefinitely |
| ClubCalendar | Develop and deploy (hours to days) |

**Result:** ClubCalendar enables rapid response to user needs.

---

## Decision Framework

### Choose Native WA Calendar If:

- Minimizing any custom code is the top priority
- No resources available for initial setup and occasional maintenance
- Current calendar UX is acceptable to membership
- Organization prefers vendor-managed solutions regardless of limitations

### Choose ClubCalendar If:

- Member experience and event discoverability are priorities
- Willing to invest initial setup effort for ongoing benefits
- Want ability to respond to user feedback with improvements
- Comfortable with tested custom code that falls back gracefully

---

## Risk Mitigation Summary

### Risks Unique to ClubCalendar (and how they're mitigated)

| Risk | Mitigation |
|------|------------|
| Custom code maintenance | Builder tool, comprehensive docs, AI-assisted development |
| Technical failures | Automatic fallback to native WA calendar |
| WA API changes | Fallback + rapid fix deployment |
| Knowledge concentration | Documentation, cross-training |

### Risks Unique to Native WA (and why they can't be mitigated)

| Risk | Why No Mitigation |
|------|-------------------|
| Limited filtering | WA product decision; no customization available |
| Poor event discovery | Fundamental design limitation |
| No "My Events" in calendar | Feature not offered by WA |
| Vendor lock-in | Inherent to SaaS model |

---

## Recommendation

**For organizations prioritizing member experience:** ClubCalendar offers significant UX improvements with manageable technical risk. The automatic fallback ensures that the worst-case scenario equals the native calendar—the alternative being considered anyway.

**For organizations prioritizing minimal change:** Native WA calendar is operationally simpler but locks in current UX limitations with no path to improvement.

**Key insight:** ClubCalendar's risk profile is "native WA calendar + small incremental risk for significant UX gain." If ClubCalendar fails completely, users see the native calendar. The question is whether the UX improvements justify the incremental risk and maintenance investment.

---

## Appendix: Document References

- [ClubCalendar Risk Analysis](RISK_ANALYSIS.md) — Detailed risk assessment for ClubCalendar
- [WA Native Calendar Risk Analysis](RISK_ANALYSIS_WA_NATIVE.md) — Detailed risk assessment for native calendar
- [Builder Executive Overview](BUILDER_EXECUTIVE_OVERVIEW.md) — Technical overview of build system
- [Development Methodology](DEVELOPMENT_METHODOLOGY.md) — How ClubCalendar was developed
