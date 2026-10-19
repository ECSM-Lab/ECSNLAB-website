# SCALE — Website

A static, GitHub Pages-compatible website for **SCALE — Sustainable Climate
Analysis & Energy Decision Lab**, at the School of Industrial Engineering, Pontificia Universidad Católica de
Valparaíso (PUCV).

---

## What's in this folder

```
site/
├── index.html              Home (hero, stats, leadership, areas, projects, news)
├── about.html              Mission, vision, leadership
├── research.html           Six research areas
├── research-area.html      Individual research area  (?id=…)
├── team.html               Director, co-director, researchers, students, alumni
├── member.html             Individual team member    (?id=…)
├── projects.html           Filterable projects list
├── project.html            Individual project page   (?id=…)
├── publications.html       BibTeX-driven publications
├── reports.html            BibTeX-driven reports
├── news.html               Lab news and activities
├── opportunities.html      Student supervision + how to join
├── contact.html            Contact info
│
├── publications.bib        Peer-reviewed bibliography (edit this!)
├── reports.bib             Reports / technical documents (edit this!)
│
├── data/                   All data-driven content lives here
│   ├── lab.json            Lab name, mission, stats, contact
│   ├── team.json           All people (director, students, alumni, collaborators)
│   ├── projects.json       Projects portfolio
│   ├── research-areas.json Six research areas
│   ├── news.json           News and activities
│   └── supervision.json    Suggested thesis topics
│
├── assets/
│   ├── css/style.css       The single stylesheet
│   ├── js/main.js          Site chrome (nav, scroll, footer, leader-name bolding)
│   ├── js/bibtex.js        BibTeX parser + publication renderer
│   ├── js/renderers.js     Renders team, projects, news, etc. from JSON
│   ├── images/logo.svg     Full SCALE logo (symbol + wordmark) — og:image
│   ├── images/logo-mark.svg  Symbol only (header, hero, footer)
│   ├── images/favicon.svg  Symbol on a square canvas (browser tab icon)
│   ├── images/team/<id>.jpg    (Drop in here — referenced by team.json)
│   └── files/CV_*.pdf      CVs and other downloadables
│
├── .nojekyll               Tells GitHub Pages to serve files as-is
└── README.md               This file
```

---

## How to deploy on GitHub Pages

