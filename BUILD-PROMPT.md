# Portfolio Website — Front-End Build Prompt

Copy **Part 1** into a fresh Claude Code session to start the build.
Parts 2–6 are the supporting agreement: the locked specs, what to hand over, how each
round works, what still needs deciding, and the traps worth heading off early.

---

## PART 1 — The master prompt (copy-paste this)

> **Project:** Build my portfolio website from scratch. This is a new build — nothing
> that exists anywhere else is a reference, an input, or a starting point. The
> Photoshop file is the only design source of truth.
>
> **Your job:** the front end — HTML structure, CSS system, responsive behavior, look
> and feel, scroll interaction, performance and accessibility. Design fidelity to the
> PSD is the primary measure of done.
>
> **Design source:** a layered PSD organized into artboards, designed at **1920 × 1080
> per page**. Layer groups are named and labeled to mark sections. The PSD is a moving
> target — I re-upload newer versions as I finish artboards. Always work from the newest
> version I've given you, and say which version you used.
>
> **Structure:** one continuous scrolling page. **Nine full-viewport panels**, each
> 100dvh, stacked in order. See the artboard map — artboards 1–3 are one page each,
> artboards 4–6 are two pages each. **Artboards 7 and 8 are unfinished; do not build,
> stub, or reference them.**
>
> **Scroll mechanic:** as I scroll down (mouse wheel, trackpad, or finger-swipe up on
> mobile), the next panel slides up from the bottom and takes over the screen, covering
> the panel behind it. The motion is tied 1:1 to my scroll input — it moves as much as I
> scroll, and stops when I stop. **This is native scroll, not scroll-jacking.** Do not
> intercept wheel or touch events. Do not use fullpage.js or any scroll-hijacking
> library. Build it with `position: sticky` panel stacking so the browser's own scroll
> physics drive the effect.
>
> **Hard rules for how you work with me:**
> 1. **Rundown before execution, every time.** Before you touch a file, tell me: what
>    you understood from my prompt, what you're about to build, which files you'll
>    create or change, what you're assuming, and what you're deliberately *not* doing
>    yet. Wait for my go-ahead. No surprise refactors.
> 2. **Artboard by artboard.** We finish one artboard completely — build, I test, we fix
>    — before starting the next. Never run ahead of where I am in the PSD.
> 3. **I test every part.** After each build round, give me the exact command to run it,
>    what to look at, and a short list of what specifically to check, including at which
>    screen widths.
> 4. **When the PSD changes,** diff the new version against the old, show me a plain
>    list of what changed, and tell me which built panels are affected — before editing
>    them.
> 5. **Ask instead of inventing.** If a spacing, color, breakpoint, hover state, or
>    piece of copy isn't determinable from the PSD, ask me. Do not fill gaps with
>    plausible-looking guesses.
> 6. **Stay inside the ask.** Build what I describe. Don't import patterns, content, or
>    assumptions from anywhere I didn't point you to.
> 7. **No dead code.** If something is a placeholder, mark it `TODO(artboard-N)`.
>
> **Foundation to build first, before any panel:**
> - A single design-token layer in CSS custom properties: color, type scale, spacing
>   scale, breakpoints, radii, shadows, easing curves, motion durations, layout widths,
>   z-index ladder. Every later rule consumes tokens — no raw hex, no magic numbers in
>   component CSS.
> - `@layer reset, tokens, base, layout, panels, components, utilities, overrides;` so
>   specificity never becomes a fight as the site grows.
> - A modern reset, fluid type via `clamp()`, mobile-first media queries, container
>   queries for components that appear at multiple widths.
> - Self-hosted, subset, preloaded fonts with `font-display: swap` and a metric-matched
>   fallback so there's no layout shift.
> - **The panel primitive** — one reusable full-viewport panel component that every page
>   drops into. One transition only: the slide.
>   Adding panel ten must be one file and one line in the panel list.
> - A living style guide page (`/styleguide`) rendering every token, type style, button
>   state and component in isolation.
>
> **Non-negotiable quality bars:**
> - Responsive at 320, 375, 414, 768, 1024, 1280, 1440, 1920 — nothing clipped, no
>   horizontal scroll ever, tap targets at least 44px.
> - Use `100dvh`/`svh`, never `100vh`, for panel height (mobile URL bar resize).
> - **Mobile keeps the desktop experience, not the desktop layout.** Same panel sequence,
>   same slide choreography. Columns stack, type uses its own scale with a 16 px
>   body floor, images re-crop rather than shrink, and mobile panels are
>   `min-height: 100dvh` rather than a fixed height.
> - `prefers-reduced-motion: reduce` fully honored — nothing moves that the user
>   didn't move.
> - Keyboard navigable (arrows, Page Up/Down, Home/End all work — a consequence of not
>   hijacking scroll), visible focus rings, semantic landmarks, skip link, real alt text,
>   AA contrast.
> - Every image: explicit width/height or `aspect-ratio`, `loading="lazy"` on panels 3+,
>   responsive `srcset`, AVIF/WebP with fallback. CLS under 0.1, LCP under 2.5s on a
>   mid-tier phone.
> - No JS framework and no animation library. Vanilla plus CSS only. The only JS in the
>   build is deep-link hash syncing and any progressive-enhancement fallback.
> - **First-view weight budget: under 1 MB.** Nine full-bleed panels in one document
>   makes this the main risk — panels below the fold must not load until near.
>
> **Scalability, because this grows:**
> - Component-per-file CSS, BEM-ish naming, nothing global that isn't a token.
> - The panel order lives in one data file, not in hand-copied markup.
> - Folder structure and naming conventions written into `CLAUDE.md` so future sessions
>   follow them without being told.
> - Adding panel ten must not require touching panels one through nine.
>
> **Deliverable each round:** working code, the one-line command to view it, and a note
> of anything in the PSD you couldn't translate and why.

