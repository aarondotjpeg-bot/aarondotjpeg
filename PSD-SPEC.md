# PSD Spec — `pro26.psd` (parsed 2026-08-25)

Extracted with `psd-tools`. This is the machine-read truth of the file, not my
interpretation of it. Regenerated on every new PSD version.

**File:** 1920 × 15931 px canvas, RGB, 8-bit, 241 MB, 8 artboards.

---

## Artboards and panels

| Artboard | Canvas y | Height | Split guide | Panels | Content |
|---|---|---|---|---|---|
| 1 | 0 – 1080 | 1080 | — | **P1** | Home — wordmark, `aaron イーライ`, `©09-2026` |
| 2 | 1180 – 2260 | 1080 | — | **P2** | About — bio, What I do, Experience, Contact, View Resume |
| 3 | 2360 – 3988 | **1628** | — | **P3** | Works index — "Making Identities" + thumbnail grid |
| 4 | 4088 – 6288 | 2200 | +1080 | **P4 + P5** | Project 01 — NutraKey Health |
| 5 | 6388 – 8681 | 2293 | +1081 / +1097 | **P6 + P7** | Project 02 — Repp Sports |
| 6 | 8781 – 11017 | 2236 | +1081 | **P8 + P9** | Project 03 — Nutrex Research |
| 7 | 11431 – 13631 | 2200 | +1072 | — | **not built — ignore** |
| 8 | 13731 – 15931 | 2200 | — | — | **empty — ignore** |

**Nine panels confirmed.** The split guides on artboards 4–6 confirm the two-page
division exactly where you said.

### Panel heights — these are not uniform

| Panel | Source | Height | vs. one 1080 screen |
|---|---|---|---|
| P1 | AB1 | 1080 | 1.00× |
| P2 | AB2 | 1080 | 1.00× |
| **P3** | AB3 | **1628** | **1.51×** |
| P4 | AB4 top | 1080 | 1.00× |
| **P5** | AB4 bottom | **1120** | **1.04×** |
| P6 | AB5 top | 1081 | 1.00× |
| **P7** | AB5 bottom | **1196** | **1.11×** |
| P8 | AB6 top | 1081 | 1.00× |
| **P9** | AB6 bottom | **1155** | **1.07×** |

Four panels are taller than one screen. See the open questions.

---

## Safe areas (confirmed present)

| Edge | Guide | Inset |
|---|---|---|
| Top | +97 to +103 per artboard | **~100 px** ✓ as agreed |
| Bottom | −98 to −100 per artboard | **~100 px** ✓ as agreed |
| Left | x = 115 | 115 px |
| Right | x = 1805 | 115 px |

Additional vertical alignment guides at x = 128, 632, 731, 960 (center), 1289, 1330, 1844.

---

## Navigation

Element positions, identical on every artboard:

| Element | Bounds (x1, y1, x2, y2) | Size | Present on |
|---|---|---|---|
| Triangle mark (`Vector Smart Object`) | 115, 97 → 183, 156 | 68 × 59 | **All artboards 1–6** |
| Dot (`.` type layer) | 188, 147 → 199, 156 | 11 × 9 | All artboards 1–6 |
| X / close mark (`Vector Smart Object`) | 143, 121 → 156, 134 | 13 × 13 | **Artboard 1 only** |
| Active pill (`Layer 79`) | 217, 108 → 307, 147 | 90 × 39 | **Artboard 1 only** |
| Nav links (single type layer) | 227, 116 → 622, 138 | 395 × 22 | **Artboard 1 only** |

Nav link text is one layer: `home\t\tabout\t\tworks\t\tcontact`.

**Read of the two states:** artboard 1 shows the nav **expanded** (X visible, links out,
`home` pilled as active). Artboards 2–6 show it **collapsed** — triangle and dot only,
links retracted. That matches the described toggle behavior.

### Link targets

| Link | Target |
|---|---|
| home | P1 (artboard 1) |
| about | P2 (artboard 2) |
| works | P3 (artboard 3) — the Works index |
| contact | **no destination yet** — artboard 7/8 unbuilt |

---

## Fonts

| Family | Sizes in file | Web licensing |
|---|---|---|
| **Helvetica** | 12, 15, 18, 57 | ⚠️ Commercial (Monotype). Paid web license required. |
| **Helvetica-Bold** | 18, 46, 69, 73, 150 | ⚠️ Same. |
| **KozGoPr6N-Regular** (Kozuka Gothic Pr6N) | 57 | ⚠️ Adobe CC desktop font. Not self-hostable. Used only for `aaron イーライ`. |
| **Satoshi-Black** | 46, 54 | ✅ Free for web via Fontshare. |

**Type sizes present:** 12, 15, 18, 46, 54, 57, 69, 73, 150.

Free substitutes if we don't buy a Helvetica web license:
- **Inter** — screen-optimized, very close in feel, the modern default.
- **Nimbus Sans** or **Liberation Sans** — exact metric clones of Helvetica; identical
  line breaks and widths.
- **Noto Sans JP** — free, covers `イーライ` cleanly, replaces Kozuka Gothic.

---

## Structural notes for the build

1. **The PSD has no layer groups.** Every artboard's children are flat, and names are
   generic (`Layer 51`, `Layer 0 copy 2`, `Vector Smart Object`). Coordinates are exact
   and usable; semantic grouping has to come from you or from the rendered image.
2. **Body copy is placeholder.** The identical string `I'm aarondotjpeg, a
   multidisciplinary creative working across graphic design, br…` appears on artboards
   2, 3, 4, 5 and 6. Artboard 4 also carries `Lorem88 Ipsum`. Real per-project copy is
   still needed.
3. **Artwork bleeds far past the artboard bounds** — e.g. `Layer 98` spans
   (−887, −2946) → (4847, 3349) inside artboard 6. Photoshop clips this at the artboard
   edge, so the build must clip too. **The clip goes on an inner wrapper, never on the
   panel itself or any ancestor** — `overflow: hidden` on a sticky element's ancestor
   silently kills `position: sticky` and the whole slide effect dies.
4. **Real content confirmed** on artboard 2: `aarondotjpeg@gmail.com`, `View Resume`,
   experience entries `JULY 2025 – Present · Lead Web Designer / Art Director · Hydra
   Workflows` and `OCT 2022 – APR 2023`.
