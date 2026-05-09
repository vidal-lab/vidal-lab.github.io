# UPDATE.md — Refresh the Vidal Lab website

> **Branch note:** on `design-experiments` the site uses a redesigned static-HTML layout driven by JS data. `build.py` is disabled. Edit pages and `assets/js/*.js` data files directly. The instructions below describe the legacy `content/*.md` + `build.py` flow on `main`.

Run this whenever the lab needs its homepage refreshed. The procedure is split into two independent tasks; do both unless the user says otherwise.

## Conventions

- All editable copy lives in `content/*.md`. Do **not** hand-edit `index.html`, `people.html`, `tutorials.html`, `data-code.html`, `talks.html`, etc. — they're generated.
- After any change to `content/`, run `python3 build.py` to regenerate. Confirm "Done. Built 7 pages." (`index`, `people`, `rene-vidal`, `teaching`, `talks`, `tutorials`, `data-code`).
- `research.html` is **not** rebuilt by `build.py`. To refresh publications, run `python3 scripts/parse_bib.py`. Its `<nav>` is also not regenerated — if you change navbar structure in `build.py`, hand-mirror the change in `research.html`.
- The bibliography of record is `vidal.bib`. Dates referenced below come from arXiv IDs (`YYMM.NNNNN`) and the `year =` field.
- Thumbnails live in two places. Keep them in sync:
  - `assets/img/projects/<slug>.<ext>` — used by the carousel slider.
  - `assets/img/thumbnails/<slug>.<ext>` — used by the highlights grid.
- Never commit secrets, `.claude/`, or files >5 MB unless explicitly asked.

### Site navigation

The top nav has Home / People / Research / Teaching plus a **More** dropdown containing Talks, Tutorials, and Data &amp; Code. The dropdown is rendered by `render_navbar()` in `build.py` (and mirrored by hand in `research.html`). Tutorials and Data &amp; Code are no longer on the home page — they live on `tutorials.html` and `data-code.html`. The `More` toggle gets `.active` automatically when the active page is `talks`, `tutorials`, or `data-code`.

---

## Task 1 — Refresh project highlights

The home page has two parallel lists in `content/index.md`:

1. `project_carousel:` — the rotating slider at the top.
2. `highlights:` — the grid of cards lower down.

Both should stay in sync (same set of papers, same ordering newest-first).

### Step 1.1 — Inventory what's currently shown

```
grep -nE 'title:|venue:' content/index.md | head -60
```

Note each highlight's title and venue. This is your "current set."

### Step 1.2 — Find candidate new papers

```
grep -B1 -A12 'year\s*=\s*{2025\|year\s*=\s*{2026\|year\s*=\s*{2027' vidal.bib
```

(Use the current year and the previous year. Bump the years in this command as time passes.)

For each entry, record: BibTeX key, title, authors, venue (decode the `@string` like `cvpr` → "IEEE/CVF Conference on Computer Vision and Pattern Recognition" — for the website, use the short form like `CVPR 2025`), and the arXiv URL from `Bib2Html_Dl_Pdf` (convert `/pdf/<id>` → `/abs/<id>`).

A paper is a **candidate** if:
- It's at a top-tier venue (CVPR, ICCV, ECCV, NeurIPS, ICML, ICLR, AISTATS, MICCAI, journals like TBME/PAMI), OR
- The user explicitly mentions it.

### Step 1.3 — Decide what to drop

Ask the user: "Currently highlighted: [list]. New candidates from the bib: [list]. Which to drop and which to add?" Offer a default of *drop the oldest 1–3 entries; add the newest 1–3 candidates not already present*.

Skip this prompt and use the default if the user said "auto" or "just refresh."

### Step 1.4 — Download thumbnails for new entries

For each new paper, find a teaser image in this order of preference:

1. **Dedicated project page** — search `<author github.io username>/<paper slug>` or look at the first author's personal site (e.g. `hanchmin.github.io`, `peterljq.github.io`, `ryanchankh.github.io`). Project pages usually have a `static/images/teaser.png` or `assets/img/teaser.png`.
2. **GitHub README** — if the repo exists, raw images via `https://raw.githubusercontent.com/<user>/<repo>/main/<path>`.
3. **arXiv HTML version** — `https://arxiv.org/html/<id>v<latest>/x1.png` is usually Figure 1.
4. **Author publication-preview** — e.g. `https://hanchmin.github.io/assets/img/publication_preview/<slug>.png`.

Verify each download:
```
file <path>          # must report image data, not HTML
ls -la <path>        # must be > 5 KB and < 5 MB
```

If only an animation (>5 MB GIF) is available, downsize via `ffmpeg` or skip with a note.

Save into both directories with a slug filename:
```
cp /tmp/<paper>.png assets/img/thumbnails/<slug>.<ext>
cp /tmp/<paper>.png assets/img/projects/<slug>.<ext>
```

You may delegate the download work to a research subagent (general-purpose) — see the Voyaging/SECA precedent in git history.

### Step 1.5 — Edit `content/index.md`

For **each** added paper, append/insert (in newest-first order) into both lists.

In `project_carousel:`:
```yaml
  - title: "<Paper title, short>"
    subtitle: "<Subtitle line, e.g. tagline or venue context>"
    authors: "<First, Second, ..., René Vidal>"
    venue: "<NeurIPS 2025>"
    description: "<One sentence, concrete about the contribution.>"
    image: assets/img/projects/<slug>.<ext>
    project_url: "<optional, omit if no project page>"
    paper_url: "https://arxiv.org/abs/<id>"
```

In `highlights:`:
```yaml
  - venue: "<NeurIPS 2025>"
    title: "<Full paper title>"
    authors: "<author list>"
    thumbnail: "assets/img/thumbnails/<slug>.<ext>"
    links:
      - text: "Project"          # optional
        url: "<project_url>"
      - text: "Paper"
        url: "https://arxiv.org/abs/<id>"
```

For **each** dropped paper, remove the corresponding YAML block from both lists.

Keep the two lists in the same order.

### Step 1.6 — Rebuild and verify

```
python3 build.py
```

Open `http://localhost:8000` (start `python3 -m http.server 8000` in the background if not already running). Confirm:
- Slider auto-advances every 6 s; prev/next/dots all work.
- Each slide's image fills the left panel without cropping (`object-fit: contain`).
- Highlights grid below shows the new cards with thumbnails not cropped.

---

## Task 2 — Update news

The news list is `news:` in `content/index.md`. Each entry is `date` + `text`:

```yaml
news:
  - date: "Feb 2026"
    text: "<short sentence>"
```

### Step 2.1 — Identify new news items

Ask the user (or check provided sources) for:

1. **Paper acceptances** — any new entries in `vidal.bib` since the last update whose venue isn't yet mentioned in news. Cross-reference: `grep -E '"year' content/index.md` won't help — instead diff `vidal.bib` against the most recent commit:
   ```
   git log -1 --format=%H -- vidal.bib
   git diff <that-hash>..HEAD -- vidal.bib | grep '^+@' | head
   ```
2. **Workshops & tutorials** — new entries the user wants surfaced. Check `content/talks.md` and `content/index.md`'s `tutorials:` list for additions.
3. **Speaker / invited-talk events for René Vidal** — usually conveyed verbally. Confirm with the user; check `content/talks.md` for new entries.

If none of the above can be determined automatically, ask the user explicitly: "Anything new to add to News? (paper acceptances, workshops, talks)"

### Step 2.2 — Style guide for news entries

- `date` — month + year, e.g. `"Feb 2026"`. Always quote.
- `text` — one sentence, present tense, no trailing period when terse, with a period if the sentence is full. Match the surrounding entries' tone.
- For multiple acceptances at the same venue, prefer one combined entry: `"Three papers accepted to NeurIPS 2026!"` rather than three separate ones.
- Keep the list **newest-first**. Insert at the top.
- Trim the bottom of the list if it grows past ~6 entries.