---

## PART 2 — Locked specs

### Artboard map

| Artboard | Pages | Panels | Status |
|---|---|---|---|
| 1 | 1 | Panel 1 — Home | ready |
| 2 | 1 | Panel 2 | ready |
| 3 | 1 | Panel 3 | ready |
| 4 | 2 | Panels 4 + 5 | ready, split by a PSD guide |
| 5 | 2 | Panels 6 + 7 | ready, split by a PSD guide |
| 6 | 2 | Panels 8 + 9 | ready, split by a PSD guide |
| 7 | — | — | **not started — do not touch** |
| 8 | — | — | **not started — do not touch** |

**Nine panels total.** Build order follows artboard order.

### Transition rules

**One transition, everywhere: the slide.** The fade that was planned for the
two-page artboards was tested and dropped — every panel, including the second
half of artboards 4, 5 and 6, slides up over the one before it.

### How the slide is built

Panels are siblings, each `position: sticky; top: 0; height: 100dvh`. Later panels
paint over earlier ones, so as you scroll, the next panel rises from the bottom edge
and covers the one behind it, which stays pinned. The browser's own scroll drives it.

This matters: it means the effect works correctly with a trackpad, a mouse wheel,
momentum scroll on iOS, keyboard paging, a screen reader, and browser find-in-page —
all of which scroll-hijacking libraries break. It also costs roughly zero JavaScript.

### Canvas and breakpoints

**Don't redraw the PSD.** Whatever width you designed at is fine — the build reads the
comp as proportions, not as fixed pixels, so nothing needs re-laying-out. I'll confirm
the actual width when I parse the file.

Standard reference widths the build targets:

| Tier | Design reference | Range | Notes |
|---|---|---|---|
| Mobile | **390 px** | 320–767 | 390 = iPhone 14/15/16. 320 is the floor that must never break. |
| Tablet | **768 px** | 768–1023 | iPad portrait. |
| Desktop | **1440 px** | 1024–1919 | The industry-standard design width; most laptops land here. |
| Large | **1920 px** | 1920+ | Content caps at a max-width so it never stretches thin. |

