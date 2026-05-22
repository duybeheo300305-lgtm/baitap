const body = document.body;

const BOOK_IMAGE_SLOTS = Object.freeze([
  {
    url: "./img/Ảnh 1.jpg",
    alt: "Ảnh album 1",
  },
  {
    url: "./img/ẢNh 2.jpg",
    alt: "Ảnh album 2",
  },
  {
    url: "./img/Ảnh 3.jpg",
    alt: "Ảnh album 3",
  },
  {
    url: "./img/Ảnh 4.jpg",
    alt: "Ảnh album 4",
  },
  {
    url: "./img/Ảnh 5.jpg",
    alt: "Ảnh album 5",
  },
  {
    url: "./img/Ảnh 6.jpg",
    alt: "Ảnh album 6",
  },
  {
    url: "./img/Ảnh 7.jpg",
    alt: "Ảnh album 7",
  },
  {
    url: "./img/Ảnh 8.jpg",
    alt: "Ảnh album 8",
  },
]);

const BOOK_COVER_FRONT = Object.freeze({
  url: "./img/Ảnh Bìa trước.png",
  alt: "Bìa trước album",
});
const BOOK_COVER_BACK = Object.freeze({
  url: "./img/Ảnh bìa sau.jpg",
  alt: "Bìa sau album",
});
let bookImagesFromServer = null;

function syncBookImagesFromPreview() {
  const pd = window.__HB_PREVIEW_DATA || null;
  if (Array.isArray(pd?.book?.images)) {
    bookImagesFromServer = pd.book.images;
  } else {
    bookImagesFromServer = null;
  }
}

function normalizeBookImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          url: item.trim(),
          alt: `Ảnh kỷ niệm ${index + 1}`,
        };
      }
      if (item && typeof item === "object" && typeof item.url === "string") {
        return {
          url: item.url.trim(),
          alt: item.alt ? String(item.alt) : `Ảnh kỷ niệm ${index + 1}`,
        };
      }
      return null;
    })
    .filter((item) => item && item.url);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBookImages() {
  const serverImages = normalizeBookImages(bookImagesFromServer);
  const baseImages = serverImages.length ? serverImages : BOOK_IMAGE_SLOTS;
  return shuffleArray(baseImages);
}

function buildSafeImageUrl(url) {
  return encodeURI(String(url).trim());
}

function ensureEvenImages(images) {
  const safe = Array.isArray(images) ? images.filter(Boolean) : [];
  if (safe.length === 0) return [];
  if (safe.length % 2 === 0) return safe;
  return [...safe, safe[safe.length - 1]];
}

function createBookPage(frontImage, backImage, pageIndex, pageCount) {
  const pageEl = document.createElement("div");
  pageEl.className = "page";
  pageEl.dataset.pageIndex = String(pageIndex);
  pageEl.style.setProperty("--i", pageIndex);

  const frontEl = document.createElement("div");
  frontEl.className = "front";
  const frontImg = document.createElement("img");
  frontImg.src = buildSafeImageUrl(frontImage.url);
  frontImg.alt = frontImage.alt || `Ảnh kỷ niệm ${pageIndex * 2 + 1}`;
  frontImg.loading = "lazy";
  frontImg.decoding = "async";
  frontEl.appendChild(frontImg);

  const backEl = document.createElement("div");
  backEl.className = "back";
  const backImg = document.createElement("img");
  backImg.src = buildSafeImageUrl(backImage.url);
  backImg.alt = backImage.alt || `Ảnh kỷ niệm ${pageIndex * 2 + 2}`;
  backImg.loading = "lazy";
  backImg.decoding = "async";
  backEl.appendChild(backImg);

  if (pageIndex === 0) frontEl.classList.add("cover");
  if (pageIndex === pageCount - 1) backEl.classList.add("cover");

  pageEl.append(frontEl, backEl);
  return pageEl;
}

function renderBook() {
  const bookRoot = document.getElementById("flip-book");
  if (!bookRoot) return;

  const endCta = document.getElementById("album-end-cta");
  if (endCta) endCta.hidden = true;

  const contentImages = ensureEvenImages(getBookImages());
  bookRoot.innerHTML = "";

  document.documentElement.style.setProperty(
    "--book-cover-image",
    `url("${buildSafeImageUrl(BOOK_COVER_FRONT.url)}")`,
  );

  const faces = [BOOK_COVER_FRONT, ...contentImages, BOOK_COVER_BACK];

  const pageCount = Math.max(1, Math.ceil(faces.length / 2));
  bookRoot.dataset.pageCount = String(pageCount);
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const frontImage = faces[pageIndex * 2] || BOOK_COVER_FRONT;
    const backImage = faces[pageIndex * 2 + 1] || BOOK_COVER_BACK;
    bookRoot.appendChild(
      createBookPage(frontImage, backImage, pageIndex, pageCount),
    );
  }

  initFlipBook(bookRoot);
  updateAlbumEndCtaVisibility();
}

