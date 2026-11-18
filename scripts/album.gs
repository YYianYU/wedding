/**
 * Guest photo album for the wedding site.
 * Deploy: script.google.com → New project → paste this file →
 * Deploy → New deployment → Web app →
 * Execute as: Me
 * Who has access: Anyone
 * Then copy the /exec URL into albumEndpoint in src/content.js.
 */
var FOLDER_ID = "1TPN_bs-xBF_9WHZAvMslbYOh4XwdlKyJ";

function doGet() {
  try {
    return json({ ok: true, photos: listPhotos_() });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var bytes = Utilities.base64Decode(body.data || "");
    var mime = String(body.mimeType || "image/jpeg");
    if (mime.indexOf("image/") !== 0) throw new Error("not an image");
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error("file size");

    var guest = cleanName_(body.name);
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var stamp = Utilities.formatDate(new Date(), "America/Chicago", "yyyyMMdd-HHmmss");
    var file = folder.createFile(Utilities.newBlob(bytes, mime, guest + "-" + stamp + ".jpg"));
    file.setDescription("guest:" + guest);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return json({ ok: true, id: file.getId() });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function listPhotos_() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var photos = [];
  while (files.hasNext()) {
    var file = files.next();
    var mime = file.getMimeType() || "";
    if (mime.indexOf("image/") !== 0) continue;
    var description = file.getDescription() || "";
    var guest = description.indexOf("guest:") === 0 ? description.slice(6) : "";
    photos.push({
      id: file.getId(),
      name: guest,
      createdAt: file.getDateCreated().toISOString(),
      url: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600",
    });
  }
  photos.sort(function (a, b) {
    return a.createdAt < b.createdAt ? 1 : -1;
  });
  return photos;
}

function cleanName_(value) {
  var name = String(value || "Guest").replace(/[^\w\u4e00-\u9fff .\-]/g, "").trim();
  return name.slice(0, 40) || "Guest";
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
