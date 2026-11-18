/**
 * Shared guestbook for the wedding site.
 * Messages are kept in this Drive folder:
 * https://drive.google.com/drive/folders/1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH
 *
 * Deploy: script.google.com → New project → paste this file →
 * Deploy → New deployment → Web app →
 * Execute as: Me
 * Who has access: Anyone
 * Then copy the /exec URL into wishesEndpoint in src/content.js.
 * After that, anyone who opens the Messages page sees the same notes.
 */
var FOLDER_ID = "1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH";
var FILE_NAME = "messages.json";

function doGet() {
  try {
    return json({ ok: true, wishes: read_() });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e.postData && e.postData.contents) || "{}");
    var name = cleanName_(body.name);
    var message = cleanMessage_(body.message);
    if (!name || !message) throw new Error("empty");

    var wishes = read_();
    wishes.unshift({
      id: Utilities.getUuid(),
      name: name,
      message: message,
      submittedAt: new Date().toISOString(),
    });
    wishes = wishes.slice(0, 200);
    write_(wishes);
    return json({ ok: true, wishes: wishes });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function read_() {
  var file = find_();
  if (!file) return [];
  var parsed = JSON.parse(file.getBlob().getDataAsString() || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

function write_(wishes) {
  var content = JSON.stringify(wishes);
  var existing = find_();
  if (existing) {
    existing.setContent(content);
    return;
  }
  DriveApp.getFolderById(FOLDER_ID).createFile(FILE_NAME, content, MimeType.PLAIN_TEXT);
}

function find_() {
  var files = DriveApp.getFolderById(FOLDER_ID).getFilesByName(FILE_NAME);
  return files.hasNext() ? files.next() : null;
}

function cleanName_(value) {
  var name = String(value || "").replace(/[^\w\u4e00-\u9fff .\-]/g, "").trim();
  return name.slice(0, 40);
}

function cleanMessage_(value) {
  return String(value || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, 500);
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
