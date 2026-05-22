/** Ẩn full-screen loading imageFly — gọi sau khi scene + 100% đã xong. */
window.scheduleHideImageFlyLoadOverlay =
  function scheduleHideImageFlyLoadOverlay() {
    var el = document.getElementById("imagefly-load-overlay");
    if (!el) return;
    el.setAttribute("hidden", "");
    el.hidden = true;
    el.setAttribute("aria-busy", "false");
    el.setAttribute("aria-hidden", "true");
  };

window.initImageFlyScene = function initImageFlyScene(options) {
  options = options || {};
  const onProgress =
    typeof options.onProgress === "function" ? options.onProgress : null;
  const onReady = typeof options.onReady === "function" ? options.onReady : null;

  function reportProgress(pct) {
    if (!onProgress) return;
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    try {
      onProgress(clamped);
    } catch (_) {
      /* ignore */
    }
  }

  function finishImageFlyReady() {
    if (typeof window.scheduleHideImageFlyLoadOverlay === "function") {
      window.scheduleHideImageFlyLoadOverlay();
    }
    if (onReady) {
      try {
        onReady();
      } catch (_) {
        /* ignore */
      }
    }
  }

  /** Sau khi UI báo 100%, chờ 1 frame rồi gỡ overlay để chắc chắn thấy màn imageFly. */
  function afterFullProgressThenFinish() {
    reportProgress(100);
    window.requestAnimationFrame(function () {
      finishImageFlyReady();
    });
  }

  /**
   * Tránh gọi init 2 lần (double tap / sự kiện trùng): lần sau không được
   * giả 100% hay ẩn overlay — lần đầu vẫn đang load async phía dưới.
   */
  if (window.__imageFlySceneStarted) {
    if (onReady) {
      try {
        onReady();
      } catch (_) {
        /* ignore */
      }
    }
    return;
  }
  const canvasEl = document.getElementById("canvas");
  if (!canvasEl || typeof THREE === "undefined") {
    afterFullProgressThenFinish();
    return;
  }
  window.__imageFlySceneStarted = true;

  function setSRGBTexture(texture) {
    if (THREE.SRGBColorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    } else if ("encoding" in texture) {
      texture.encoding = THREE.sRGBEncoding;
    }
  }

  let mouseX = 0;
  let mouseY = 0;
  let halfWidth = window.innerWidth / 2;
  let halfHeight = window.innerHeight / 2;
  const CAMERA_BASE_Z = 120;

  let renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: true,
    alpha: true,
    /* Giúp canvas phía trên chồng đúng lên WebGL nền (sao + bánh) */
    premultipliedAlpha: false,
  });

  renderer.setClearColor(0x000000, 0);
  canvasEl.style.background = "transparent";
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  let camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    2000,
  );

  camera.position.z = CAMERA_BASE_Z;

  let scene = new THREE.Scene();

  let ambLight = new THREE.AmbientLight(0xffffff, 0.78);
  let pointLight = new THREE.PointLight(0xffffff, 1.72, 2000, 2);
  let fillLight = new THREE.PointLight(0xe8f8ff, 1.12, 2400, 2);

  pointLight.position.set(40, 230, -440);
  fillLight.position.set(-240, -130, -320);

  scene.add(ambLight);
  scene.add(pointLight);
  scene.add(fillLight);

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const MAX_CUBE_SCALE = 0.96;
  const MAX_BLESSING_SCALE = 1.12;
  const RESET_Z_THRESHOLD = CAMERA_BASE_Z - 120;
  /** z càng xa (âm lớn) → scale càng nhỏ lúc spawn = có độ sâu; vẫn phóng tới MAX */
  const Z_SPAWN_MIN = -1800;
  const Z_SPAWN_MAX = -300;
  /** Giữ khoảng cách z giữa các lần spawn giống lúc mới vào (trước đây chỉ trừ i*8 lúc build, reset thì mất → cảnh dồn/thưa dần). */
  const LANE_Z_STEP = 8;
  const INITIAL_CUBE_COUNT = 24;
  const INITIAL_BLESSING_COUNT = 28;
  /** Giữ mật độ lâu dài: bơm thêm khi thiếu so với trần */
  const MAX_CUBE_COUNT = 32;
  const MAX_BLESSING_COUNT = 40;
  const BOOST_INTERVAL_MS = 12000;
  const BOOST_CUBES_EACH = 2;
  const BOOST_BLESSINGS_EACH = 3;
  const previewData = window.__HB_PREVIEW_DATA || null;
  const previewImages = Array.isArray(previewData?.book?.images)
    ? previewData.book.images
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (
            item &&
            typeof item === "object" &&
            typeof item.url === "string"
          ) {
            return item.url.trim();
          }
          return "";
        })
        .filter(Boolean)
    : [];
  const IMAGE_CANDIDATES = previewImages.length
    ? previewImages.map((url) => [url])
    : [
        ["./img/Ảnh 1.jpg"],
        ["./img/ẢNh 2.jpg"],
        ["./img/Ảnh 3.jpg"],
        ["./img/Ảnh 4.jpg"],
        ["./img/Ảnh 5.jpg"],
        ["./img/Ảnh 6.jpg"],
        ["./img/Ảnh 7.jpg"],
        ["./img/Ảnh 8.jpg"],
      ];

  const previewWishes = Array.isArray(previewData?.finalGift?.wishes)
    ? previewData.finalGift.wishes
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];
  const BLESSING_MESSAGES = previewWishes.length
    ? previewWishes
    : ["Happy Birthday 💕", "Yêu em nhất ❤️", "Tuổi mới thật hạnh phúc 💖"];

  function setProps(mesh) {
    mesh.vx = random(-0.04, 0.04);
    mesh.vy = random(-0.04, 0.04);
    mesh.vz = random(0.88, 1.65);
    mesh.vs = random(0.0014, 0.0049);
    mesh.vrx = random(-0.012, 0.012);
    mesh.vry = random(-0.012, 0.012);
    const lane =
      typeof mesh.userData.laneIndex === "number" ? mesh.userData.laneIndex : 0;
    const zLo = Z_SPAWN_MIN + lane * LANE_Z_STEP;
    const zBase =
      zLo <= Z_SPAWN_MAX
        ? random(zLo, Z_SPAWN_MAX)
        : random(Z_SPAWN_MIN, Z_SPAWN_MAX);
    const zFinal = zBase - lane * LANE_Z_STEP;
    const depthSpan = Z_SPAWN_MAX - Z_SPAWN_MIN;
    const depthT = Math.max(0, Math.min(1, (zFinal - Z_SPAWN_MIN) / depthSpan));
    const s0 = (0.13 + depthT * 0.4) * random(0.88, 1.08);
    mesh.scale.set(s0, s0, s0);
    const distance = CAMERA_BASE_Z - zFinal;
    const fovInRad = (camera.fov * Math.PI) / 180;
    const viewHeight = 2 * Math.tan(fovInRad / 2) * distance;
    const viewWidth = viewHeight * camera.aspect;
    mesh.position.set(
      random(-viewWidth * 0.5, viewWidth * 0.5),
      random(-viewHeight * 0.5, viewHeight * 0.5),
      zFinal,
    );
  }

  const BLESSING_FONT_FAMILY = '"Pacifico-Regular", cursive';

  function createBlessingTexture(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 118;
    const font = `${fontSize}px ${BLESSING_FONT_FAMILY}`;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const w = Math.ceil(metrics.width) + 148;
    const h = Math.ceil(fontSize * 2.08);
    canvas.width = w;
    canvas.height = h;
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const cx = w / 2;
    const cy = h / 2;

    ctx.shadowColor = "rgba(255, 105, 180, 0.9)";
    ctx.shadowBlur = 42;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#ff5fa8";
    ctx.fillText(text, cx, cy);

    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 182, 225, 0.95)";
    ctx.fillStyle = "#ffb6d9";
    ctx.fillText(text, cx, cy);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffe4f3";
    ctx.fillText(text, cx, cy);

    const texture = new THREE.CanvasTexture(canvas);
    setSRGBTexture(texture);
    texture.needsUpdate = true;
    return { texture, cssWidth: w, cssHeight: h };
  }

  function setPropsSprite(sprite) {
    sprite.vx = random(-0.012, 0.012);
    sprite.vy = random(-0.012, 0.012);
    sprite.vz = random(0.34, 0.55);
    sprite.vs = random(0.00048, 0.00175);
    const lane =
      typeof sprite.userData.laneIndex === "number"
        ? sprite.userData.laneIndex
        : 0;
    const zLo = Z_SPAWN_MIN + lane * LANE_Z_STEP;
    const zBase =
      zLo <= Z_SPAWN_MAX
        ? random(zLo, Z_SPAWN_MAX)
        : random(Z_SPAWN_MIN, Z_SPAWN_MAX);
    const zFinal = zBase - lane * LANE_Z_STEP;
    const depthSpan = Z_SPAWN_MAX - Z_SPAWN_MIN;
    const depthT = Math.max(0, Math.min(1, (zFinal - Z_SPAWN_MIN) / depthSpan));
    sprite.userData.floatScale = (0.18 + depthT * 0.52) * random(0.9, 1.06);
    const distance = CAMERA_BASE_Z - zFinal;
    const fovInRad = (camera.fov * Math.PI) / 180;
    const viewHeight = 2 * Math.tan(fovInRad / 2) * distance;
    const viewWidth = viewHeight * camera.aspect;
    sprite.position.set(
      random(-viewWidth * 0.5, viewWidth * 0.5),
      random(-viewHeight * 0.5, viewHeight * 0.5),
      zFinal,
    );
    const f = sprite.userData.floatScale;
    sprite.scale.set(sprite.userData.baseSX * f, sprite.userData.baseSY * f, 1);
    sprite.material.rotation = 0;
  }

  function createFallbackTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#12343a");
    gradient.addColorStop(1, "#2a8ca1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 232, 232);
    const tex = new THREE.CanvasTexture(canvas);
    setSRGBTexture(tex);
    tex.needsUpdate = true;
    return tex;
  }

  /** Ảnh JPEG/PNG từ TextureLoader: image là HTMLImageElement có kích thước. */
  function isUsableImageTexture(texture) {
    const img = texture && texture.image;
    if (!(img instanceof HTMLImageElement)) return false;
    return img.naturalWidth > 0 && img.naturalHeight > 0;
  }

  /**
   * Cloudflare R2 + Vary:Origin đôi khi cache nhầm bản response không có ACAO.
   * Thêm query cố định theo phiên để tránh dùng cache cũ.
   */
  const R2_CORS_CACHE_BUST = String(Date.now());

  function withR2CorsCacheBust(href) {
    try {
      const u = new URL(href);
      if (!/\.r2\.dev$/i.test(u.hostname)) return href;
      u.searchParams.set("__hb_cb", R2_CORS_CACHE_BUST);
      return u.href;
    } catch (_) {
      return href;
    }
  }

  function textureRequestUrl(url) {
    const s = String(url || "").trim();
    if (/^(data:|blob:)/i.test(s)) return s;
    const proxyPrefix = String(window.__HB_MEDIA_PROXY_URL || "").trim();
    if (proxyPrefix) {
      try {
        if (/^https?:\/\//i.test(s)) {
          const abs = new URL(s);
          if (abs.origin !== window.location.origin) {
            return proxyPrefix + encodeURIComponent(abs.href);
          }
        }
      } catch (e) {
        /* giữ URL gốc */
      }
    }
    return s;
  }

  function finalizeLoadedTexture(texture) {
    setSRGBTexture(texture);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = maxAnisotropy;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }

  function loadTextureWithLoader(src, useAnonymousCrossOrigin) {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      if (useAnonymousCrossOrigin) loader.setCrossOrigin("anonymous");
      loader.load(
        src,
        (texture) => resolve(finalizeLoadedTexture(texture)),
        undefined,
        () => resolve(null),
      );
    });
  }

  /**
   * Cross-origin (R2): thử TextureLoader trước, rồi fetch+blob (no-store + cache-bust URL).
   */
  async function loadTexture(url) {
    const resolvedUrl = textureRequestUrl(url);
    if (!resolvedUrl) return null;

    if (/^(data:|blob:)/i.test(resolvedUrl)) {
      const t = await loadTextureWithLoader(resolvedUrl, true);
      return isUsableImageTexture(t) ? t : null;
    }

    let absUrl;
    try {
      absUrl = new URL(resolvedUrl, window.location.href);
    } catch (_) {
      return null;
    }

    const isHttpCrossOrigin =
      (absUrl.protocol === "http:" || absUrl.protocol === "https:") &&
      absUrl.origin !== window.location.origin;

    const hrefForCors = isHttpCrossOrigin
      ? withR2CorsCacheBust(absUrl.href)
      : absUrl.href;

    if (isHttpCrossOrigin) {
      const tImg = await loadTextureWithLoader(hrefForCors, true);
      if (isUsableImageTexture(tImg)) return tImg;

      try {
        const res = await fetch(hrefForCors, {
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
          const t = await loadTextureWithLoader(objectUrl, false);
          if (isUsableImageTexture(t)) return t;
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (e) {
        console.warn("[imageFly] fetch+blob texture:", hrefForCors, e);
      }

      const tLast = await loadTextureWithLoader(absUrl.href, true);
      return isUsableImageTexture(tLast) ? tLast : null;
    }

    const t2 = await loadTextureWithLoader(absUrl.href, true);
    return isUsableImageTexture(t2) ? t2 : null;
  }

  async function loadFirstAvailableTexture(candidates) {
    for (const candidate of candidates) {
      const texture = await loadTexture(candidate);
      if (isUsableImageTexture(texture)) return texture;
    }
    return createFallbackTexture();
  }

  let group = new THREE.Group();

  let loadedTexturesShared = [];
  const BLESSING_SCALE_FACTOR = 0.162;
  let nextCubeLane = 0;
  let nextBlessingLane = 0;
  let lastBoostT = 0;

  function addCubeAtLane(laneIndex) {
    if (!loadedTexturesShared.length) return;
    const size = random(36, 72);
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Chọn ngẫu nhiên ảnh cho từng mặt trong số các ảnh đã tải
    const faceMaterials = [];
    for (let i = 0; i < 6; i++) {
      const texture = loadedTexturesShared[Math.floor(random(0, loadedTexturesShared.length))];
      faceMaterials.push(
        new THREE.MeshBasicMaterial({
          map: texture,
        })
      );
    }
    
    const mesh = new THREE.Mesh(geometry, faceMaterials);
    mesh.userData.laneIndex = laneIndex;
    mesh.userData.isFlyCube = true;
    setProps(mesh);
    group.add(mesh);
  }

  function addBlessingAtLane(laneIndex) {
    const text = BLESSING_MESSAGES[laneIndex % BLESSING_MESSAGES.length];
    const { texture, cssWidth, cssHeight } = createBlessingTexture(text);
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.userData.baseSX = cssWidth * BLESSING_SCALE_FACTOR;
    sprite.userData.baseSY = cssHeight * BLESSING_SCALE_FACTOR;
    sprite.renderOrder = 1;
    sprite.userData.laneIndex = laneIndex;
    setPropsSprite(sprite);
    group.add(sprite);
  }

  function boostPopulationIfNeeded() {
    if (!loadedTexturesShared.length) return;
    const cubes = group.children.filter((o) => !(o instanceof THREE.Sprite));
    const sprites = group.children.filter((o) => o instanceof THREE.Sprite);
    const needC = MAX_CUBE_COUNT - cubes.length;
    if (needC > 0) {
      const n = Math.min(BOOST_CUBES_EACH, needC);
      for (let j = 0; j < n; j++) {
        addCubeAtLane(nextCubeLane++);
      }
    }
    const needB = MAX_BLESSING_COUNT - sprites.length;
    if (needB > 0) {
      const n = Math.min(BOOST_BLESSINGS_EACH, needB);
      for (let j = 0; j < n; j++) {
        addBlessingAtLane(nextBlessingLane++);
      }
    }
  }

  async function buildCubes() {
    const slots = IMAGE_CANDIDATES.length || 1;
    const textures = [];
    let done = 0;
    for (const candidates of IMAGE_CANDIDATES) {
      textures.push(await loadFirstAvailableTexture(candidates));
      done++;
      reportProgress((done / slots) * 72);
    }

    loadedTexturesShared = textures.filter(Boolean);
    if (!loadedTexturesShared.length) {
      loadedTexturesShared = [createFallbackTexture()];
    }

    nextCubeLane = 0;
    for (let i = 0; i < INITIAL_CUBE_COUNT; i++) {
      addCubeAtLane(nextCubeLane++);
    }
  }

  function buildBlessings() {
    nextBlessingLane = 0;
    for (let i = 0; i < INITIAL_BLESSING_COUNT; i++) {
      addBlessingAtLane(nextBlessingLane++);
    }
  }

  scene.add(group);

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const debrisRoots = [];
  let debrisLastT = null;
  const SHARD_BURST_MULT = 0.48;
  const SHARD_LIFE_MS = 3400;
  const SHARD_FADE_START_MS = 1800;

  /** Thứ tự mặt khớp BoxGeometry r128: +x, -x, +y, -y, +z, -z */
  function shatterCube(mesh) {
    if (!mesh.userData.isFlyCube) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (
      mats.length < 6 ||
      !mesh.geometry ||
      mesh.geometry.type !== "BoxGeometry"
    ) {
      return;
    }

    mesh.updateMatrixWorld(true);
    const wPos = new THREE.Vector3();
    const wQuat = new THREE.Quaternion();
    const wSca = new THREE.Vector3();
    mesh.matrixWorld.decompose(wPos, wQuat, wSca);

    const size = mesh.geometry.parameters.width;
    const h = size / 2;

    mesh.userData.isFlyCube = false;
    group.remove(mesh);
    mesh.geometry.dispose();

    const root = new THREE.Group();
    root.position.copy(wPos);
    root.quaternion.copy(wQuat);
    root.scale.copy(wSca);
    scene.add(root);

    const faceSetup = [
      {
        pos: new THREE.Vector3(h, 0, 0),
        rot: new THREE.Euler(0, -Math.PI / 2, 0),
      },
      {
        pos: new THREE.Vector3(-h, 0, 0),
        rot: new THREE.Euler(0, Math.PI / 2, 0),
      },
      {
        pos: new THREE.Vector3(0, h, 0),
        rot: new THREE.Euler(Math.PI / 2, 0, 0),
      },
      {
        pos: new THREE.Vector3(0, -h, 0),
        rot: new THREE.Euler(-Math.PI / 2, 0, 0),
      },
      { pos: new THREE.Vector3(0, 0, h), rot: new THREE.Euler(0, 0, 0) },
      { pos: new THREE.Vector3(0, 0, -h), rot: new THREE.Euler(0, Math.PI, 0) },
    ];

    const born = performance.now();
    const faces = [];

    for (let i = 0; i < 6; i++) {
      const mat = mats[i].clone();
      mat.transparent = true;
      mat.opacity = 1;
      mat.depthWrite = true;
      const geo = new THREE.PlaneGeometry(size, size);
      const faceMesh = new THREE.Mesh(geo, mat);
      const cfg = faceSetup[i];
      faceMesh.position.copy(cfg.pos);
      faceMesh.rotation.copy(cfg.rot);
      root.add(faceMesh);

      const localDir = cfg.pos.clone().normalize();
      faces.push({
        mesh: faceMesh,
        localDir,
        speed: 0.82 + Math.random() * 1.2,
        avx: random(-0.026, 0.026),
        avy: random(-0.026, 0.026),
        avz: random(-0.02, 0.02),
      });
    }

    debrisRoots.push({ group: root, faces, born });
  }

  function updateDebris() {
    const now = performance.now();
    if (debrisLastT == null) debrisLastT = now;
    const dt = Math.min(48, now - debrisLastT) / 16.67;
    debrisLastT = now;

    for (let r = debrisRoots.length - 1; r >= 0; r--) {
      const root = debrisRoots[r];
      const age = now - root.born;

      root.faces.forEach((f) => {
        f.mesh.position.addScaledVector(
          f.localDir,
          f.speed * SHARD_BURST_MULT * dt,
        );
        f.mesh.rotation.x += f.avx * dt;
        f.mesh.rotation.y += f.avy * dt;
        f.mesh.rotation.z += f.avz * dt;
      });

      if (age > SHARD_FADE_START_MS) {
        const u = Math.min(
          1,
          (age - SHARD_FADE_START_MS) / (SHARD_LIFE_MS - SHARD_FADE_START_MS),
        );
        const op = Math.max(0, 1 - u);
        root.faces.forEach((f) => {
          f.mesh.material.opacity = op;
        });
      }

      if (age > SHARD_LIFE_MS) {
        scene.remove(root.group);
        root.faces.forEach((f) => {
          f.mesh.geometry.dispose();
          f.mesh.material.dispose();
        });
        debrisRoots.splice(r, 1);
      }
    }
  }

  function onCanvasPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = canvasEl.getBoundingClientRect();
    const rw = rect.width || 1;
    const rh = rect.height || 1;
    pointerNdc.x = ((e.clientX - rect.left) / rw) * 2 - 1;
    pointerNdc.y = -((e.clientY - rect.top) / rh) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const cubes = group.children.filter(
      (c) => c.userData && c.userData.isFlyCube,
    );
    const hits = raycaster.intersectObjects(cubes, false);
    if (hits.length > 0) {
      shatterCube(hits[0].object);
      e.preventDefault();
    }
  }

  function animate() {
    const t = performance.now() * 0.0005;
    const autoX = Math.sin(t * 1.18) * 24;
    const autoY = Math.cos(t * 1.38) * 14;
    camera.position.x += (autoX - camera.position.x) * 0.036;
    camera.position.y += (autoY - camera.position.y) * 0.036;
    camera.lookAt(0, 0, -1000);

    updateDebris();

    const nowBoost = performance.now();
    if (lastBoostT === 0) lastBoostT = nowBoost;
    else if (nowBoost - lastBoostT >= BOOST_INTERVAL_MS) {
      lastBoostT = nowBoost;
      boostPopulationIfNeeded();
    }

    group.children.forEach((obj) => {
      if (obj instanceof THREE.Sprite) {
        if (obj.position.z < RESET_Z_THRESHOLD) {
          obj.position.z += obj.vz;
          obj.position.x += obj.vx;
          obj.position.y += obj.vy;
          obj.material.rotation = 0;
          const nextF = Math.min(
            obj.userData.floatScale + obj.vs,
            MAX_BLESSING_SCALE,
          );
          obj.userData.floatScale = nextF;
          obj.scale.set(
            obj.userData.baseSX * nextF,
            obj.userData.baseSY * nextF,
            1,
          );
        } else {
          setPropsSprite(obj);
        }
      } else if (obj.position.z < RESET_Z_THRESHOLD) {
        obj.rotation.x += obj.vrx;
        obj.rotation.y += obj.vry;
        obj.position.z += obj.vz;
        obj.position.x += obj.vx;
        obj.position.y += obj.vy;
        const nextScale = Math.min(obj.scale.x + obj.vs, MAX_CUBE_SCALE);
        obj.scale.set(nextScale, nextScale, nextScale);
      } else {
        setProps(obj);
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  async function ensureBlessingFontLoaded() {
    try {
      if (document.fonts?.load) {
        await document.fonts.load('118px "Pacifico-Regular"');
      }
    } catch (_) {
      /* ignore */
    }
  }

  buildCubes()
    .then(async () => {
      reportProgress(78);
      await ensureBlessingFontLoaded();
      reportProgress(88);
      buildBlessings();
      reportProgress(96);
      canvasEl.addEventListener("pointerdown", onCanvasPointerDown, {
        passive: false,
      });
      animate();
      afterFullProgressThenFinish();
    })
    .catch((err) => {
      console.error("[imageFly] init:", err);
      afterFullProgressThenFinish();
    });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    halfWidth = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
