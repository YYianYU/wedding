/**
 * Shared guestbook for the wedding site.
 * Messages are kept in this Drive folder:
 * https://drive.google.com/drive/folders/1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH
 *
 * New notes stay hidden until you approve them.
 * Easiest review page (on the wedding site):
 *   https://yyianyu.github.io/wedding/review
 * Key: REVIEW_KEY below
 *
 * Deploy: Deploy → Manage deployments → Edit → New version → Deploy
 * Execute as: Me · Who has access: Anyone
 */
var FOLDER_ID = "1Lpv9Yhi3nHY5k8YoH9HBSD3X_5SBoQkH";
var FILE_NAME = "messages.json";
var MAX_AUDIO_BYTES = 2 * 1024 * 1024;
/** Private review key — change it anytime, then redeploy. */
var REVIEW_KEY = "chen-yu-wish-review-2026";
var NOTIFY_TO = "yianyu@umich.edu,czxyian@gmail.com";
var SITE_REVIEW_URL = "https://yyianyu.github.io/wedding/review";

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.audio) {
      return serveAudio_(String(params.audio), params.key);
    }
    if (params.key && String(params.key) === REVIEW_KEY) {
      return reviewPage_(params);
    }
    return json({ ok: true, wishes: decorate_(publicOnly_(read_()), false) });
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

    var wish = {
      id: Utilities.getUuid(),
      name: name,
      message: message,
      audioId: audioId || undefined,
      submittedAt: new Date().toISOString(),
      approved: false,
    };

    var wishes = read_();
    wishes.unshift(wish);
    wishes = wishes.slice(0, 200);
    write_(wishes);
    notifyPending_(wish);

    return json({
      ok: true,
      pending: true,
      wishes: decorate_(publicOnly_(wishes), false),
    });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function reviewPage_(params) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var wishes = read_();
    var changed = false;
    var notice = "";

    if (params.approve) {
      changed = setApproved_(wishes, String(params.approve), true);
      notice = changed ? "Approved." : "Not found.";
    } else if (params.reject) {
      var rejected = removeWish_(wishes, String(params.reject));
      changed = rejected.changed;
      if (rejected.audioId) {
        try {
          DriveApp.getFileById(rejected.audioId).setTrashed(true);
        } catch (error) {
          /* keep going even if the audio file is already gone */
        }
      }
      notice = changed ? "Removed." : "Not found.";
    }

    if (changed) write_(wishes);

    var pending = wishes.filter(function (wish) {
      return wish.approved === false;
    });
    var approved = publicOnly_(wishes);

    if (String(params.format || "") === "json") {
      return json({
        ok: true,
        notice: notice,
        pending: decorate_(pending, true),
        publicCount: approved.length,
      });
    }

    var base = ScriptApp.getService().getUrl() + "?key=" + encodeURIComponent(REVIEW_KEY);
    var html = [];
    html.push("<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>");
    html.push("<title>Wedding messages review</title>");
    html.push("<style>body{font:16px/1.5 Georgia,serif;max-width:40rem;margin:2rem auto;padding:0 1rem;color:#333}");
    html.push("h1{font-weight:400} .card{border-top:1px solid #ddd;padding:1rem 0} .meta{color:#777;font-size:.9rem}");
    html.push("a.btn{display:inline-block;margin:0 .6rem .4rem 0;padding:.45rem .8rem;border:1px solid #333;text-decoration:none;color:#333}");
    html.push(".ok{color:#2f6b3a}.empty{color:#777}</style></head><body>");
    html.push("<h1>Review messages</h1>");
    html.push("<p class='meta'>Prefer the site page: <a href='" + escapeHtml_(SITE_REVIEW_URL) + "'>" + escapeHtml_(SITE_REVIEW_URL) + "</a></p>");
    if (notice) html.push("<p class='ok'>" + escapeHtml_(notice) + "</p>");
    html.push("<p class='meta'>Pending: " + pending.length + " · Public: " + approved.length + "</p>");

    if (!pending.length) {
      html.push("<p class='empty'>No messages waiting.</p>");
    } else {
      pending.forEach(function (wish) {
        html.push("<div class='card'>");
        html.push("<strong>" + escapeHtml_(wish.name) + "</strong>");
        html.push("<p>" + escapeHtml_(wish.message || "(voice note only)") + "</p>");
        if (wish.audioId) {
          html.push(
            "<p class='meta'><a href='" +
              escapeHtml_(ScriptApp.getService().getUrl() + "?audio=" + encodeURIComponent(wish.audioId) + "&key=" + encodeURIComponent(REVIEW_KEY)) +
              "' target='_blank' rel='noreferrer'>Open voice note</a></p>",
          );
        }
        html.push("<p class='meta'>" + escapeHtml_(wish.submittedAt || "") + "</p>");
        html.push("<p>");
        html.push("<a class='btn' href='" + base + "&approve=" + encodeURIComponent(wish.id) + "'>Approve</a>");
        html.push("<a class='btn' href='" + base + "&reject=" + encodeURIComponent(wish.id) + "'>Reject</a>");
        html.push("</p></div>");
      });
    }

    html.push("</body></html>");
    /* ContentService HTML opens reliably; HtmlService often shows a blank page on Workspace accounts. */
    return ContentService.createTextOutput(html.join("")).setMimeType(ContentService.MimeType.HTML);
  } finally {
    lock.releaseLock();
  }
}