function setBookImagesData(images) {
  bookImagesFromServer = images;
  renderBook();
}

window.setBookImagesData = setBookImagesData;

function getFlipBookProgress(elBook) {
  const rawC = elBook?.style?.getPropertyValue("--c")?.trim() ?? "";
  const c = Number.parseInt(rawC, 10);
  const pageCount = Number.parseInt(elBook?.dataset?.pageCount || "", 10);
  return {
    c: Number.isFinite(c) ? c : 0,
    pageCount: Number.isFinite(pageCount) ? pageCount : 0,
  };
}

function updateAlbumEndCtaVisibility() {
  const btn = document.getElementById("album-end-cta");
  const book = document.getElementById("flip-book");
  if (!btn || !book) return;

  if (!body.classList.contains("scene-book")) {
    btn.hidden = true;
    return;
  }

  const { c, pageCount } = getFlipBookProgress(book);
  btn.hidden = !(pageCount > 0 && c === pageCount);
}

function initFlipBook(elBook) {
  if (!elBook) return;
  elBook.style.setProperty("--c", 0);

  if (elBook.dataset.flipBound === "1") return;
  elBook.dataset.flipBound = "1";

  elBook.addEventListener("click", (evt) => {
    if (evt.target.closest("a")) return;
    const pageEl = evt.target.closest(".page");
    if (!pageEl || !elBook.contains(pageEl)) return;

    const idx = Number.parseInt(pageEl.dataset.pageIndex || "", 10);
    if (!Number.isFinite(idx)) return;

    const curr = evt.target.closest(".back") ? idx : idx + 1;
    elBook.style.setProperty("--c", curr);
    updateAlbumEndCtaVisibility();
  });
}

const albumEndCta = document.getElementById("album-end-cta");
if (albumEndCta) {
  albumEndCta.addEventListener("click", () => {
    body.classList.remove("scene-book");
    body.classList.add("scene-letters");
    albumEndCta.hidden = true;
  });
}

const giftPanel = document.querySelector(".panel--giftbox");
const present = giftPanel?.querySelector(".present");
const animateGiftEls = present ? present.querySelectorAll(".animate") : [];

/** Sau khi mở quà: chờ (ms) rồi chuyển màn bánh */
const GIFT_TO_CAKE_DELAY_MS = 1000;
let giftStoryStarted = false;

/**
 * Gọi khi có dữ liệu từ server (fetch/API) để đổi tên dưới "happy birthday!"
 * Ví dụ: setCakeBirthdayName(data.displayName)
 */
function setCakeBirthdayName(name) {
  const text = name == null ? "" : String(name);
  const el = document.getElementById("cake-birthday-name");
  if (el) el.textContent = text;
  const introEl = document.getElementById("intro-cake-birthday-name");
  if (introEl) introEl.textContent = text;
}

window.setCakeBirthdayName = setCakeBirthdayName;

function restartCakeSvg() {
  const svg = document.getElementById("cake");
  if (svg && typeof svg.setCurrentTime === "function") {
    try {
      svg.setCurrentTime(0);
    } catch (_) {
      /* ignore */
    }
  }
}

const cakePanel = document.querySelector(".panel--cake");

let cakePostUiRunId = 0;

