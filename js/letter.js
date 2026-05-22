/**
 * Dữ liệu thư từ server (JSON). Ví dụ:
 * { "title": "...", "body": "...", "signature": "..." }
 * - body: mỗi lần xuống dòng sẽ tách thành một đoạn mới để hiển thị dễ đọc hơn.
 * - Mỗi đoạn là <p class="letter__paragraph">, .textContent để tránh XSS.
 */
function renderLetter(data) {
    var title = data && data.title != null ? String(data.title) : "";
    var body = data && data.body != null ? String(data.body) : "";
    var signature = data && data.signature != null ? String(data.signature) : "";
  
    $(".js-letter-title").text(title);
  
    var $bodyEl = $(".js-letter-body");
    $bodyEl.empty();
    var chunks = body.split(/\r?\n+/);
    for (var i = 0; i < chunks.length; i++) {
      var t = chunks[i].replace(/^\s+|\s+$/g, "");
      if (t === "") continue;
      var p = document.createElement("p");
      p.className = "letter__paragraph";
      p.textContent = t;
      $bodyEl.append(p);
    }
  
    $(".js-letter-signature").text(signature);
  }
  
  /**
   * Sau này thay bằng gọi API, ví dụ:
   * return fetch('/api/letter/123').then(function (r) {
   *   if (!r.ok) throw new Error(r.statusText);
   *   return r.json();
   * });
   */
  function startLetterFall($self) {
    if (
      $self.hasClass("letter-revealed-settling") ||
      $self.hasClass("letter-revealed-done")
    ) {
      return;
    }
    var card = $self.find(".envelope__card.open")[0];
    if (!card) {
      $self.addClass("letter-revealed-done");
      return;
    }
    $self.addClass("letter-revealed-settling");
    var fallTimer = window.setTimeout(function () {
      card.removeEventListener("animationend", onFallEnd);
      finishLetterFall($self);
    }, 1300);
  
    function onFallEnd(e) {
      if (e.target !== card) return;
      var name = (e.animationName || "").toLowerCase();
      if (name.indexOf("letterfall") === -1) return;
      window.clearTimeout(fallTimer);
      card.removeEventListener("animationend", onFallEnd);
      finishLetterFall($self);
    }
  
    card.addEventListener("animationend", onFallEnd);
  }
  
  function finishLetterFall($self) {
    var wrap = $self[0];
    if (wrap.classList && wrap.classList.replace) {
      wrap.classList.replace("letter-revealed-settling", "letter-revealed-done");
    } else {
      $self
        .addClass("letter-revealed-done")
        .removeClass("letter-revealed-settling");
    }
  }
  
  function loadLetter() {
    var previewLetter = window.__HB_PREVIEW_DATA?.letter;
    if (previewLetter) {
      return Promise.resolve({
        title:
          previewLetter.title != null ? String(previewLetter.title).trim() : "",
        body: previewLetter.body != null ? String(previewLetter.body) : "",
        signature:
          previewLetter.signature != null
            ? String(previewLetter.signature).trim()
            : "",
      });
    }
    return Promise.resolve({
      title: "Em yêu à,",
      body:
        "Hôm nay là một ngày thật đặc biệt – ngày mà một người tuyệt vời như em xuất hiện trên thế giới này. Anh chỉ muốn nói rằng, gặp được em là điều may mắn nhất trong cuộc đời anh.\n\n" +
        "Chúc em luôn xinh đẹp, hạnh phúc và mãi ở bên anh như bây giờ. Dù sau này có chuyện gì xảy ra, anh vẫn sẽ luôn nắm tay em thật chặt.",
      signature: "Yêu em nhiều hơn mỗi ngày.",
    });
  }

  function isFinalGiftEnabled() {
    return !!window.__HB_PREVIEW_DATA?.finalGift?.enabled;
  }
  
  function whenGiftDataReady(done) {
    if (window.__HB_GIFT_LOAD_PROMISE) {
      window.__HB_GIFT_LOAD_PROMISE.finally(done);
    } else {
      done();
    }
  }

  $(function () {
    whenGiftDataReady(function () {
      loadLetter()
        .then(renderLetter)
        .catch(function () {
          renderLetter({
            title: "Không tải được thư",
            body: "Vui lòng thử lại sau.",
            signature: "",
          });
        });
    });

    function setImageFlyLoadProgress(p) {
      var bar = document.getElementById("imagefly-load-bar");
      var pctEl = document.getElementById("imagefly-load-pct");
      var n = Math.max(0, Math.min(100, Math.round(p)));
      if (bar) bar.style.width = n + "%";
      if (pctEl) pctEl.textContent = n + "%";
    }

    function enterImageFlyFromLetter() {
      document.body.classList.remove("scene-letters");
      document.body.classList.add("scene-imagefly");
      var panel = document.getElementById("image-fly-screen");
      var loadOverlay = document.getElementById("imagefly-load-overlay");
      if (panel) panel.hidden = false;
      if (loadOverlay) {
        loadOverlay.removeAttribute("hidden");
        loadOverlay.hidden = false;
        loadOverlay.setAttribute("aria-busy", "true");
        loadOverlay.setAttribute("aria-hidden", "false");
        setImageFlyLoadProgress(0);
      }
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (typeof window.initCakeFlyBackground === "function") {
            window.initCakeFlyBackground();
          }
          if (typeof window.initImageFlyScene === "function") {
            window.initImageFlyScene({
              onProgress: setImageFlyLoadProgress,
            });
          }
          window.dispatchEvent(new Event("resize"));
        });
      });
    }

    $(".js-letter-cake-fly").on("click keydown", function (event) {
      if (event.type === "keydown") {
        var key = event.key;
        if (key !== "Enter" && key !== " ") return;
      }
      var $env = $(this).closest(".js-open-envelope");
      if (!$env.find(".envelope").hasClass("open")) return;
      if (!isFinalGiftEnabled()) return;
      event.preventDefault();
      event.stopPropagation();
      enterImageFlyFromLetter();
    });

    $(".js-open-envelope").on("click", function (event) {
      event.preventDefault();
      var $self = $(this);
      if ($self.find(".envelope").hasClass("open")) {
        return;
      }
      $self.find(".envelope").addClass("open");
      $self.find(".heart use").attr("xlink:href", "#icon-heart-broken");
      $self.find(".envelope__card").addClass("open");
      /* Căn giữa + rơi chồng thời gian (không chờ hết transition) để liền mạch */
      window.setTimeout(function () {
        $self.addClass("letter-revealed");
        window.setTimeout(function () {
          startLetterFall($self);
        }, 320);
      }, 1280);
    });
  });
