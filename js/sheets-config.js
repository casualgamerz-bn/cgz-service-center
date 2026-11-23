/**
 * sheets-config.js — CGZ Service Center
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO SET UP:
 *  1. Open google-apps-script/Code.gs and follow its deploy instructions
 *  2. After deploying, copy the Web App URL
 *  3. Paste it below, replacing YOUR_APPS_SCRIPT_URL_HERE
 *
 * The URL looks like:
 *   https://script.google.com/macros/s/AKfycby.../exec
 * ─────────────────────────────────────────────────────────────────────
 */
(function () {
  window._SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzgLHXMDBQyXpe1zsL5bPXLtDJvgdiORT983F7d8O0NzA3W3I4bzXADTbiYEvnRzcfu/exec';

  if (!window._SHEETS_URL || window._SHEETS_URL.includes('YOUR_')) {
    console.warn(
      '[CGZ] ⚠️  Google Sheets not connected yet!\n' +
      '    Deploy google-apps-script/Code.gs as a Web App,\n' +
      '    then paste the URL into js/sheets-config.js'
    );
  } else {
    console.log('[CGZ] ✅ Google Sheets connected');
  }
})();
