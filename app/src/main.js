// Neon Coast Cover Studio — editor wiring.
//
// Loads photos from the user's machine (file picker or drag and drop),
// lets each panel be cropped and positioned, edits the caption, and exports
// the cover as a real PNG in 1080 x 1080, 1080 x 1350 or 1920 x 1080.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCoverArt, panelRectsOnCanvas, panLimits, defaultOy, blankPanel, blankState, LAYOUTS, THEMES, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelLabel = document.getElementById('panel-label');
const state = blankState();
let selected = 0;

const $ = (id) => document.getElementById(id);

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function layoutCount() {
  return (LAYOUTS[state.layout] ?? LAYOUTS.triptych).panels;
}

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
    canvas.style.aspectRatio = `${size.w} / ${size.h}`;
  }
  drawCoverArt(canvas, state);
  syncControls();
}

function syncControls() {
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('on', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false');
  });
  document.querySelectorAll('[data-theme]').forEach((b) => {
    b.classList.toggle('on', b.dataset.theme === state.theme);
    b.setAttribute('aria-pressed', b.dataset.theme === state.theme ? 'true' : 'false');
  });
  document.querySelectorAll('[data-size]').forEach((b) => {
    b.classList.toggle('on', b.dataset.size === state.size);
    b.setAttribute('aria-pressed', b.dataset.size === state.size ? 'true' : 'false');
  });
  const panel = state.panels[selected];
  panelLabel.textContent = `Panel ${selected + 1} of ${layoutCount()}`;
  $('zoom').value = String(panel.zoom);
  $('zoom-out').textContent = `${Math.round(panel.zoom * 100)}%`;
  $('fit').value = panel.fit;
  $('title-size').value = String(state.titleScale);
  document.body.dataset.theme = state.theme;
}

function setStatus(text) {
  status.textContent = text;
}

function setPhotoIntoPanel(fileOrUrl, index, done) {
  const apply = async (img) => {
    const panel = { ...blankPanel(), img };
    panel.oy = defaultOy(img, panelRectsOnCanvas(canvas, state)[index], panel);
    state.panels[index] = panel;
    redraw();
    setStatus(`Photo loaded into panel ${index + 1}.`);
    done?.();
  };
  if (typeof fileOrUrl === 'string') {
    loadImage(fileOrUrl).then(apply, () => setStatus('That sample could not be loaded.'));
  } else {
    const url = URL.createObjectURL(fileOrUrl);
    loadImage(url).then(
      (img) => { URL.revokeObjectURL(url); apply(img); },
      () => { URL.revokeObjectURL(url); setStatus('That file is not a readable image.'); },
    );
  }
}

// Fill every panel of the current layout with one photo.
function fillAllPanels(fileOrUrl) {
  const apply = async (img) => {
    const rects = panelRectsOnCanvas(canvas, state);
    for (let i = 0; i < layoutCount(); i++) {
      const panel = { ...blankPanel(), img };
      panel.oy = defaultOy(img, rects[i], panel);
      state.panels[i] = panel;
    }
    redraw();
    setStatus(`One photo fills all ${layoutCount()} panels.`);
  };
  if (typeof fileOrUrl === 'string') {
    loadImage(fileOrUrl).then(apply, () => setStatus('That sample could not be loaded.'));
  } else {
    const url = URL.createObjectURL(fileOrUrl);
    loadImage(url).then(
      (img) => { URL.revokeObjectURL(url); apply(img); },
      () => { URL.revokeObjectURL(url); setStatus('That file is not a readable image.'); },
    );
  }
}

async function loadSample(name) {
  return loadImage(`samples/${name}.jpg`);
}

// --- Controls -------------------------------------------------------------

