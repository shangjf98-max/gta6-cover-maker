// Neon Coast Cover Studio — original poster art engine.
//
// Everything on the cover is drawn in code: gradient sky, striped retro sun,
// city skyline, palm silhouettes, neon grid, film grain and vignette. No
// Rockstar artwork, logo, wordmark or font is used anywhere; the lettering
// is the system heavy sans stack (Arial Black / sans-serif) with outline,
// shadow and skew applied in code.

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Landscape 1920 x 1080' },
};

// Four multi-panel poster layouts. Each panel is a fraction of the photo
// area (the strip of sky at the top and the title band at the bottom are
// drawn by the engine, panels fill the space between them).
export const LAYOUTS = {
  triptych: {
    name: 'Triple Strip',
    panels: 3,
    rects: [
      { x: 0.0, y: 0.0, w: 0.32, h: 1.0 },
      { x: 0.34, y: 0.0, w: 0.32, h: 1.0 },
      { x: 0.68, y: 0.0, w: 0.32, h: 1.0 },
    ],
  },
  grid: {
    name: 'Four Square',
    panels: 4,
    rects: [
      { x: 0.0, y: 0.0, w: 0.49, h: 0.485 },
      { x: 0.51, y: 0.0, w: 0.49, h: 0.485 },
      { x: 0.0, y: 0.515, w: 0.49, h: 0.485 },
      { x: 0.51, y: 0.515, w: 0.49, h: 0.485 },
    ],
  },
  hero: {
    name: 'Hero + Two',
    panels: 3,
    rects: [
      { x: 0.0, y: 0.0, w: 0.62, h: 1.0 },
      { x: 0.64, y: 0.0, w: 0.36, h: 0.485 },
      { x: 0.64, y: 0.515, w: 0.36, h: 0.485 },
    ],
  },
  banner: {
    name: 'Wide + Two',
    panels: 3,
    rects: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.56 },
      { x: 0.0, y: 0.59, w: 0.49, h: 0.41 },
      { x: 0.51, y: 0.59, w: 0.49, h: 0.41 },
    ],
  },
};

// Colour grades. Every value is our own palette; nothing is sampled from
// any game's artwork.
export const THEMES = {
  neon: {
    name: 'Neon Pink',
    skyTop: '#160a2e', skyMid: '#7b1e5b', skyLow: '#ff5e7a',
    sun: '#ffd166', sunCore: '#fff3b0',
    accent: '#ff2e88', accent2: '#37e6ff',
    bandTop: '#1c0b2e', bandBottom: '#0a0514',
    frame: '#ffffff', scrim: 'rgba(10, 4, 20, 0.55)',
    title: '#ffffff', titleEdge: '#1c0b2e', subtitle: '#37e6ff',
  },
  sunset: {
    name: 'Sunset Orange',
    skyTop: '#2b1055', skyMid: '#c94b4b', skyLow: '#ff9a3d',
    sun: '#ffe066', sunCore: '#fffbe0',
    accent: '#ff7a18', accent2: '#ffd166',
    bandTop: '#33122b', bandBottom: '#12060d',
    frame: '#ffffff', scrim: 'rgba(20, 5, 10, 0.55)',
    title: '#ffffff', titleEdge: '#2b0a1e', subtitle: '#ffd166',
  },
  teal: {
    name: 'Teal Coast',
    skyTop: '#04263b', skyMid: '#0e7c7b', skyLow: '#7ef0c1',
    sun: '#fff3b0', sunCore: '#ffffff',
    accent: '#2ee6a8', accent2: '#ffd166',
    bandTop: '#062b33', bandBottom: '#03161c',
    frame: '#ffffff', scrim: 'rgba(3, 20, 24, 0.55)',
    title: '#ffffff', titleEdge: '#03222b', subtitle: '#2ee6a8',
  },
};

