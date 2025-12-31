# ClubCalendar Development Methodology

**Version:** 1.0
**Date:** December 30, 2025

---

## Overview

ClubCalendar was developed using an **AI-assisted iterative approach**—a pragmatic methodology suited to small-scope projects maintained by volunteers with AI assistance. This document describes the methodology, practices, costs, risks, and operational procedures.

---

## Methodology Summary

| Aspect | Approach |
|--------|----------|
| **Development Model** | AI pair programming (Claude as primary developer) |
| **Requirements** | User research rubric → capability analysis |
| **Documentation** | Extensive, AI-context-oriented |
| **Code Review** | Buddy reviews (peer feedback) |
| **Testing** | Manual + automated E2E (Playwright) |
| **Version Control** | Git with semantic commits |
| **Releases** | Versioned packages (1.0, 1.01) |
| **Iteration** | Respond to feedback, fix bugs, iterate |

---

## Core Practices

### 1. AI-Assisted Development

Claude Code serves as the primary developer, with human oversight for:

- Requirements definition
- Architectural decisions
- Code review and approval
- Deployment decisions

**What AI does:**

- Writes code based on requirements
- Generates documentation
- Creates and runs tests
- Fixes bugs
- Responds to code review feedback

**What humans do:**

- Define what to build and why
- Review AI-generated code
- Make go/no-go decisions
- Deploy to production
- Conduct buddy reviews

### 2. Documentation-Oriented Development

The repository contains extensive documentation to provide context for AI maintenance:

| Document Type | Purpose |
|---------------|---------|
| Architecture docs | System design and data flow |
| Setup guides | Installation and configuration |
| Schema references | Data format specifications |
| Capability analysis | Requirements traceability |
| Code comments | Implementation context |

This documentation serves dual purposes:

1. **AI Context** - Enable AI agents to understand and modify the codebase effectively
2. **Human Reference** - Provide maintainers with comprehensive reference material

### 3. Buddy Reviews

Instead of formal code review gates, ClubCalendar uses buddy reviews:

- Peer developers review code and provide feedback
- Reviews are documented in the repository
- Feedback is incorporated iteratively
- Focus on design decisions and maintainability

### 4. Iterative Improvement

Development follows a build-measure-learn cycle:

1. **Build** - Implement feature based on requirements
2. **Test** - Manual testing and automated E2E tests
3. **Review** - Gather feedback from buddy reviews
4. **Iterate** - Incorporate findings and improve

### 5. Failover-First Reliability

Rather than pursuing perfection, ClubCalendar relies on graceful degradation:

- If the widget fails to load, users automatically see the native WA calendar
- Sync failures don't break the user experience
- Read-only design prevents any possibility of data corruption
- Recovery is instantaneous (no manual intervention required)

---

## Testing Strategy

### Manual Testing

- All views (Month, Week, List, Year)
- Filter combinations
- Mobile responsiveness
- Authenticated features (REGISTER, VIEW MY EVENTS)

### Automated Testing

- **Framework:** Playwright E2E
- **Coverage:** 35 test cases
- **Categories:** Filters, Views, Navigation, Search, Events, Edge Cases, Mobile

### Bug Verification

- Query forums and online sources for known platform bugs
- Design targeted tests to verify if bugs affect the configuration
- Document findings in buddy test reports

---

## Version Control Practices

### Branching

- `main` branch for production-ready code
- Feature branches for development
- Direct commits for documentation updates

### Commit Messages

- Semantic commit messages describing changes
- Reference to issues or reviews where applicable
- AI-generated commits include co-author attribution

### Release Tagging

- Semantic versioning (1.0, 1.01, etc.)
- Release packages include all necessary files
- Release notes document changes

---

## Costs

| Item | Cost | Notes |
|------|------|-------|
| Hosting (Custom Server) | $0-10/month | Can use existing web server or mail server |
| Hosting (Google Cloud) | $0 | Free tier sufficient for sync job |
| Wild Apricot API | $0 | Included in WA subscription |
| CDN (FullCalendar) | $0 | Public CDN with high availability |
| Development | Volunteer time | AI-assisted reduces effort |
| Maintenance | Minimal | AI can diagnose and fix most issues |

**Total recurring cost:** $0-10/month depending on hosting choice

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sync server unavailable | Low | Low | Automatic failover to WA widget |
| WA API breaking changes | Low | Medium | Monitor WA release notes; pagination updated for Nov 2025 changes |
| CDN unavailability | Very Low | Low | FullCalendar CDN has excellent uptime; could self-host if needed |
| Data staleness | Medium | Low | 15-minute sync interval acceptable for event data |
| Maintainer unavailability | Medium | Low | AI can assist new maintainers; extensive documentation |
| Security vulnerability | Low | Low | Read-only system; no user input processed; no data mutation |