document.querySelectorAll('[data-layout]').forEach((b) => {
  b.addEventListener('click', () => {
    state.layout = b.dataset.layout;
    selected = Math.min(selected, layoutCount() - 1);
    // Re-frame the panels the app framed itself for the new layout's
    // panel shapes; panels the person dragged or zoomed keep their crop.
    const rects = panelRectsOnCanvas(canvas, state);
    for (let i = 0; i < layoutCount(); i++) {
      const panel = state.panels[i];
      if (panel.img && panel.autoFramed) panel.oy = defaultOy(panel.img, rects[i], panel);
    }
    redraw();
    setStatus(`Layout: ${LAYOUTS[state.layout].name}.`);
  });
});
document.querySelectorAll('[data-theme]').forEach((b) => {
  b.addEventListener('click', () => {
    state.theme = b.dataset.theme;
    redraw();
    setStatus(`Colour grade: ${THEMES[state.theme].name}.`);
  });
});
document.querySelectorAll('[data-size]').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    redraw();
    setStatus(`Export size: ${state.size.replace('x', ' × ')}. Preview matches it.`);
  });
});

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('title-size').addEventListener('input', (e) => {
  state.titleScale = Number(e.target.value);
  redraw();
});
$('zoom').addEventListener('input', (e) => {
  const panel = state.panels[selected];
  panel.zoom = Number(e.target.value);
  panel.autoFramed = false;
  redraw();
});
$('fit').addEventListener('change', (e) => {
  const panel = state.panels[selected];
  panel.fit = e.target.value;
  if (panel.img && panel.autoFramed) {
    panel.oy = defaultOy(panel.img, panelRectsOnCanvas(canvas, state)[selected], panel);
  }
  redraw();
});
$('reset-panel').addEventListener('click', () => {
  const img = state.panels[selected].img;
  const panel = { ...blankPanel(), img };
  if (img) panel.oy = defaultOy(img, panelRectsOnCanvas(canvas, state)[selected], panel);
  state.panels[selected] = panel;
  redraw();
  setStatus(`Panel ${selected + 1} crop reset.`);
});
$('clear-panel').addEventListener('click', () => {
  state.panels[selected] = blankPanel();
  redraw();
  setStatus(`Panel ${selected + 1} cleared.`);
});
$('photo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) setPhotoIntoPanel(file, selected);
  e.target.value = '';
});
$('fill-all').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) fillAllPanels(file);
  e.target.value = '';
});
$('sample-boulevard').addEventListener('click', () => setPhotoIntoPanel('samples/boulevard.jpg', selected));
$('sample-pier').addEventListener('click', () => setPhotoIntoPanel('samples/pier.jpg', selected));
$('sample-fill-all').addEventListener('click', () => fillAllPanels('samples/boulevard.jpg'));

// --- Crop by dragging on the preview, wheel to zoom ------------------------

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

function panelAt(point) {
  const rects = panelRectsOnCanvas(canvas, state);
  for (let i = rects.length - 1; i >= 0; i--) {
    const rc = rects[i];
    if (point.x >= rc.x && point.x <= rc.x + rc.w && point.y >= rc.y && point.y <= rc.y + rc.h) return i;
  }
  return -1;
}

let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(p);
  if (hit < 0) return;
  selected = hit;
  try { canvas.setPointerCapture(e.pointerId); } catch { /* drag still works without capture */ }
  dragging = { x: p.x, y: p.y, ox: state.panels[hit].ox, oy: state.panels[hit].oy };
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const rects = panelRectsOnCanvas(canvas, state);
  const rc = rects[selected];
  const panel = state.panels[selected];
  panel.autoFramed = false;
  panel.ox = dragging.ox + (p.x - dragging.x) / rc.w;
  panel.oy = dragging.oy + (p.y - dragging.y) / rc.h;
  // Stop the drag where the photo would stop covering the panel.
  if (panel.img) {
    const lim = panLimits(panel.img, rc, panel);
    panel.ox = Math.max(-lim.ox, Math.min(lim.ox, panel.ox));
    panel.oy = Math.max(-lim.oy, Math.min(lim.oy, panel.oy));
  } else {
    panel.ox = Math.max(-1, Math.min(1, panel.ox));
    panel.oy = Math.max(-1, Math.min(1, panel.oy));
  }
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = canvasPoint(e);
  const hit = panelAt(p);
  if (hit < 0) return;
  selected = hit;
  const panel = state.panels[hit];
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  panel.autoFramed = false;
  redraw();
}, { passive: false });

// Drag and drop photos: one file fills the selected panel, several fill
// the panels in order.
canvas.addEventListener('dragover', (e) => { e.preventDefault(); });
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'));
  if (!files.length) return;
  if (files.length === 1) setPhotoIntoPanel(files[0], selected);
  else files.slice(0, layoutCount()).forEach((f, i) => setPhotoIntoPanel(f, i));
});

// --- Export ---------------------------------------------------------------

// Renders the cover at the exact export size and downloads it as a PNG.
export function exportCover(sizeKey) {
  const size = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCoverArt(off, { ...state, size: sizeKey });
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-coast-cover-${size.w}x${size.h}.png`;
      a.click();
      setStatus(`Saved neon-coast-cover-${size.w}x${size.h}.png (${size.w} x ${size.h}).`);
      resolve({ w: size.w, h: size.h, bytes: blob.size });
    }, 'image/png');
  });
}

$('export').addEventListener('click', () => exportCover(state.size));

// --- Fixed screenshot scenes ----------------------------------------------

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    async applyScene(scene) {
      if (scene.layout) state.layout = scene.layout;
      if (scene.theme) state.theme = scene.theme;
      if (scene.size) state.size = scene.size;
      if (scene.title !== undefined) { state.title = scene.title; $('title').value = scene.title; }
      if (scene.subtitle !== undefined) { state.subtitle = scene.subtitle; $('subtitle').value = scene.subtitle; }
      const names = scene.photos ?? ['boulevard', 'pier', 'boulevard', 'pier'];
      for (let i = 0; i < layoutCount(); i++) {
        state.panels[i] = { ...blankPanel(), img: await loadSample(names[i % names.length]), autoFramed: false };
        if (scene.oy && Number.isFinite(scene.oy[i])) state.panels[i].oy = scene.oy[i];
      }
      redraw();
    },
    coverOnly: shot === 'cover',
  });
} else {
  redraw();
}
