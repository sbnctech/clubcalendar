ClubCalendar SBNC Inline-Only Pack
Commit: 145e184

Files:
- ClubCalendar_SBNC_INSTALLATION.md
- ClubCalendar_SBNC_CONFIG_PAGE.html
- ClubCalendar_SBNC_EVENTS_PAGE.html

Contract:
- Config page publishes JSON in <script id="clubcalendar-config">...</script>
- Events page fetches /clubcalendar-config, parses JSON, sets window.CLUBCALENDAR_CONFIG before init.