**Vertical safe area:** a maximized browser window on a 1080p monitor gives about
1920 × 950 of usable height, not 1080 — browser chrome and the taskbar take the rest.
Keep everything essential inside a band roughly **100 px in from the top and bottom** of
each page, and treat those outer strips as decorative bleed that's allowed to crop.
Adding that guide to the PSD costs a minute and saves every panel.

### Mobile

Mobile keeps the desktop **experience**, not the desktop **layout** — the apple.com
approach. The choreography is identical: same nine panels, same order, same slide-up
between every panel. What changes is the composition:

- Columns and side-by-side pairs stack into a single column.
- Type switches to its own mobile scale with a **16 px body floor** — never a
  proportional shrink, which would put 24 px captions at 5 px.
- Images re-crop toward portrait rather than scaling down inside a letterbox.
- Panel height is **`min-height: 100dvh`**, not a fixed `height`. A panel that genuinely
  needs more vertical room in one column gets it and scrolls slightly longer, instead of
  crushing its own contents. The slide-up transition is unaffected.

First pass on each panel is my derivation; you review it against the desktop comp and
correct anything that reads wrong. Where a panel can't work in portrait without a real
design decision, I'll flag it rather than guess.

### Deep links

One page means one URL by default. Each panel gets an `id`, the hash updates as you
scroll, and landing on `#panel-4` jumps straight there — so individual sections stay
shareable without splitting the document.

---

## PART 3 — What to hand over with the PSD

I can't read a `.psd` directly — it's a binary format. Two ways to fix that, best first:

**Option A (preferred): let me parse it.** Drop the `.psd` in the project folder and
I'll install `psd-tools` and run a script that dumps, per artboard: layer and group
names, x/y/width/height, text content, font family + size + tracking + leading, fill
colors, opacity, blend mode, and the full nesting tree. That gives me real coordinates
and real type specs instead of eyeballed guesses. **Worth doing — it's the difference
between "close to the comp" and "matches the comp."**

**Option B (fallback): export by hand.**
- One flattened PNG per page at 1x **and** 2x, named `panel-01_home.png`
- One screenshot of the Layers panel per artboard, so I can read the group labels
- Assets exported individually: logos and icons as **SVG**, photos as PNG/JPG at 2x
- The font list, with the exact weights used

**Either way, also tell me:**
- The exact y-coordinate of the dividing guide on artboards 4, 5 and 6 (I can also read
  this straight out of the parse — guides are stored in the file)
- Which layer groups are one component vs. purely decorative
- Hover, active and focus states — these don't exist in a PSD, so either draw them or
  give me the rule ("all buttons: lighten 10% and lift 2px")
- Mobile: mobile artboards, or do I derive mobile from the desktop comps?

**PSD version naming:** `portfolio_v3.psd`, `_v4`, and so on — never overwrite `_v3`
with new content. I keep a parsed snapshot of each version, so I can diff v3 against v4
and tell you exactly what moved.

---

## PART 4 — The per-artboard loop

1. **You:** "Artboard N is ready," plus the PSD version.
2. **Me:** parse it, then give you the **rundown** — the section breakdown I see, the
   components I plan to build, what's reusable from earlier panels, my open questions.
   Nothing gets written yet.
3. **You:** correct me, answer the questions, say go.
4. **Me:** build. Tokens and shared components first, panel-specific CSS second.
5. **You:** test. I hand you the run command plus a checklist: which widths, which
   interactions, what should animate, what should not move.
6. **Me:** fix what you found. Then we tag the artboard done and freeze it — later
   artboards may extend the system but must not silently restyle a finished panel.

**Definition of done for an artboard:** matches the comp at 1920 width; works at all
eight breakpoints; the transition in and out is correct; keyboard reachable;
reduced-motion safe; images optimized; no console errors; every new token documented on
`/styleguide`; you've signed off.

