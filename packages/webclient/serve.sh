#!/bin/bash
cat > /tmp/lighttpd-webclient.conf << 'EOF'
server.port = 8080
server.document-root = "/home/anon/projects/game/packages/webclient"
mimetype.assign = (".html" => "text/html", ".js" => "text/javascript")
EOF
lighttpd -D -f /tmp/lighttpd-webclient.conf