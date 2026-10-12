#!/bin/sh
set -eu

if [ ! -r /etc/secrets/mosquitto.passwd ]; then
  echo "ERROR: Mosquitto password secret is missing or unreadable."
  exit 1
fi

cp /etc/secrets/mosquitto.passwd /tmp/mosquitto.passwd
chown mosquitto:mosquitto /tmp/mosquitto.passwd
chmod 600 /tmp/mosquitto.passwd

exec mosquitto -c /mosquitto/config/mosquitto.conf