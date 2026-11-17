/* CASAVEN7 — application logic.
 * Extracted from the single-file build so the Content Security Policy can drop
 * 'unsafe-inline' from script-src. Keep this file as the only place app logic
 * lives: an inline <script> added back to the HTML is refused by the CSP.
 *
 * Loaded as an ES module (<script type="module" src="app.js">), so three.js is
 * imported rather than read off window. That removes the last third-party script
 * from the page: see vendor/three.module.min.js.
 */
import * as THREE from './vendor/three.module.min.js';

(function () {
  'use strict';

  // =========================================================================
  // 1. BRAND CATALOG & CONFIGURATION (CASAVEN7 — ALL SKULL CAPS 50 DH)
  // =========================================================================
  const WHATSAPP_NUMBERS = [
    { international: '212674609122', local: '0674609122' },
    { international: '212779162845', local: '0779162845' },
  ];
  const UNIT_PRICE = 50;

  const STORAGE_KEYS = {
    USERS: 'casaven7_users_v2',
    SESSION: 'casaven7_session_v2',
    SETTINGS: 'casaven7_settings',
    REVIEWS: 'casaven7_reviews_v1',
    WISHLIST: 'casaven7_wishlist_v1',
  };

  const COLORWAYS = {
    black: {
      id: 'black',
      label: 'Obsidian Black',
      swatch: '#0d0d0f',
      knitHex: 0x111114,
      knitCss: '#111114',
      seamCss: '#2c2c32',
      printCss: '#ffffff',
      roughness: 0.62,
    },
    white: {
      id: 'white',
      label: 'Stark White',
      swatch: '#f4f4f5',
      knitHex: 0xf0f0f3,
      knitCss: '#f0f0f3',
      seamCss: '#c8c8d0',
      printCss: '#09090b',
      roughness: 0.60,
    },
    grey: {
      id: 'grey',
      label: 'Heather Grey',
      swatch: '#8e8e96',
      knitHex: 0x92929a,
      knitCss: '#92929a',
      seamCss: '#686870',
      printCss: '#09090b',
      roughness: 0.62,
    },
  };

  const PRODUCTS = [
    {
      id: '212',
      name: '212 Tribal',
      subtitle: 'Signature Moroccan 212 horned tribal emblem on cuff',
      category: 'essential',
      price: UNIT_PRICE,
      colors: ['black', 'white'],
      type: 'vector',
    },
    {
      id: 'swoosh-outline',
      name: 'Swoosh Outline',
      subtitle: 'Crisp hollow athletic swoosh contour on double-stitched band',
      category: 'athletic',
      price: UNIT_PRICE,
      colors: ['black', 'white'],
      type: 'vector',
    },
    {
      id: 'swoosh-solid',
      name: 'Swoosh Solid',
      subtitle: 'Bold solid athletic swoosh mark in high-contrast transfer',
      category: 'athletic',
      price: UNIT_PRICE,
      colors: ['black', 'white'],
      type: 'vector',
    },
    {
      id: 'omerta',
      name: 'Omerta',
      subtitle: 'Old-world blackletter gothic OMERTA typography',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'text',
      text: 'OMERTA',
      svgFont: 'UnifrakturCook, serif',
      fontSize: 27,
      canvasFont: '700 66px "UnifrakturCook", serif',
    },
    {
      id: 'heart',
      name: 'Spiky Heart',
      subtitle: 'Jagged barbed streetwear heart outline on cuff',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'balaclava',
      name: 'Triple Balaclava',
      subtitle: 'Trio of masked ski-mask silhouettes across cuff band',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'lv',
      name: 'Monogram LV',
      subtitle: 'Classic interlocking luxury monogram emblem',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'stwd',
      name: 'STWD.',
      subtitle: 'Bold tilted brush-script STWD. streetwear emblem',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'corteiz',
      name: 'Corteiz',
      subtitle: 'Sharp hand-drawn Corteiz script with twin star crossbars',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'puma',
      name: 'Leaping Cat',
      subtitle: 'Classic leaping feline athletic silhouette on cuff',
      category: 'athletic',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'jordan',
      name: 'Jordan',
      subtitle: 'Iconic airborne Jordan basketball silhouette on cuff',
      category: 'athletic',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'ros',
      name: 'ROS Star Tag',
      subtitle: 'Circled graffiti ROS tag flanked by twin stars',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['white', 'black'],
      type: 'vector',
    },
    {
      id: 'stussy',
      name: 'Stussy Script',
      subtitle: 'Authentic hand-scrawled streetwear signature script',
      category: 'street',
      price: UNIT_PRICE,
      colors: ['black'],
      type: 'vector',
    },
    {
      id: 'ua',
      name: 'UA Performance',
      subtitle: 'Interlocking athletic compression performance emblem',
      category: 'athletic',
      price: UNIT_PRICE,
      colors: ['white', 'black'],
      type: 'vector',
    },
    {
      id: 'blank',
      name: 'Blank Essential',
      subtitle: 'Clean unbranded thermal lycra skull cap with double-stitch cuff',
      category: 'essential',
      price: UNIT_PRICE,
      colors: ['black', 'white', 'grey'],
      type: 'blank',
    },
  ];

  const DEFAULT_REVIEWS = [
    {
      id: 'rev-1',
      username: 'yassine_casa',
      verified: true,
      rating: 5,
      product: '212 Tribal',
      comment: 'Clean compression fit and sharp cuff print. Worn daily in Casa and the stitching holds up solid.',
      date: '14 Nov 2026',
    },
    {
      id: 'rev-2',
      username: 'amine.vfx',
      verified: true,
      rating: 5,
      product: 'Jordan',
      comment: '50 DH for this lycra quality is unbeatable. Fast WhatsApp confirmation and smooth low-profile crown.',
      date: '11 Nov 2026',
    },
    {
      id: 'rev-3',
      username: 'salma_k',
      verified: false,
      rating: 5,
      product: 'Swoosh Outline',
      comment: 'Ordered the Stark White and Obsidian Black pair—both look exact to the 3D preview.',
      date: '08 Nov 2026',
    },
  ];

  // Application State
  const state = {
    activeProductId: '212',
    activeColorId: 'black',
    activeFilter: 'all',
    cardColors: {},
    cart: [],
    wishlist: [],
    autoRotate: true,
    showGrid: true,
    preferredWaIndex: 0,
    currentUser: null,
    reviews: [],
    selectedRating: 5,
  };
  PRODUCTS.forEach((p) => {
    state.cardColors[p.id] = p.colors[0];
  });

  // =========================================================================
  // 2. LOCALSTORAGE HELPERS (ACCOUNTS, WISHLIST, REVIEWS & SETTINGS)
  // =========================================================================
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Ignore storage quota errors safely
    }
  }

  // =======================================================================
  // SECURITY: PASSWORD HASHING (PBKDF2-SHA256 via WebCrypto)
  // A plaintext password is never written to localStorage. Client-side hashing
  // does not make this real authentication - see SECURITY_AUDIT.txt, V-05 -
  // but it stops localStorage from being a readable password dump.
  // =======================================================================
  const PBKDF2_ITERATIONS = 210000;
  const PASSWORD_MIN = 8;
  const PASSWORD_MAX = 128;
  const USERNAME_RE = /^[A-Za-z0-9_.\-]{3,24}$/;
  const COMMENT_MAX = 600;
  const MAX_QTY_PER_LINE = 99;
  const MAX_STORED_REVIEWS = 200;

  function cryptoReady() {
    return typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.getRandomValues === 'function';
  }

  function bytesToHex(bytes) {
    return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    const pairs = String(hex).match(/.{1,2}/g) || [];
    return Uint8Array.from(pairs.map((h) => parseInt(h, 16)));
  }

  async function derivePassword(password, saltHex, iterations) {
    const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
    const iter = Number(iterations) > 0 ? Number(iterations) : PBKDF2_ITERATIONS;
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, keyMaterial, 256
    );
    return { salt: bytesToHex(salt), iterations: iter, hash: bytesToHex(bits) };
  }

  // Length-safe, branch-free hex compare: no early exit to leak how much matched.
  function digestEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || !a.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  async function verifyPassword(user, password) {
    if (!user || typeof password !== 'string' || !password) return false;
    if (user.hash && user.salt) {
      const derived = await derivePassword(password, user.salt, user.iterations);
      return digestEqual(derived.hash, user.hash);
    }
    // Legacy record created before hashing existed: verify once, then upgrade.
    if (typeof user.password === 'string') return user.password === password;
    return false;
  }

  // Replaces any legacy plaintext field with a salted hash.
  async function upgradeLegacyUser(username, password) {
    if (!cryptoReady()) return;
    const users = readJSON(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex((u) => validUsername(u) && u.username.toLowerCase() === username.toLowerCase());
    if (idx === -1 || (users[idx].hash && users[idx].salt)) return;
    const derived = await derivePassword(password);
    delete users[idx].password;
    users[idx].salt = derived.salt;
    users[idx].iterations = derived.iterations;
    users[idx].hash = derived.hash;
    writeJSON(STORAGE_KEYS.USERS, users);
    if (state.currentUser && state.currentUser.username === users[idx].username) {
      state.currentUser = users[idx];
    }
  }

  // Stored records are attacker-writable (any localStorage editor). Never trust shape.
  function validUsername(u) {
    return u && typeof u.username === 'string' && u.username.length > 0;
  }

  // A single malformed entry (null, a number, an unknown id) used to throw inside
  // renderWishlist and abort the whole load handler - no product grid, no 3D, no
  // reviews. Normalise against the real catalogue before anything renders.
  const MAX_WISHLIST = 100;
  function sanitizeWishlist(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
      if (!item || typeof item.id !== 'string') continue;
      const prod = PRODUCTS.find((p) => p.id === item.id);
      if (!prod) continue;
      const color = typeof item.color === 'string' && prod.colors.includes(item.color)
        ? item.color
        : prod.colors[0];
      const key = `${item.id}|${color}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: item.id, color });
      if (out.length >= MAX_WISHLIST) break;
    }
    return out;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadPersistedState() {
    const savedSettings = readJSON(STORAGE_KEYS.SETTINGS, null);
    if (savedSettings) {
      if (typeof savedSettings.autoRotate === 'boolean') state.autoRotate = savedSettings.autoRotate;
      if (typeof savedSettings.showGrid === 'boolean') state.showGrid = savedSettings.showGrid;
      if (savedSettings.preferredWaIndex === 0 || savedSettings.preferredWaIndex === 1) {
        state.preferredWaIndex = savedSettings.preferredWaIndex;
      }
    }

    state.wishlist = sanitizeWishlist(readJSON(STORAGE_KEYS.WISHLIST, []));

    const sessionUsername = readJSON(STORAGE_KEYS.SESSION, null);
    if (typeof sessionUsername === 'string' && sessionUsername) {
      const users = readJSON(STORAGE_KEYS.USERS, []).filter(validUsername);
      const matched = users.find((u) => u.username.toLowerCase() === sessionUsername.toLowerCase());
      if (matched) {
        state.currentUser = matched;
        const userWishlist = sanitizeWishlist(matched.wishlist);
        if (userWishlist.length > 0) {
          state.wishlist = userWishlist;
        }
      }
    }

    const savedReviews = readJSON(STORAGE_KEYS.REVIEWS, null);
    state.reviews = (Array.isArray(savedReviews) && savedReviews.length > 0 ? savedReviews : DEFAULT_REVIEWS.slice())
      .filter((r) => r && typeof r === 'object')
      .slice(0, MAX_STORED_REVIEWS);
  }

  function saveSettings() {
    writeJSON(STORAGE_KEYS.SETTINGS, {
      autoRotate: state.autoRotate,
      showGrid: state.showGrid,
      preferredWaIndex: state.preferredWaIndex,
    });
  }

  function saveReviews() {
    // Cap the stored list: an unbounded array fills the origin quota and breaks the page.
    state.reviews = state.reviews.slice(0, MAX_STORED_REVIEWS);
    writeJSON(STORAGE_KEYS.REVIEWS, state.reviews);
  }

  function saveWishlist() {
    writeJSON(STORAGE_KEYS.WISHLIST, state.wishlist);
    if (state.currentUser) {
      const users = readJSON(STORAGE_KEYS.USERS, []).filter(validUsername);
      const idx = users.findIndex((u) => u.username.toLowerCase() === state.currentUser.username.toLowerCase());
      if (idx !== -1) {
        users[idx].wishlist = state.wishlist.slice();
        writeJSON(STORAGE_KEYS.USERS, users);
        state.currentUser = users[idx];
      }
    }
  }

  // =========================================================================
  // 3. VECTOR GRAPHIC PAINTERS (SHARED BETWEEN 3D CANVAS & 2D SVG CARDS)
  // =========================================================================
  function drawVectorLogoOnCanvas(ctx, id, cx, cy, scale, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (id) {
      case '212': {
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(-46, -18);
        ctx.quadraticCurveTo(-50, 2, -26, 2);
        ctx.lineTo(-26, 18);
        ctx.moveTo(-46, -18);
        ctx.lineTo(-34, -24);
        ctx.moveTo(0, -22);
        ctx.lineTo(0, 22);
        ctx.moveTo(46, -18);
        ctx.quadraticCurveTo(50, 2, 26, 2);
        ctx.lineTo(26, 18);
        ctx.moveTo(46, -18);
        ctx.lineTo(34, -24);
        ctx.stroke();
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-54, 10);
        ctx.quadraticCurveTo(0, 24, 54, 10);
        ctx.stroke();
        break;
      }
      case 'swoosh-outline': {
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.moveTo(-36, -16);
        ctx.bezierCurveTo(-52, 2, -52, 22, -22, 18);
        ctx.bezierCurveTo(6, 14, 48, -2, 64, -8);
        ctx.bezierCurveTo(22, 2, -12, 8, -28, 4);
        ctx.bezierCurveTo(-38, 1, -38, -8, -36, -16);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'swoosh-solid': {
        ctx.beginPath();
        ctx.moveTo(-36, -16);
        ctx.bezierCurveTo(-52, 2, -52, 22, -22, 18);
        ctx.bezierCurveTo(6, 14, 48, -2, 64, -8);
        ctx.bezierCurveTo(22, 2, -12, 8, -28, 4);
        ctx.bezierCurveTo(-38, 1, -38, -8, -36, -16);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'heart': {
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-10, -24);
        ctx.lineTo(-24, -18);
        ctx.lineTo(-34, -24);
        ctx.lineTo(-28, -8);
        ctx.lineTo(-40, -2);
        ctx.lineTo(-24, 8);
        ctx.lineTo(-16, 22);
        ctx.lineTo(0, 30);
        ctx.lineTo(16, 22);
        ctx.lineTo(24, 8);
        ctx.lineTo(40, -2);
        ctx.lineTo(28, -8);
        ctx.lineTo(34, -24);
        ctx.lineTo(24, -18);
        ctx.lineTo(10, -24);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'balaclava': {
        [-42, 0, 42].forEach((ox, idx) => {
          ctx.save();
          ctx.translate(ox, idx === 1 ? 2 : -1);
          ctx.beginPath();
          ctx.moveTo(-15, -8);
          ctx.bezierCurveTo(-15, -24, 15, -24, 15, -8);
          ctx.lineTo(14, 16);
          ctx.quadraticCurveTo(0, 24, -14, 16);
          ctx.closePath();
          ctx.fill();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.ellipse(-6, -6, 4.2, 2.3, -0.15, 0, Math.PI * 2);
          ctx.ellipse(6, -6, 4.2, 2.3, 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        break;
      }
      case 'lv': {
        ctx.lineWidth = 5;
        ctx.font = '700 46px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', -6, 4);
        ctx.fillText('V', 6, -2);
        break;
      }
      case 'stwd': {
        ctx.rotate(-0.18);
        ctx.font = '900 44px "Permanent Marker", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STWD.', 0, 2);
        break;
      }
      case 'corteiz': {
        ctx.font = '700 42px "Permanent Marker", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Corteiz', 0, 2);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-34, -8);
        ctx.lineTo(-22, 8);
        ctx.moveTo(-22, -8);
        ctx.lineTo(-34, 8);
        ctx.moveTo(22, -8);
        ctx.lineTo(34, 8);
        ctx.moveTo(34, -8);
        ctx.lineTo(22, 8);
        ctx.stroke();
        break;
      }
      case 'puma': {
        ctx.beginPath();
        ctx.moveTo(-38, 14);
        ctx.quadraticCurveTo(-12, -2, 22, -12);
        ctx.lineTo(34, -20);
        ctx.lineTo(32, -10);
        ctx.lineTo(44, -6);
        ctx.lineTo(26, -2);
        ctx.quadraticCurveTo(0, 6, -26, 22);
        ctx.lineTo(-34, 18);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-34, 12);
        ctx.quadraticCurveTo(-50, 4, -52, -10);
        ctx.stroke();
        break;
      }
      case 'jordan': {
        ctx.beginPath();
        ctx.arc(-23, -25, 4.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-1, -13, 4.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-20, -22);
        ctx.lineTo(-6, -9);
        ctx.lineTo(3, -8);
        ctx.lineTo(22, -12);
        ctx.lineTo(23, -9);
        ctx.lineTo(4, -3);
        ctx.lineTo(6, 6);
        ctx.lineTo(24, 21);
        ctx.lineTo(29, 20);
        ctx.lineTo(28, 24);
        ctx.lineTo(21, 24);
        ctx.lineTo(2, 10);
        ctx.lineTo(-14, 24);
        ctx.lineTo(-20, 26);
        ctx.lineTo(-21, 23);
        ctx.lineTo(-16, 20);
        ctx.lineTo(-3, 5);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-22, -20);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'ros': {
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(0, 2, 46, 17, -0.08, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '700 32px "Permanent Marker", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ROS', 0, 3);
        break;
      }
      case 'stussy': {
        ctx.font = '700 38px "Permanent Marker", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Stüssy', 0, 2);
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-42, -14);
        ctx.lineTo(42, -16);
        ctx.moveTo(-36, 18);
        ctx.lineTo(38, 15);
        ctx.stroke();
        break;
      }
      case 'ua': {
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.arc(0, -18, 24, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 20, 24, 1.25 * Math.PI, 1.75 * Math.PI);
        ctx.stroke();
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  // =========================================================================
  // 4. PROCEDURAL MICRO-KNIT & THREE.JS 3D SKULL CAP ENGINE
  // =========================================================================
  let scene, camera, renderer, beanieGroup, crownMesh, cuffMesh, seamLinesGroup;
  let microFabricTexture, cuffDiffuseTexture, cuffCanvas, cuffCtx;
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let targetRotY = 0;
  let targetRotX = 0.08;
  let targetCamPos = new THREE.Vector3(0, 0.22, 4.1);

  function createThermalLycraBumpTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      for (let x = 0; x < 512; x += 3) {
        const v = 122 + ((x * 7 + y * 13) % 14);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    return tex;
  }

  function updateCuffTexture() {
    if (!cuffCtx || !cuffDiffuseTexture) return;

    const prod = PRODUCTS.find((p) => p.id === state.activeProductId) || PRODUCTS[0];
    const col = COLORWAYS[state.activeColorId] || COLORWAYS.black;

    const W = cuffCanvas.width;
    const H = cuffCanvas.height;

    cuffCtx.fillStyle = col.knitCss;
    cuffCtx.fillRect(0, 0, W, H);

    cuffCtx.strokeStyle = col.seamCss;
    cuffCtx.lineWidth = 4;
    cuffCtx.setLineDash([12, 7]);
    cuffCtx.beginPath();
    cuffCtx.moveTo(0, 44);
    cuffCtx.lineTo(W, 44);
    cuffCtx.moveTo(0, 62);
    cuffCtx.lineTo(W, 62);
    cuffCtx.moveTo(0, H - 22);
    cuffCtx.lineTo(W, H - 22);
    cuffCtx.stroke();
    cuffCtx.setLineDash([]);

    if (prod.type === 'text' && prod.text) {
      cuffCtx.save();
      cuffCtx.fillStyle = col.printCss;
      cuffCtx.font = prod.canvasFont;
      cuffCtx.textAlign = 'center';
      cuffCtx.textBaseline = 'middle';
      cuffCtx.fillText(prod.text, W * 0.5, H * 0.56);
      cuffCtx.restore();
    } else if (prod.type === 'vector') {
      drawVectorLogoOnCanvas(cuffCtx, prod.id, W * 0.5, H * 0.56, 2.35, col.printCss);
    }

    cuffDiffuseTexture.needsUpdate = true;

    if (crownMesh) {
      crownMesh.material.color.setHex(col.knitHex);
      crownMesh.material.roughness = col.roughness;
    }
    if (seamLinesGroup) {
      seamLinesGroup.children.forEach((line) => {
        line.material.color.set(col.seamCss);
      });
    }
  }

  function init3DScene() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.copy(targetCamPos);

    // three.js r152 turned colour management on by default and r165 removed the
    // legacy light scaling. Both change how this scene looks: colours authored as
    // sRGB hex become ~12x darker once converted to linear, and light intensities
    // lose their implicit PI factor. This is a security upgrade, not a redesign, so
    // the original look is preserved deliberately rather than restyled.
    // To adopt modern colour management instead, delete the line below and re-grade
    // the COLORWAYS hex values and light intensities against the 2D product cards.
    THREE.ColorManagement.enabled = false;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;   // r152 renamed outputEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const loader = document.getElementById('webgl-loader');
    if (loader) loader.remove();
    container.appendChild(renderer.domElement);

    // Intensities carry the PI factor the renderer applied implicitly before r165.
    const LEGACY_LIGHT_SCALE = Math.PI;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6 * LEGACY_LIGHT_SCALE);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2 * LEGACY_LIGHT_SCALE);
    keyLight.position.set(3.2, 4.5, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe4e4e7, 0.95 * LEGACY_LIGHT_SCALE);
    rimLight.position.set(-3.8, 3.0, -3.5);
    scene.add(rimLight);

    const bottomFill = new THREE.DirectionalLight(0x71717a, 0.35 * LEGACY_LIGHT_SCALE);
    bottomFill.position.set(0, -3.5, 2.5);
    scene.add(bottomFill);

    microFabricTexture = createThermalLycraBumpTexture();

    cuffCanvas = document.createElement('canvas');
    cuffCanvas.width = 2048;
    cuffCanvas.height = 512;
    cuffCtx = cuffCanvas.getContext('2d');

    cuffDiffuseTexture = new THREE.CanvasTexture(cuffCanvas);
    cuffDiffuseTexture.colorSpace = THREE.SRGBColorSpace;   // r152 renamed .encoding
    cuffDiffuseTexture.anisotropy = 8;

    beanieGroup = new THREE.Group();
    beanieGroup.position.y = -0.12;
    scene.add(beanieGroup);

    const crownPoints = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * (Math.PI * 0.51);
      const radius = Math.sin(angle) * 1.16;
      const y = Math.cos(angle) * 1.20 - 0.08;
      crownPoints.push(new THREE.Vector2(radius, y));
    }

    const crownGeo = new THREE.LatheGeometry(crownPoints, 72);
    const crownMat = new THREE.MeshStandardMaterial({
      color: COLORWAYS.black.knitHex,
      bumpMap: microFabricTexture,
      bumpScale: 0.006,
      roughness: 0.62,
      metalness: 0.06,
    });
    crownMesh = new THREE.Mesh(crownGeo, crownMat);
    beanieGroup.add(crownMesh);

    seamLinesGroup = new THREE.Group();
    const dartCount = 4;
    for (let d = 0; d < dartCount; d++) {
      const theta = (d / dartCount) * Math.PI * 2 + Math.PI * 0.25;
      const seamPts = [];
      for (let i = 1; i <= 18; i++) {
        const t = (i / 18) * 0.78;
        const angle = t * (Math.PI * 0.51);
        const r = Math.sin(angle) * 1.164;
        const y = Math.cos(angle) * 1.20 - 0.08;
        seamPts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      const curve = new THREE.CatmullRomCurve3(seamPts);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.005, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: COLORWAYS.black.seamCss });
      seamLinesGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    }
    beanieGroup.add(seamLinesGroup);

    const cuffProfile = [
      new THREE.Vector2(1.14, -0.50),
      new THREE.Vector2(1.19, -0.49),
      new THREE.Vector2(1.205, -0.44),
      new THREE.Vector2(1.205, 0.05),
      new THREE.Vector2(1.19, 0.09),
      new THREE.Vector2(1.14, 0.10),
    ];
    const cuffGeo = new THREE.LatheGeometry(cuffProfile, 84);
    cuffGeo.rotateY(-Math.PI * 0.5);

    const cuffMat = new THREE.MeshStandardMaterial({
      map: cuffDiffuseTexture,
      bumpMap: microFabricTexture,
      bumpScale: 0.007,
      roughness: 0.60,
      metalness: 0.05,
    });
    cuffMesh = new THREE.Mesh(cuffGeo, cuffMat);
    beanieGroup.add(cuffMesh);

    const shadowGeo = new THREE.CircleGeometry(1.45, 48);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.position.y = -0.76;
    scene.add(shadowDisc);

    updateCuffTexture();

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      prevPointer = { x: e.clientX, y: e.clientY };

      targetRotY += dx * 0.011;
      targetRotX = Math.max(-0.45, Math.min(0.65, targetRotX + dy * 0.008));
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    window.addEventListener('resize', () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (beanieGroup) {
        if (state.autoRotate && !isDragging) {
          targetRotY += 0.0055;
        }
        beanieGroup.rotation.y += (targetRotY - beanieGroup.rotation.y) * 0.1;
        beanieGroup.rotation.x += (targetRotX - beanieGroup.rotation.x) * 0.1;
        beanieGroup.position.y = -0.12 + Math.sin(elapsed * 1.6) * 0.03;
      }

      if (camera) {
        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(0, 0.05, 0);
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  // =========================================================================
  // 5. SVG MINIATURE RENDERER (MATCHING DOUBLE-STITCH LYCRA SKULL CAPS)
  // =========================================================================
  function getSVGEmblemMarkup(product, printColor) {
    if (product.type === 'blank') return '';
    if (product.type === 'text') {
      return `
        <text x="110" y="156" text-anchor="middle"
          font-family='${product.svgFont}'
          font-size="${product.fontSize}"
          fill="${printColor}"
          letter-spacing="0.02em">
          ${product.text}
        </text>
      `;
    }

    switch (product.id) {
      case '212':
        return `
          <g transform="translate(110, 148) scale(0.55)" stroke="${printColor}" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M-46 -18 Q-50 2 -26 2 L-26 18 M-46 -18 L-34 -24 M0 -22 L0 22 M46 -18 Q50 2 26 2 L26 18 M46 -18 L34 -24" stroke-width="5.5"/>
            <path d="M-54 10 Q0 24 54 10" stroke-width="4.5"/>
          </g>
        `;
      case 'swoosh-outline':
        return `
          <g transform="translate(110, 149) scale(0.62)">
            <path d="M-36 -16 C-52 2 -52 22 -22 18 C6 14 48 -2 64 -8 C22 2 -12 8 -28 4 C-38 1 -38 -8 -36 -16 Z"
              fill="none" stroke="${printColor}" stroke-width="3.6" stroke-linejoin="round"/>
          </g>
        `;
      case 'swoosh-solid':
        return `
          <g transform="translate(110, 149) scale(0.62)">
            <path d="M-36 -16 C-52 2 -52 22 -22 18 C6 14 48 -2 64 -8 C22 2 -12 8 -28 4 C-38 1 -38 -8 -36 -16 Z"
              fill="${printColor}"/>
          </g>
        `;
      case 'heart':
        return `
          <g transform="translate(110, 148) scale(0.56)">
            <path d="M0 -10 L-10 -24 L-24 -18 L-34 -24 L-28 -8 L-40 -2 L-24 8 L-16 22 L0 30 L16 22 L24 8 L40 -2 L28 -8 L34 -24 L24 -18 L10 -24 Z"
              fill="none" stroke="${printColor}" stroke-width="4.2" stroke-linejoin="round"/>
          </g>
        `;
      case 'balaclava':
        return `
          <g transform="translate(110, 149) scale(0.56)" fill="${printColor}">
            <g transform="translate(-42, -1)">
              <path d="M-15 -8 C-15 -24 15 -24 15 -8 L14 16 Q0 24 -14 16 Z"/>
            </g>
            <g transform="translate(0, 2)">
              <path d="M-15 -8 C-15 -24 15 -24 15 -8 L14 16 Q0 24 -14 16 Z"/>
            </g>
            <g transform="translate(42, -1)">
              <path d="M-15 -8 C-15 -24 15 -24 15 -8 L14 16 Q0 24 -14 16 Z"/>
            </g>
          </g>
        `;
      case 'lv':
        return `
          <g transform="translate(110, 151) scale(0.62)" fill="${printColor}" font-family="Georgia, serif" font-weight="700" font-size="44" text-anchor="middle">
            <text x="-5" y="14">L</text>
            <text x="6" y="8">V</text>
          </g>
        `;
      case 'stwd':
        return `
          <g transform="translate(110, 151) rotate(-10)">
            <text x="0" y="8" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="25" fill="${printColor}">STWD.</text>
          </g>
        `;
      case 'corteiz':
        return `
          <text x="110" y="156" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="24" fill="${printColor}">Corteiz</text>
        `;
      case 'puma':
        return `
          <g transform="translate(110, 149) scale(0.62)" fill="${printColor}" stroke="${printColor}">
            <path d="M-38 14 Q-12 -2 22 -12 L34 -20 L32 -10 L44 -6 L26 -2 Q0 6 -26 22 L-34 18 Z" stroke="none"/>
            <path d="M-34 12 Q-50 4 -52 -10" fill="none" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        `;
      case 'jordan':
        return `
          <g transform="translate(110, 148) scale(0.64)" fill="${printColor}">
            <circle cx="-23" cy="-25" r="4.6"/>
            <circle cx="-1" cy="-13" r="4.1"/>
            <path d="M-20 -22 L-6 -9 L3 -8 L22 -12 L23 -9 L4 -3 L6 6 L24 21 L29 20 L28 24 L21 24 L2 10 L-14 24 L-20 26 L-21 23 L-16 20 L-3 5 L-5 -5 L-22 -20 Z"/>
          </g>
        `;
      case 'ros':
        return `
          <g transform="translate(110, 149) scale(0.62)">
            <ellipse cx="0" cy="2" rx="44" ry="16" transform="rotate(-5)" fill="none" stroke="${printColor}" stroke-width="3.2"/>
            <text x="0" y="11" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="28" fill="${printColor}">ROS</text>
          </g>
        `;
      case 'stussy':
        return `
          <g transform="translate(110, 150) scale(0.62)">
            <text x="0" y="10" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="32" fill="${printColor}">Stüssy</text>
            <line x1="-38" y1="-12" x2="38" y2="-14" stroke="${printColor}" stroke-width="2.6" stroke-linecap="round"/>
            <line x1="-32" y1="16" x2="34" y2="14" stroke="${printColor}" stroke-width="2.6" stroke-linecap="round"/>
          </g>
        `;
      case 'ua':
        return `
          <g transform="translate(110, 149) scale(0.56)" fill="none" stroke="${printColor}" stroke-width="6.5" stroke-linecap="round">
            <path d="M-18 -6 A24 24 0 0 0 18 -6"/>
            <path d="M-18 8 A24 24 0 0 1 18 8"/>
          </g>
        `;
      default:
        return '';
    }
  }

  function renderBeanieSVG(product, colorKey) {
    const col = COLORWAYS[colorKey] || COLORWAYS[product.colors[0]] || COLORWAYS.black;
    return `
      <svg viewBox="0 0 220 200" class="w-full h-auto drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-105" role="img" aria-label="${product.name} skull cap in ${col.label}">
        <defs>
          <radialGradient id="sheen-${product.id}-${colorKey}" cx="38%" cy="28%" r="65%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="${colorKey === 'black' ? '0.09' : '0.25'}" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.18" />
          </radialGradient>
        </defs>
        <path d="M34 130 C34 54, 72 24, 110 24 C148 24, 186 54, 186 130 Z"
          fill="${col.knitCss}" stroke="${col.seamCss}" stroke-width="1.4" />
        <path d="M34 130 C34 54, 72 24, 110 24 C148 24, 186 54, 186 130 Z"
          fill="url(#sheen-${product.id}-${colorKey})" />
        <path d="M110 24 C88 56, 76 92, 72 124" fill="none" stroke="${col.seamCss}" stroke-width="1.1" stroke-opacity="0.7" />
        <path d="M110 24 C132 56, 144 92, 148 124" fill="none" stroke="${col.seamCss}" stroke-width="1.1" stroke-opacity="0.7" />
        <rect x="28" y="122" width="164" height="48" rx="10"
          fill="${col.knitCss}" stroke="${col.seamCss}" stroke-width="1.5" />
        <line x1="30" y1="128" x2="190" y2="128" stroke="${col.seamCss}" stroke-width="1" stroke-dasharray="4 3" />
        <line x1="30" y1="132" x2="190" y2="132" stroke="${col.seamCss}" stroke-width="1" stroke-dasharray="4 3" />
        ${getSVGEmblemMarkup(product, col.printCss)}
      </svg>
    `;
  }

  // =========================================================================
  // 6. WISHLIST ENGINE (SAVE, REMOVE, MOVE TO BAG, SYNC UI)
  // =========================================================================
  function isInWishlist(productId, colorId) {
    return state.wishlist.some((w) => w.id === productId && w.color === colorId);
  }

  function toggleWishlist(productId, colorId) {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const validColor = prod.colors.includes(colorId) ? colorId : prod.colors[0];
    const existingIdx = state.wishlist.findIndex(
      (w) => w.id === productId && w.color === validColor
    );

    if (existingIdx !== -1) {
      state.wishlist.splice(existingIdx, 1);
      saveWishlist();
      renderWishlist();
      syncStudioControls();
      renderProductGrid(state.activeFilter);
      showToast(`Removed ${prod.name} (${COLORWAYS[validColor].label}) from wishlist`);
    } else {
      state.wishlist.unshift({
        id: productId,
        color: validColor,
      });
      saveWishlist();
      renderWishlist();
      syncStudioControls();
      renderProductGrid(state.activeFilter);
      showToast(`Saved ${prod.name} (${COLORWAYS[validColor].label}) to wishlist`);
    }
  }

  function renderWishlist() {
    const itemsContainer = document.getElementById('wishlist-items');
    const badge = document.getElementById('wishlist-badge');
    const drawerCount = document.getElementById('wishlist-drawer-count');
    const totalDhEl = document.getElementById('wishlist-total-dh');
    const menuWishlistText = document.getElementById('menu-wishlist-text');
    const moveAllBtn = document.getElementById('wishlist-move-all-btn');
    const clearBtn = document.getElementById('wishlist-clear-btn');

    const count = state.wishlist.length;
    const totalValue = count * UNIT_PRICE;

    if (badge) {
      badge.textContent = count;
      badge.className = count > 0
        ? 'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-black font-mono text-xs font-semibold transition-colors'
        : 'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/15 text-white font-mono text-xs font-semibold transition-colors';
    }
    if (drawerCount) drawerCount.textContent = count;
    if (totalDhEl) totalDhEl.textContent = `${totalValue} DH VALUE`;
    if (menuWishlistText) menuWishlistText.textContent = `SAVED WISHLIST (${count})`;

    if (moveAllBtn && clearBtn) {
      if (count === 0) {
        moveAllBtn.classList.add('opacity-45', 'pointer-events-none');
        clearBtn.classList.add('opacity-45', 'pointer-events-none');
      } else {
        moveAllBtn.classList.remove('opacity-45', 'pointer-events-none');
        clearBtn.classList.remove('opacity-45', 'pointer-events-none');
      }
    }

    if (!itemsContainer) return;

    if (count === 0) {
      itemsContainer.innerHTML = `
        <div class="py-16 text-center space-y-3">
          <div class="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.03] mx-auto flex items-center justify-center text-zinc-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p class="font-display text-lg text-zinc-300">Your wishlist is empty</p>
          <p class="text-xs text-zinc-500 max-w-xs mx-auto">
            Tap the heart icon on any skull cap card or in the 3D Studio to save your favorite silhouettes here.
          </p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = state.wishlist.map((item, idx) => {
      const prod = PRODUCTS.find((p) => p.id === item.id);
      if (!prod) return '';
      const col = COLORWAYS[item.color] || COLORWAYS[prod.colors[0]];
      return `
        <div class="py-4 flex items-center gap-3.5">
          <button type="button" data-wish-inspect="${idx}" aria-label="Inspect ${prod.name} in 3D"
            class="w-16 h-16 rounded-xl bg-[#16161a] border border-white/10 hover:border-white/30 p-1.5 flex-shrink-0 transition-colors">
            ${renderBeanieSVG(prod, col.id)}
          </button>
          <div class="flex-1 min-w-0">
            <h4 class="font-display font-semibold text-sm text-white truncate">${prod.name}</h4>
            <p class="font-mono text-[11px] text-zinc-400">${col.label}</p>
            <p class="font-mono text-xs font-semibold text-white mt-0.5">${prod.price} DH</p>
          </div>
          <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button type="button" data-wish-to-bag="${idx}"
              class="rounded-full bg-white text-black hover:bg-zinc-200 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors">
              + BAG
            </button>
            <button type="button" data-wish-remove="${idx}"
              class="font-mono text-[10px] text-zinc-500 hover:text-red-400 transition-colors">
              REMOVE
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // 7. UI SYNCHRONIZATION, SETTINGS, REVIEWS & ACCOUNT MANAGEMENT
  // =========================================================================
  function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-msg');
    msg.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
    }, 2400);
  }

  function syncSettingsUI() {
    document.getElementById('spin-label').textContent = `AUTO-ROTATE: ${state.autoRotate ? 'ON' : 'OFF'}`;
    document.getElementById('spin-indicator').className = state.autoRotate
      ? 'w-1.5 h-1.5 rounded-full bg-white'
      : 'w-1.5 h-1.5 rounded-full bg-zinc-600';

    const spinSwitch = document.getElementById('setting-spin-toggle');
    const spinKnob = document.getElementById('setting-spin-knob');
    if (spinSwitch && spinKnob) {
      spinSwitch.setAttribute('aria-checked', String(state.autoRotate));
      spinSwitch.className = state.autoRotate
        ? 'w-11 h-6 rounded-full bg-white p-0.5 transition-colors flex items-center'
        : 'w-11 h-6 rounded-full bg-white/15 p-0.5 transition-colors flex items-center';
      spinKnob.className = state.autoRotate
        ? 'w-5 h-5 rounded-full bg-black translate-x-5 transition-transform'
        : 'w-5 h-5 rounded-full bg-zinc-400 translate-x-0 transition-transform';
    }

    const studioSection = document.getElementById('studio');
    if (studioSection) {
      if (state.showGrid) {
        studioSection.classList.remove('grid-hidden');
      } else {
        studioSection.classList.add('grid-hidden');
      }
    }
    const gridSwitch = document.getElementById('setting-grid-toggle');
    const gridKnob = document.getElementById('setting-grid-knob');
    if (gridSwitch && gridKnob) {
      gridSwitch.setAttribute('aria-checked', String(state.showGrid));
      gridSwitch.className = state.showGrid
        ? 'w-11 h-6 rounded-full bg-white p-0.5 transition-colors flex items-center'
        : 'w-11 h-6 rounded-full bg-white/15 p-0.5 transition-colors flex items-center';
      gridKnob.className = state.showGrid
        ? 'w-5 h-5 rounded-full bg-black translate-x-5 transition-transform'
        : 'w-5 h-5 rounded-full bg-zinc-400 translate-x-0 transition-transform';
    }

    document.querySelectorAll('.pref-wa-btn').forEach((btn) => {
      const idx = Number(btn.dataset.prefWa);
      if (idx === state.preferredWaIndex) {
        btn.className = 'pref-wa-btn rounded-xl bg-white text-black px-2.5 py-2 font-mono text-[10px] font-semibold transition-all';
      } else {
        btn.className = 'pref-wa-btn rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/30 px-2.5 py-2 font-mono text-[10px] font-medium transition-all';
      }
    });

    const waBtn1 = document.getElementById('wa-checkout-btn-1');
    const waBtn2 = document.getElementById('wa-checkout-btn-2');
    if (waBtn1 && waBtn2) {
      const primaryClass = 'w-full inline-flex items-center justify-between rounded-full bg-white text-black hover:bg-zinc-200 px-5 py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all';
      const secondaryClass = 'w-full inline-flex items-center justify-between rounded-full border border-white/20 bg-white/[0.06] text-white hover:bg-white hover:text-black px-5 py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all';
      waBtn1.className = state.preferredWaIndex === 0 ? primaryClass : secondaryClass;
      waBtn2.className = state.preferredWaIndex === 1 ? primaryClass : secondaryClass;
      if (state.cart.length === 0) {
        waBtn1.classList.add('opacity-50', 'pointer-events-none');
        waBtn2.classList.add('opacity-50', 'pointer-events-none');
      }
    }
  }

  function getInitials(username) {
    if (!username) return 'C7';
    const clean = username.replace(/^@+/, '').trim();
    return clean.slice(0, 2).toUpperCase() || 'C7';
  }

  function syncAccountUI() {
    const headerLabel = document.getElementById('header-account-label');
    const headerAvatar = document.getElementById('header-account-avatar');
    const menuAccountText = document.getElementById('menu-account-text');
    const authView = document.getElementById('auth-view');
    const profileView = document.getElementById('profile-view');
    const reviewAuthorInput = document.getElementById('review-author');
    const reviewSigninPrompt = document.getElementById('review-signin-prompt');

    if (state.currentUser) {
      const uname = state.currentUser.username;
      const initials = getInitials(uname);
      headerLabel.textContent = `@${uname}`;
      headerAvatar.textContent = initials;
      headerAvatar.className = 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-black text-[10px] font-mono font-bold';
      menuAccountText.textContent = `@${uname.toUpperCase()} // PROFILE`;

      authView.classList.add('hidden');
      profileView.classList.remove('hidden');

      document.getElementById('profile-initials').textContent = initials;
      document.getElementById('profile-username').textContent = `@${uname}`;

      if (reviewAuthorInput) {
        reviewAuthorInput.value = `@${uname}`;
        reviewAuthorInput.readOnly = true;
        reviewAuthorInput.classList.add('opacity-80');
      }
      if (reviewSigninPrompt) {
        reviewSigninPrompt.textContent = 'SIGNED IN';
      }

      const orders = state.currentUser.orders || [];
      document.getElementById('profile-order-count').textContent = `${orders.length} ORDER${orders.length === 1 ? '' : 'S'}`;
      const ordersList = document.getElementById('profile-orders-list');
      if (orders.length === 0) {
        ordersList.innerHTML = `
          <div class="rounded-xl border border-white/[0.06] bg-black/40 p-3 text-center font-mono text-[11px] text-zinc-500">
            No orders dispatched yet.
          </div>
        `;
      } else {
        ordersList.innerHTML = orders.slice().reverse().map((ord) => `
          <div class="rounded-xl border border-white/[0.08] bg-black/50 p-3 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-medium text-white truncate">${escapeHTML(ord.summary)}</p>
              <p class="font-mono text-[10px] text-zinc-500">${escapeHTML(ord.date)}</p>
            </div>
            <span class="font-mono text-xs font-semibold text-white flex-shrink-0">${Number(ord.total) || 0} DH</span>
          </div>
        `).join('');
      }
    } else {
      headerLabel.textContent = 'ACCOUNT';
      headerAvatar.className = 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] font-mono font-bold';
      headerAvatar.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      `;
      menuAccountText.textContent = 'MEMBER ACCOUNT // SIGN IN';

      if (reviewAuthorInput) {
        reviewAuthorInput.readOnly = false;
        reviewAuthorInput.classList.remove('opacity-80');
      }
      if (reviewSigninPrompt) {
        reviewSigninPrompt.textContent = 'SIGN IN';
      }

      authView.classList.remove('hidden');
      profileView.classList.add('hidden');
    }

    renderCart();
  }

  function setAuthFeedback(message, isError = true) {
    const box = document.getElementById('auth-feedback');
    if (!message) {
      box.classList.add('hidden');
      return;
    }
    box.textContent = message;
    box.className = isError
      ? 'rounded-xl px-4 py-3 text-xs font-mono border border-red-500/30 bg-red-500/10 text-red-300'
      : 'rounded-xl px-4 py-3 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  }

  // =========================================================================
  // REVIEWS & COMMENTS RENDERING
  // =========================================================================
  function populateReviewProductOptions() {
    const select = document.getElementById('review-product');
    if (!select) return;
    const options = ['<option value="General Atelier">General / All Caps</option>']
      .concat(PRODUCTS.map((p) => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`));
    select.innerHTML = options.join('');
  }

  function syncStarPickerUI() {
    document.querySelectorAll('.star-btn').forEach((btn) => {
      const val = Number(btn.dataset.star);
      if (val <= state.selectedRating) {
        btn.classList.remove('text-zinc-600');
        btn.classList.add('text-white');
      } else {
        btn.classList.remove('text-white');
        btn.classList.add('text-zinc-600');
      }
    });
  }

  function renderReviews() {
    const list = document.getElementById('reviews-list');
    const countBadge = document.getElementById('reviews-count-badge');
    const avgBadge = document.getElementById('reviews-avg-badge');
    if (!list) return;

    const total = state.reviews.length;
    const avg = total > 0
      ? (state.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / total).toFixed(1)
      : '5.0';

    if (countBadge) countBadge.textContent = `${total} REVIEW${total === 1 ? '' : 'S'}`;
    if (avgBadge) avgBadge.textContent = `★ ${avg}`;

    list.innerHTML = state.reviews.map((rev) => {
      const rating = Math.max(1, Math.min(5, Number(rev.rating) || 5));
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const cleanUser = escapeHTML(String(rev.username || 'guest').replace(/^@+/, ''));
      return `
        <article class="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center font-mono text-xs font-bold text-white flex-shrink-0">
                ${escapeHTML(getInitials(cleanUser))}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-display font-semibold text-sm text-white truncate">@${cleanUser}</span>
                  ${rev.verified ? '<span class="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">MEMBER</span>' : ''}
                </div>
                <span class="font-mono text-[10px] text-zinc-500 block">${escapeHTML(rev.product || 'General Atelier')} • ${escapeHTML(rev.date || '')}</span>
              </div>
            </div>
            <span class="font-mono text-xs tracking-widest text-white flex-shrink-0" aria-label="${rating} out of 5 stars">${stars}</span>
          </div>
          <p class="text-sm text-zinc-300 leading-relaxed">${escapeHTML(rev.comment)}</p>
        </article>
      `;
    }).join('');
  }

  function syncStudioControls() {
    const prod = PRODUCTS.find((p) => p.id === state.activeProductId) || PRODUCTS[0];
    if (!prod.colors.includes(state.activeColorId)) {
      state.activeColorId = prod.colors[0];
    }
    const col = COLORWAYS[state.activeColorId] || COLORWAYS.black;

    document.getElementById('studio-model-title').textContent = `${prod.name} — ${col.label}`;
    document.getElementById('hero-active-price').textContent = `${prod.price} DH`;

    // Sync Studio Wishlist Button State
    const studioWishBtn = document.getElementById('studio-wishlist-btn');
    const studioWishIcon = document.getElementById('studio-wishlist-icon');
    const studioWishLabel = document.getElementById('studio-wishlist-label');
    const saved = isInWishlist(prod.id, state.activeColorId);
    if (studioWishBtn && studioWishIcon && studioWishLabel) {
      if (saved) {
        studioWishBtn.className = 'inline-flex items-center gap-1.5 rounded-lg bg-white text-black px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all';
        studioWishIcon.setAttribute('fill', 'currentColor');
        studioWishLabel.textContent = 'SAVED';
      } else {
        studioWishBtn.className = 'inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:border-white/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-all';
        studioWishIcon.setAttribute('fill', 'none');
        studioWishLabel.textContent = 'SAVE';
      }
    }

    const pillsContainer = document.getElementById('hero-design-pills');
    pillsContainer.innerHTML = PRODUCTS.map((p) => {
      const active = p.id === state.activeProductId;
      return `
        <button type="button" data-studio-prod="${p.id}"
          class="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
            active
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/10'
          }">
          ${p.name}
        </button>
      `;
    }).join('');

    const swatchContainer = document.getElementById('hero-color-swatches');
    swatchContainer.innerHTML = prod.colors.map((cId) => {
      const c = COLORWAYS[cId];
      const active = c.id === state.activeColorId;
      return `
        <button type="button" data-studio-color="${c.id}" aria-label="${c.label}" title="${c.label}"
          class="swatch-${c.id} w-6 h-6 rounded-full border border-white/30 transition-transform ${
            active ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0e0e11] scale-110' : 'opacity-75 hover:opacity-100'
          }">
        </button>
      `;
    }).join('');

    updateCuffTexture();
  }

  function renderProductGrid(filterCategory = state.activeFilter) {
    state.activeFilter = filterCategory;
    const grid = document.getElementById('product-grid');
    const filtered = filterCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === filterCategory);

    grid.innerHTML = filtered.map((prod) => {
      const selectedCol = state.cardColors[prod.id] || prod.colors[0];
      const saved = isInWishlist(prod.id, selectedCol);
      return `
        <article class="glass-card rounded-3xl overflow-hidden flex flex-col group" data-product-card="${prod.id}">
          <div class="relative bg-gradient-to-b from-[#17171c] to-[#0c0c0f] p-7 border-b border-white/[0.06]">
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <button type="button" data-wish-card="${prod.id}" aria-label="${saved ? 'Remove from wishlist' : 'Save to wishlist'}"
                  class="w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                    saved
                      ? 'bg-white text-black border-white'
                      : 'bg-black/60 text-zinc-300 border-white/15 hover:border-white/40 hover:text-white'
                  }">
                  <svg class="w-3.5 h-3.5" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  ONE SIZE // LYCRA
                </span>
              </div>
              <button type="button" data-inspect-3d="${prod.id}"
                class="inline-flex items-center gap-1 rounded-full bg-black/60 hover:bg-white hover:text-black border border-white/15 px-2.5 py-1 font-mono text-[10px] text-zinc-300 transition-colors">
                <span>3D VIEW</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div id="card-svg-${prod.id}" class="py-2 cursor-pointer" data-inspect-3d="${prod.id}">
              ${renderBeanieSVG(prod, selectedCol)}
            </div>
          </div>

          <div class="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div>
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="font-display font-bold text-xl text-white">${prod.name}</h3>
                <span class="font-mono font-semibold text-base text-white">${prod.price} DH</span>
              </div>
              <p class="text-xs text-zinc-400 mt-1 leading-relaxed">${prod.subtitle}</p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span id="card-color-label-${prod.id}" class="font-mono text-[11px] text-zinc-400">
                  ${COLORWAYS[selectedCol].label}
                </span>
                <div class="flex items-center gap-2">
                  ${prod.colors.map((cId) => {
                    const c = COLORWAYS[cId];
                    return `
                      <button type="button"
                        data-card-prod="${prod.id}"
                        data-card-color="${c.id}"
                        aria-label="${c.label}"
                        class="swatch-${c.id} w-5 h-5 rounded-full border border-white/25 transition-transform ${
                          selectedCol === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0e0e11] scale-110' : 'opacity-70 hover:opacity-100'
                        }">
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <button type="button" data-add-prod="${prod.id}"
                class="w-full rounded-full bg-white text-black hover:bg-zinc-200 py-3 text-xs font-bold tracking-wider uppercase transition-all active:scale-[0.98]">
                ADD TO BAG — 50 DH
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // =========================================================================
  // 8. SHOPPING BAG & WHATSAPP CHECKOUT ENGINE
  // =========================================================================
  function addToCart(productId, colorId, silent = false) {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const validColor = prod.colors.includes(colorId) ? colorId : prod.colors[0];

    const existing = state.cart.find(
      (item) => item.id === productId && item.color === validColor
    );

    if (existing) {
      existing.qty = Math.min(existing.qty + 1, MAX_QTY_PER_LINE);
    } else {
      state.cart.push({
        id: productId,
        color: validColor,
        qty: 1,
      });
    }

    renderCart();
    if (!silent) {
      showToast(`${prod.name} (${COLORWAYS[validColor].label}) added to bag`);
    }
  }

  function recordOrderForMember() {
    if (!state.currentUser || state.cart.length === 0) return;

    let totalDh = 0;
    const summaryParts = state.cart.map((item) => {
      const prod = PRODUCTS.find((p) => p.id === item.id);
      const col = COLORWAYS[item.color];
      totalDh += prod.price * item.qty;
      return `${item.qty}x ${prod.name} (${col.label})`;
    });

    const newOrder = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      summary: summaryParts.join(', '),
      total: totalDh,
    };

    const users = readJSON(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex((u) => u.username.toLowerCase() === state.currentUser.username.toLowerCase());
    if (idx !== -1) {
      users[idx].orders = users[idx].orders || [];
      users[idx].orders.push(newOrder);
      writeJSON(STORAGE_KEYS.USERS, users);
      state.currentUser = users[idx];
      syncAccountUI();
    }
  }

  function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const drawerCount = document.getElementById('drawer-count');
    const subtotalEl = document.getElementById('cart-subtotal');
    const waBtn1 = document.getElementById('wa-checkout-btn-1');
    const waBtn2 = document.getElementById('wa-checkout-btn-2');

    let totalQty = 0;
    let totalDh = 0;
    const waLines = ['Hello CASAVEN7, I would like to order:\n'];

    if (state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="py-16 text-center space-y-3">
          <p class="font-display text-lg text-zinc-300">Your bag is empty</p>
          <p class="text-xs text-zinc-500 max-w-xs mx-auto">
            Select any skull cap silhouette (50 DH each) from the 3D Studio or Collection to start your order.
          </p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = state.cart.map((item, idx) => {
        const prod = PRODUCTS.find((p) => p.id === item.id);
        const col = COLORWAYS[item.color];
        const lineTotal = prod.price * item.qty;
        totalQty += item.qty;
        totalDh += lineTotal;

        waLines.push(`• ${item.qty}x ${prod.name} — ${col.label} (${lineTotal} DH)`);

        return `
          <div class="py-4 flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#16161a] border border-white/10 p-1.5 flex-shrink-0">
              ${renderBeanieSVG(prod, item.color)}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-display font-semibold text-sm text-white truncate">${prod.name}</h4>
              <p class="font-mono text-[11px] text-zinc-400">${col.label}</p>
              <p class="font-mono text-xs font-semibold text-white mt-1">${lineTotal} DH</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" data-cart-dec="${idx}" aria-label="Decrease quantity"
                class="w-7 h-7 rounded-full border border-white/15 hover:bg-white hover:text-black flex items-center justify-center font-mono text-xs transition-colors">
                -
              </button>
              <span class="font-mono text-xs w-5 text-center">${item.qty}</span>
              <button type="button" data-cart-inc="${idx}" aria-label="Increase quantity"
                class="w-7 h-7 rounded-full border border-white/15 hover:bg-white hover:text-black flex items-center justify-center font-mono text-xs transition-colors">
                +
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    waLines.push(`\nTotal: ${totalDh} DH`);
    if (state.currentUser) {
      waLines.push(`\nMember: @${state.currentUser.username}`);
    }

    const encodedMsg = encodeURIComponent(waLines.join('\n'));

    badge.textContent = totalQty;
    drawerCount.textContent = totalQty;
    subtotalEl.textContent = `${totalDh} DH`;

    [waBtn1, waBtn2].forEach((btn, i) => {
      if (!btn) return;
      if (state.cart.length > 0) {
        btn.href = `https://wa.me/${WHATSAPP_NUMBERS[i].international}?text=${encodedMsg}`;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        btn.href = '#collection';
        btn.classList.add('opacity-50', 'pointer-events-none');
      }
    });
  }

  // =========================================================================
  // 9. DRAWERS & MODALS CONTROLLERS
  // =========================================================================
  function openCartDrawer() {
    closeMenuDrawer();
    closeWishlistDrawer();
    document.getElementById('cart-drawer').classList.remove('translate-x-full');
    document.getElementById('cart-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  }

  function closeCartDrawer() {
    document.getElementById('cart-drawer').classList.add('translate-x-full');
    document.getElementById('cart-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }

  function openWishlistDrawer() {
    closeMenuDrawer();
    closeCartDrawer();
    renderWishlist();
    document.getElementById('wishlist-drawer').classList.remove('translate-x-full');
    document.getElementById('wishlist-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  }

  function closeWishlistDrawer() {
    document.getElementById('wishlist-drawer').classList.add('translate-x-full');
    document.getElementById('wishlist-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }

  function openMenuDrawer() {
    closeCartDrawer();
    closeWishlistDrawer();
    document.getElementById('menu-drawer').classList.remove('-translate-x-full');
    document.getElementById('menu-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  }

  function closeMenuDrawer() {
    document.getElementById('menu-drawer').classList.add('-translate-x-full');
    document.getElementById('menu-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }

  function openAccountModal() {
    closeMenuDrawer();
    closeCartDrawer();
    closeWishlistDrawer();
    setAuthFeedback('');
    syncAccountUI();
    document.getElementById('account-modal-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  }

  function closeAccountModal() {
    document.getElementById('account-modal-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }

  function openComingSoonModal(categoryName) {
    closeMenuDrawer();
    document.getElementById('coming-soon-title').textContent = categoryName;
    document.getElementById('coming-soon-modal-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  }

  function closeComingSoonModal() {
    document.getElementById('coming-soon-modal-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }

  // =========================================================================
  // 10. EVENT DELEGATION & INITIALIZATION
  // =========================================================================
  document.addEventListener('click', (e) => {
    const comingSoonBtn = e.target.closest('[data-coming-soon]');
    if (comingSoonBtn) {
      openComingSoonModal(comingSoonBtn.dataset.comingSoon);
      return;
    }

    const prefWaBtn = e.target.closest('[data-pref-wa]');
    if (prefWaBtn) {
      state.preferredWaIndex = Number(prefWaBtn.dataset.prefWa);
      saveSettings();
      syncSettingsUI();
      showToast(`Preferred WhatsApp set to Line 0${state.preferredWaIndex + 1}`);
      return;
    }

    const studioProdBtn = e.target.closest('[data-studio-prod]');
    if (studioProdBtn) {
      state.activeProductId = studioProdBtn.dataset.studioProd;
      targetRotY = 0;
      syncStudioControls();
      return;
    }

    const studioColorBtn = e.target.closest('[data-studio-color]');
    if (studioColorBtn) {
      state.activeColorId = studioColorBtn.dataset.studioColor;
      syncStudioControls();
      return;
    }

    const camBtn = e.target.closest('[data-cam]');
    if (camBtn) {
      const mode = camBtn.dataset.cam;
      document.querySelectorAll('.cam-preset-btn').forEach((b) => {
        b.className = 'cam-preset-btn rounded-lg bg-white/[0.05] text-zinc-300 hover:bg-white/15 px-2.5 py-1 font-mono text-[11px] transition-colors';
      });
      camBtn.className = 'cam-preset-btn rounded-lg bg-white text-black px-2.5 py-1 font-mono text-[11px] font-medium transition-colors';

      if (mode === 'front') {
        targetRotY = 0;
        targetRotX = 0.06;
        targetCamPos.set(0, 0.2, 4.1);
      } else if (mode === 'angle') {
        targetRotY = -0.62;
        targetRotX = 0.14;
        targetCamPos.set(0, 0.28, 4.0);
      } else if (mode === 'crown') {
        targetRotY = 0.25;
        targetRotX = 0.58;
        targetCamPos.set(0, 0.75, 3.85);
      }
      return;
    }

    const cardColorBtn = e.target.closest('[data-card-color]');
    if (cardColorBtn) {
      const prodId = cardColorBtn.dataset.cardProd;
      const colorId = cardColorBtn.dataset.cardColor;
      state.cardColors[prodId] = colorId;
      renderProductGrid(state.activeFilter);
      return;
    }

    const wishCardBtn = e.target.closest('[data-wish-card]');
    if (wishCardBtn) {
      const prodId = wishCardBtn.dataset.wishCard;
      const prod = PRODUCTS.find((p) => p.id === prodId);
      const colorId = state.cardColors[prodId] || (prod ? prod.colors[0] : 'black');
      toggleWishlist(prodId, colorId);
      return;
    }

    const wishRemoveBtn = e.target.closest('[data-wish-remove]');
    if (wishRemoveBtn) {
      const idx = Number(wishRemoveBtn.dataset.wishRemove);
      const removed = state.wishlist[idx];
      if (removed) {
        state.wishlist.splice(idx, 1);
        saveWishlist();
        renderWishlist();
        syncStudioControls();
        renderProductGrid(state.activeFilter);
        const prod = PRODUCTS.find((p) => p.id === removed.id);
        if (prod) showToast(`Removed ${prod.name} from wishlist`);
      }
      return;
    }

    const wishToBagBtn = e.target.closest('[data-wish-to-bag]');
    if (wishToBagBtn) {
      const idx = Number(wishToBagBtn.dataset.wishToBag);
      const item = state.wishlist[idx];
      if (item) {
        addToCart(item.id, item.color);
        openCartDrawer();
      }
      return;
    }

    const wishInspectBtn = e.target.closest('[data-wish-inspect]');
    if (wishInspectBtn) {
      const idx = Number(wishInspectBtn.dataset.wishInspect);
      const item = state.wishlist[idx];
      if (item) {
        state.activeProductId = item.id;
        state.activeColorId = item.color;
        targetRotY = 0;
        targetRotX = 0.08;
        syncStudioControls();
        closeWishlistDrawer();
        document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const inspectBtn = e.target.closest('[data-inspect-3d]');
    if (inspectBtn) {
      const prodId = inspectBtn.dataset.inspect3d;
      state.activeProductId = prodId;
      state.activeColorId = state.cardColors[prodId] || 'black';
      targetRotY = 0;
      targetRotX = 0.08;
      syncStudioControls();
      document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const addBtn = e.target.closest('[data-add-prod]');
    if (addBtn) {
      const prodId = addBtn.dataset.addProd;
      const prod = PRODUCTS.find((p) => p.id === prodId);
      const colorId = state.cardColors[prodId] || (prod ? prod.colors[0] : 'black');
      addToCart(prodId, colorId);
      openCartDrawer();
      return;
    }

    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      document.querySelectorAll('.filter-btn').forEach((b) => {
        b.className = 'filter-btn rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30 px-4 py-1.5 text-xs font-medium tracking-wide transition-all';
      });
      filterBtn.className = 'filter-btn rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold tracking-wide transition-all';
      renderProductGrid(filterBtn.dataset.filter);
      return;
    }

    const decBtn = e.target.closest('[data-cart-dec]');
    if (decBtn) {
      const idx = Number(decBtn.dataset.cartDec);
      if (Number.isInteger(idx) && state.cart[idx]) {
        state.cart[idx].qty -= 1;
        if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        renderCart();
      }
      return;
    }

    const incBtn = e.target.closest('[data-cart-inc]');
    if (incBtn) {
      const idx = Number(incBtn.dataset.cartInc);
      if (Number.isInteger(idx) && state.cart[idx]) {
        state.cart[idx].qty = Math.min(state.cart[idx].qty + 1, MAX_QTY_PER_LINE);
        renderCart();
      }
      return;
    }

    const starBtn = e.target.closest('[data-star]');
    if (starBtn) {
      state.selectedRating = Math.max(1, Math.min(5, Number(starBtn.dataset.star) || 5));
      syncStarPickerUI();
      return;
    }
  });

  document.getElementById('hero-add-btn').addEventListener('click', () => {
    addToCart(state.activeProductId, state.activeColorId);
    openCartDrawer();
  });

  document.getElementById('studio-wishlist-btn').addEventListener('click', () => {
    toggleWishlist(state.activeProductId, state.activeColorId);
  });

  function toggleAutoRotate() {
    state.autoRotate = !state.autoRotate;
    saveSettings();
    syncSettingsUI();
  }
  document.getElementById('toggle-spin-btn').addEventListener('click', toggleAutoRotate);
  document.getElementById('setting-spin-toggle').addEventListener('click', toggleAutoRotate);

  document.getElementById('setting-grid-toggle').addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    saveSettings();
    syncSettingsUI();
  });

  document.getElementById('open-menu-btn').addEventListener('click', openMenuDrawer);
  document.getElementById('close-menu-btn').addEventListener('click', closeMenuDrawer);
  document.getElementById('menu-backdrop').addEventListener('click', closeMenuDrawer);
  document.getElementById('menu-cat-skullcaps').addEventListener('click', closeMenuDrawer);
  document.getElementById('menu-wishlist-shortcut').addEventListener('click', openWishlistDrawer);
  document.getElementById('menu-account-shortcut').addEventListener('click', openAccountModal);

  document.getElementById('open-wishlist-btn').addEventListener('click', openWishlistDrawer);
  document.getElementById('close-wishlist-btn').addEventListener('click', closeWishlistDrawer);
  document.getElementById('wishlist-backdrop').addEventListener('click', closeWishlistDrawer);

  document.getElementById('wishlist-move-all-btn').addEventListener('click', () => {
    if (state.wishlist.length === 0) return;
    const count = state.wishlist.length;
    state.wishlist.forEach((item) => {
      addToCart(item.id, item.color, true);
    });
    openCartDrawer();
    showToast(`Added ${count} saved item${count === 1 ? '' : 's'} to bag`);
  });

  document.getElementById('wishlist-clear-btn').addEventListener('click', () => {
    if (state.wishlist.length === 0) return;
    state.wishlist = [];
    saveWishlist();
    renderWishlist();
    syncStudioControls();
    renderProductGrid(state.activeFilter);
    showToast('Wishlist cleared');
  });

  document.getElementById('close-coming-soon-btn').addEventListener('click', closeComingSoonModal);
  document.getElementById('coming-soon-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'coming-soon-modal-backdrop') closeComingSoonModal();
  });

  document.getElementById('open-account-btn').addEventListener('click', openAccountModal);
  document.getElementById('close-account-btn').addEventListener('click', closeAccountModal);
  document.getElementById('account-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'account-modal-backdrop') closeAccountModal();
  });

  document.getElementById('review-signin-prompt').addEventListener('click', openAccountModal);

  // Switch Between Create Account and Sign In Tabs
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  tabSignupBtn.addEventListener('click', () => {
    setAuthFeedback('');
    tabSignupBtn.className = 'rounded-full bg-white text-black py-2 text-xs font-bold tracking-wide transition-all';
    tabLoginBtn.className = 'rounded-full text-zinc-400 hover:text-white py-2 text-xs font-semibold tracking-wide transition-all';
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  tabLoginBtn.addEventListener('click', () => {
    setAuthFeedback('');
    tabLoginBtn.className = 'rounded-full bg-white text-black py-2 text-xs font-bold tracking-wide transition-all';
    tabSignupBtn.className = 'rounded-full text-zinc-400 hover:text-white py-2 text-xs font-semibold tracking-wide transition-all';
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  // Handle Account Creation (Username & Password Only)
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim().replace(/^@+/, '');
    const password = document.getElementById('signup-password').value;

    if (!USERNAME_RE.test(username)) {
      setAuthFeedback('Username must be 3-24 characters: letters, digits, dot, dash or underscore.');
      return;
    }
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setAuthFeedback(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`);
      return;
    }
    if (password.toLowerCase().includes(username.toLowerCase())) {
      setAuthFeedback('Password must not contain your username.');
      return;
    }
    // Refuse to fall back to plaintext storage if WebCrypto is unavailable.
    if (!cryptoReady()) {
      setAuthFeedback('Secure storage unavailable in this browser context. Serve this page over HTTPS.');
      return;
    }

    const users = readJSON(STORAGE_KEYS.USERS, []).filter(validUsername);
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      setAuthFeedback('This username is already taken. Please choose another or sign in.');
      return;
    }

    const submitBtn = signupForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const derived = await derivePassword(password);
      const newUser = {
        username,
        salt: derived.salt,
        iterations: derived.iterations,
        hash: derived.hash,
        orders: [],
        wishlist: state.wishlist.slice(),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeJSON(STORAGE_KEYS.USERS, users);
      writeJSON(STORAGE_KEYS.SESSION, username);

      state.currentUser = newUser;
      signupForm.reset();
      syncAccountUI();
      showToast(`Welcome to CASAVEN7, @${username}!`);
    } catch (err) {
      setAuthFeedback('Could not create the account securely. Please try again.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Handle Member Sign In (Username & Password Only)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim().replace(/^@+/, '');
    const password = document.getElementById('login-password').value;

    const users = readJSON(STORAGE_KEYS.USERS, []).filter(validUsername);
    const candidate = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    let ok = false;
    try {
      ok = await verifyPassword(candidate, password);
    } catch (err) {
      ok = false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }

    // One message for both cases: do not reveal whether the username exists.
    if (!ok) {
      setAuthFeedback('Invalid username or password. Please try again.');
      return;
    }
    await upgradeLegacyUser(candidate.username, password);
    const matched = readJSON(STORAGE_KEYS.USERS, []).filter(validUsername)
      .find((u) => u.username === candidate.username) || candidate;

    writeJSON(STORAGE_KEYS.SESSION, matched.username);
    state.currentUser = matched;
    const restored = sanitizeWishlist(matched.wishlist);
    if (restored.length > 0) {
      state.wishlist = restored;
      writeJSON(STORAGE_KEYS.WISHLIST, state.wishlist);
    }
    loginForm.reset();
    renderWishlist();
    syncStudioControls();
    renderProductGrid(state.activeFilter);
    syncAccountUI();
    showToast(`Signed in as @${matched.username}`);
  });

  // Handle Sign Out
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    state.currentUser = null;
    document.getElementById('review-author').value = '';
    syncAccountUI();
    showToast('Signed out of CASAVEN7 ID');
  });

  // Handle Review / Comment Submission
  document.getElementById('review-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rawAuthor = state.currentUser
      ? state.currentUser.username
      : document.getElementById('review-author').value.trim().replace(/^@+/, '');
    const product = document.getElementById('review-product').value;
    const comment = document.getElementById('review-comment').value.trim().slice(0, COMMENT_MAX);

    if (!rawAuthor || !comment) {
      showToast('Enter a username and comment');
      return;
    }
    if (!USERNAME_RE.test(rawAuthor)) {
      showToast('Username must be 3-24 characters: letters, digits, dot, dash or underscore');
      return;
    }
    // Only the server-side product list is acceptable; reject a tampered <select>.
    const knownProducts = ['General Atelier'].concat(PRODUCTS.map((p) => p.name));
    if (!knownProducts.includes(product)) {
      showToast('Unknown product selection');
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      username: rawAuthor.slice(0, 24),
      verified: Boolean(state.currentUser),
      rating: Math.max(1, Math.min(5, Number(state.selectedRating) || 5)),
      product,
      comment,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    state.reviews.unshift(newReview);
    saveReviews();
    renderReviews();

    document.getElementById('review-comment').value = '';
    if (!state.currentUser) {
      document.getElementById('review-author').value = '';
    }
    state.selectedRating = 5;
    syncStarPickerUI();
    showToast('Review posted to atelier');
  });

  document.getElementById('wa-checkout-btn-1').addEventListener('click', recordOrderForMember);
  document.getElementById('wa-checkout-btn-2').addEventListener('click', recordOrderForMember);

  document.getElementById('open-cart-btn').addEventListener('click', openCartDrawer);
  document.getElementById('close-cart-btn').addEventListener('click', closeCartDrawer);
  document.getElementById('cart-backdrop').addEventListener('click', closeCartDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeWishlistDrawer();
      closeMenuDrawer();
      closeAccountModal();
      closeComingSoonModal();
    }
  });

  window.addEventListener('load', () => {
    loadPersistedState();
    populateReviewProductOptions();
    renderWishlist();
    syncStudioControls();
    syncSettingsUI();
    syncAccountUI();
    syncStarPickerUI();
    renderReviews();
    renderProductGrid('all');
    init3DScene();
  });
})();
