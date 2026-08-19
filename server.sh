#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 2>&1
  echo "Restarting in 2s..." >> /tmp/server-restarts.log
  sleep 2
done
