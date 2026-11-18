/**
 * Shared guestbook for the wedding site.
 * Messages are kept in this Drive folder:
 * https://drive.google.com/drive/folders/1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH
 *
 * Text notes go in messages.json. Voice notes are saved as audio files
 * in the same folder, and played back through this web app.
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
var MAX_AUDIO_BYTES = 2 * 1024 * 1024;

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.audio) {
      return serveAudio_(String(e.parameter.audio));
    }
    return json({ ok: true, wishes: decorate_(read_()) });
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
    var audioId = "";
    if (!name) throw new Error("empty");
    if (!message && !body.audio) throw new Error("empty");

    if (body.audio) {
      audioId = saveAudio_(body.audio, body.mimeType, name);
    }

    var wishes = read_();
    wishes.unshift({
      id: Utilities.getUuid(),
      name: name,
      message: message,
      audioId: audioId || undefined,
      submittedAt: new Date().toISOString(),
    });
    wishes = wishes.slice(0, 200);
    write_(wishes);
    return json({ ok: true, wishes: decorate_(wishes) });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function saveAudio_(data, mimeType, guest) {
  var bytes = Utilities.base64Decode(String(data || ""));
  var mime = String(mimeType || "audio/webm");
  if (mime.indexOf("audio/") !== 0) throw new Error("not audio");
  if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) throw new Error("audio size");

  var stamp = Utilities.formatDate(new Date(), "America/Chicago", "yyyyMMdd-HHmmss");
  var ext = mime.indexOf("mp4") >= 0 || mime.indexOf("m4a") >= 0 ? ".m4a" : mime.indexOf("mpeg") >= 0 || mime.indexOf("mp3") >= 0 ? ".mp3" : ".webm";
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var file = folder.createFile(Utilities.newBlob(bytes, mime, cleanName_(guest) + "-" + stamp + ext));
  file.setDescription("wish-audio");
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    /* university accounts sometimes block link sharing; playback still works via this web app */
  }
  return file.getId();
}

function serveAudio_(id) {
  var file = DriveApp.getFileById(id);
  var blob = file.getBlob();
  return json({
    ok: true,
    mimeType: blob.getContentType() || "audio/webm",
    data: Utilities.base64Encode(blob.getBytes()),
  });
}

function decorate_(wishes) {
  var base = ScriptApp.getService().getUrl();
  return wishes.map(function (wish) {
    var row = {
      id: wish.id,
      name: wish.name,
      message: wish.message || "",
      submittedAt: wish.submittedAt,
    };
    if (wish.audioId) {
      row.audioId = wish.audioId;
      row.audioUrl = base + "?audio=" + encodeURIComponent(wish.audioId);
    }
    return row;
  });
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
