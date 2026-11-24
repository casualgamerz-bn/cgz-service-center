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
      const row = REPAIR_COLS.map(k => {
        if (k === 'ticketId')  return ticketId;
        if (k === 'createdAt') return now;
        if (k === 'status')    return 'Received';
        if (k === 'updatedAt') return now;
        return d[k] || '';
      });
      repairSheet().appendRow(row);
      logSheet().appendRow([ticketId, now, 'Received', 'Repair submitted', '']);
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

    return corsOutput({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
}