/** Sau khi nến rơi xong: gõ chữ (tiêu đề → tên); xong mới hiện nút Tiếp tục */
function setupCakePostAnimUi() {
  if (!cakePanel) return;

  const runId = ++cakePostUiRunId;
  const stale = () => runId !== cakePostUiRunId;

  const btn = document.getElementById("cake-next-btn");
  const textBlock = cakePanel.querySelector(".text");
  const velas = cakePanel.querySelector(".velas");

  cakePanel.classList.remove("cake-candle-done", "cake-btn-ready");

  if (btn) {
    btn.tabIndex = -1;
    btn.setAttribute("aria-hidden", "true");
  }
  if (textBlock) {
    textBlock.setAttribute("aria-hidden", "true");
    textBlock.removeAttribute("aria-live");
  }

  const revealButton = () => {
    if (stale()) return;
    cakePanel.classList.add("cake-btn-ready");
    if (btn) {
      btn.removeAttribute("tabindex");
      btn.removeAttribute("aria-hidden");
    }
  };

  const beginCakeTypewriter = () => {
    if (stale() || cakePanel.classList.contains("cake-candle-done")) return;

    const h1 = cakePanel.querySelector(".text h1");
    const nameEl = document.getElementById("cake-birthday-name");
    if (!h1 || !nameEl) {
      cakePanel.classList.add("cake-candle-done");
      if (textBlock) {
        textBlock.removeAttribute("aria-hidden");
        textBlock.setAttribute("aria-live", "polite");
      }
      revealButton();
      return;
    }

    const titleFull = h1.textContent.trim();
    const nameFull = nameEl.textContent.trim();

    h1.textContent = "";
    nameEl.textContent = "";

    cakePanel.classList.add("cake-candle-done");
    if (textBlock) {
      textBlock.removeAttribute("aria-hidden");
      textBlock.setAttribute("aria-live", "polite");
    }

    const msChar = 52;
    const after = (fn, ms) => {
      window.setTimeout(() => {
        if (!stale()) fn();
      }, ms);
    };

    let ti = 0;
    const typeTitle = () => {
      if (stale()) return;
      h1.classList.add("cake-type-caret");
      if (ti < titleFull.length) {
        h1.textContent += titleFull.charAt(ti);
        ti += 1;
        after(typeTitle, msChar);
      } else {
        h1.classList.remove("cake-type-caret");
        after(typeName, 320);
      }
    };

    let ni = 0;
    const typeName = () => {
      if (stale()) return;
      nameEl.classList.add("cake-type-caret");
      if (ni < nameFull.length) {
        nameEl.textContent += nameFull.charAt(ni);
        ni += 1;
        after(typeName, msChar);
      } else {
        nameEl.classList.remove("cake-type-caret");
        revealButton();
      }
    };

    if (titleFull.length) typeTitle();
    else if (nameFull.length) typeName();
    else revealButton();
  };

  const onCandleEnd = (e) => {
    if (e.animationName !== "cake-candle-in") return;
    velas.removeEventListener("animationend", onCandleEnd);
    beginCakeTypewriter();
  };

  if (velas) {
    velas.style.animation = "none";
    void velas.offsetWidth;
    velas.style.removeProperty("animation");
    velas.addEventListener("animationend", onCandleEnd);
  }

  /* 5s delay + 500ms nến (cake-candle-in) + dự phòng */
  window.setTimeout(() => {
    if (stale()) return;
    velas?.removeEventListener("animationend", onCandleEnd);
    beginCakeTypewriter();
  }, 5800);
}

function openGiftAndShowCake() {
  if (giftStoryStarted) return;
  giftStoryStarted = true;

  animateGiftEls.forEach((item) => item.classList.add("run"));

  if (typeof confetti === "function") {
    confetti({
      origin: { x: 0.5, y: 0.55 },
      particleCount: 42,
      spread: 60,
      ticks: 55,
      zIndex: 100,
    });
  }

  setTimeout(() => {
    body.classList.remove("scene-gift");
    body.classList.add("scene-cake");
    requestAnimationFrame(() => {
      restartCakeSvg();
      setupCakePostAnimUi();
    });
  }, GIFT_TO_CAKE_DELAY_MS);

  setTimeout(() => {
    animateGiftEls.forEach((item) => item.classList.remove("run"));
  }, 6000);
}

const cakeNextBtn = document.getElementById("cake-next-btn");

if (cakeNextBtn) {
  cakeNextBtn.addEventListener("click", () => {
    body.classList.remove("scene-cake");
    body.classList.add("scene-book");
    renderBook();
  });
}

if (giftPanel && present) {
  giftPanel.addEventListener("click", () => {
    openGiftAndShowCake();
  });
  present.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGiftAndShowCake();
    }
  });
  present.setAttribute("tabindex", "0");
  present.setAttribute("role", "button");
  present.setAttribute("aria-label", "Mở hộp quà");
}

function runMainAfterGiftDataReady() {
  syncBookImagesFromPreview();
  const pd = window.__HB_PREVIEW_DATA || null;
  if (pd?.intro?.recipientName) {
    setCakeBirthdayName(pd.intro.recipientName);
  }
  renderBook();
}

if (window.__HB_GIFT_LOAD_PROMISE) {
  window.__HB_GIFT_LOAD_PROMISE.finally(() => {
    runMainAfterGiftDataReady();
  });
} else {
  runMainAfterGiftDataReady();
}
