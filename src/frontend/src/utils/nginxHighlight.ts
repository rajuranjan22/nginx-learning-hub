// Nginx config syntax highlighter (CSS-class based)

const KEYWORDS = [
  "http",
  "events",
  "server",
  "location",
  "upstream",
  "stream",
  "map",
  "geo",
  "types",
  "if",
];

const DIRECTIVES = [
  "listen",
  "server_name",
  "root",
  "index",
  "include",
  "proxy_pass",
  "proxy_set_header",
  "proxy_hide_header",
  "proxy_http_version",
  "proxy_connect_timeout",
  "proxy_send_timeout",
  "proxy_read_timeout",
  "proxy_buffering",
  "proxy_buffer_size",
  "proxy_buffers",
  "proxy_busy_buffers_size",
  "proxy_cache",
  "proxy_cache_path",
  "proxy_cache_valid",
  "proxy_cache_use_stale",
  "proxy_cache_background_update",
  "proxy_cache_lock",
  "proxy_intercept_errors",
  "proxy_next_upstream",
  "proxy_next_upstream_tries",
  "ssl_certificate",
  "ssl_certificate_key",
  "ssl_protocols",
  "ssl_ciphers",
  "ssl_prefer_server_ciphers",
  "ssl_session_cache",
  "ssl_session_timeout",
  "ssl_session_tickets",
  "ssl_dhparam",
  "add_header",
  "more_clear_headers",
  "expires",
  "access_log",
  "error_log",
  "log_format",
  "return",
  "rewrite",
  "try_files",
  "error_page",
  "sendfile",
  "tcp_nopush",
  "tcp_nodelay",
  "keepalive_timeout",
  "keepalive_requests",
  "keepalive",
  "worker_processes",
  "worker_connections",
  "worker_cpu_affinity",
  "worker_rlimit_nofile",
  "use",
  "multi_accept",
  "gzip",
  "gzip_min_length",
  "gzip_comp_level",
  "gzip_proxied",
  "gzip_vary",
  "gzip_types",
  "gzip_disable",
  "gzip_static",
  "limit_req_zone",
  "limit_req",
  "limit_req_status",
  "limit_req_log_level",
  "limit_conn_zone",
  "limit_conn",
  "limit_conn_log_level",
  "fastcgi_pass",
  "fastcgi_index",
  "fastcgi_param",
  "fastcgi_params",
  "client_header_timeout",
  "client_body_timeout",
  "client_max_body_size",
  "client_header_buffer_size",
  "client_body_buffer_size",
  "large_client_header_buffers",
  "send_timeout",
  "server_tokens",
  "types_hash_max_size",
  "default_type",
  "pid",
  "user",
  "http2",
  "hash",
  "least_conn",
  "ip_hash",
  "weight",
  "backup",
  "down",
  "max_fails",
  "fail_timeout",
  "zone",
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightNginx(code: string): string {
  const lines = code.split("\n");
  return lines
    .map((line) => {
      // Comment lines
      const trimmed = line.trimStart();
      if (trimmed.startsWith("#")) {
        return `<span class="cmt">${escapeHtml(line)}</span>`;
      }

      let result = escapeHtml(line);

      // Keywords (block openers like server, location, http)
      for (const kw of KEYWORDS) {
        const re = new RegExp(`\\b(${kw})\\b`, "g");
        result = result.replace(re, `<span class="kw">$1</span>`);
      }

      // Directives
      for (const dir of DIRECTIVES) {
        const re = new RegExp(`\\b(${dir})\\b`, "g");
        result = result.replace(re, `<span class="dir">$1</span>`);
      }

      // Strings in quotes
      result = result.replace(
        /&quot;([^&]*)&quot;/g,
        `&quot;<span class="str">$1</span>&quot;`,
      );

      // Braces
      result = result.replace(/(\{|\})/g, `<span class="br">$1</span>`);

      // Semicolons
      result = result.replace(/(;)/g, `<span class="sem">$1</span>`);

      // Port numbers (e.g., :80, :443, :3000)
      result = result.replace(
        /(\b(?:80|443|8080|8443|3000|8000|8001|3001|3306|5432|6379)\b)/g,
        `<span class="prt">$1</span>`,
      );

      return result;
    })
    .join("\n");
}
