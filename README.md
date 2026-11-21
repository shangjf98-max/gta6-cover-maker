# gta6-cover-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/shangjf98-max/gta6-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/shangjf98-max/gta6-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Coast Cover Studio: an offline web app that turns any photo and a caption into a multi-panel sunset poster — four layouts, three neon colour grades, per-panel crop and positioning, and one-click PNG export in the three common post sizes. All artwork (sunset sky, striped sun, skyline, palms, neon grid, grain) is drawn in code; no game artwork, logo or font is used, and photos never leave the machine.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network requests: `app/` is plain static files.

## How it works

1. Pick a layout: Triple Strip, Four Square, Hero + Two, or Wide + Two.
2. Load photos from your machine (file picker or drag and drop) — one photo can fill every panel, or each panel can hold a different photo. Photos are framed toward the top automatically so faces stay in frame; click a panel to select it, drag to move its photo, scroll to zoom, or use the zoom slider and fill/fit switch.
3. Edit the title and subtitle, pick a colour grade (Neon Pink, Sunset Orange, Teal Coast) and a title size.
4. Choose an export size and hit Export PNG.

## Export sizes

- 1080 × 1080 (square)
- 1080 × 1350 (portrait)
- 1920 × 1080 (landscape)

The preview always shows the cover at the selected export size, and the export renders the same drawing at full resolution.

## Originality

Every visual on the cover is original code in `app/src/cover.js`: gradient sky, retro striped sun, city skyline, palm silhouettes, neon grid floor, film grain and vignette. The lettering is the system heavy sans stack (Arial Black / sans-serif) with outline, shadow and skew applied in code. The two sample photos in `app/samples/` were made for make.fun with an image model and are free to use.

---

Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
