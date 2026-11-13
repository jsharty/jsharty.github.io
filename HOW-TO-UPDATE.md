# How to update justinharty.com

The site rebuilds itself every time something is pushed to the `main` branch (GitHub Actions →
"Build and deploy site"). You can edit files right on github.com: open a file, click the pencil, commit.

## Add or change publications, conference talks, presentations, guest lectures
These all come from **`_bibliography/cv.bib`**, the same Zotero export your CV is built from.

1. In Zotero, add the item and give it its CV tag, e.g. `cv-pub-journal`, `cv-conf-papers`,
   `cv-pres-invitedtalks` (the full list and the section each goes to is in `_data/sections.yml`).
2. Export the collection (Better BibLaTeX) and replace `_bibliography/cv.bib` with it.
3. Commit. The new item appears in the right section, in CV order, with its buttons.

Items tagged `cv-pub-journal-underreview` are kept off the site (set by `hide: true` in `_data/sections.yml`).

## Add a PDF, slides, poster, handout, or recording to an item
Create a folder named with the item's citekey (the key after `@article{` in the .bib) and drop files in:

```
assets/pubs/<citekey>/paper.pdf      → PDF button
assets/pubs/<citekey>/cover.jpg      → cover thumbnail (600 x 800 works best)
assets/pubs/<citekey>/slides.pdf     → Slides button
assets/pubs/<citekey>/poster.pdf     → Poster button
assets/pubs/<citekey>/handout.pdf    → Handout button
assets/pubs/<citekey>/recording.mp4  → Recording button
```
No code changes; buttons only appear when the file exists. On github.com: **Add file → Upload files**,
and type the folder path in front of the file name.

Only post publisher PDFs when the journal's sharing policy allows it (open-access/CC-licensed articles,
your own reports and bibliographies, or accepted manuscripts where permitted).

## Research pillars (Systems, Fathers, History)
Each item is tagged automatically from its title using the word lists in `_data/pillars.yml`.
To set tags yourself, either:
- add a Zotero tag `pillar-systems`, `pillar-fathers`, and/or `pillar-history` to the item, or
- add a line to `_data/pillar_overrides.yml`, e.g. `harty2024: [history, systems]`.

## Google Scholar and Dimensions buttons
- **Google Scholar** opens the item's record on your Scholar profile when its ID is in `_data/scholar.yml`;
  otherwise it runs a Scholar search for the title. To add an ID: open the paper on your Scholar profile,
  copy the part after `uXKeZIMAAAAJ:` in the address bar, add `citekey: "THAT-ID"`.
- **Dimensions** citation badges appear automatically for items with a DOI.

## Everything else on the CV
Education, positions, teaching, research projects, grants, practice, mentoring, service, and memberships
live in **`_data/cv.yml`**. Edit the text there; keep the indentation.

Bio and the home page: `index.md`. Name, title, links, menu: `_config.yml`. CV download: replace
`assets/files/Harty-CV.pdf`. Photo: `assets/img/harty.jpg`.

## Brand
Colors, fonts, buttons, and logos follow the ASU spec; all variables are at the top of `_sass/minimal-light.scss`. See BRANDING.md for the color and button mapping and contrast ratios.

## Switching to justinharty.com (one-time)
justinharty.com currently points to Wix, so the site is served at https://jsharty.github.io for now.
When you're ready to retire the Wix site, at your domain registrar (or in Wix's DNS settings):
1. Set four **A** records for `justinharty.com` (`@`): 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
2. Set a **CNAME** for `www` pointing to `jsharty.github.io`
3. Remove the old Wix A/CNAME records.
4. In this repo: uncomment the `cname: justinharty.com` line in `.github/workflows/deploy.yml`, and set `url: https://justinharty.com` in `_config.yml`. Commit.
5. In GitHub, Settings, Pages: confirm the custom domain and tick **Enforce HTTPS** once the certificate is issued.
