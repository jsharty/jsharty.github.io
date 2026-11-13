# Branding: ASU standards applied to this site

Theme: [Minimal Light](https://github.com/yaoyao-liu/minimal-light) by Yaoyao Liu (CC0; credited in the footer),
restyled to Arizona State University brand and web standards. All colors are SCSS variables at the top of
`_sass/minimal-light.scss`; no hex values appear anywhere else.

## Colors

| Role | Name | Hex |
|---|---|---|
| Primary | ASU Maroon | `#8C1D40` |
| Primary | ASU Gold | `#FFC627` |
| Primary (text "black") | Gray 1 | `#191919` |
| Primary (ground) | White / Gray 7 | `#FFFFFF` / `#FAFAFA` |
| UI grayscale | Gray 2, ASU Gray, Gray 4, Gray 5, Gray 6 | `#484848`, `#747474`, `#BFBFBF`, `#D0D0D0`, `#E8E8E8` |
| Secondary (buttons and tags only) | Green, Blue, Orange, Turquoise, Pink | `#78BE20`, `#00A3E0`, `#FF7F32`, `#4AB7C4`, `#E74973` |
| Secondary, not used for fills | Copper | `#AF674B` (fails AA with Gray 1 and with white) |

Maroon and gold lead: gold top bar, gold heading bars, gold current-page underline, maroon links and dates,
maroon group headings, gold "Download CV" button (the single primary call to action).

## Buttons (one ASU secondary color per link type)

| Button | Class | Fill | Label | Contrast |
|---|---|---|---|---|
| PDF | `.btn-pdf` | ASU Blue `#00A3E0` | Gray 1 | 6.12:1 |
| Code (reserved) | `.btn-code` | ASU Green `#78BE20` | Gray 1 | 7.69:1 |
| Cite / BibTeX | `.btn-bibtex` | ASU Turquoise `#4AB7C4` | Gray 1 | 7.42:1 |
| Journal, Publisher, Program, Course, Website (the item's page) | `.btn-project` | ASU Orange `#FF7F32` | Gray 1 | 6.98:1 |
| Slides, Recording | `.btn-video` | ASU Pink `#E74973` | Gray 1 | 4.69:1 |
| Poster, Handout, Abstract, Google Scholar | `.btn-other` | ASU Gray `#747474` | White | 4.67:1 |
| Download CV (primary action) | `.btn-gold` | ASU Gold `#FFC627` | Gray 1 | 11.18:1 |

Style: Arial Bold, sentence case, 4 px radius, 4 px × 12 px padding, 8 px gaps. Hover/focus keeps the same
color and scales to 1.05; every button has a 2 px Gray 1 focus ring with 2 px offset. Scaling is turned off
under `prefers-reduced-motion`.

## Other contrast checks (WCAG 2.1 relative luminance)

| Pair | Ratio |
|---|---|
| Gray 1 text on white | 17.58:1 |
| Gray 2 text on white | 9.15:1 |
| Maroon text/links on white | 8.88:1 |
| Maroon on Gray 7 | 8.51:1 |
| ASU Gray text on white | 4.67:1 |
| Gray 1 on Gray 6 (footer) | 14.35:1 |
| White on Maroon (Systems chip) | 8.88:1 |
| Gray 1 on Gold (Fathers chip/tag, CV button) | 11.18:1 |
| White on Gray 2 (History chip) | 9.15:1 |
| Maroon link vs Gray 1 body text | 1.98:1, so links in running text stay underlined (WCAG 1.4.1) |

## Type

`Arial, Helvetica, "Nimbus Sans L", "Liberation Sans", FreeSans, sans-serif` (ASU Web Standards 2.0).
No web fonts, no serif option. Body 16 px, line height 1.5, paragraphs capped at 700 px (about 75 characters).
Headings bold and sentence case; navigation title case; no ampersands in menus or headings; no italics
(journal and book titles in citations are upright as a result); no all caps.

## Logos and icons

| Use | File |
|---|---|
| Header logo (white ground), links to socialwork.asu.edu | `assets/img/asu-socialwork-horiz.png` (web-size copy of `ASU_SocialWork_1_Horiz_RGB_MaroonGold_600ppi.png`) |
| Original, full resolution | `assets/img/ASU_SocialWork_1_Horiz_RGB_MaroonGold_600ppi.png` |
| White version, for maroon/dark grounds only (not currently used) | `assets/img/ASU_SocialWork_2_Horiz_RGB_White_600ppi.png` |
| Favicon (light) | `assets/img/ASU_SunBurst_1_RGB_MaroonGold_150ppi.png` |
| Favicon (dark browser UI) | `assets/img/ASU_SunBurst_2_RGB_White_150ppi.png` |

Logos are not recolored, stretched, cropped, or given effects. Source: `0_FileSystem/OLD SYSTEM/_Inbox/ASU/ASUFiles/Logos`.

## Dark mode
Disabled. ASU web standards define no dark theme.

## Scope
This is a personal faculty site on GitHub Pages, so it uses its own header and footer. If it ever moves to an
asu.edu address, it must adopt the Unity Design System global header and footer
(`@asu/component-header-footer`) and ASU's Enterprise Google Tag Manager.