1. **Create a repo.** Push the contents of this `site/` folder to the root of a
   new repo (e.g. `ecslab.github.io` if it's the org/user site, or any other
   repo if it's a project site).

2. **Enable Pages.** In the repo: Settings → Pages → Build and deployment →
   Source: *Deploy from a branch* → Branch: `main` (or `master`) — `/ (root)`.

3. **Wait ~1 minute.** Visit the URL GitHub gives you. The `.nojekyll` file in
   this folder ensures GitHub serves everything as a plain static site — no
   build step required.

4. **Custom domain (optional).** Add a `CNAME` file with your domain on the
   first line and configure DNS as GitHub instructs.

> **Why no Jekyll / Astro / Hugo?** None of the content needs a build step.
> The site loads JSON and BibTeX directly in the browser. That means:
> editing a single file is enough to update the site, and there's no toolchain
> to maintain. Adding Jekyll later is easy if you ever need it.

---

## How to update content

Edit a file, commit, push. GitHub Pages will rebuild within a minute.

### Adding a publication

Open `publications.bib` (peer-reviewed work) or `reports.bib` (technical /
advisory) and append a new entry. Minimum required fields:

```bibtex
@article{some-key-2026,
  title   = {Your paper title},
  author  = {Last, First and Other, Author and Feijoo, Felipe},
  journal = {Journal name},
  year    = {2026},
  volume  = {64},
  pages   = {1--20},
  doi     = {10.xxxx/xxxxx},
  url     = {https://doi.org/10.xxxx/xxxxx}
}
```

Optional custom fields the site recognises:

- `selected = {yes}` — features the entry in the **Selected publications**
  block on the home page.
- `keywords = {...}` — comma-separated topic tags shown in the expanded view.
  Also used by the *Research area* filter on the publications page (any keyword
  matching a research area's keyword list will match).
- `abstract = {...}` — shown when the reader clicks the title.
- `pdf = {assets/files/your-paper.pdf}` — relative path to a local PDF.

The names **Felipe Feijoo** and **Monica Castañeda** are auto-highlighted in
the author list — no special markup required.

### Adding a project

Edit `data/projects.json`. Copy an existing project block as a template and
update the fields. Notes:

- `id` — a slug used in the URL (`project.html?id=<id>`). Pick something
  short and stable.
- `status` — one of `"active"`, `"completed"`, or `"review"`.
- `research_areas` — array of research-area ids (see
  `data/research-areas.json`). Use these to cross-link projects to areas.
- `team` — array of `{ "member_id": "<id>", "role": "..." }` objects. The
  `member_id` should match an `id` in `data/team.json` so the link works.

### Adding a team member or student (and their individual profile page)

Every team member — current student, alumnus, collaborator — gets an
individual profile page at `member.html?id=<id>` automatically. The card on
the Team page is the link. Edit `data/team.json` to add a new member; the
card appears in the right group and the profile page is live as soon as the
data file is committed.

For an example of a fully filled-in profile, see Francisco Flores (id
`francisco-flores`). It demonstrates every supported field, including the
auto-pulled publications and projects.

**Key fields for student profiles:**

| Field | Purpose |
|---|---|
| `id` | Slug used in URL (`member.html?id=<id>`) |
| `name` | Display name |
| `role` | Grouping bucket (see table below) |
| `subrole` | E.g. `"PhD Alumni"` for alumni — drives the alumni grouping |
| `bibtex_name` | The author-name string used for this person in `publications.bib`. **When set, the profile page automatically shows their publications and bolds their name.** |
| `degree`, `year`, `thesis`, `thesis_summary` | Thesis information |
| `supervisors` | Array of member ids — auto-linked to those people's profiles |
| `research_topics`, `keywords` | Research-area tags shown on the profile |
| `bio_short`, `bio_long` | Short and long biographies |
| `current_position` | For alumni — where they are now |
| `links` | Object with any of: `scholar`, `orcid`, `github`, `linkedin`, `website`, `anid`, `cv`, `twitter` |
| `photo` | Path like `assets/images/<id>.jpg`. Leave empty for an automatic monogram. |
| `projects` | (Optional) Array of project ids to override the auto-detection. Usually unnecessary — projects are auto-detected by matching `team[].member_id` in `projects.json`. |

**How students are linked to publications:** add `"bibtex_name": "Francisco
Flores"` (the exact string used in BibTeX `author = {...}` fields). The
profile page uses this string to filter the bibliography to entries where
that author appears, and to bold their name in author lists. For Latin-style
single-surname matching, just the surname works (e.g. `"Matamala"`).

**How students are linked to projects:** add the student's `id` to the
project's `team[].member_id` array in `data/projects.json`. The profile
will list those projects automatically with their role on the project.

**Roles** (drive grouping on team.html):

| `role`                       | Where it appears                     |
|------------------------------|--------------------------------------|
| `Director`                   | Leadership block, Team page          |
| `Co-Director`                | Leadership block, Team page          |
| `Researcher`                 | Team page (with `group: "national"` or `"international"`) |
| `Postdoctoral Researcher`    | Team page                            |
| `PhD Student`                | Team page                            |
| `Master's Student`           | Team page                            |
| `Undergraduate Student`      | Team page                            |
| `Visiting Scholar`           | Team page                            |
| `Alumni`                     | Team page (use `subrole` "PhD Alumni" or "Master's Alumni") |

For a photo, drop `assets/images/<id>.jpg` (or `.jpeg`/`.png`) and set
`photo` in the JSON to that path. If `photo` is empty — or if the image
fails to load for any reason (wrong extension, missing file, typo) — the
site renders a clean monogram fallback automatically. **No broken-image
icons can ever appear on the page.**

### Adding a news item

Edit `data/news.json`. Use ISO date format (`YYYY-MM-DD`). Items are sorted
newest-first.

### Adding a research area

Edit `data/research-areas.json`. Each area has an `id` (slug). The
`projects` and `people` arrays are id-references that produce automatic
cross-links on the area's detail page.

### Adding a thesis topic (Opportunities page)

Edit `data/supervision.json`. Two arrays: `phd` and `master`. Status is
`"open"`, `"taken"`, or `"example"`.

---

## Local preview

The site uses `fetch()` to load JSON and BibTeX, so opening files directly
with `file://` won't work. Run a local HTTP server:

```bash
cd site
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

Any other static server (`npx serve`, `caddy file-server`, etc.) works too.

---

## Design notes

- **Brand palette** taken from the SCALE logo: turquoise `#007F82` (`--brand`),
  deep teal `#003F3D` (`--brand-900`, footer), light turquoise `#00AAAE`
  (`--brand-bright`) and gold `#F5C66C` (`--gold`). All defined at the top of
  `assets/css/style.css`. Change them there to rebrand.
- **Typography** Newsreader (serif, headings) + Inter (sans, body) + JetBrains
  Mono (code). Loaded from Google Fonts.
- **Names of leadership** Monica Castañeda (Director) and Felipe Feijoo
  (Co-Director) are
  auto-highlighted in bold across the entire site by `assets/js/main.js`. No
  special markup required when authoring content.
- **Responsive** All pages collapse to a mobile-friendly layout below 900 px.
- **Accessibility** Semantic landmarks (header / main / footer), focus styles,
  `aria-*` attributes on nav and tabs, and high-contrast text colors.

---

## Updating the navigation menu

The header and footer are inlined on every page (look for the comment
`BEGIN SITE HEADER` / `BEGIN SITE FOOTER`). To change a nav link or add a
section site-wide, run a find-and-replace across the HTML files:

```bash
# Example — rename "Opportunities" to "Join us"
sed -i 's|>Opportunities<|>Join us<|' *.html
```

---

## Notes on placeholder content

A few fields are marked **`TODO`** in the JSON files (e.g. some alumni current
positions, photos, full bios). Search for `TODO` in `data/*.json` to find them
and replace as you collect the content.
