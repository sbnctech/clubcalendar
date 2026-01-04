#!/usr/bin/env python3
"""Create test database with sample events for testing."""

import sqlite3
from datetime import datetime, timedelta

DB_PATH = "./wa.db"

def create_test_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Create events table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS events (
        Id INTEGER PRIMARY KEY,
        Name TEXT,
        StartDate TEXT,
        EndDate TEXT,
        Location TEXT,
        Details TEXT,
        AccessLevel TEXT,
        Tags TEXT,
        RegistrationEnabled INTEGER,
        RegistrationsLimit INTEGER,
        ConfirmedRegistrationsCount INTEGER,
        RegistrationUrl TEXT,
        OrganizerContactId INTEGER,
        ContactEmail TEXT,
        ContactPhone TEXT
    )
    """)

    # Clear existing
    cur.execute("DELETE FROM events")

    # Sample events
    now = datetime.now()
    events = [
        # Public event
        (1, "TGIF: Welcome Happy Hour",
         (now + timedelta(days=3)).isoformat(),
         (now + timedelta(days=3, hours=2)).isoformat(),
         "The Blue Dolphin, 123 State St, Santa Barbara",
         "Join us for drinks and appetizers. Great way to meet new members!",
         "Public", "social,tgif", 1, 50, 23,
         "https://sbnewcomers.org/event-1",
         101, "organizer@example.com", "805-555-1234"),

        # Member-only event
        (2, "Happy Hikers: Rattlesnake Canyon",
         (now + timedelta(days=5)).isoformat(),
         (now + timedelta(days=5, hours=4)).isoformat(),
         "Rattlesnake Canyon Trailhead, Las Canoas Rd",
         "Moderate 4-mile hike with beautiful views. Bring water and snacks.",
         "Members", "hiking,outdoors", 1, 20, 18,
         "https://sbnewcomers.org/event-2",
         102, "hiker@example.com", "805-555-2345"),

        # Public event - sold out
        (3, "Games!: Trivia Night",
         (now + timedelta(days=7)).isoformat(),
         (now + timedelta(days=7, hours=3)).isoformat(),
         "The Library Bar, 456 Anacapa St",
         "Test your knowledge at our monthly trivia competition!",
         "Public", "games,social", 1, 40, 40,
         "https://sbnewcomers.org/event-3",
         103, "games@example.com", "805-555-3456"),
    ]

    cur.executemany("""
    INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, events)

    conn.commit()
    conn.close()
    print(f"Created test database at {DB_PATH} with {len(events)} events")

if __name__ == "__main__":
    create_test_db()