---

## PART 5 — Decisions

| # | Decision | Status |
|---|---|---|
| 1 | Routes vs. one long scroll | **Decided: one continuous scrolling page, 9 panels, hash deep-links.** |
| 2 | Scroll feel | **Decided: sticky-stack slide-up, native scroll, no hijacking. Slide only — the fade was tested and dropped.** |
| 3 | Canvas | **Decided: PSD stays as drawn. Build targets 390 / 768 / 1440 / 1920.** |
| 4 | Artboard scope | **Decided: artboards 1–6 only. 7 and 8 untouched.** |
| 5 | Mobile design | **Decided: I derive mobile from the desktop comps, apple.com-style — identical choreography, reflowed layout. You correct me per panel.** |
| 6 | **Stack** — plain HTML/CSS/JS vs. a static site generator (Astro) | **Open.** Nine panels is fine by hand; the growth you described is where a generator pays off. My recommendation: Astro, ships zero JS by default. |
| 7 | Hosting | Open. Recommend Vercel or Netlify — free, auto-deploys, gives a preview URL you can open on your actual phone. |
| 8 | Contact form | Open. Formspree or Netlify Forms — a static site can't send email on its own. |
| 9 | Copy | Open. Send real text per page as we go; lorem hides layout problems. |

---

## PART 6 — What wasn't in your prompt, and will bite

1. **Mobile is a reflow, not a shrink — the one place "just scale it down" fails.**
   Scaling a 1920-wide panel to a 390-wide phone is a 4.9× reduction: 24 px caption type
   lands at 5 px, and a 44 px tap target lands at 9 px. What apple.com actually does is
   keep the choreography and change the layout. That's the plan here — see the mobile
   section in Part 2.
2. **Some panels will not fit a portrait phone at exactly one screen.** A composition
   built wide often needs more vertical room once it stacks into a single column. That's
   why mobile panels are `min-height: 100dvh` rather than a hard `height` — a dense panel
   gets the room it needs, instead of crushing its own text to fit an arbitrary limit.
3. **Font licensing.** If the PSD uses Adobe Fonts, that's a *desktop* license — those
   files legally cannot be self-hosted on a website. Send me the font names early and
   I'll find the web-licensed or open-source equivalent before the type system is built.
4. **Nine full-bleed panels in one document is a weight problem.** If each panel carries
   a full-screen image, a naive build is a 10 MB first load. Panels 3+ lazy-load, images
   go out as AVIF/WebP at multiple sizes, and only panel 1's hero gets preloaded.
5. **Version control.** `git init` before we build — so every artboard is a commit you
   can roll back, and "the old version looked better" is a revert, not a rebuild.
6. **Sticky stacking has one real gotcha:** `overflow: hidden` or `overflow: clip` on
   any ancestor of the panels silently kills `position: sticky`. If the slide ever stops
   working after a CSS change, that's the first thing to check.
7. **Real-device testing beats DevTools.** iOS Safari has its own opinions about
   viewport height, `position: sticky` and momentum scroll. A deploy preview opened on
   your actual phone catches what a desktop simulator won't.
8. **Reduced motion is a real user setting.** Full-screen panel transitions are exactly
   the kind of motion that triggers it. The sticky-stack approach is inherently safe —
   the "slide" is just the user's own scrolling, so it stays safe by construction.
9. **`CLAUDE.md` is the memory across sessions.** Once conventions are set they go in
   that file, so a future session picks up your naming, tokens and rules without you
   re-explaining. I'll write it during the foundation round.
10. **Browser support floor.** Recommended: last 2 versions of Chrome, Safari, Firefox
    and Edge, plus iOS Safari 15+. It decides whether I can use CSS scroll-driven
    queries natively or need fallbacks.
11. **Favicon, OG image, page title, meta description, sitemap.** Invisible until you
    paste a link somewhere and it looks broken. Budget one round at the end.
