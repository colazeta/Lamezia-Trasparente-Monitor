# Civic-service home — design QA

Source visual truth: first displayed selected concept, `Lamezia Trasparente civic information portal.png`, ChatGPT Library file `libfile_9d431099f7508191994c3962b3f413f5`. Local source: `/workspace/scratch/d08ba292b432/generated_images/exec-90ab6608-bde0-4545-8342-619f1d7135f3.png`.

Implementation: final runtime preview https://bf6335ce.lamezia-trasparente.pages.dev/, commit 88b15f016a5fe06c34901b3a69e44549ec827cda. Initial comparison used https://3d19ac0f.lamezia-trasparente.pages.dev.

Final implementation screenshot: `docs/design/civic-service-home-desktop.webp`. Combined source/implementation evidence: `docs/design/civic-service-comparison.webp`. Focused search/path comparison: `docs/design/civic-service-focused.webp`. Initial evidence was captured as `/workspace/scratch/d08ba292b432/visual-qa/home-desktop.png` and `/workspace/scratch/d08ba292b432/visual-qa/comparison.png`.

State: home, light theme, no overlays, disclosures collapsed. Source 1487×1058 px; implementation screenshot 1348×926 px. Browser reports CSS viewport 1363×936, DPR 1. Both images were proportionally resized to 900px wide in a single comparison board; comparison concerns content geometry and relative hierarchy, not identical full-page pixel height. The mock omits the retained full site footer and uses abbreviated example record titles.

## Comparison history

### Initial comparison — blocked

The combined board was opened and inspected. The overall white/indigo/cobalt palette, search, three divider-separated paths and archive list match the selected direction. No horizontal overflow was reported. H1 computed family is Inter.

- [P2] Supporting link and archive typography is smaller than the selected reference after width normalisation. Increase path headings/links and archive title/status text, and expand disclosure summary typography.
- [P2] Long unabridged archive titles change the row proportions. Use conservative display-only shortening of the existing titles: remove the repeated institutional prefix and editorial suffix, retaining explicit uncertainty/editorial warnings beside each record and the full titles on destination pages.

Fixes implemented: path headings 20–24px, path links 16–18px, archive titles 16–18px, statuses 16px, disclosure summaries 20px; display-only title shortening. A second capture confirmed the larger supporting text and compact real-record titles. It also exposed unequal question wrapping at the narrower browser width; path typography was changed to a fluid 18–24px clamp. The final capture reports all three question headings at 22.0806px with the same 29.4375px height. No horizontal overflow remains. The final combined full-view and focused comparison images were opened and inspected after these fixes.

## Intentional differences

- Existing supplied brand mark/name retained; the illustrative L mark is not introduced.
- Search shortcut, theme control, mobile navigation and full footer remain functional.
- Actual civic statuses, timestamps and editorial caveats are preserved instead of copying shortened mock data.
- Dark mode is supported, although the selected source depicts light mode only.

## Required fidelity surfaces

- Typography: Inter, explicit home-only override; main hierarchy and supporting typography checked in the final capture and focused comparison.
- Spacing/layout: matching search-first composition and three paths, divider-based sections; no nested cards/shadows. Post-fix list rhythm and aligned path links checked in final evidence.
- Colours: home-scoped white, deep indigo and cobalt; dark tokens retained separately.
- Assets: original brand asset retained; no new raster illustrations, CSS artwork or mock imagery introduced.
- Copy: existing factual records retained with conservative visual shortening; no dates recast as future meetings.

## Interaction checks

Verified: search opens with three shortcuts; Scordovillo returns two existing records; Escape dismisses it; Altri argomenti exposes the retained section and participation destinations; source disclosure opens with source links and stale-Albo warning; theme toggle reaches a dark background and is restored to light. The final revision differs only in fluid path-heading sizing from these tested interaction states. Final browser capture reports no horizontal overflow and the expected three compact archive titles. Browser error logs were checked: no application-origin errors were returned; extension metadata errors were excluded. Mobile viewport and screen-reader checks remain unverified and are not covered by this desktop visual pass.

## Final findings

No actionable P0/P1/P2 differences remain for the desktop civic-service direction. The initial typography/list findings and the follow-up question wrapping have been resolved and recaptured. The existing brand, extra access/theme controls, complete footer, fuller civic timestamps and editorial warning are intentional product constraints rather than missing mock fidelity.

## Follow-up polish

- [P3] The original brand lockup is denser than the mock's illustrative wordmark; a separate identity brief would be needed to replace it.
- [P3] Search icon proportions differ slightly from the raster concept, using the existing icon library.
- Residual verification gaps: mobile viewport and screen reader; no compliance claim.

## Implementation checklist

- [x] Compare source and implementation in one width-normalised board.
- [x] Inspect a focused search/path comparison and read archive status/copy in the full view.
- [x] Fix and recapture supporting typography, real-title rhythm and proportional question sizing.
- [x] Check Inter, home-scoped colours, dividers and absence of card shadows.
- [x] Verify public controls and inspect browser console.

final result: passed
