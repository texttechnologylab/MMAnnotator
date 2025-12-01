#!/bin/sh
cat <<EOF > /usr/share/nginx/html/config.js
window._env_ = {
  BACKEND_URL: "$BACKEND_URL",
  UCE_URL: "$UCE_URL"
};
EOF

exec "$@"