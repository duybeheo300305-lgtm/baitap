(function () {
  const root = document.getElementById("intro-cake-screen");
  const scene = root?.querySelector(".intro-cake-scene");
  const btn = root?.querySelector(".nature-btn");
  if (!root || !scene || !btn) return;

  /** Thời gian mờ lửa (khớp transition .fuego trong introCake.css) */
  const CANDLE_EXTINGUISH_MS = 450;
  /** Sau khi tắt nến xong, chờ thêm bấy nhiêu ms rồi vào album */
  const DELAY_AFTER_CANDLE_MS = 500;

  let leaving = false;

  function syncAria() {
    const out = scene.classList.contains("is-candle-out");
    btn.setAttribute("aria-pressed", out ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      out ? "Đang chuyển vào album" : "Tắt nến và vào album",
    );
  }

  btn.addEventListener("click", () => {
    if (leaving) return;
    leaving = true;
    btn.disabled = true;
    scene.classList.add("is-candle-out");
    syncAria();

    window.setTimeout(() => {
      root.setAttribute("hidden", "");
      document.body.classList.remove(
        "scene-gift",
        "scene-cake",
        "scene-letters",
        "scene-imagefly",
      );
      document.body.classList.add("scene-book");
      leaving = false;
      btn.disabled = false;
      scene.classList.remove("is-candle-out");
      syncAria();
    }, CANDLE_EXTINGUISH_MS + DELAY_AFTER_CANDLE_MS);
  });

  syncAria();
})();
