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

## Two machines

The repo lives on GitHub; the PSD does not (it is 242 MB and gitignored).

- **PSD:** kept in Dropbox under `PRO26/`, downloaded by hand to `design/pro26.psd`
  inside the project. `design/` is gitignored, so the path is identical on every
  machine and the 242 MB file never reaches a commit. Reading it needs a real
  filesystem path — a dropbox.com URL is not usable. When the user says the PSD
  has been updated, re-parse and diff before touching anything already built.
- **Laptop setup:** Claude Code, git, Python 3, then
  `python -m pip install psd-tools pillow fonttools brotli pymupdf`.
  Those five are what read the PSD, render artboards, subset fonts and pull
  vector out of smart objects. Nothing else is needed — the dev server is
  `python dev-server.py` (a no-cache wrapper; the stock http.server lets the
  browser serve stale JS, which reads as a bug that was already fixed).
- **Rhythm:** `git pull` before a session, `git push` after. Every round ends in
  a commit, so that is already the boundary.

## Deployment

Vercel, static, no build step. `vercel.json` sets `outputDirectory: web` and
long-lived immutable caching for fonts and images; HTML revalidates. If the
Vercel project is created through the dashboard instead, its Root Directory
must be set to `web`.

## Where the build is

Twelve panels from artboards 1-8. No placeholder shells remain.


| Panel | Artboard | State |
|---|---|---|
| 1 Home | 1 | **built, signed off** |
| 2 About | 2 | **built, signed off** |
| 3 Works index | 3 | **built, signed off** |
| 4-5 NutraKey | 4 | **built** |
| 6-7 Repp Sports | 5 | **built** |
| 8-9 Nutrex | 6 | **built** |
| 10-11 World Wide Web / Content Creation | 7 | **framework built** — artwork placeholder |
| 12 Contact | 8 | **framework built** — artwork placeholder, nav link live |

Artboards 4-6 are image collages of 21-29 overlapping layers. Composite the
artwork into one image per panel and keep only the real text as text.

**Check the artboard for MULTIPLY layers first.** If there are none, use
`ab.composite()` — psd-tools is correct without blend modes and gets layer
order right. The manual compositor below is only for artboards that DO have
multiply layers, and its paint order has been wrong at least once: on artboard
8 a full-bleed white layer wiped everything beneath it. Always sanity-check the
output against `ab.composite()`.

**Two things that will bite:** several shadow layers are MULTIPLY, and
psd-tools composites those as NORMAL — opaque grey slabs instead of darkening
what is beneath. Composite manually with real per-layer blending. And save
LOSSLESS: this artwork is hard product edges on flat white, the worst case for
lossy ringing; even quality 98 leaves visible halos.

## Settled — do not revisit without being asked

These cost several rounds each. They are decisions, not defaults:

- **Continuous scroll, no page transition.** The site was originally built as
  a sticky-panel stack where each artboard slid up to cover the one before it
  (see git history before 2026-08-27 if that mechanic is ever needed for
  reference). It was removed entirely — not swapped for a different
  transition, removed — because it read poorly on mobile/tablet. Panels are
  now plain sections in normal document flow, one after another. Do not
  reintroduce `position: sticky` on `.panel` or any per-panel slide/fade
  effect without being explicitly asked.
- **Nav starts open** (`data-open="true"` in the HTML, matching artboard 1)
  and never collapses itself. No auto-collapse on scroll, no auto-open on
  returning home — an earlier version did both and the competing animations
  fought each other. The toggle is still the visitor's alone from there.
- **No current-page state.** The pill is hover and focus only. `aria-current`
  stays for screen readers but paints nothing.
- **Nav link slide is 684ms**, eased `cubic-bezier(0.4, 0, 0.2, 1)`, with a
  **linear** opacity fade — on an eased curve the fade collapses in the first
  third and reads as no fade at all.
- **The clip window starts at the triangle's RIGHT edge.** At the left edge the
  links show through the mark's transparent corners.
- **The email hover is an underline**, not a weight change. Both were tried.

## Working agreement

- **Rundown before execution, every time.** What was understood, what will be
  built, which files change, what is assumed, what is deliberately deferred.
  Wait for approval.
- **Artboard by artboard.** Finish one, get sign-off, freeze it, move on.
- **Artboards 7 and 8** were empty in the parsed version. They are being
  finished; build them only from a PSD that actually contains them.
- After each round, hand over the run command and what specifically to check.

## Architecture

Static HTML/CSS/JS in `web/`. No framework, no build step, no scroll library.

- `styles/` — cascade layers: `reset, tokens, base, layout, panels, components,
  utilities, overrides`. Component CSS consumes tokens only; no raw hex, no
  magic numbers.
- Twelve sections in one document, in normal document flow (continuous
  scroll — no `position: sticky`, no JS-driven pinning). The browser's own
  scroll is the entire mechanism — **no wheel or touch listener exists in
  this build, and none should be added.** Each section's `--ar` (design
  height / 1920) sets a `min-height` so the composition keeps the PSD's
  proportions at any viewport width; a section with more content than that
  floor just grows to fit, no JS measurement involved.
- Anchor ids name the section they point to (`nutrakey`, `repp-sports`,
  `world-wide-web`, etc., not `work-01a`/`work-01b`). Nav only links to
  home/about/works/contact — individual project sections are addressable by
  hash but not surfaced in the nav UI.
- Panels are normal flow now, so `getBoundingClientRect()`/`scrollIntoView()`
  are trustworthy — no cumulative-height workaround needed for anchor jumps.
- **Two different artwork patterns, don't mix them up:**
  - **Full-bleed collages** (NutraKey, Repp Sports, Nutrex) use `.pj-bg`: a
    plain background image sized to the *panel* (`position:absolute;inset:0;
    object-fit:cover`), living OUTSIDE `.stage` as a sibling, not inside it.
    It always fills edge-to-edge and crops instead of leaving a gap.
  - **Everything else** (Content Creation, Contact's placeholder, the World
    Wide Web carousel) uses `.pj-art` / lives inside `.stage`: positioned in
    the same design-pixel coordinate space as the text around it, because
    it's a specific element at a specific spot, not full-bleed background.
  - These are deliberately decoupled, not locked to one shared scale — a
    single coordinate space can guarantee "background never gaps" or "text
    never crops" but not both at every aspect ratio. Locking them together
    is what caused the caption-drift bug from before; forcing everything to
    `.pj-bg`-style cover scaling is what caused the text-gets-clipped-off-
    the-edge bug after that. See `styles/project.css` for the reasoning.

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

- Artboards 7 and 8 are framework only. Text and coordinates are exact from the
  PSD; the artwork is placeholder and gets replaced when the final images land.
  Artboard 8 is the contact page and the nav link now points at it.
- Domain `aarondotjpeg.com` is owned and needs pointing at Vercel.
- The `logo` layer is raster-only in the PSD — an SVG export would sharpen it
  on high-density screens.
- Body copy on artboards 3-6 still repeats the About paragraph; artboard 2's
  copy turned out to be real and final.
- No favicon, OG image or per-panel meta yet.
