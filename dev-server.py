#!/usr/bin/env python3
"""Local dev server for web/.

Identical to `python -m http.server` except it tells the browser never to cache
anything. The stock server sends no cache headers at all, so browsers hold onto
stale CSS and JS — which looks exactly like a bug that has already been fixed,
and costs a debugging cycle every time.

Production caching is Vercel's job and is configured in vercel.json; this only
affects local development.

    python dev-server.py [port]
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quiet the per-request noise; errors still surface.
        if not str(args[1] if len(args) > 1 else "").startswith("2"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    handler = partial(NoCacheHandler, directory="web")
    with ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"serving web/ on http://127.0.0.1:{PORT}  (no-store)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
