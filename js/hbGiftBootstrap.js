/**
 * Map bản ghi GET /api/happy-birthday-vips/:id → shape __HB_PREVIEW_DATA (viewer).
 */
(function (global) {
  function normBookImages(images) {
    if (!Array.isArray(images)) return [];
    return images
      .map(function (item, i) {
        if (typeof item === "string") {
          var u = item.trim();
          return u ? { url: u, alt: "Ảnh kỷ niệm " + (i + 1) } : null;
        }
        if (item && typeof item === "object" && typeof item.url === "string") {
          return {
            url: item.url.trim(),
            alt: item.alt
              ? String(item.alt)
              : "Ảnh kỷ niệm " + (i + 1),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  function musicFromRecord(content, record) {
    function pickTrackUrlFromBackgroundMusic(bm) {
      if (!bm || typeof bm !== "object") return "";
      var candidates = [
        bm.path,
        bm.url,
        bm.fileUrl,
        bm.fileURL,
        bm.src,
        bm.link,
        bm.musicUrl,
      ];
      for (var i = 0; i < candidates.length; i++) {
        if (typeof candidates[i] === "string" && candidates[i].trim()) {
          return candidates[i].trim();
        }
      }
      return "";
    }

    if (content && content.music && typeof content.music === "object") {
      return {
        tracks: Array.isArray(content.music.tracks) ? content.music.tracks : [],
        selectedTrackUrl: content.music.selectedTrackUrl || "",
      };
    }
    var intro = (content && content.intro) || (record && record.intro) || {};
    var bm = intro.backgroundMusic;
    var bgTrack = pickTrackUrlFromBackgroundMusic(bm);
    if (bgTrack) {
      return { tracks: [bgTrack], selectedTrackUrl: bgTrack };
    }
    return { tracks: [], selectedTrackUrl: "" };
  }

  global.__HB_mapRecordToViewerPayload = function (record) {
    if (!record || typeof record !== "object") return null;
    var content = record.content;
    if (!content || typeof content !== "object") content = record;

    var intro = content.intro || {};
    var letter = content.letter || {};
    var finalGift = content.finalGift || { enabled: false, wishes: [] };
    var bookImages = normBookImages(
      content.book && content.book.images ? content.book.images : [],
    );
    var recipient =
      intro.recipientName != null ? String(intro.recipientName).trim() : "";

    return {
      intro: { recipientName: recipient },
      music: musicFromRecord(content, record),
      book: { images: bookImages },
      letter: {
        title: letter.title != null ? String(letter.title) : "",
        body: letter.body != null ? String(letter.body) : "",
        signature: letter.signature != null ? String(letter.signature) : "",
      },
      finalGift: {
        enabled: !!finalGift.enabled,
        wishes: Array.isArray(finalGift.wishes) ? finalGift.wishes : [],
      },
    };
  };

  try {
    var params = new URLSearchParams(global.location.search);
    if (params.get("mode") === "preview" || params.get("mode") === "demo") {
      global.__HB_GIFT_LOAD_PROMISE = Promise.resolve();
      return;
    }
    var id = params.get("id");
    if (id) id = String(id).trim();
    if (!id || global.__HB_PREVIEW_DATA) {
      global.__HB_GIFT_LOAD_PROMISE = Promise.resolve();
      return;
    }
    var BASE =
      global.__HB_API_BASE || "https://hearlyserver.onrender.com";
    var url =
      BASE.replace(/\/$/, "") +
      "/api/happy-birthday-vips/" +
      encodeURIComponent(id.trim());

    global.__HB_GIFT_LOAD_PROMISE = fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
    })
      .then(function (r) {
        return r.json().catch(function () {
          return {};
        });
      })
      .then(function (j) {
        if (!j || !j.success || !j.data) return;
        var mapped = global.__HB_mapRecordToViewerPayload(j.data);
        if (!mapped) return;
        global.__HB_PREVIEW_DATA = mapped;
        if (
          typeof global.setBirthdayMusicData === "function" &&
          mapped.music
        ) {
          global.setBirthdayMusicData(mapped.music);
        }
      })
      .catch(function (e) {
        console.warn("[HB] Không tải được quà theo id:", e);
      });
  } catch (e) {
    global.__HB_GIFT_LOAD_PROMISE = Promise.resolve();
    console.warn("[HB] gift bootstrap:", e);
  }
})(typeof window !== "undefined" ? window : globalThis);
