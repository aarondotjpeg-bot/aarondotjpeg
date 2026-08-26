# Setup — working on this from any machine

## What you need

1. **Claude Code**
2. **Git**
3. **Python 3**, then one command:

```bash
python -m pip install psd-tools pillow fonttools brotli pymupdf
```

That's the whole toolchain. No Node, no build step, no package.json. Those five
packages are what read the PSD, render artboards to reference images, subset
fonts, and pull vector artwork out of smart objects.

## Get the code

```bash
git clone https://github.com/aarondotjpeg-bot/aarondotjpeg.git
```

## Get the PSD

The PSD is **not** in the repo — it is 242 MB and gitignored. It lives in
Dropbox at `PRO26/`.

Download it from Dropbox and put it in a `design/` folder inside the project:

```
aarondotjpeg/
  design/pro26.psd      <- gitignored, download it here
  web/                  <- the site
```

`design/` is ignored by git, so the file never gets committed by accident and
the path is the same on every machine.

**When the PSD changes:** save from Photoshop, upload to Dropbox, then download
it to `design/pro26.psd` on whichever machine you're building from. Tell Claude
the file has been updated — it re-parses and diffs against what it already knows.

## Run it

```bash
python -m http.server 8765 --directory web
```

Then <http://127.0.0.1:8765>. The style guide is at `/styleguide`.

## Moving between machines

```bash
git pull      # before starting
git push      # after finishing
```

Every build round ends in a commit, so that's already the natural boundary.

## Deploy

Vercel, static, no build step. `vercel.json` handles the configuration:
output directory `web`, clean URLs, and year-long immutable caching on fonts
and images while HTML revalidates.

Connect the GitHub repo in the Vercel dashboard and every push to `main`
deploys. If you create the project manually instead, set **Root Directory** to
`web`.

## Not in the repo

The old Wayback salvage of the previous site — `site/`, `content/`,
`recovery/`, `RECONCILIATION.md` and the existing `README.md` — is deliberately
untracked and stays on the desktop machine only. It is not part of this build.