### Risk Assessment Summary

ClubCalendar is a **low-risk system** because:

1. **Read-only** - Cannot corrupt or modify Wild Apricot data
2. **Automatic failover** - Users see WA calendar if widget fails
3. **No authentication** - Widget doesn't handle credentials
4. **No user input** - No forms, no injection vectors
5. **Stateless** - No session management or cookies

---

## Dependencies

### Runtime Dependencies

| Dependency | Version | Purpose | Required |
|------------|---------|---------|----------|
| Wild Apricot API | v2 | Event data source | Yes |
| FullCalendar | 6.x | Calendar rendering | Yes |
| Modern browser | ES6+ | Widget execution | Yes |

### Sync Job Dependencies

| Dependency | Version | Purpose | Required |
|------------|---------|---------|----------|
| Python | 3.8+ | Sync script runtime | Yes |
| requests | Latest | HTTP client for API | Yes |
| Cron or Cloud Scheduler | - | Scheduled execution | Yes |

### Optional Dependencies

| Dependency | Purpose | When Needed |
|------------|---------|-------------|
| Google Cloud Functions | Serverless sync hosting | If no custom server |
| Google Cloud Storage | JSON file hosting | If using GCP |
| Google Cloud Scheduler | Cron replacement | If using GCP |

---

## Deployment

### Prerequisites

1. Wild Apricot API credentials (client ID and secret)
2. Web server or Google Cloud account
3. Access to Wild Apricot admin (for embed code)

### Initial Deployment Steps

1. **Configure API credentials**
   - Create WA authorized application
   - Note client ID and secret

2. **Deploy sync job**
   - Copy sync scripts to server
   - Configure credentials in environment
   - Set up cron job (every 15 minutes)
   - Verify events.json is generated

3. **Host widget files**
   - Upload widget JavaScript to web server
   - Ensure CORS headers allow WA domain

4. **Whitelist domain in Wild Apricot**
   - Settings → Site → Global settings
   - Add hosting domain to External JavaScript authorization

5. **Embed widget**
   - Add HTML/Code gadget to WA page
   - Paste widget embed code
   - Configure options (colors, filters, etc.)

6. **Verify functionality**
   - Test all views and filters
   - Verify events display correctly
   - Test on mobile devices

### Update Procedure

1. Update widget code on hosting server
2. Clear CDN cache if applicable
3. Hard refresh browser to verify changes
4. Test core functionality

---

## Rollback

### Automatic Failover

If the widget fails to load (network error, JavaScript error, JSON unavailable):

- Widget automatically displays native WA calendar
- No user action required
- No data loss possible

### Manual Rollback to Previous Version

1. Replace widget JavaScript with previous version
2. Clear browser cache
3. Verify functionality

### Complete Removal

If ClubCalendar needs to be fully removed:

1. **Remove widget embed** from WA pages (replace with WA calendar gadget)
2. **Disable sync job** (remove cron entry or disable Cloud Function)
3. **Revoke API credentials** in WA admin
4. **Delete hosted files** (optional)

**Recovery time:** Immediate. Users see native WA calendar with no interruption.

---

## Maintenance

### Routine Maintenance

| Task | Frequency | Responsibility |
|------|-----------|----------------|
| Monitor sync job logs | Weekly | Tech volunteer |
| Check for WA API updates | Monthly | Tech volunteer |
| Review error reports | As needed | Tech volunteer |
| Update dependencies | Quarterly | Tech volunteer with AI |

### Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Events not updating | Sync job stopped | Check cron, restart if needed |
| Widget shows WA calendar | JSON load failed | Check hosting, verify URL |
| Filters not working | Tag mismatch | Verify event tagging conventions |
| Mobile display issues | CSS conflict | Check WA theme CSS |

### Getting Help

- AI assistant (Claude) can diagnose most issues given error messages
- Documentation provides troubleshooting guides
- GitHub issues for bug reports

---

## Future Considerations

If ClubCalendar's scope expands, consider adopting:

1. **Formal principles** - Document non-negotiable design principles
2. **CI/CD pipeline** - Automated testing before deployment
3. **Staging environment** - Test changes before production
4. **Monitoring/alerting** - Proactive notification of issues

For current scope (read-only display widget), these would add overhead without proportional benefit.

---

## Summary

ClubCalendar uses a pragmatic, AI-assisted development methodology appropriate for a low-stakes, read-only widget. The approach prioritizes:

- **Rapid iteration** over formal process
- **Failover reliability** over perfection
- **AI-assisted development** over traditional staffing
- **Buddy reviews** over formal code review gates
- **Documentation** for AI and human maintainability

The methodology matches the risk profile: a display-only widget where failure means users see the native WA calendar instead—an acceptable fallback that requires no recovery effort.

---

*Document maintained by Ed Forman with AI assistance*
