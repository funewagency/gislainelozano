#!/bin/bash
cd /home/z/my-project
while true; do
  # Check if port 3000 is in use
  if ! ss -tlnp | grep -q ':3000 '; then
    echo "$(date): Starting Next.js server..." >> /home/z/my-project/dev.log
    node node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    SERVER_PID=$!
    # Wait for it to start
    sleep 5
  fi
  sleep 5
done
