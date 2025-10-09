#!/bin/sh

# Ghi đè file config.js bằng biến môi trường
cat <<EOF > /usr/share/nginx/html/config.js
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}"
};
EOF

exec "$@"
