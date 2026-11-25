# Design brief: Negative Space (여백)

- **Design read:** a personal Korean writing blog for people who read slowly; the register is quiet, exact and a little cinematic, like standing in a darkroom while a print appears.
- **Concept spine:** the darkroom. Every post is a frame on a contact sheet; the landing page "develops" from negative to positive as you scroll. Motifs: film frames with sprocket holes, frame numbers, a red grease-pencil loop, the safelight.
- **Delivery tier:** cinema (scroll-driven chapters, one Tier-1 mechanic, motivated reveals), implemented with a small in-house rAF scroll engine (no runtime deps).
- **Locked palette:** paper `#EDEDEA` (cool, not cream), ink `#111113`, graphite `#2A2A2D`, mid `#6E6F72`, hairline `#C9C9C5`, accent safelight red `#C8321E` (one accent, page-wide). Defense: a darkroom is monochrome plus exactly one red light; the red marks only "this one" (current, selected, submit).
- **Locked type:** Satoshi (display, Latin) + Pretendard (Korean text) + JetBrains Mono (frame numbers, counts, meta). No serif.
Animation mode: non-animated (user picked "10크레딧 안에서 제작" at intake: the balance could not cover the scroll-scrub film, so motion is carried by the C3 mask reveal plus scroll chapters)
- **Tier-1 technique:** C3 Scroll-driven mask reveal. The hero opens with the darkroom photo visible only through giant "NEGATIVE / SPACE" letters, shown inverted (a negative). Scrolling expands the window to full bleed and the photo crossfades from negative to positive: the page develops. This enacts the spine directly. Mobile: shorter pin (160vh). Reduced motion: final positive full-bleed state, no pin.
- **Second motion beat (seasoning):** contact-sheet rail, horizontal pan pinned to scroll (D1 family), frames get a red loop on hover/focus.
- **Reference boards:** generated (z_image is the only model this plan allows); boards came back as mood art with garbled type, so they inform motifs (sprocket frames, red loop) not layout. Layout follows this brief.

## Section plan
1. **Hero** (inline typography behemoth / masked image) — headline "글이 현상되는 곳", sub, CTA. Eyebrow: none.
2. **Featured essay** (editorial offset: image-as-canvas, text bottom-left overlapping the image edge). Eyebrow #1: "이번 주의 글".
3. **Contact sheet** (horizontal pinned rail of 6 film frames, mono frame numbers).
4. **Topics index** (full-width divided rows, icon + name + mono count, hover preview crop).
5. **About** (asymmetric: tall portrait left third, large statement right, vertical side-rail note, oversized red period as structure = second-read moment).
6. **Letters (newsletter)** (framed block form, D1-backed). Eyebrow #2: none needed.
Footer: single mono line.
Families: masked hero, editorial offset, horizontal rail, divided list, asymmetric split, framed form = 6 distinct.

## Asset plan
Hero plate (darkroom tray), featured essay photo (desk by window), 6 contact-sheet frames, about portrait (hands writing), generated line icon set (6 topics), inline-SVG monogram (aperture square + red dot), OG card composed from the hero plate in brand type, favicon set from the monogram.

## CTA inventory (each its own garment)
- Nav "구독": mono readout that decodes the label on hover.
- Hero "최신 글 읽기": viewfinder corner brackets close around the label.
- Featured "계속 읽기": arrow travels along a drawn film-perforation path.
- Contact frame: the frame number is the hit area; red grease-pencil loop draws on hover.
- Topic row: entire row shears and shifts grade, preview crop slides in.
- Letters "구독하기": rubber stamp, :active imprints (skew + press).

## Anti-convergence ledger
First build in this chat. Axes derived from the material world (paper, silver gelatin, safelight, film base): palette paper+ink+safelight red; Satoshi/Pretendard/JetBrains Mono; masked type hero; C3; garments above; corner language: all sharp 0px, hairline-ruled.

## Liquid Glass layer (2026-11-25 redesign)
Apple's Liquid Glass rules, adapted to the web (`.lg` in styles.css):
- Two layers. The **content layer** is the printed matter: paper, photographs, type, contact frames. It stays square-cornered and solid. The **functional layer** floats above it and is glass: the nav capsule, the hero's primary action, the contact-sheet loupe, the newsletter field.
- Glass is round (capsules, circles); print is square. The contrast between the two is the point.
- Never glass on glass: controls inside a glass surface are solid fills (nav subscribe, form submit).
- Variants: `lg-regular` (light, ink text) anywhere; `lg-clear` (dark, white text) only over photographs, always with a dimming gradient behind; `lg-prominent` (safelight red) for the single primary action in view.
- Text on glass is full contrast; hierarchy by size and weight.
- `prefers-reduced-transparency` turns glass solid; `prefers-contrast: more` adds an outline.
- Signature moment: the loupe. Hovering a contact-sheet frame shows a glass lens that magnifies the print, the way a photographer reads a contact sheet.
