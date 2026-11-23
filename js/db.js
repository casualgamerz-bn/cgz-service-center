/**
 * CasualGamerzDB — v8 (Google Sheets)
 * ─────────────────────────────────────────────────────────────────────
 * Async frontend interface to the Google Apps Script backend.
 * All public methods return Promises.
 *
 * Requires: js/sheets-config.js loaded first (sets window._SHEETS_URL)
 * ─────────────────────────────────────────────────────────────────────
 */
const CasualGamerzDB = (() => {

  // ── Helpers ─────────────────────────────────────────────────────────

  function url() {
    return window._SHEETS_URL || '';
  }

  function isConfigured() {
    const u = url();
    return u && !u.includes('YOUR_');
  }

  async function get(action, params = {}) {
    if (!isConfigured()) throw new Error('Google Sheets URL not configured. See js/sheets-config.js');
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${url()}?${qs}`, { credentials: 'omit' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Server error');
    return data;
  }

  async function post(body) {
    if (!isConfigured()) throw new Error('Google Sheets URL not configured. See js/sheets-config.js');
    const res = await fetch(url(), {
      method: 'POST',
      body: JSON.stringify(body),
      credentials: 'omit',
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Server error');
    return data;
  }

  // ── Formatting helpers ───────────────────────────────────────────────

  function fmt(isoString) {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return isoString; }
  }

  function fmtDate(isoString) {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return isoString; }
  }

  function total(repair) {
    const l = parseFloat(repair.laborCost) || 0;
    const p = parseFloat(repair.partsCost) || 0;
    return (l + p).toFixed(2);
  }

  const STATUS_ORDER = ['Received','Diagnosing','Repairing','Testing','Ready','Completed','Cancelled'];
  const STATUS_COLORS = {
    'Received':   '#00f5ff',
    'Diagnosing': '#b464ff',
    'Repairing':  '#ff6b35',
    'Testing':    '#ffc800',
    'Ready':      '#39ff14',
    'Completed':  '#39ff14',
    'Cancelled':  '#888',
  };

  function statusColor(s) { return STATUS_COLORS[s] || '#888'; }

  // ── Public API ───────────────────────────────────────────────────────

  return {

    isConfigured,

    /** Get all repairs */
    getAll: () => get('getAll').then(d => d.repairs),

    /** Get single repair + its log */
    getByTicket: (ticket) => get('getByTicket', { ticket }),

    /** Get repairs by phone number */
    getByPhone: (phone) => get('getByPhone', { phone }).then(d => d.repairs),

    /** Get stats (total, active, completed, revenue) */
    getStats: () => get('getStats').then(d => d.stats),

    /** Add a new repair — returns ticketId */
    addRepair: (data) => post({ action: 'addRepair', data }).then(d => d.ticketId),

    /** Update status */
    updateStatus: (ticket, status, note, tech) =>
      post({ action: 'updateStatus', ticket, status, note, tech }),

    /** Update repair fields */
    updateRepair: (ticket, data) =>
      post({ action: 'updateRepair', ticket, data }),

    /** Delete a repair */
    deleteRepair: (ticket) =>
      post({ action: 'deleteRepair', ticket }),

    // ── Utilities ──────────────────────────────────────────────────────

    fmt,
    fmtDate,
    total,
    statusColor,
    STATUS_ORDER,
    STATUS_COLORS,

    /** Export to CSV and trigger download */
    exportCSV: async () => {
      const repairs = await get('getAll').then(d => d.repairs);
      if (!repairs.length) { alert('No repairs to export.'); return; }

      const headers = [
        'Ticket ID','Date','Status','Device','Brand','Model',
        'Issue','Details','First Name','Last Name','Phone','Email',
        'Service Type','Preferred Date','Tech Notes','Parts Used',
        'Labour (BND$)','Parts (BND$)','Total (BND$)',
        'Est. Ready','Completed','Warranty Expiry',
      ];

      const rows = repairs.map(r => [
        r.ticketId, r.createdAt, r.status, r.deviceType, r.brand, r.model,
        r.issue, r.issueDetail, r.firstName, r.lastName, r.phone, r.email,
        r.serviceType, r.preferredDate, r.techNotes, r.partsUsed,
        r.laborCost, r.partsCost, total(r),
        r.estimatedReady, r.completedAt, r.warrantyExpiry,
      ].map(v => `"${String(v||'').replace(/"/g,'""')}"`));

      const csv = [headers.map(h => `"${h}"`), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `CGZ_Repairs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    },
  };

})();

console.log('[CGZ] 🎮 CasualGamerzDB v8 ready');