// A panel's photo state: the image (or null), zoom, pan offset in panel
// fractions, and whether the photo fills or fits the panel.
export function blankPanel() {
  return { img: null, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
}

export function blankState() {
  return {
    layout: 'triptych',
    theme: 'neon',
    size: '1080x1080',
    title: 'NEON COAST',
    subtitle: 'A SUNSET DRIVE STORY',
    titleScale: 1,
    panels: [blankPanel(), blankPanel(), blankPanel(), blankPanel()],
  };
}

// Deterministic pseudo-random numbers, so an export is identical every run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawSky(ctx, w, h, theme) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.55, theme.skyMid);
  sky.addColorStop(1, theme.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // A few early stars in the upper sky.
  const rand = mulberry32(20261121);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 42; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.16;
    const r = 0.6 + rand() * 1.4;
    ctx.globalAlpha = 0.25 + rand() * 0.55;
    ctx.beginPath();
    ctx.arc(x, y, (r * w) / 1080, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Retro sun with horizontal slits, cut on its own canvas so the slits are
// clean against any sky behind it.
function drawSun(ctx, cx, cy, r, theme) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(r * 2) + 4;
  off.height = Math.ceil(r * 2) + 4;
  const c = off.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, off.height);
  g.addColorStop(0, theme.sunCore);
  g.addColorStop(0.55, theme.sun);
  g.addColorStop(1, theme.accent);
  c.fillStyle = g;
  c.beginPath();
  c.arc(off.width / 2, off.height / 2, r, 0, Math.PI * 2);
  c.fill();
  c.globalCompositeOperation = 'destination-out';
  let y = off.height * 0.52;
  let gap = 2;
  while (y < off.height) {
    c.fillRect(0, y, off.width, gap);
    y += gap + r * 0.16;
    gap += 1.5;
  }
  ctx.save();
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = r * 0.35;
  ctx.drawImage(off, cx - off.width / 2, cy - off.height / 2);
  ctx.restore();
}

// Dark city skyline along a baseline, with a few lit windows. The skyline
// leaves a gap around the sun so its striped disc stays visible.
function drawSkyline(ctx, w, baseY, topY, theme, gapX0, gapX1) {
  const rand = mulberry32(77);
  ctx.fillStyle = theme.bandBottom;
  let x = 0;
  while (x < w) {
    const bw = w * (0.03 + rand() * 0.05);
    const bh = (baseY - topY) * (0.25 + rand() * 0.55);
    const overlapsSun = x + bw > gapX0 && x < gapX1;
    if (!overlapsSun) {
      ctx.fillRect(x, baseY - bh, bw, bh);
      if (rand() > 0.6) ctx.fillRect(x + bw * 0.4, baseY - bh - 8, 2, 8); // antenna
    }
    x += bw + w * 0.008;
  }
  ctx.fillStyle = theme.accent2;
  for (let i = 0; i < 26; i++) {
    const wx = rand() * w;
    if (wx > gapX0 && wx < gapX1) continue;
    ctx.globalAlpha = 0.35 + rand() * 0.5;
    ctx.fillRect(wx, topY + rand() * (baseY - topY) * 0.8, 3, 3);
  }
  ctx.globalAlpha = 1;
}

// One palm silhouette: a curved trunk and fanning fronds.
function drawPalm(ctx, x, y, s, flip, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 34, -118);
  ctx.stroke();
  ctx.lineWidth = 5;
  const fronds = [-150, -115, -80, -45, -12, 18, 48];
  for (const a of fronds) {
    const rad = (a * Math.PI) / 180;
    const ex = 34 + Math.cos(rad) * 74;
    const ey = -118 + Math.sin(rad) * 44;
    const mx = 34 + Math.cos(rad) * 40;
    const my = -118 + Math.sin(rad) * 14 - 16;
    ctx.beginPath();
    ctx.moveTo(34, -118);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(34, -118, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Faint perspective neon grid on the title band.
function drawNeonGrid(ctx, w, topY, h, theme) {
  const horizon = topY + (h - topY) * 0.28;
  const cx = w / 2;
  ctx.save();
  ctx.strokeStyle = theme.accent;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * (w * 0.06), horizon);
    ctx.lineTo(cx + i * (w * 0.22), h);
    ctx.stroke();
  }
  let y = horizon;
  let step = 4;
  while (y < h) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    y += step;
    step *= 1.55;
  }
  ctx.restore();
}

function drawPhoto(ctx, img, rect, panel) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  let scale = panel.fit === 'contain'
    ? Math.min(rect.w / iw, rect.h / ih)
    : Math.max(rect.w / iw, rect.h / ih);
  scale *= panel.zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + panel.ox * rect.w;
  const cy = rect.y + rect.h / 2 + panel.oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (panel.fit === 'contain') {
    ctx.fillStyle = '#101018';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, theme, index) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, theme.skyMid);
  g.addColorStop(1, theme.bandTop);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let x = -rect.h; x < rect.w; x += 26) {
    ctx.beginPath();
    ctx.moveTo(rect.x + x, rect.y + rect.h);
    ctx.lineTo(rect.x + x + rect.h, rect.y);
    ctx.stroke();
  }
  const label = `PANEL ${index + 1} — ADD PHOTO`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `700 ${Math.max(13, rect.w * 0.055)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

// Big poster title: heavy italic caps, dark outline, accent drop shadow,
// slight forward skew. Uses only the system sans stack.
function drawTitleBlock(ctx, w, bandY, bandH, state, theme) {
  const title = state.title.trim().toUpperCase();
  const subtitle = state.subtitle.trim().toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = w / 2;
  const titleY = bandY + bandH * 0.42;
  if (title) {
    let size = bandH * 0.44 * state.titleScale;
    const setFont = (s) => {
      ctx.font = `italic 900 ${s}px "Arial Black", Arial, sans-serif`;
      try { ctx.letterSpacing = `${Math.round(s * 0.02)}px`; } catch { /* older canvas */ }
    };
    setFont(size);
    while (ctx.measureText(title).width > w * 0.92 && size > 12) {
      size -= 2;
      setFont(size);
    }
    ctx.save();
    ctx.translate(cx, titleY);
    ctx.transform(1, 0, -0.06, 1, 0, 0);
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = size * 0.14;
    ctx.shadowOffsetX = size * 0.045;
    ctx.shadowOffsetY = size * 0.045;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeStyle = theme.titleEdge;
    ctx.strokeText(title, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = theme.title;
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }
  if (subtitle) {
    const subSize = Math.max(12, bandH * 0.13);
    ctx.font = `700 ${subSize}px Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = theme.subtitle;
    ctx.fillText(subtitle, cx, bandY + bandH * 0.8);
  }
  ctx.restore();
}