function notifyPending_(wish) {
  try {
    var body = [
      "A new wedding guestbook note is waiting for review.",
      "",
      "Name: " + wish.name,
      "Message: " + (wish.message || "(voice note only)"),
      "When: " + wish.submittedAt,
      "",
      "Open the review page:",
      SITE_REVIEW_URL,
      "Review key: " + REVIEW_KEY,
    ].join("\n");
    MailApp.sendEmail({
      to: NOTIFY_TO,
      subject: "Wedding message waiting for review — " + wish.name,
      body: body,
    });
  } catch (error) {
    /* posting still works if mail is unavailable */
  }
}

function publicOnly_(wishes) {
  return wishes.filter(function (wish) {
    return wish.approved !== false;
  });
}

function setApproved_(wishes, id, approved) {
  for (var i = 0; i < wishes.length; i += 1) {
    if (wishes[i].id === id) {
      wishes[i].approved = approved;
      return true;
    }
  }
  return false;
}

function removeWish_(wishes, id) {
  for (var i = 0; i < wishes.length; i += 1) {
    if (wishes[i].id === id) {
      var audioId = wishes[i].audioId || "";
      wishes.splice(i, 1);
      return { changed: true, audioId: audioId };
    }
  }
  return { changed: false, audioId: "" };
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

function serveAudio_(id, key) {
  var wishes = read_();
  var match = null;
  for (var i = 0; i < wishes.length; i += 1) {
    if (wishes[i].audioId === id) {
      match = wishes[i];
      break;
    }
  }
  var reviewer = key && String(key) === REVIEW_KEY;
  if (!match || (match.approved === false && !reviewer)) throw new Error("not found");

  var file = DriveApp.getFileById(id);
  var blob = file.getBlob();
  return json({
    ok: true,
    mimeType: blob.getContentType() || "audio/webm",
    data: Utilities.base64Encode(blob.getBytes()),
  });
}

function decorate_(wishes, forReview) {
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
      row.audioUrl =
        base +
        "?audio=" +
        encodeURIComponent(wish.audioId) +
        (forReview ? "&key=" + encodeURIComponent(REVIEW_KEY) : "");
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
  var name = String(value || "").replace(/[^\w\u4e00-\u9fff .\-']/g, "").trim();
  return name.slice(0, 40);
}

function cleanMessage_(value) {
  return String(value || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, 500);
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
