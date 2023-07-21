#!/bin/sh
# This script is used for docker-compose to wait for mysql to be ready 
# before backend service can connect to it.

set -e

host="$DB_HOST"
username="$DB_USERNAME"
password="$DB_PASSWORD"

until mysql -h"$host" -u"$username" -p"$password" -e 'SELECT 1'; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - executing command"
exec "$@"