function drawGrainAndVignette(ctx, w, h) {
  const rand = mulberry32(4242);
  const count = Math.floor((w * h) / 1400);
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
  const vg = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.72,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

// Draws the whole cover onto `canvas` at its own pixel size from `state`.
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const theme = THEMES[state.theme] ?? THEMES.neon;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.triptych;
  const u = w / 1080; // scale unit: artwork is authored at 1080 wide

  drawSky(ctx, w, h, theme);

  // Sky strip at the top: sun, skyline and palms frame the panels.
  const stripH = h * 0.1;
  const sunR = stripH * 0.52;
  drawSun(ctx, w * 0.5, stripH * 0.62, sunR, theme);
  drawSkyline(ctx, w, stripH, stripH * 0.35, theme, w * 0.5 - sunR * 1.05, w * 0.5 + sunR * 1.05);
  drawPalm(ctx, w * 0.045, stripH * 0.98, 0.62 * u, false, theme.bandBottom);
  drawPalm(ctx, w * 0.955, stripH * 0.98, 0.62 * u, true, theme.bandBottom);

  // Photo area between the sky strip and the title band.
  const bandH = h * 0.22;
  const bandY = h - bandH;
  const area = {
    x: w * 0.028,
    y: stripH + h * 0.018,
    w: w * 0.944,
    h: bandY - stripH - h * 0.036,
  };
  for (let i = 0; i < layout.panels; i++) {
    const f = layout.rects[i];
    const rect = {
      x: area.x + f.x * area.w,
      y: area.y + f.y * area.h,
      w: f.w * area.w,
      h: f.h * area.h,
    };
    const panel = state.panels[i] ?? blankPanel();
    if (panel.img) drawPhoto(ctx, panel.img, rect, panel);
    else drawEmptyPanel(ctx, rect, theme, i);
    ctx.lineWidth = Math.max(3, 7 * u);
    ctx.strokeStyle = theme.frame;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    // Thin neon inner edge on the selected-feel: a second accent line.
    ctx.lineWidth = Math.max(1, 2 * u);
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.55;
    ctx.strokeRect(rect.x + 4 * u, rect.y + 4 * u, rect.w - 8 * u, rect.h - 8 * u);
    ctx.globalAlpha = 1;
  }

  // Title band: dark scrim, neon grid, glowing rule, big title + subtitle.
  const bandGrad = ctx.createLinearGradient(0, bandY, 0, h);
  bandGrad.addColorStop(0, theme.bandTop);
  bandGrad.addColorStop(1, theme.bandBottom);
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, w, bandH);
  drawNeonGrid(ctx, w, bandY, h, theme);
  ctx.fillStyle = theme.scrim;
  ctx.fillRect(0, bandY, w, bandH * 0.4);
  ctx.save();
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 12 * u;
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, bandY, w, Math.max(2, 3 * u));
  ctx.restore();
  drawTitleBlock(ctx, w, bandY, bandH, state, theme);

  drawGrainAndVignette(ctx, w, h);
}

// Panel rectangles on the canvas, in canvas pixels, for hit-testing.
export function panelRectsOnCanvas(canvas, state) {
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.triptych;
  const stripH = h * 0.1;
  const bandH = h * 0.22;
  const bandY = h - bandH;
  const area = {
    x: w * 0.028,
    y: stripH + h * 0.018,
    w: w * 0.944,
    h: bandY - stripH - h * 0.036,
  };
  return layout.rects.slice(0, layout.panels).map((f) => ({
    x: area.x + f.x * area.w,
    y: area.y + f.y * area.h,
    w: f.w * area.w,
    h: f.h * area.h,
  }));
}
