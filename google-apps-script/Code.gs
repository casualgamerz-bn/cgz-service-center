/**
 * CGZ Service Center — Google Apps Script Backend v3
 * Uses hardcoded Spreadsheet ID (no DriveApp scope needed)
 *
 * HOW TO DEPLOY:
 *  1. Go to https://script.google.com → New project (run as casualgamerz.co@gmail.com)
 *  2. Paste this entire file into the editor
 *  3. Click "Deploy" → "New deployment" → Type: Web App
 *     • Execute as: Me
 *     • Who has access: Anyone
 *  4. Click Deploy, copy the Web App URL
 *  5. Paste the URL into js/sheets-config.js
 *
 * Current deployment:
 *  Web App URL: https://script.google.com/macros/s/AKfycbzgLHXMDBQyXpe1zsL5bPXLtDJvgdiORT983F7d8O0NzA3W3I4bzXADTbiYEvnRzcfu/exec
 *  Spreadsheet: https://docs.google.com/spreadsheets/d/1zkpQ5XTQUEESehPofGt2cKrDRB8l02T1YTaz11v10sI/edit
 */
const SPREADSHEET_ID = '1zkpQ5XTQUEESehPofGt2cKrDRB8l02T1YTaz11v10sI';
const REPAIR_COLS = [
  'ticketId','createdAt','status','deviceType','brand','model',
  'issue','issueDetail','firstName','lastName','phone','email',
  'serviceType','preferredDate','techNotes','partsUsed',
  'laborCost','partsCost','totalCost','estimatedReady',
  'completedAt','warrantyExpiry','updatedAt',
];
const LOG_COLS = ['ticketId', 'timestamp', 'status', 'note', 'tech'];

function corsOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(name, headers) {
  const ss = getSpreadsheet();

  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a2740')
      .setFontColor('#00f5ff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function repairSheet() { return getOrCreateSheet('Repairs', REPAIR_COLS); }
function logSheet()    { return getOrCreateSheet('Log', LOG_COLS); }

function sheetToObjects(sheet, cols) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(row => {
    const obj = {};
    cols.forEach((k, i) => { obj[k] = row[i] !== undefined ? String(row[i]) : ''; });
    return obj;
  });
}

function findRepairRow(sheet, ticketId) {
  const col = sheet.getRange('A:A').getValues();
  const target = String(ticketId || '').trim();
  if (!target) return -1;
  for (let i = 1; i < col.length; i++) {
    if (String(col[i][0]).trim() === target) return i + 1;
  }
  return -1;
}

function generateTicketId() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const datePart = now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate());
  const timePart = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  return 'CGZ-' + datePart + '-' + timePart;
}

