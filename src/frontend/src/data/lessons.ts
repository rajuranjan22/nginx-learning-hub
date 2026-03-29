export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  lessonNumber: number;
  nginxCode: string;
  explanation: string;
  tips: string[];
  terminalCommands: string[];
}

export const CATEGORIES = [
  "Getting Started",
  "Installation",
  "Server Blocks",
  "Location Blocks",
  "Reverse Proxy",
  "SSL/TLS",
  "Load Balancing",
  "Security",
  "Performance",
  "Logging",
];

export const lessons: Lesson[] = [
  // Getting Started
  {
    id: "intro-what-is-nginx",
    title: "What is Nginx?",
    description:
      "An introduction to Nginx: the high-performance, open-source web server, reverse proxy, and load balancer used by millions of websites worldwide.",
    category: "Getting Started",
    lessonNumber: 1,
    nginxCode: `# nginx.conf - Main configuration file
# Nginx is an event-driven, asynchronous web server

user www-data;
worker_processes auto;  # Automatically set to CPU cores
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    # Maximum simultaneous connections per worker
    worker_connections 1024;
    use epoll;           # Linux kernel I/O event mechanism
    multi_accept on;     # Accept as many connections as possible
}

http {
    # MIME types for file serving
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Efficient file transmission
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;

    # Keep-alive connections
    keepalive_timeout  65;
    keepalive_requests 100;

    # Include all virtual host configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}`,
    explanation:
      "Nginx (pronounced 'engine-x') is a free, open-source web server created by Igor Sysoev in 2004. Unlike Apache's process-per-connection model, Nginx uses an event-driven, asynchronous architecture that handles thousands of simultaneous connections with minimal memory.",
    tips: [
      "Nginx is the most popular web server in the world, powering over 30% of all websites.",
      "The main config file is usually at /etc/nginx/nginx.conf.",
      "worker_processes auto matches the number of CPU cores for optimal performance.",
      "Include directives let you split configuration into multiple files.",
    ],
    terminalCommands: [
      "nginx -v                     # Check Nginx version",
      "nginx -V                     # Version with compile options",
      "cat /etc/nginx/nginx.conf    # View main config",
      "nginx -t                     # Test configuration syntax",
    ],
  },
  {
    id: "intro-how-nginx-works",
    title: "How Nginx Works",
    description:
      "Deep dive into Nginx's event-driven, non-blocking architecture and how worker processes handle thousands of connections simultaneously.",
    category: "Getting Started",
    lessonNumber: 2,
    nginxCode: `# Event-driven architecture configuration
# Nginx master process manages worker processes

user nginx;

# Number of worker processes - set to auto for CPU core count
worker_processes auto;

# Bind each worker to a specific CPU core (CPU affinity)
worker_cpu_affinity auto;

# Raise file descriptor limit for high concurrency
worker_rlimit_nofile 65535;

events {
    # Max connections = worker_processes * worker_connections
    worker_connections 4096;

    # Use epoll on Linux (most efficient I/O model)
    use epoll;

    # Accept multiple connections per wakeup
    multi_accept on;
}

http {
    # Connection pooling and timeouts
    keepalive_timeout 75s;
    keepalive_requests 1000;

    # How long to wait for client to send request
    client_header_timeout 15s;
    client_body_timeout 15s;

    # How long to wait before closing idle connection
    send_timeout 30s;

    # Buffer sizes
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;
    client_body_buffer_size 128k;
    client_max_body_size 50m;

    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html;
        }
    }
}`,
    explanation:
      "Nginx uses a master-worker architecture. The master process reads configuration, manages worker processes, and handles signals. Worker processes handle all actual client requests using a non-blocking event loop — each worker can handle thousands of connections simultaneously without creating new threads or processes.",
    tips: [
      "Master process runs as root; workers run as www-data or nginx user.",
      "Total max connections = worker_processes × worker_connections.",
      "epoll is the most efficient I/O multiplexing mechanism on Linux.",
      "Each worker handles I/O asynchronously, never blocking on a single request.",
    ],
    terminalCommands: [
      "ps aux | grep nginx          # See master and worker processes",
      "nginx -s reload              # Gracefully reload config",
      "kill -HUP $(cat /var/run/nginx.pid)  # Same as reload via signal",
      "ulimit -n                    # Check file descriptor limit",
    ],
  },

  // Installation
  {
    id: "install-ubuntu",
    title: "Installing on Ubuntu/Debian",
    description:
      "Step-by-step installation of Nginx on Ubuntu and Debian-based Linux distributions using the APT package manager.",
    category: "Installation",
    lessonNumber: 3,
    nginxCode: `# Install Nginx on Ubuntu/Debian
# Run these commands in your terminal:

# Update package index
# sudo apt update

# Install Nginx
# sudo apt install -y nginx

# =============================================
# After installation, verify with:
# nginx -v
# systemctl status nginx
# =============================================

# /etc/nginx/nginx.conf - Default configuration
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format main
        '$remote_addr - $remote_user [$time_local] "$request" '
        '$status $body_bytes_sent "$http_referer" '
        '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Load modular configuration files
    include /etc/nginx/conf.d/*.conf;

    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /usr/share/nginx/html;

        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {}

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {}
    }
}`,
    explanation:
      "On Ubuntu/Debian, Nginx is available in the default APT repositories. The package manager handles dependencies, creates system service files, and sets up default directory structure at /etc/nginx/. After installation, Nginx automatically starts and is configured to start on boot via systemd.",
    tips: [
      "Ubuntu repository may have an older version; add Nginx's official repo for latest.",
      "Config files go in /etc/nginx/sites-available/, then symlink to sites-enabled/.",
      "Test config with 'sudo nginx -t' before reloading.",
      "Log files are in /var/log/nginx/ by default.",
    ],
    terminalCommands: [
      "sudo apt update && sudo apt install -y nginx",
      "sudo systemctl enable nginx   # Start on boot",
      "sudo systemctl start nginx    # Start now",
      "sudo ufw allow 'Nginx Full'   # Open firewall ports",
    ],
  },
  {
    id: "install-centos",
    title: "Installing on CentOS/RHEL",
    description:
      "Install Nginx on CentOS, RHEL, Fedora, and AlmaLinux using the YUM/DNF package manager and the official Nginx repository.",
    category: "Installation",
    lessonNumber: 4,
    nginxCode: `# Install Nginx on CentOS/RHEL/AlmaLinux
# Add official Nginx repository for latest stable version

# /etc/yum.repos.d/nginx.repo
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

# ============================================
# Then run: sudo dnf install nginx
# ============================================

# Default config at /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main
        '$remote_addr - $remote_user [$time_local] "$request" '
        '$status $body_bytes_sent "$http_referer" '
        '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile     on;
    tcp_nopush   on;
    keepalive_timeout 65;
    gzip  on;

    include /etc/nginx/conf.d/*.conf;
}`,
    explanation:
      "On CentOS/RHEL, adding Nginx's official repository ensures you get the latest stable or mainline version rather than the older version in EPEL. The installation creates a systemd service and places config files in /etc/nginx/conf.d/ (instead of Ubuntu's sites-available pattern).",
    tips: [
      "CentOS 8+ uses DNF; CentOS 7 uses YUM — both work for nginx installation.",
      "SELinux may block Nginx; run 'setsebool -P httpd_can_network_connect 1' for proxy.",
      "firewalld is the default firewall; use firewall-cmd to open ports.",
      "Config includes go in /etc/nginx/conf.d/*.conf on RHEL-based systems.",
    ],
    terminalCommands: [
      "sudo dnf install -y nginx",
      "sudo systemctl enable --now nginx",
      "sudo firewall-cmd --permanent --add-service=http --add-service=https",
      "sudo firewall-cmd --reload",
    ],
  },
  {
    id: "install-commands",
    title: "Basic Nginx Commands",
    description:
      "Essential Nginx commands for starting, stopping, reloading, and testing your configuration in day-to-day operations.",
    category: "Installation",
    lessonNumber: 5,
    nginxCode: `# Essential Nginx commands reference

# --- Service Management via systemctl ---
# systemctl start nginx      # Start Nginx
# systemctl stop nginx       # Stop Nginx  
# systemctl restart nginx    # Full restart (downtime)
# systemctl reload nginx     # Graceful reload (no downtime)
# systemctl status nginx     # Show service status
# systemctl enable nginx     # Enable auto-start on boot
# systemctl disable nginx    # Disable auto-start

# --- Direct Nginx Commands ---
# nginx -t                   # Test configuration
# nginx -T                   # Test + print full config
# nginx -s reload            # Reload configuration
# nginx -s stop              # Fast shutdown
# nginx -s quit              # Graceful shutdown
# nginx -s reopen            # Reopen log files

# --- Configuration Test Example ---
nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx -t: configuration file /etc/nginx/nginx.conf test is successful

# --- Practical config structure ---
# /etc/nginx/
# ├── nginx.conf          (main config)
# ├── conf.d/
# │   └── default.conf    (default server)
# ├── sites-available/    (Ubuntu/Debian only)
# │   └── mysite.conf
# ├── sites-enabled/      (Ubuntu/Debian only)
# │   └── mysite.conf -> ../sites-available/mysite.conf
# ├── mime.types
# └── snippets/`,
    explanation:
      "Understanding Nginx's command-line interface is crucial for server management. The key distinction is 'reload' vs 'restart': reload gracefully applies new configuration without dropping connections, while restart has brief downtime. Always test config with 'nginx -t' before reloading.",
    tips: [
      "Always run 'nginx -t' before reload to prevent service interruption on syntax errors.",
      "'systemctl reload' is equivalent to 'nginx -s reload' — both are graceful.",
      "'nginx -T' shows the full merged configuration — useful for debugging.",
      "Log files can be reopened with 'nginx -s reopen' after log rotation.",
    ],
    terminalCommands: [
      "sudo nginx -t                # Test config syntax",
      "sudo systemctl reload nginx  # Reload without downtime",
      "sudo nginx -T | grep server  # Find server block configs",
      "journalctl -u nginx -f       # Follow Nginx logs",
    ],
  },

  // Server Blocks
  {
    id: "vhost-basic",
    title: "Basic Server Block",
    description:
      "Learn how to create a basic Nginx server block (virtual host) to serve a website on a specific domain.",
    category: "Server Blocks",
    lessonNumber: 6,
    nginxCode: `# /etc/nginx/sites-available/example.com
# Basic server block for serving a static website

server {
    # Listen on port 80 (HTTP)
    listen 80;
    listen [::]:80;  # IPv6 support

    # Domain name(s) this block responds to
    server_name example.com www.example.com;

    # Document root - where files are served from
    root /var/www/example.com/html;

    # Default index files
    index index.html index.htm index.php;

    # Logging
    access_log /var/log/nginx/example.com.access.log;
    error_log  /var/log/nginx/example.com.error.log warn;

    # Handle all requests
    location / {
        # Try to serve file, then directory, then 404
        try_files $uri $uri/ =404;
    }

    # Serve static assets with caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}`,
    explanation:
      "A server block is Nginx's equivalent to Apache's VirtualHost. It defines how Nginx should respond to requests for a specific domain. The 'server_name' directive routes requests to the correct block, while 'root' tells Nginx where the website files are located on disk.",
    tips: [
      "Enable site: ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/",
      "try_files $uri $uri/ =404 is the standard pattern for static sites.",
      "Multiple server_name values allow one block to serve multiple domains.",
      "Use separate log files per vhost for easier troubleshooting.",
    ],
    terminalCommands: [
      "sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/",
      "sudo nginx -t && sudo systemctl reload nginx",
      "curl -I http://example.com    # Test response headers",
      "tail -f /var/log/nginx/example.com.access.log",
    ],
  },
  {
    id: "vhost-multiple",
    title: "Multiple Server Blocks",
    description:
      "Host multiple websites on a single server using multiple server blocks, each responding to different domain names.",
    category: "Server Blocks",
    lessonNumber: 7,
    nginxCode: `# /etc/nginx/conf.d/sites.conf
# Multiple virtual hosts on one server

# First website: example.com
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html;

    access_log /var/log/nginx/example.com.access.log;
    error_log  /var/log/nginx/example.com.error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}

# Second website: shop.example.com (subdomain)
server {
    listen 80;
    server_name shop.example.com;
    root /var/www/shop;
    index index.html index.php;

    access_log /var/log/nginx/shop.access.log;
    error_log  /var/log/nginx/shop.error.log;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}

# Third website: api.example.com
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`,
    explanation:
      "Nginx uses the 'server_name' directive to route requests to the correct server block. When a request arrives, Nginx compares the Host header against all server_name directives. Each virtual host can serve completely different content, use different PHP versions, or proxy to different backend services.",
    tips: [
      "DNS must point each domain/subdomain to your server's IP address.",
      "Server blocks are matched in file order; use 'default_server' for fallback.",
      "Subdomains can proxy to different local ports for microservices.",
      "Use $host variable in proxy headers to pass the original domain name.",
    ],
    terminalCommands: [
      "nginx -T | grep 'server_name'  # List all configured domains",
      "curl -H 'Host: shop.example.com' http://localhost  # Test by host header",
      "dig +short example.com          # Check DNS resolution",
      "ss -tlnp | grep nginx           # Check Nginx listening ports",
    ],
  },

  // Location Blocks
  {
    id: "location-basic",
    title: "Basic Location Blocks",
    description:
      "Master Nginx location blocks to route different URL paths to different handlers, directories, or backend services.",
    category: "Location Blocks",
    lessonNumber: 8,
    nginxCode: `# Location block matching rules and priority
# Priority order: = > ^~ > ~* = ~ > prefix > /

server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # 1. EXACT match (highest priority)
    # Only matches /favicon.ico exactly
    location = /favicon.ico {
        log_not_found off;
        access_log off;
        expires 1y;
    }

    # 2. PREFERENTIAL PREFIX - stops searching after match
    # Matches /images/ and all paths starting with /images/
    location ^~ /images/ {
        root /var/www;
        expires 30d;
        add_header Cache-Control "public";
    }

    # 3. CASE-INSENSITIVE REGEX match
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 4. PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 5. API prefix  
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 6. DEFAULT catch-all (lowest priority)
    location / {
        try_files $uri $uri/ =404;
    }
}`,
    explanation:
      "Location blocks define how Nginx processes requests based on the URL path. The matching algorithm has strict priority rules: exact matches (=) always win, followed by preferential prefix (^~), then regex matches (~ case-sensitive, ~* case-insensitive), then longest prefix match, and finally the catch-all (/).",
    tips: [
      "Use '= /' only when you want to exactly match the root URL.",
      "^~ prefix stops regex matching — great for performance on static file paths.",
      "Regex is evaluated in order — put more specific patterns first.",
      "'try_files' is essential for SPA frameworks (React, Vue, Angular).",
    ],
    terminalCommands: [
      "nginx -T | grep location       # List all location blocks",
      "curl -I http://example.com/api/users  # Test API routing",
      "curl -I http://example.com/style.css  # Test static file routing",
      "tail -f /var/log/nginx/access.log     # Watch requests live",
    ],
  },
  {
    id: "location-regex",
    title: "Regex Location Blocks",
    description:
      "Use powerful regular expressions in location blocks to match complex URL patterns for routing and access control.",
    category: "Location Blocks",
    lessonNumber: 9,
    nginxCode: `# Advanced regex location examples

server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # Match any URL ending in common image extensions (case-insensitive)
    location ~* \.(gif|jpg|jpeg|png|webp|avif|svg)$ {
        expires 365d;
        add_header Vary Accept;
        add_header Cache-Control "public, stale-while-revalidate=86400";
    }

    # Match versioned assets (e.g., /assets/app.v3.min.js)
    location ~* /assets/.*\.(css|js)(\?.*)?$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # Block common attack patterns
    location ~* /(\.|wp-admin|phpmyadmin|xmlrpc\.php|setup\.php) {
        return 404;
    }

    # Block file extensions that should never be served
    location ~* \.(htaccess|htpasswd|git|svn|env|sql|bak|log|ini|cfg)$ {
        deny all;
        return 404;
    }

    # Match /user/{id}/profile URLs
    location ~ ^/user/(\d+)/profile$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-User-ID $1;  # Pass capture group
    }

    # SPA fallback - serve index.html for all non-file requests
    location / {
        try_files $uri $uri/ @fallback;
    }

    location @fallback {
        rewrite .* /index.html last;
    }
}`,
    explanation:
      "Regular expressions in location blocks unlock powerful URL pattern matching. The '~' modifier enables case-sensitive PCRE regex, while '~*' is case-insensitive. Capture groups ($1, $2) can extract URL segments and pass them as headers or variables to upstream services.",
    tips: [
      "PCRE (Perl-compatible) regex syntax is used in Nginx location blocks.",
      "Always test regex patterns with 'nginx -t' before deploying.",
      "Capture groups in regex can be referenced as $1, $2 etc.",
      "Named locations (@name) provide internal redirects without HTTP overhead.",
    ],
    terminalCommands: [
      "nginx -t                        # Test regex syntax",
      "curl -I http://example.com/image.JPG  # Test case-insensitive match",
      "curl http://example.com/.env    # Should return 404",
      "pcre2test                       # Test regex patterns offline",
    ],
  },

  // Reverse Proxy
  {
    id: "proxy-basic",
    title: "Basic Reverse Proxy",
    description:
      "Configure Nginx as a reverse proxy to forward requests to backend application servers like Node.js, Python, Ruby, or Java.",
    category: "Reverse Proxy",
    lessonNumber: 10,
    nginxCode: `# /etc/nginx/conf.d/reverse-proxy.conf
# Nginx as a reverse proxy for a Node.js backend

server {
    listen 80;
    server_name api.example.com;

    # Proxy all requests to Node.js running on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;

        # Pass original host to backend
        proxy_set_header Host $host;

        # Pass client's real IP (not Nginx's)
        proxy_set_header X-Real-IP $remote_addr;

        # Pass the full chain of proxy IPs
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Pass the original protocol (http/https)
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for the upstream connection
        proxy_connect_timeout 30s;
        proxy_send_timeout    30s;
        proxy_read_timeout    30s;

        # Don't pass errors from backend to client directly
        proxy_intercept_errors on;
    }

    # Separate proxy for WebSocket connections
    location /ws/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Required headers for WebSocket upgrade
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        # Longer timeout for WebSocket connections
        proxy_read_timeout 86400s;
    }

    # Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}`,
    explanation:
      "A reverse proxy sits between clients and backend servers, forwarding requests and returning responses. This pattern is essential for production deployments: it handles SSL termination, provides load balancing, adds security headers, enables caching, and allows zero-downtime deployments.",
    tips: [
      "Always set X-Real-IP and X-Forwarded-For so your app knows the real client IP.",
      "proxy_pass URL trailing slash matters: 'http://backend/' strips the location prefix.",
      "WebSocket requires HTTP 1.1 and the Upgrade/Connection headers.",
      "proxy_intercept_errors lets you show custom error pages on upstream failures.",
    ],
    terminalCommands: [
      "curl -I http://api.example.com    # Test proxy response",
      "curl -H 'Upgrade: websocket' http://api.example.com/ws/  # Test WS",
      "ss -tlnp | grep 3000             # Verify backend is running",
      "nginx -t && systemctl reload nginx",
    ],
  },
  {
    id: "proxy-headers",
    title: "Proxy Headers & Configuration",
    description:
      "Configure essential proxy headers to ensure your backend application receives accurate information about the original client request.",
    category: "Reverse Proxy",
    lessonNumber: 11,
    nginxCode: `# /etc/nginx/snippets/proxy-headers.conf
# Reusable proxy headers snippet

# Include this in any proxy location block:
# include /etc/nginx/snippets/proxy-headers.conf;

proxy_http_version 1.1;

# Remove hop-by-hop headers
proxy_set_header Connection "";

# Client identification headers
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;
proxy_set_header X-Forwarded-Port  $server_port;

# Request ID for tracing (requires ngx_http_uuid module or generate with map)
proxy_set_header X-Request-ID $request_id;

# Security: hide Nginx version from upstream
proxy_hide_header X-Powered-By;
proxy_hide_header Server;

# Buffer settings
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;

# Timeout configuration
proxy_connect_timeout 10s;
proxy_send_timeout    60s;
proxy_read_timeout    60s;

# ============================================
# Usage in server block:
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://backend_pool;
        include /etc/nginx/snippets/proxy-headers.conf;
    }
}`,
    explanation:
      "Proper proxy header configuration is critical for security and application correctness. Without X-Forwarded-For, your backend logs will show Nginx's IP instead of clients' real IPs. X-Forwarded-Proto tells the backend whether the original request was HTTP or HTTPS, preventing redirect loops.",
    tips: [
      "Use 'include' snippets to avoid duplicating header configs across server blocks.",
      "$request_id is available in Nginx 1.11.0+ for distributed tracing.",
      "proxy_http_version 1.1 is required for keepalive connections to upstream.",
      "proxy_hide_header removes sensitive headers from upstream responses.",
    ],
    terminalCommands: [
      "curl -v http://app.example.com 2>&1 | grep '>' # See request headers",
      "curl -v http://app.example.com 2>&1 | grep '<' # See response headers",
      "nginx -T | grep proxy_set_header               # List all proxy headers",
    ],
  },

  // SSL/TLS
  {
    id: "ssl-basic",
    title: "Basic SSL Configuration",
    description:
      "Set up HTTPS on your Nginx server with SSL/TLS certificates to encrypt traffic between clients and your server.",
    category: "SSL/TLS",
    lessonNumber: 12,
    nginxCode: `# /etc/nginx/conf.d/ssl-example.conf
# Complete HTTPS server configuration

# Redirect all HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    # Permanent redirect to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;  # Enable HTTP/2

    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html;

    # SSL Certificate paths
    ssl_certificate     /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # Strong SSL protocols (disable SSLv3, TLS 1.0, 1.1)
    ssl_protocols TLSv1.2 TLSv1.3;

    # Strong cipher suites
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:
                ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:
                ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    # Session caching for performance
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS: force HTTPS for 1 year
    add_header Strict-Transport-Security
        "max-age=31536000; includeSubDomains; preload" always;

    location / {
        try_files $uri $uri/ =404;
    }
}`,
    explanation:
      "SSL/TLS encrypts the connection between browser and server, protecting data in transit. Modern Nginx config should disable old protocols (TLSv1.0, 1.1), use strong cipher suites, enable HTTP/2 for performance, and add HSTS to prevent protocol downgrade attacks.",
    tips: [
      "Always redirect HTTP (port 80) to HTTPS (port 443) with 301 redirect.",
      "HSTS preload requires submitting your domain to browser preload lists.",
      "ssl_session_cache shared:SSL:10m handles ~40,000 simultaneous sessions.",
      "Use 'openssl s_client -connect example.com:443' to test SSL config.",
    ],
    terminalCommands: [
      "openssl s_client -connect example.com:443  # Test SSL handshake",
      "openssl x509 -in cert.crt -text -noout    # Inspect certificate",
      "curl -I https://example.com               # Test HTTPS response",
      "curl https://www.ssllabs.com/ssltest/analyze.html?d=example.com  # SSL grade",
    ],
  },
  {
    id: "ssl-letsencrypt",
    title: "SSL with Let's Encrypt",
    description:
      "Obtain and automatically renew free SSL certificates from Let's Encrypt using Certbot for Nginx.",
    category: "SSL/TLS",
    lessonNumber: 13,
    nginxCode: `# /etc/nginx/conf.d/certbot-ready.conf
# Prepare Nginx for Let's Encrypt certificate issuance

# Initial HTTP config (before certbot runs)
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/html;

    # ACME challenge location for certbot domain verification
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        allow all;
    }

    # Redirect all other HTTP to HTTPS (after cert is issued)
    location / {
        return 301 https://$host$request_uri;
    }
}

# After running: certbot --nginx -d example.com -d www.example.com
# Certbot automatically creates/modifies this HTTPS block:
server {
    listen 443 ssl;
    http2 on;
    server_name example.com www.example.com;
    root /var/www/html;
    index index.html;

    # Let's Encrypt certificate paths
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Let's Encrypt recommended options
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Auto-renewal verification endpoint
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    add_header Strict-Transport-Security
        "max-age=31536000; includeSubDomains" always;
}`,
    explanation:
      "Let's Encrypt provides free, automated SSL certificates trusted by all major browsers. Certbot is the recommended client that handles certificate issuance, Nginx configuration, and automatic renewal via cron/systemd. Certificates expire every 90 days but auto-renewal keeps them fresh.",
    tips: [
      "Install certbot: 'sudo snap install --classic certbot'",
      "Certbot auto-configures Nginx when you use '--nginx' flag.",
      "Renewal is automated: check with 'certbot renew --dry-run'.",
      "Wildcard certs (*.example.com) require DNS challenge instead of HTTP.",
    ],
    terminalCommands: [
      "sudo snap install --classic certbot",
      "sudo certbot --nginx -d example.com -d www.example.com",
      "sudo certbot renew --dry-run       # Test auto-renewal",
      "sudo certbot certificates          # List all certificates",
    ],
  },

  // Load Balancing
  {
    id: "lb-round-robin",
    title: "Round Robin Load Balancing",
    description:
      "Distribute incoming requests evenly across multiple backend servers using Nginx's default round-robin load balancing algorithm.",
    category: "Load Balancing",
    lessonNumber: 14,
    nginxCode: `# /etc/nginx/conf.d/load-balancer.conf
# Round-robin load balancing across multiple app servers

# Define the upstream server pool
upstream app_backend {
    # Default method: round-robin (no keyword needed)
    server 192.168.1.10:3000 weight=3;  # Gets 3x more traffic
    server 192.168.1.11:3000 weight=1;
    server 192.168.1.12:3000 weight=1;

    # Backup server: only used when all primaries are down
    server 192.168.1.20:3000 backup;

    # Health check settings
    # max_fails: failed requests before marking as down
    # fail_timeout: how long to consider server down
    server 192.168.1.10:3000 max_fails=3 fail_timeout=30s;

    # Keepalive connections to upstream
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://app_backend;

        # Required for keepalive upstream connections
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Retry failed requests on next upstream server
        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_next_upstream_tries 3;
    }
}`,
    explanation:
      "Round-robin is Nginx's default load balancing method, distributing requests sequentially to each server. Weight modifiers allow unequal distribution — useful when servers have different capacities. Backup servers provide failover. Health checking marks servers as unavailable when they fail too many consecutive requests.",
    tips: [
      "Weighted round-robin is ideal when servers have different hardware specs.",
      "proxy_next_upstream retries requests on the next server when upstream fails.",
      "keepalive connections to upstream significantly improves performance.",
      "Use upstream zones (shared memory) for active health checks in Nginx Plus.",
    ],
    terminalCommands: [
      "while true; do curl -s http://example.com | grep server; done  # Watch LB",
      "nginx -T | grep upstream          # List all upstreams",
      "curl -I http://example.com/       # Check load balanced response",
    ],
  },
  {
    id: "lb-least-conn",
    title: "Least Connections Load Balancing",
    description:
      "Use the least-connections algorithm to route new requests to the backend server with the fewest active connections.",
    category: "Load Balancing",
    lessonNumber: 15,
    nginxCode: `# /etc/nginx/conf.d/least-conn.conf
# Least connections load balancing
# Best for: long-lived connections, varying request durations

upstream api_backend {
    # Route to server with fewest active connections
    least_conn;

    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;

    # Passive health checks
    server 10.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:8080 max_fails=3 fail_timeout=30s;

    keepalive 64;
}

# IP Hash - sessions stick to same server
upstream sticky_backend {
    ip_hash;  # Client always goes to same server

    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080 down;  # Manually marked offline
}

# URL hash - same URL always goes to same server (caching)
upstream cache_backend {
    hash $request_uri consistent;

    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}

server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
    }

    location /static/ {
        proxy_pass http://cache_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}`,
    explanation:
      "Least-connections is ideal when requests have varying processing times — it prevents overloading slow servers. IP hash provides session persistence, routing the same client IP to the same server (important for applications that store session data in memory). URL hash is perfect for distributed caching.",
    tips: [
      "Use least_conn for APIs with variable response times (database queries, etc).",
      "ip_hash is a simple alternative to Redis/Memcached for session affinity.",
      "'hash $request_uri consistent' uses consistent hashing to minimize cache invalidation.",
      "Mark servers 'down' instead of removing them to preserve ip_hash mappings.",
    ],
    terminalCommands: [
      "ab -n 1000 -c 50 http://api.example.com/  # Load test",
      "nginx -T | grep 'least_conn\\|ip_hash'    # Check LB method",
      "curl -s http://api.example.com/health     # Check health endpoint",
    ],
  },

  // Security
  {
    id: "security-headers",
    title: "Security Headers",
    description:
      "Add essential HTTP security headers to protect your web application from XSS, clickjacking, MIME sniffing, and other common attacks.",
    category: "Security",
    lessonNumber: 16,
    nginxCode: `# /etc/nginx/snippets/security-headers.conf
# Comprehensive security headers for all server blocks
# Include with: include /etc/nginx/snippets/security-headers.conf;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent clickjacking (deny loading in iframes)
add_header X-Frame-Options "SAMEORIGIN" always;

# Enable XSS filter in older browsers
add_header X-XSS-Protection "1; mode=block" always;

# HSTS: force HTTPS for 1 year with subdomains
add_header Strict-Transport-Security
    "max-age=31536000; includeSubDomains; preload" always;

# Referrer Policy: control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy: disable unnecessary browser features
add_header Permissions-Policy
    "geolocation=(), microphone=(), camera=(), payment=(self)" always;

# Content Security Policy: prevent XSS and injection
add_header Content-Security-Policy
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://cdn.trusted.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https://api.example.com; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self';" always;

# Hide Nginx version number
server_tokens off;

# Hide Server header or set custom value
more_clear_headers Server;  # Requires ngx_http_headers_more module`,
    explanation:
      "Security headers are a critical defense-in-depth layer that protect users from common web vulnerabilities. CSP prevents XSS by whitelisting trusted content sources. HSTS prevents downgrade attacks. X-Frame-Options stops clickjacking. These headers are free to implement and have significant security impact.",
    tips: [
      "Use report-uri in CSP to collect violation reports before enforcing strictly.",
      "Test your headers at securityheaders.com for a grade and recommendations.",
      "'always' keyword in add_header applies the header to error responses too.",
      "Be careful with CSP — overly strict policies can break legitimate functionality.",
    ],
    terminalCommands: [
      "curl -I https://example.com | grep -i 'x-frame\\|x-content\\|strict'  # Check headers",
      "# Visit https://securityheaders.com to grade your headers",
      "nginx -T | grep add_header       # List all configured headers",
    ],
  },
  {
    id: "security-rate-limiting",
    title: "Rate Limiting",
    description:
      "Protect your server from DDoS attacks, brute force, and API abuse using Nginx's built-in rate limiting module.",
    category: "Security",
    lessonNumber: 17,
    nginxCode: `# /etc/nginx/conf.d/rate-limiting.conf
# Rate limiting to protect against DDoS and abuse

http {
    # Define rate limit zones in http block
    # Zone: 10MB shared memory (~160,000 IP addresses)
    # Rate: 10 requests per second per IP
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    # Stricter zone for login endpoints
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Zone for API endpoints
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

    # Connection limit zone
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    server {
        listen 443 ssl;
        server_name example.com;

        # Apply general rate limit with burst buffer
        # burst=20: allow up to 20 excess requests queued
        # nodelay: don't delay burst requests, reject over limit
        limit_req zone=general burst=20 nodelay;

        # Maximum 10 simultaneous connections per IP
        limit_conn addr 10;

        # Login endpoint - very strict
        location /auth/login {
            limit_req zone=login burst=5 nodelay;
            limit_req_status 429;  # 429 Too Many Requests

            # Return Retry-After header
            add_header Retry-After 60 always;

            proxy_pass http://backend;
        }

        # API endpoints - moderate limit
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            limit_req_status 429;

            proxy_pass http://api_backend;
        }

        # Rate limit logging
        limit_req_log_level warn;
        limit_conn_log_level warn;
    }
}`,
    explanation:
      "Rate limiting protects your server resources and prevents abuse. The 'zone' stores per-IP state in shared memory. 'burst' allows short traffic spikes without rejection. 'nodelay' processes burst requests immediately (instead of queuing with delay). Set 429 (Too Many Requests) as the status code for standards compliance.",
    tips: [
      "Use $binary_remote_addr (4 bytes) not $remote_addr (string) to save memory.",
      "Set burst to roughly 5-10x your per-second rate for good user experience.",
      "Log rate limit violations at 'warn' level to monitor for attacks.",
      "Consider different zones for different endpoint sensitivity (login vs API vs static).",
    ],
    terminalCommands: [
      "ab -n 100 -c 10 http://example.com/api/  # Trigger rate limit",
      "grep 'limiting requests' /var/log/nginx/error.log  # See violations",
      "tail -f /var/log/nginx/access.log | grep ' 429 '  # Watch 429s",
    ],
  },

  // Performance
  {
    id: "perf-gzip",
    title: "Gzip Compression",
    description:
      "Enable Gzip compression to reduce response sizes by 60-80%, dramatically improving page load times and reducing bandwidth costs.",
    category: "Performance",
    lessonNumber: 18,
    nginxCode: `# /etc/nginx/conf.d/gzip.conf
# Gzip compression configuration

http {
    # Enable gzip compression
    gzip on;

    # Minimum response size to compress (in bytes)
    # Don't compress small responses - overhead outweighs benefit
    gzip_min_length 1024;

    # Compression level: 1 (fast/less) to 9 (slow/more)
    # Level 6 is the sweet spot: good compression, reasonable CPU
    gzip_comp_level 6;

    # Compress responses to proxied requests too
    gzip_proxied any;

    # Vary header tells CDNs to cache compressed and uncompressed separately
    gzip_vary on;

    # MIME types to compress
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/x-component
        application/json
        application/javascript
        application/x-javascript
        application/xml
        application/xml+rss
        application/atom+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        font/opentype
        image/svg+xml
        image/x-icon;

    # Don't compress for IE 1-6 (broken gzip support)
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    # Serve pre-compressed .gz files if they exist
    # gzip_static on;  # Requires ngx_http_gzip_static_module

    server {
        listen 80;
        server_name example.com;
        root /var/www/html;

        location / {
            try_files $uri $uri/ =404;
        }
    }
}`,
    explanation:
      "Gzip compression reduces the size of text-based responses (HTML, CSS, JS, JSON) by 60-80% before sending them to clients. This significantly reduces bandwidth usage and improves page load times. Modern browsers all support gzip and will decompress automatically. Binary formats (images, videos) are already compressed and shouldn't be gzipped.",
    tips: [
      "Never compress images (JPEG, PNG, WebP) — they're already compressed.",
      "gzip_static serves pre-compressed .gz files, saving CPU on each request.",
      "Level 6 compresses ~85% as well as level 9 but at 3x the speed.",
      "Add 'Vary: Accept-Encoding' header so CDNs cache both versions.",
    ],
    terminalCommands: [
      "curl -H 'Accept-Encoding: gzip' -I https://example.com  # Check Content-Encoding",
      "curl -H 'Accept-Encoding: gzip' https://example.com | wc -c  # Compressed size",
      "curl https://example.com | wc -c                             # Uncompressed size",
    ],
  },
  {
    id: "perf-caching",
    title: "Caching Headers & Proxy Cache",
    description:
      "Implement browser and proxy caching strategies to serve content faster and reduce server load.",
    category: "Performance",
    lessonNumber: 19,
    nginxCode: `# /etc/nginx/conf.d/caching.conf
# Browser caching and Nginx proxy cache configuration

http {
    # Define proxy cache path
    # levels=1:2: cache directory structure
    # keys_zone: 10MB for storing keys (~80,000 entries)
    # max_size: maximum cache disk size
    # inactive: remove items not accessed in 60 minutes
    proxy_cache_path /var/cache/nginx
        levels=1:2
        keys_zone=app_cache:10m
        max_size=10g
        inactive=60m
        use_temp_path=off;

    server {
        listen 80;
        server_name example.com;
        root /var/www/html;

        # Aggressive caching for versioned static assets
        location ~* \.(css|js)(\?v=[0-9]+)?$ {
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
            access_log off;
        }

        # Medium-term caching for images
        location ~* \.(png|jpg|jpeg|gif|webp|avif|svg|ico)$ {
            expires 30d;
            add_header Cache-Control "public, max-age=2592000";
            access_log off;
        }

        # Short cache for HTML pages
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, max-age=3600, must-revalidate";
        }

        # API with proxy caching
        location /api/ {
            proxy_pass http://api_backend;
            proxy_cache app_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout http_500 http_502;
            proxy_cache_background_update on;
            proxy_cache_lock on;

            # Cache hit/miss status header for debugging
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}`,
    explanation:
      "Caching operates at multiple levels: browser cache (Cache-Control headers), CDN/proxy cache (nginx proxy_cache), and upstream cache. 'immutable' tells browsers never to revalidate a cached asset — perfect for versioned filenames. Proxy cache stores upstream responses on disk to serve repeated identical requests without hitting the backend.",
    tips: [
      "'immutable' only works with versioned filenames (app.v1.2.3.js not app.js).",
      "Check X-Cache-Status header to see HIT/MISS/BYPASS/EXPIRED.",
      "proxy_cache_use_stale serves stale content while fetching fresh in background.",
      "Purge specific cache entries with proxy_cache_purge (Nginx Plus or module).",
    ],
    terminalCommands: [
      "curl -I https://example.com/api/data | grep -i 'cache'  # Check cache headers",
      "ls /var/cache/nginx/                                    # Browse cache files",
      "find /var/cache/nginx -name '*.cache' -delete           # Clear all cache",
    ],
  },

  // Logging
  {
    id: "logging-access",
    title: "Access Log Formats",
    description:
      "Customize Nginx access log formats to capture the request information you need for analytics, monitoring, and debugging.",
    category: "Logging",
    lessonNumber: 20,
    nginxCode: `# /etc/nginx/conf.d/logging.conf
# Custom log formats for different use cases

http {
    # Default 'combined' format (Apache-compatible)
    log_format combined
        '$remote_addr - $remote_user [$time_local] '
        '"$request" $status $body_bytes_sent '
        '"$http_referer" "$http_user_agent"';

    # Extended format with timing and upstream info
    log_format extended
        '$remote_addr - $remote_user [$time_local] '
        '"$request" $status $body_bytes_sent '
        '"$http_referer" "$http_user_agent" '
        'rt=$request_time '
        'uct=$upstream_connect_time '
        'uht=$upstream_header_time '
        'urt=$upstream_response_time '
        'ups=$upstream_status '
        'cs=$upstream_cache_status';

    # JSON format for log aggregation (Elasticsearch, Splunk, etc.)
    log_format json_combined escape=json
        '{'
        '"time": "$time_iso8601",' 
        '"remote_addr": "$remote_addr",'
        '"method": "$request_method",'
        '"uri": "$uri",'
        '"args": "$args",'
        '"status": $status,'
        '"bytes": $body_bytes_sent,'
        '"request_time": $request_time,'
        '"upstream_time": "$upstream_response_time",'
        '"http_referer": "$http_referer",'
        '"http_user_agent": "$http_user_agent",'
        '"request_id": "$request_id"'
        '}';

    server {
        listen 80;
        server_name example.com;

        # Use JSON format for structured logging
        access_log /var/log/nginx/access.log json_combined;
        error_log  /var/log/nginx/error.log warn;

        # Disable logging for health checks
        location /health {
            access_log off;
            return 200 'OK';
        }
    }
}`,
    explanation:
      "Nginx's log_format directive lets you define exactly what information to capture. The JSON format is increasingly popular because it integrates seamlessly with log aggregation tools like the ELK stack (Elasticsearch, Logstash, Kibana) and Grafana Loki. Request timing variables ($request_time, $upstream_response_time) are invaluable for performance monitoring.",
    tips: [
      "$request_time includes client receive time; $upstream_response_time is backend only.",
      "Use 'escape=json' in log_format to properly escape special characters in JSON.",
      "Disable access logs for health check endpoints to reduce noise.",
      "Rotate logs with logrotate; reload Nginx after rotation with 'nginx -s reopen'.",
    ],
    terminalCommands: [
      "tail -f /var/log/nginx/access.log            # Follow access log",
      "awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c  # Status codes",
      "cat /var/log/nginx/access.log | python3 -m json.tool | head  # Parse JSON log",
      "goaccess /var/log/nginx/access.log --log-format=COMBINED      # Analytics",
    ],
  },
];

export function getLessonsByCategory(category: string): Lesson[] {
  return lessons.filter((l) => l.category === category);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
