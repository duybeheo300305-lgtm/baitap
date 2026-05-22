/**
 * Nền bánh kem 3D (particle) cho màn Image Fly.
 * Gọi sau khi hiện #image-fly-screen; cần THREE (r128) và #cake-background.
 */
window.initCakeFlyBackground = function initCakeFlyBackground() {
  if (window.__cakeFlyBgStarted) return;
  if (!document.getElementById("cake-background") || typeof THREE === "undefined") return;
  window.__cakeFlyBgStarted = true;
(function () {
        let scene,
          camera,
          renderer,
          cakeParticles,
          starField,
          flameParticles,
          decorations,
          candleBody;
        let flameOrigins,
          flamePhases,
          flameHFactor,
          flameTheta,
          flameColorsOrig,
          flameLight,
          flameGlowMesh;
        const particleCount = 18000;
        const flameCount = 1000;
        const decoCount = 6000;

        const palette = { main: 0xff8eb8, deco: 0xe91e8c };

        function init() {
          scene = new THREE.Scene();
          camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
          );
          camera.position.set(0, 2, 12);

          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          });
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setClearColor(0x050210, 1);
          const bgHost = document.getElementById("cake-background");
          bgHost.appendChild(renderer.domElement);
          renderer.domElement.style.cssText =
            "display:block;width:100%;height:100%;position:absolute;inset:0;";

          createCake();
          createDecorations();
          createCandleBody();
          createFlame();
          createFlameLight();
          createStarField();

          window.addEventListener("resize", onWindowResize, false);
          animate();
        }

        function createCake() {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(particleCount * 3);
          const colors = new Float32Array(particleCount * 3);
          const colorObj = new THREE.Color();

          for (let i = 0; i < particleCount; i++) {
            let x, y, z;
            const rand = Math.random();
            if (rand < 0.6) {
              const r = 3.5 + Math.random() * 0.4;
              const theta = Math.random() * Math.PI * 2;
              x = Math.cos(theta) * r;
              z = Math.sin(theta) * r;
              y = (Math.random() - 0.5) * 2.8 - 1.2;
            } else {
              const r = 2.4 + Math.random() * 0.3;
              const theta = Math.random() * Math.PI * 2;
              x = Math.cos(theta) * r;
              z = Math.sin(theta) * r;
              y = (Math.random() - 0.5) * 2.2 + 1.3;
            }
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            colorObj.setHex(palette.main);
            colors[i * 3] = colorObj.r + (Math.random() - 0.5) * 0.1;
            colors[i * 3 + 1] = colorObj.g + (Math.random() - 0.5) * 0.1;
            colors[i * 3 + 2] = colorObj.b + (Math.random() - 0.5) * 0.1;
          }
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          cakeParticles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
              size: 0.05,
              vertexColors: true,
              transparent: true,
              opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }),
          );
          scene.add(cakeParticles);
        }

        function createDecorations() {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(decoCount * 3);
          const colors = new Float32Array(decoCount * 3);
          const colorObj = new THREE.Color();

          for (let i = 0; i < decoCount; i++) {
            const layer = Math.random() > 0.5 ? -2.6 : 0.2;
            const r = layer < 0 ? 3.95 : 2.75;
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = layer + Math.sin(theta * 12) * 0.15;
            positions[i * 3 + 2] = Math.sin(theta) * r;
            colorObj.setHex(palette.deco);
            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
          }
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          decorations = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
              size: 0.07,
              vertexColors: true,
              blending: THREE.AdditiveBlending,
            }),
          );
          scene.add(decorations);
        }

        function createCandleBody() {
          const geometry = new THREE.BufferGeometry();
          const count = 600;
          const positions = new Float32Array(count * 3);
          const colors = new Float32Array(count * 3);

          for (let i = 0; i < count; i++) {
            const r = 0.08 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = 2.5 + Math.random() * 1.0;
            positions[i * 3 + 2] = Math.sin(theta) * r;

            colors[i * 3] = 0.9;
            colors[i * 3 + 1] = 0.95;
            colors[i * 3 + 2] = 1.0;
          }
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          candleBody = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
              size: 0.03,
              vertexColors: true,
              transparent: true,
              opacity: 0.6,
            }),
          );
          scene.add(candleBody);
        }

        function createFlame() {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(flameCount * 3);
          const colors = new Float32Array(flameCount * 3);
          flameOrigins = new Float32Array(flameCount * 3);
          flamePhases = new Float32Array(flameCount);
          flameHFactor = new Float32Array(flameCount);
          flameTheta = new Float32Array(flameCount);

          for (let i = 0; i < flameCount; i++) {
            const h = Math.random();
            const r = Math.max(0, (1 - h) * 0.12);
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r * Math.sqrt(Math.random());
            const y = 3.5 + h * 0.7;
            const z = Math.sin(angle) * r * Math.sqrt(Math.random());

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            flameOrigins[i * 3] = x;
            flameOrigins[i * 3 + 1] = y;
            flameOrigins[i * 3 + 2] = z;
            flamePhases[i] = Math.random() * Math.PI * 2;
            flameHFactor[i] = h;
            flameTheta[i] = angle;

            const colorObj = new THREE.Color();
            if (h < 0.15) {
              colorObj.setHex(0x3366ff);
            } else if (h < 0.5) {
              colorObj.setHex(0xffffdd);
            } else if (h < 0.85) {
              colorObj.setHex(0xffaa00);
            } else {
              colorObj.setHex(0xff3300);
            }
            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
          }

          flameColorsOrig = new Float32Array(colors);

          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

          flameParticles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
              size: 0.05,
              vertexColors: true,
              transparent: true,
              blending: THREE.AdditiveBlending,
              opacity: 0.9,
            }),
          );
          scene.add(flameParticles);
        }

        function createFlameLight() {
          flameLight = new THREE.PointLight(0xffddaa, 0.52, 14, 1.8);
          flameLight.position.set(0, 3.82, 0);
          scene.add(flameLight);
          const glowGeo = new THREE.SphereGeometry(0.14, 16, 16);
          const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffeedd,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          flameGlowMesh = new THREE.Mesh(glowGeo, glowMat);
          flameGlowMesh.position.copy(flameLight.position);
          scene.add(flameGlowMesh);
        }

        function createStarField() {
          const geometry = new THREE.BufferGeometry();
          const n = 5200;
          const positions = new Float32Array(n * 3);
          for (let i = 0; i < n; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
          }
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          starField = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
              color: 0xc8d4ff,
              size: 0.048,
              transparent: true,
              opacity: 0.92,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            }),
          );
          scene.add(starField);
        }

        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
          requestAnimationFrame(animate);
          const speed = 0.005;
          const t = performance.now() * 0.001;
          cakeParticles.rotation.y += speed;
          decorations.rotation.y += speed;
          candleBody.rotation.y += speed;

          const gust =
            Math.sin(t * 0.88) * 0.042 + Math.sin(t * 0.41 + 1.1) * 0.018;
          const gustZ =
            Math.cos(t * 0.76 + 0.4) * 0.028 + Math.sin(t * 1.05) * 0.012;
          const fPos = flameParticles.geometry.attributes.position.array;
          const fCol = flameParticles.geometry.attributes.color.array;

          const coreX =
            gust * 0.55 +
            Math.sin(t * 2.9 + 0.7) * 0.045 +
            Math.sin(t * 4.2) * 0.018;
          const coreY =
            3.84 + Math.sin(t * 3.4) * 0.035 + Math.sin(t * 6.1 + 1.2) * 0.014;
          const coreZ =
            gustZ * 0.55 +
            Math.cos(t * 2.5 + 0.3) * 0.04 +
            Math.cos(t * 5.0) * 0.016;
          flameLight.position.set(coreX, coreY, coreZ);
          flameLight.intensity =
            0.46 +
            Math.sin(t * 5.8 + 0.4) * 0.09 +
            Math.sin(t * 10.2) * 0.045 +
            Math.sin(t * 2.1 + gust * 8) * 0.05;
          const glowPulse =
            1 + Math.sin(t * 5.2) * 0.12 + Math.sin(t * 8.4 + 0.5) * 0.06;
          flameGlowMesh.position.set(coreX, coreY, coreZ);
          flameGlowMesh.scale.setScalar(glowPulse);
          flameGlowMesh.material.opacity =
            0.17 + Math.sin(t * 5.9 + 0.3) * 0.055 + Math.sin(t * 11) * 0.028;

          for (let i = 0; i < flameCount; i++) {
            const h = flameHFactor[i];
            const ph = flamePhases[i];
            const theta = flameTheta[i];
            const ox = flameOrigins[i * 3];
            const oy = flameOrigins[i * 3 + 1];
            const oz = flameOrigins[i * 3 + 2];

            const tip = Math.max(0, (h - 0.42) / 0.58);
            const tipCurve = tip * tip;

            const wave =
              Math.sin(theta * 5 + t * 3.1) * 0.052 * tipCurve +
              Math.sin(theta * 9 - t * 3.8 + ph * 0.3) * 0.028 * tipCurve;
            const waveZ =
              Math.cos(theta * 5 + t * 2.7 + 0.6) * 0.046 * tipCurve +
              Math.sin(theta * 6 + t * 2.2) * 0.02 * tipCurve;

            const baseSway = h * h * 0.018;
            const brightBand = h > 0.18 && h < 0.72;
            const brightW = brightBand ? 0.55 + h * 0.45 : 0;
            const glowDrift =
              brightW *
              (Math.sin(t * 4.1 + ph * 1.2) * 0.022 +
                Math.cos(t * 2.8 + theta * 4) * 0.018);
            const glowDriftZ =
              brightW *
              (Math.cos(t * 3.6 + ph) * 0.02 +
                Math.sin(t * 5.2 + theta * 3) * 0.015);
            const glowLift =
              brightW *
              (Math.sin(t * 4.5 + ph * 0.9) * 0.009 +
                Math.sin(t * 7.8 + theta) * 0.004);

            fPos[i * 3] =
              ox +
              gust * tipCurve +
              wave +
              Math.sin(t * 2.3 + ph) * baseSway +
              glowDrift;
            fPos[i * 3 + 1] =
              oy +
              Math.sin(t * 3.2 + ph * 1.5) * 0.011 * tipCurve +
              Math.sin(t * 6.5 + theta) * 0.005 * h +
              glowLift;
            fPos[i * 3 + 2] =
              oz +
              gustZ * tipCurve +
              waveZ +
              Math.cos(t * 2.0 + ph * 1.1) * baseSway * 0.85 +
              glowDriftZ;

            const br = flameColorsOrig[i * 3];
            const bg = flameColorsOrig[i * 3 + 1];
            const bb = flameColorsOrig[i * 3 + 2];
            const lum = 0.299 * br + 0.587 * bg + 0.114 * bb;
            if (lum > 0.55) {
              const flick =
                1 +
                Math.sin(t * 5.5 + ph + theta) * 0.11 +
                Math.sin(t * 9.2 + i * 0.05) * 0.06 +
                Math.sin(t * 3.1 + gust * 6) * 0.05;
              fCol[i * 3] = Math.min(1, br * flick);
              fCol[i * 3 + 1] = Math.min(1, bg * flick);
              fCol[i * 3 + 2] = Math.min(1, bb * flick);
            } else if (h > 0.82) {
              const tipFlick =
                1 + Math.sin(t * 6 + ph) * 0.08 + Math.sin(t * 11) * 0.04;
              fCol[i * 3] = Math.min(1, br * tipFlick);
              fCol[i * 3 + 1] = Math.min(1, bg * tipFlick);
              fCol[i * 3 + 2] = Math.min(1, bb * tipFlick);
            } else {
              fCol[i * 3] = br;
              fCol[i * 3 + 1] = bg;
              fCol[i * 3 + 2] = bb;
            }
          }
          flameParticles.geometry.attributes.position.needsUpdate = true;
          flameParticles.geometry.attributes.color.needsUpdate = true;

          camera.lookAt(0, 1, 0);
          starField.rotation.y += 0.0003;
          renderer.render(scene, camera);
        }

        init();
      })();
};