function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    if (action === 'getAll') {
      const repairs = sheetToObjects(repairSheet(), REPAIR_COLS);
      return corsOutput({ ok: true, repairs });
    }
    if (action === 'getByTicket') {
      const ticketId = e.parameter.ticket || '';
      const repairs = sheetToObjects(repairSheet(), REPAIR_COLS);
      const repair = repairs.find(r => r.ticketId === ticketId) || null;
      const logs = repair
        ? sheetToObjects(logSheet(), LOG_COLS).filter(l => l.ticketId === ticketId)
        : [];
      return corsOutput({ ok: true, repair, logs });
    }
    if (action === 'getByPhone') {
      const phone = e.parameter.phone || '';
      const repairs = sheetToObjects(repairSheet(), REPAIR_COLS)
        .filter(r => r.phone === phone);
      return corsOutput({ ok: true, repairs });
    }
    if (action === 'getStats') {
      const repairs = sheetToObjects(repairSheet(), REPAIR_COLS);
      const stats = {
        total: repairs.length,
        active: repairs.filter(r => !['Completed','Cancelled'].includes(r.status)).length,
        completed: repairs.filter(r => r.status === 'Completed').length,
        cancelled: repairs.filter(r => r.status === 'Cancelled').length,
      };
      return corsOutput({ ok: true, stats });
    }
    return corsOutput({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'addRepair') {
      const d = body.data || {};
      const ticketId = generateTicketId();
      const now = new Date().toISOString();
      // Allow backdated entries: if data.createdAt supplied, use it; else use now
      const entryTime = (d.createdAt && d.createdAt.trim()) ? d.createdAt.trim() : now;
      const row = REPAIR_COLS.map(k => {
        if (k === 'ticketId')  return ticketId;
        if (k === 'createdAt') return entryTime;
        if (k === 'status')    return d.status || 'Received';
        if (k === 'updatedAt') return now;
        return d[k] || '';
      });
      repairSheet().appendRow(row);
      logSheet().appendRow([ticketId, entryTime, d.status || 'Received', 'Repair submitted (backdated)', '']);
      return corsOutput({ ok: true, ticketId });
    }

    if (action === 'updateStatus') {
      const ticketId = body.ticketId || body.ticket;
      const { status, note, tech } = body;
      const sheet = repairSheet();
      const rowNum = findRepairRow(sheet, ticketId);
      if (rowNum < 0) return corsOutput({ ok: false, error: 'Ticket not found' });
      const statusIdx = REPAIR_COLS.indexOf('status') + 1;
      const updatedIdx = REPAIR_COLS.indexOf('updatedAt') + 1;
      const now = new Date().toISOString();
      sheet.getRange(rowNum, statusIdx).setValue(status);
      sheet.getRange(rowNum, updatedIdx).setValue(now);
      if (status === 'Completed') {
        const compIdx = REPAIR_COLS.indexOf('completedAt') + 1;
        const warIdx  = REPAIR_COLS.indexOf('warrantyExpiry') + 1;
        const warDate = new Date(); warDate.setDate(warDate.getDate() + 90);
        sheet.getRange(rowNum, compIdx).setValue(now);
        sheet.getRange(rowNum, warIdx).setValue(warDate.toISOString());
      }
      logSheet().appendRow([ticketId, now, status, note || '', tech || '']);
      return corsOutput({ ok: true });
    }

    if (action === 'updateRepair') {
      const ticketId = body.ticketId || body.ticket;
      const data = body.data;
      const sheet = repairSheet();
      const rowNum = findRepairRow(sheet, ticketId);
      if (rowNum < 0) return corsOutput({ ok: false, error: 'Ticket not found' });
      const now = new Date().toISOString();
      REPAIR_COLS.forEach((k, i) => {
        if (data[k] !== undefined) {
          sheet.getRange(rowNum, i + 1).setValue(data[k]);
        }
      });
      const updatedIdx = REPAIR_COLS.indexOf('updatedAt') + 1;
      sheet.getRange(rowNum, updatedIdx).setValue(now);
      return corsOutput({ ok: true });
    }

    if (action === 'deleteRepair') {
      const ticketId = body.ticketId || body.ticket;
      const rSheet = repairSheet();
      const rowNum = findRepairRow(rSheet, ticketId);
      if (rowNum < 0) return corsOutput({ ok: false, error: 'Ticket not found' });
      rSheet.deleteRow(rowNum);
      const lSheet = logSheet();
      const logData = lSheet.getDataRange().getValues();
      for (let i = logData.length - 1; i >= 1; i--) {
        if (logData[i][0] === ticketId) lSheet.deleteRow(i + 1);
      }
      return corsOutput({ ok: true });
    }

    if (action === 'sendReceiptEmail') {
      const ticketId = body.ticketId || body.ticket;
      const repairs  = sheetToObjects(repairSheet(), REPAIR_COLS);
      const repair   = repairs.find(r => r.ticketId === ticketId);
      if (!repair)        return corsOutput({ ok: false, error: 'Ticket not found' });
      if (!repair.email)  return corsOutput({ ok: false, error: 'No email address on file for this customer' });
      const subject = 'Your Repair Receipt — ' + ticketId + ' | Casual Gamerz Service Center';
      MailApp.sendEmail({ to: repair.email, subject: subject, htmlBody: buildReceiptEmailHTML_(repair) });
      return corsOutput({ ok: true });
    }

    return corsOutput({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
}

// ── Email receipt HTML builder ──────────────────────────────────────────────
function buildReceiptEmailHTML_(r) {
  var fmtDate = function(s) {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}); }
    catch(e) { return s; }
  };
  var labor = parseFloat(r.laborCost) || 0;
  var parts = parseFloat(r.partsCost) || 0;
  var total = parseFloat(r.totalCost) || (labor + parts);
  var sc = {Received:'#0ea5e9',Diagnosing:'#8b5cf6',Repairing:'#f97316',Testing:'#eab308',Ready:'#22c55e',Completed:'#16a34a',Cancelled:'#9ca3af'}[r.status] || '#6b7280';
  var deviceLine = [r.brand, r.model].filter(Boolean).join(' · ');
  var datesHtml = '';
  if (r.estimatedReady) datesHtml += '<td width="8"></td><td style="padding:10px 12px;background:#f8fafc;border-radius:6px;font-size:12px;"><div style="color:#94a3b8;font-size:10px;text-transform:uppercase;">Est. Ready</div><div style="font-weight:600;color:#0f172a;">' + fmtDate(r.estimatedReady) + '</div></td>';
  if (r.completedAt)    datesHtml += '<td width="8"></td><td style="padding:10px 12px;background:#f8fafc;border-radius:6px;font-size:12px;"><div style="color:#94a3b8;font-size:10px;text-transform:uppercase;">Completed</div><div style="font-weight:600;color:#0f172a;">' + fmtDate(r.completedAt) + '</div></td>';
  if (r.warrantyExpiry) datesHtml += '<td width="8"></td><td style="padding:10px 12px;background:#dcfce7;border-radius:6px;font-size:12px;"><div style="color:#16a34a;font-size:10px;text-transform:uppercase;font-weight:700;">Warranty Until</div><div style="font-weight:700;color:#15803d;">' + fmtDate(r.warrantyExpiry) + '</div></td>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
    +'<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">'
    +'<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;"><tr><td align="center">'
    +'<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">'
    // Header
    +'<tr><td style="background:#0f172a;padding:28px 32px;text-align:center;">'
    +'<div style="font-size:32px;">🎮</div>'
    +'<div style="color:#00f5ff;font-size:20px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">CASUAL GAMERZ</div>'
    +'<div style="color:#94a3b8;font-size:12px;margin-top:4px;">CGZ Service Center — Brunei Darussalam</div></td></tr>'
    // Ticket
    +'<tr><td style="background:#1e293b;padding:14px 32px;text-align:center;">'
    +'<div style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;">REPAIR RECEIPT</div>'
    +'<div style="color:#fff;font-size:26px;font-weight:900;letter-spacing:0.06em;">' + r.ticketId + '</div></td></tr>'
    // Status
    +'<tr><td style="padding:20px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" style="background:' + sc + '18;border-left:4px solid ' + sc + ';border-radius:4px;">'
    +'<tr><td style="padding:12px 16px;"><span style="color:' + sc + ';font-weight:700;font-size:13px;text-transform:uppercase;">Status: ' + r.status + '</span>'
    +(r.serviceType ? '<span style="color:#64748b;font-size:12px;float:right;">' + r.serviceType + '</span>' : '')
    +'</td></tr></table></td></tr>'
    // Customer & Device
    +'<tr><td style="padding:16px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr>'
    +'<td width="48%" valign="top" style="background:#f8fafc;border-radius:8px;padding:14px;">'
    +'<div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Customer</div>'
    +'<div style="font-weight:700;font-size:15px;color:#0f172a;">' + r.firstName + ' ' + r.lastName + '</div>'
    +'<div style="color:#475569;font-size:13px;">' + r.phone + '</div>'
    +(r.email ? '<div style="color:#475569;font-size:12px;">' + r.email + '</div>' : '')
    +'</td><td width="4%"></td>'
    +'<td width="48%" valign="top" style="background:#f8fafc;border-radius:8px;padding:14px;">'
    +'<div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Device</div>'
    +'<div style="font-weight:700;font-size:15px;color:#0f172a;">' + r.deviceType + '</div>'
    +(deviceLine ? '<div style="color:#475569;font-size:13px;">' + deviceLine + '</div>' : '')
    +'</td></tr></table></td></tr>'
    // Issue
    +'<tr><td style="padding:16px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;">'
    +'<tr><td style="padding:14px;">'
    +'<div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Issue Reported</div>'
    +'<div style="font-weight:600;color:#0f172a;">' + r.issue + '</div>'
    +(r.issueDetail ? '<div style="color:#475569;font-size:12px;margin-top:4px;">' + r.issueDetail + '</div>' : '')
    +'</td></tr></table></td></tr>'
    // Costs
    +'<tr><td style="padding:16px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #0f172a;border-radius:8px;overflow:hidden;">'
    +'<tr><td colspan="2" style="background:#0f172a;color:#fff;padding:10px 16px;font-size:11px;text-transform:uppercase;font-weight:700;">Cost Breakdown</td></tr>'
    +'<tr><td style="padding:10px 16px;color:#475569;font-size:13px;border-bottom:1px solid #f1f5f9;">Labour</td><td style="padding:10px 16px;text-align:right;font-weight:600;font-size:13px;border-bottom:1px solid #f1f5f9;">BND$ ' + labor.toFixed(2) + '</td></tr>'
    +'<tr><td style="padding:10px 16px;color:#475569;font-size:13px;border-bottom:1px solid #f1f5f9;">Parts</td><td style="padding:10px 16px;text-align:right;font-weight:600;font-size:13px;border-bottom:1px solid #f1f5f9;">BND$ ' + parts.toFixed(2) + '</td></tr>'
    +'<tr><td style="padding:12px 16px;font-weight:900;font-size:16px;color:#0f172a;">TOTAL</td><td style="padding:12px 16px;text-align:right;font-weight:900;font-size:16px;color:#0f172a;">BND$ ' + total.toFixed(2) + '</td></tr>'
    +'</table></td></tr>'
    // Dates
    +'<tr><td style="padding:16px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr>'
    +'<td style="padding:10px 12px;background:#f8fafc;border-radius:6px;font-size:12px;"><div style="color:#94a3b8;font-size:10px;text-transform:uppercase;">Date In</div><div style="font-weight:600;color:#0f172a;">' + fmtDate(r.createdAt) + '</div></td>'
    + datesHtml
    +'</tr></table></td></tr>'
    // Footer
    +'<tr><td style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 32px;margin-top:16px;">'
    +'<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    +'<td valign="top"><div style="font-size:12px;color:#475569;line-height:1.7;">'
    +'<strong style="color:#0f172a;">Warranty Terms</strong><br>'
    +'• 30-day warranty on all completed repairs<br>'
    +'• Keep this email for warranty claims<br>'
    +'• Uncollected devices after 30 days may be disposed</div></td>'
    +'<td valign="top" align="right">'
    +'<div style="font-size:13px;font-weight:700;color:#0f172a;">Thank you! 🎮</div>'
    +'<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Casual Gamerz Service Center</div>'
    +'</td></tr></table></td></tr>'
    +'</table></td></tr></table></body></html>';
}
