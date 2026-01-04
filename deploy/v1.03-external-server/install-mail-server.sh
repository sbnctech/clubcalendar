#!/bin/bash
#
# ClubCalendar v1.03 - Mail Server Installation Script
# Target: mail.sbnewcomers.org
#
# This script installs the ClubCalendar API endpoints on the existing
# chatbot server (FastAPI). Run from local machine.
#
# Usage:
#   ./install-mail-server.sh
#
# Prerequisites:
#   - SSH access to sbnewcom@mail.sbnewcomers.org
#   - Existing chatbot infrastructure running
#

set -e  # Exit on error

REMOTE_HOST="sbnewcom@mail.sbnewcomers.org"
REMOTE_PATH="/home/sbnewcom"
LOCAL_CHATBOT_DIR="/Users/edf/SBNC-Chatbot"
LOCAL_WIDGET_DIR="/Users/edf/clubcalendar/widget"

echo "═══════════════════════════════════════════════════════════════════"
echo "  ClubCalendar v1.03 - Mail Server Installation"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Backup existing app.py
echo "[1/5] Backing up existing app.py on server..."
ssh $REMOTE_HOST "cp ${REMOTE_PATH}/app.py ${REMOTE_PATH}/app.py.backup-\$(date +%Y%m%d-%H%M%S)"

# Step 2: Upload updated app.py with calendar endpoints
echo "[2/5] Uploading updated app.py with calendar endpoints..."
scp "${LOCAL_CHATBOT_DIR}/app.py" "${REMOTE_HOST}:${REMOTE_PATH}/app.py"

# Step 3: Create static directory if needed
echo "[3/5] Creating static directory for widget..."
ssh $REMOTE_HOST "mkdir -p ${REMOTE_PATH}/static"

# Step 4: Upload widget script
echo "[4/5] Uploading widget script..."
scp "${LOCAL_WIDGET_DIR}/clubcalendar-widget.js" "${REMOTE_HOST}:${REMOTE_PATH}/static/clubcalendar-widget.js"

# Step 5: Restart the FastAPI service
echo "[5/5] Restarting chatbot service..."
ssh $REMOTE_HOST "
    if systemctl is-active --quiet sbnc-chatbot 2>/dev/null; then
        sudo systemctl restart sbnc-chatbot
        echo 'Service restarted via systemd'
    elif pgrep -f 'uvicorn.*app:app' > /dev/null; then
        # Kill existing uvicorn processes
        pkill -f 'uvicorn.*app:app' || true
        sleep 2
        # Start new uvicorn in background
        cd ${REMOTE_PATH}
        nohup uvicorn app:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &
        echo 'Service restarted manually'
    else
        echo 'Warning: Could not detect running service'
        echo 'Please restart manually: cd ${REMOTE_PATH} && uvicorn app:app --host 0.0.0.0 --port 8000'
    fi
"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Installation Complete!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Test API endpoints:"
echo "   curl https://mail.sbnewcomers.org/api/calendar/events"
echo "   curl https://mail.sbnewcomers.org/api/calendar/events/member"
echo ""
echo "2. Install WA config page:"
echo "   - Create page: /clubcalendar-config"
echo "   - Paste contents of: orgs/sbnc/wa-config-page.html"
echo ""
echo "3. Install WA events pages:"
echo "   - Public page: /events-public (Everyone access)"
echo "     Paste: orgs/sbnc/wa-events-public.html"
echo ""
echo "   - Member page: /events (Members only access)"
echo "     Paste: orgs/sbnc/wa-events-member.html"
echo ""
echo "4. Test calendars:"
echo "   - Public: https://sbnewcomers.org/events-public"
echo "   - Member: https://sbnewcomers.org/events (logged in)"
echo ""
