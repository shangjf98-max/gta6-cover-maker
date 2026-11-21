// Fixed scenes for screenshots: ?shot=editor shows the editor with sample
// photos loaded into every panel; ?shot=cover shows the cover alone.
// Query params: layout (triptych|grid|hero|banner), theme
// (neon|sunset|teal), size (1080x1080|1080x1350|1920x1080), title,
// subtitle, photos (comma list of sample names, one per panel), oy (comma
// list of vertical photo offsets per panel, to frame faces).
// window.__shotReady is set once the scene is painted.
export async function runShot(shot, query, env) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const scene = {
    layout: query.get('layout') ?? undefined,
    theme: query.get('theme') ?? undefined,
    size: query.get('size') ?? undefined,
    title: query.get('title') ?? undefined,
    subtitle: query.get('subtitle') ?? undefined,
    photos: query.get('photos') ? query.get('photos').split(',') : undefined,
    oy: query.get('oy') ? query.get('oy').split(',').map(Number) : undefined,
  };
  await env.applyScene(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
