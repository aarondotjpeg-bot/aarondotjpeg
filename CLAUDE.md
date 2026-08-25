# aarondotjpeg — build rules

## The first rule: the PSD is the specification

**Every artboard must match `pro26.psd` as closely as the browser allows** —
position, size, type, spacing, colour, all of it. This is not a stylistic
preference, it is the point of the project: the composition carries the
atmosphere, and a "close enough" rebuild loses it.

Practically:

- **Never estimate a value that the file can tell you.** Position, font size,
  tracking, colour, dimensions — read them out of the PSD. If you catch yourself
  picking a number that looks right, stop and go measure.
- **When fidelity and animation conflict, fidelity wins.** Sacrifice the effect,
  not the look.
- **Add nothing that isn't in the PSD.** No decorative rules, borders, dividers
  or flourishes invented to fill space. A placeholder that ships is a bug.
- **Ask rather than invent.** If the file can't answer it — a hover state, a
  mobile stack order, a piece of copy — ask.

### Two traps that have already bitten

**1. Type layers carry scale transforms.** The `FontSize` Photoshop reports is
*not* the rendered size. The real size is `FontSize x transform[0]`. The nav
links read as 68.6pt in the file and render at **30px**. Always apply the
transform.

**2. Photoshop measures ink, CSS measures line boxes.** A text layer's bbox is
its ink extent; a CSS box includes the font's leading. To place type on a PSD
coordinate, measure the font's real metrics (canvas `TextMetrics` gives
`actualBoundingBoxAscent`/`Descent`) and offset the box accordingly. Satoshi
Black at 30px has ink ascent 23 / descent 1 — a 24px ink height inside a 30px
line box, sitting 3.5px below the box top.

### How to read the file

`psd-tools` is installed. Useful facts:
- Guides live in image resource `1032`, coordinates in 1/32 px, `direction==1`
  is horizontal.
- Smart objects embed vector PDFs — extract with `layer.smart_object.data` and
  convert to SVG with `pymupdf`. That is how the triangle and X were made.
- Rendered references for every artboard are in `web/assets/ref/`.
- Raw layer exports per artboard are in `web/assets/img/artboard-N/`.
  **These are unoptimised source PNGs (17 MB total)** — convert to sized
  AVIF/WebP when building a page. Never ship them as-is.

## Working agreement

- **Rundown before execution, every time.** What was understood, what will be
  built, which files change, what is assumed, what is deliberately deferred.
  Wait for approval.
- **Artboard by artboard.** Finish one, get sign-off, freeze it, move on.
- **Artboards 7 and 8 do not exist.** Do not build, stub or reference them.
- After each round, hand over the run command and what specifically to check.

## Architecture

Static HTML/CSS/JS in `web/`. No framework, no build step, no scroll library.

- `styles/` — cascade layers: `reset, tokens, base, layout, panels, components,
  utilities, overrides`. Component CSS consumes tokens only; no raw hex, no
  magic numbers.
- Nine panels in one document, stacked with `position: sticky`. Native scroll
  drives the slide — **no wheel or touch listener exists in this build, and none
  should be added.**
- **`overflow` other than `visible` on `html`, `body` or `.stack` kills
  `position: sticky` and the entire effect.** Panels clip internally via
  `.panel__inner`.
- Panels taller than the viewport offset their `top` so they reveal fully
  before being covered.
- Sticky elements report their *pinned* position, so `offsetTop` and
  `scrollIntoView()` both lie. Anchor jumps compute flow position from
  cumulative panel heights — see `flowTop()` in `scripts/panels.js`.

## Type and fonts

Self-hosted in `web/assets/fonts/`. Satoshi (Fontshare, free for web) in Light
300 / Regular 400 / Black 900. Noto Sans JP, subset to the three glyphs that
appear (イ ー ラ), replaces Kozuka Gothic Pr6N — a Creative Cloud desktop font
that cannot legally be served.

**Helvetica in the PSD maps to Satoshi:** Helvetica -> Satoshi Regular,
Helvetica-Bold -> Satoshi Black. The 68px full stop beside the triangle is
rebuilt as a CSS shape, not text.

Rendered sizes present in the file: 12, 15, 18, 30, 34, 36, 46, 57.
Only two tracking values exist: `-0.05em` (display, nav, dates) and `+0.01em`
(body, labels).

## Still open

- Artboard 7 (contact) not designed; the nav's `contact` link is disabled.
- The `logo` layer is raster-only in the PSD — an SVG export would sharpen it
  on high-density screens.
- Body copy on artboards 2-6 is placeholder and repeats.
