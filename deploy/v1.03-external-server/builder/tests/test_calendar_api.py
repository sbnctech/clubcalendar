#!/usr/bin/env python3
"""
ClubCalendar API - Comprehensive E2E Tests
Version 1.03

Run with: pytest tests/test_calendar_api.py -v --tb=short
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calendar_api import app

client = TestClient(app)


# ============================================================================
# ENDPOINT AVAILABILITY TESTS
# ============================================================================

class TestEndpointAvailability:
    """Verify all endpoints are reachable"""

    def test_public_events_endpoint_exists(self):
        response = client.get("/api/calendar/events")
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code}"

    def test_member_events_endpoint_exists(self):
        response = client.get("/api/calendar/events/member")
        assert response.status_code in [200, 503]

    def test_event_detail_endpoint_exists(self):
        response = client.get("/api/calendar/event/1")
        assert response.status_code in [200, 404, 503]

    def test_config_endpoint_exists(self):
        response = client.get("/api/calendar/config")
        assert response.status_code == 200

    def test_health_endpoint_exists(self):
        response = client.get("/health")
        assert response.status_code == 200


# ============================================================================
# PUBLIC EVENTS - RESPONSE STRUCTURE
# ============================================================================

class TestPublicEventsStructure:
    """Verify public events response structure"""

    def test_returns_json(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            assert response.headers["content-type"] == "application/json"

    def test_has_events_array(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            data = response.json()
            assert "events" in data
            assert isinstance(data["events"], list)

    def test_has_count_field(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            data = response.json()
            assert "count" in data
            assert isinstance(data["count"], int)

    def test_has_audience_field(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            data = response.json()
            assert "audience" in data
            assert data["audience"] == "public"

    def test_has_timestamp(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            data = response.json()
            assert "timestamp" in data


# ============================================================================
# PUBLIC EVENTS - PII PROTECTION (CRITICAL)
# ============================================================================

class TestPublicEventsPIIProtection:
    """CRITICAL: Verify no member data leaks to public"""

    def test_no_location_field(self):
        """Location must NEVER appear in public events"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "Location" not in event, \
                    f"SECURITY FAIL: Location exposed in event {event.get('Id')}"

    def test_no_confirmed_registrations_count(self):
        """Registration counts must NEVER appear in public"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "ConfirmedRegistrationsCount" not in event, \
                    f"SECURITY FAIL: ConfirmedRegistrationsCount exposed"

    def test_no_registrations_limit(self):
        """Registration limit must NEVER appear in public"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "RegistrationsLimit" not in event, \
                    f"SECURITY FAIL: RegistrationsLimit exposed"

    def test_no_spots_available(self):
        """Spots available must NEVER appear in public"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "SpotsAvailable" not in event, \
                    f"SECURITY FAIL: SpotsAvailable exposed"

    def test_no_is_full(self):
        """IsFull must NEVER appear in public"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "IsFull" not in event, \
                    f"SECURITY FAIL: IsFull exposed"

    def test_no_organizer_contact_id(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "OrganizerContactId" not in event

    def test_no_contact_email(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "ContactEmail" not in event

    def test_no_contact_phone(self):
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                assert "ContactPhone" not in event

    def test_description_truncated(self):
        """Public descriptions should be max 200 chars + '...'"""
        response = client.get("/api/calendar/events")
        if response.status_code == 200:
            for event in response.json()["events"]:
                desc = event.get("BriefDescription", "")
                if desc and len(desc) > 203:  # 200 + "..."
                    assert False, f"Description too long: {len(desc)} chars"


# ============================================================================
# MEMBER EVENTS - RESPONSE STRUCTURE
# ============================================================================

class TestMemberEventsStructure:
    """Verify member events response structure"""

    def test_returns_json(self):
        response = client.get("/api/calendar/events/member")
        if response.status_code == 200:
            assert response.headers["content-type"] == "application/json"

    def test_has_audience_member(self):
        response = client.get("/api/calendar/events/member")
        if response.status_code == 200:
            data = response.json()
            assert data["audience"] == "member"

    def test_events_have_required_fields(self):
        response = client.get("/api/calendar/events/member")
        if response.status_code == 200:
            events = response.json()["events"]
            if events:
                event = events[0]
                assert "Id" in event
                assert "Name" in event
                assert "StartDate" in event


# ============================================================================
# EVENT DETAIL - AUDIENCE FILTERING
# ============================================================================

class TestEventDetailAudienceFiltering:
    """Verify event detail respects audience parameter"""

    def test_invalid_audience_rejected(self):
        response = client.get("/api/calendar/event/1?audience=hacker")
        assert response.status_code == 422  # Validation error

    def test_public_audience_no_location(self):
        # First get a valid event ID
        list_resp = client.get("/api/calendar/events")
        if list_resp.status_code == 200:
            events = list_resp.json()["events"]
            if events:
                event_id = events[0]["Id"]
                response = client.get(f"/api/calendar/event/{event_id}?audience=public")
                if response.status_code == 200:
                    event = response.json()["event"]
                    assert "Location" not in event, \
                        "SECURITY FAIL: Location in public detail"

    def test_public_audience_no_availability(self):
        list_resp = client.get("/api/calendar/events")
        if list_resp.status_code == 200:
            events = list_resp.json()["events"]
            if events:
                event_id = events[0]["Id"]
                response = client.get(f"/api/calendar/event/{event_id}?audience=public")
                if response.status_code == 200:
                    event = response.json()["event"]
                    assert "SpotsAvailable" not in event
                    assert "IsFull" not in event
                    assert "ConfirmedRegistrationsCount" not in event

    def test_member_audience_has_location(self):
        list_resp = client.get("/api/calendar/events/member")
        if list_resp.status_code == 200:
            events = list_resp.json()["events"]
            if events:
                event_id = events[0]["Id"]
                response = client.get(f"/api/calendar/event/{event_id}?audience=member")
                if response.status_code == 200:
                    event = response.json()["event"]
                    assert "Location" in event  # Should have Location

    def test_nonexistent_event_404(self):
        response = client.get("/api/calendar/event/999999999")
        assert response.status_code == 404


# ============================================================================
# CONFIG ENDPOINT
# ============================================================================

class TestConfigEndpoint:
    """Verify config endpoint structure"""

    def test_has_organization(self):
        response = client.get("/api/calendar/config")
        data = response.json()
        assert "organization" in data
        assert "waAccountId" in data["organization"]
        assert data["organization"]["waAccountId"] == "176353"

    def test_has_server_urls(self):
        response = client.get("/api/calendar/config")
        data = response.json()
        assert "server" in data
        assert "eventsUrl" in data["server"]
        assert "memberEventsUrl" in data["server"]

    def test_public_config_hides_sensitive(self):
        response = client.get("/api/calendar/config")
        data = response.json()
        pub = data["publicConfig"]
        assert pub["showLocation"] == False
        assert pub["showAvailability"] == False

    def test_member_config_shows_sensitive(self):
        response = client.get("/api/calendar/config")
        data = response.json()
        mem = data["memberConfig"]
        assert mem["showLocation"] == True
        assert mem["showAvailability"] == True


# ============================================================================
# HEALTH CHECK
# ============================================================================

class TestHealthCheck:
    """Verify health check"""

    def test_health_returns_ok(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_health_returns_version(self):
        response = client.get("/health")
        data = response.json()
        assert "version" in data


# ============================================================================
# SECURITY SUMMARY TEST
# ============================================================================

class TestSecuritySummary:
    """Final security verification - run this last"""

    FORBIDDEN_PUBLIC_FIELDS = [
        "Location",
        "ConfirmedRegistrationsCount",
        "RegistrationsLimit",
        "SpotsAvailable",
        "IsFull",
        "OrganizerContactId",
        "ContactEmail",
        "ContactPhone",
        "RegistrationUrl",
    ]

    def test_public_events_clean(self):
        """Comprehensive check: no forbidden fields in public events"""
        response = client.get("/api/calendar/events")
        if response.status_code != 200:
            pytest.skip("Database not available")

        violations = []
        for event in response.json()["events"]:
            for field in self.FORBIDDEN_PUBLIC_FIELDS:
                if field in event:
                    violations.append(f"Event {event.get('Id')}: {field}")

        if violations:
            pytest.fail(f"SECURITY VIOLATIONS:\n" + "\n".join(violations))

    def test_public_detail_clean(self):
        """Comprehensive check: no forbidden fields in public event detail"""
        list_resp = client.get("/api/calendar/events")
        if list_resp.status_code != 200:
            pytest.skip("Database not available")

        events = list_resp.json()["events"]
        if not events:
            pytest.skip("No events to test")

        event_id = events[0]["Id"]
        response = client.get(f"/api/calendar/event/{event_id}?audience=public")

        if response.status_code != 200:
            pytest.skip("Event not found")

        event = response.json()["event"]
        violations = []
        for field in self.FORBIDDEN_PUBLIC_FIELDS:
            if field in event:
                violations.append(field)

        if violations:
            pytest.fail(f"SECURITY VIOLATIONS in event detail: {violations}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