### Step 2.3 — Apply and rebuild

Edit `content/index.md`, then:

```
python3 build.py
```

Verify the News section on the home page reflects the changes.

---

## Task 3 — Update Tutorials &amp; Workshops

Edit `content/tutorials.md`. Two parallel lists:

- `tutorials:` — renders the **Tutorials** table on `tutorials.html`.
- `workshops:` — renders the **Workshops Organized** table beneath it.

Each row uses the same shape:

```yaml
  - year: "2025"
    title: "<short title>"
    venue: "<CVPR 2025>"
    url: "<page or empty string>"
```

Both tables use the `.teaching-table` style (Year / Title / Venue / Link). Keep entries newest-first. If `url` is empty the Link cell renders as "—".

Historical entries (2005–2017) were imported from `vision.jhu.edu/activity.htm`; preserve them when adding new ones.

Run `python3 build.py` and verify both tables render on `tutorials.html`.

---

## Task 4 — Update Talks

Edit `content/talks.md`. Talks are grouped under `sections:`, each with a `heading` and a list of `talks` (`title`, `venue`, `date`). Add new invited talks / keynotes to the appropriate section, newest-first under "Recent Conference Talks." Run `python3 build.py` and confirm the `talks.html` output.

---

## Task 5 — Update Data &amp; Code

Edit `content/data-code.md`. The single `data_code:` list renders on `data-code.html` as `<a>` + description bullets. Run `python3 build.py` to regenerate.

---

## Task 6 — Commit & push (only when the user asks)

Default behavior is **never** auto-commit. If the user says "commit and push":

```
git add content/ assets/img/projects/ assets/img/thumbnails/ index.html people.html
git commit -m "<short summary, e.g. 'refresh highlights and news'>"
git push origin main
git push upstream main
```

Both `origin` (ryanchankh/vidal-lab-website) and `upstream` (vidal-lab/vidal-lab.github.io) should track the same `main`.

If pushing to `main` is blocked by the auto-mode classifier, ask the user to run the push themselves with `! git push origin main && git push upstream main`.

---

## Troubleshooting

- **Carousel images zoomed/cropped** — check `.project-image { background-size: contain }` and `.highlight-thumb img { object-fit: contain }` in `assets/css/style.css`.
- **Slider buttons/dots don't work** — `assets/js/main.js` must count `.project-slide` (not just `.carousel-slide`/`<img>`); the count selector in the carousel init handles all three.
- **Image is HTML, not an image** — re-download; some servers return a "captcha" or redirect HTML for hotlinks. Use a different source.
- **arXiv HTML 404** — try `v1` instead of `v2`, or use `arxiv.org/abs/<id>` and screenshot/skip.
- **`research.html` shows wrong publications** — run `python3 scripts/parse_bib.py`.
- **`research.html` navbar out of sync** — `research.html` is not regenerated by `build.py`; update its `<nav>` and footer Links list by hand to match `render_navbar()` / `FOOTER` in `build.py`.

---

## Recent structural changes

- Talks tab in the navbar replaced with a **More** dropdown (Talks, Tutorials, Data &amp; Code). Implemented in `render_navbar()`; mirrored in `research.html`. Styles in `assets/css/style.css` under `/* ===== NAV DROPDOWN ===== */` plus mobile overrides; click-toggle wiring in `assets/js/main.js`.
- `tutorials.html` and `data-code.html` are now standalone pages built from `content/tutorials.md` and `content/data-code.md`. The Tutorials and Data &amp; Code sections were removed from `content/index.md` / `index.html`.
- `tutorials.html` uses the Teaching-style table layout (`.teaching-table`) and includes a second **Workshops Organized** table. Historical entries (2005–2017) were imported from `http://vision.jhu.edu/activity.htm`.
- Footer Links list extended to include Tutorials and Data &amp; Code.
