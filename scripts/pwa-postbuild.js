/**
 * pwa-postbuild.js - Post-build script for PWA configuration
 *
 * Runs after `expo export --platform web` to inject PWA-specific tags into
 * the generated index.html. Adds manifest link, Apple meta tags, and service
 * worker registration script. Idempotent - safe to run multiple times.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('No index.html found in dist/, skipping PWA postbuild');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Add manifest link if not present
if (!html.includes('rel="manifest"')) {
  html = html.replace(
    '</head>',
    `<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="PATH Solutions" />
<link rel="apple-touch-icon" href="/assets/icon.png" />
</head>`
  );
}

// Add service worker registration if not present
if (!html.includes('serviceWorker')) {
  html = html.replace(
    '</body>',
    `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(r) { console.log('SW registered:', r.scope); })
      .catch(function(e) { console.log('SW failed:', e); });
  });
}
</script>
</body>`
  );
}

fs.writeFileSync(indexPath, html);
console.log('PWA postbuild complete: manifest and service worker added to index.html');
