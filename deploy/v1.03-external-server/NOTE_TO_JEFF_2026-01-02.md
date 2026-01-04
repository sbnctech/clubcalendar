# ClubCalendar API Testing - Question for Jeff

**Date:** January 2, 2026
**From:** Ed
**To:** Jeff

---

Jeff,

You mentioned you've confirmed that client-side WildApricot API calls work. We're getting different results and need to understand what you tested.

## What We Tested

**Environment:** Production sbnewcomers.org (account 176353), logged in as member

**Browser console:**
```javascript
fetch('/sys/api/v2/accounts/176353/events?$top=1', {
    credentials: 'include'
}).then(r => r.text()).then(console.log)
```

**Result:** Empty response (HTTP 200, zero-length body)

## Our Conclusion

The `/sys/api/v2/` endpoints require OAuth bearer tokens. Session cookies don't work, even on production.

## Question

You must be calling something different. What endpoint or method are you using?

Let's jump on a call to sort this out.

Ed
