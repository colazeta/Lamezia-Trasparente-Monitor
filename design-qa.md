# Civic-service home — design QA

Source visual truth: first displayed selected concept, `Lamezia Trasparente civic information portal.png`, ChatGPT Library file `libfile_9d431099f7508191994c3962b3f413f5`. Local source: `/workspace/scratch/d08ba292b432/generated_images/exec-90ab6608-bde0-4545-8342-619f1d7135f3.png`.

Implementation: Cloudflare preview https://3d19ac0f.lamezia-trasparente.pages.dev, commit 838749a54119947f76981fd63de28930b3d49b31.

Implementation screenshot: `/workspace/scratch/d08ba292b432/visual-qa/home-desktop.png`. Combined source/implementation comparison: `/workspace/scratch/d08ba292b432/visual-qa/comparison.png`.

State: home, light theme, no overlays, disclosures collapsed. Source 1487×1058 px; implementation screenshot 1348×926 px. Browser reports CSS viewport 1363×936, DPR 1. Both images were proportionally resized to 900px wide in a single comparison board; comparison concerns content geometry and relative hierarchy, not identical full-page pixel height. The mock omits the retained full site footer and uses abbreviated example record titles.

## Comparison history

### Initial comparison — blocked

The combined board was opened and inspected. The overall white/indigo/cobalt palette, search, three divider-separated paths and archive list match the selected direction. No horizontal overflow was reported. H1 computed family is Inter.

- [P2] Supporting link and archive typography is smaller than the selected reference after width normalisation. Increase path headings/links and archive title/status text, and expand disclosure summary typography.
- [P2] Long unabridged archive titles change the row proportions. Use conservative display-only shortening of the existing titles: remove the repeated institutional prefix and editorial suffix, retaining explicit uncertainty/editorial warnings beside each record and the full titles on destination pages.

Fixes implemented: path headings 20–24px, path links 16–18px, archive titles 16–18px, statuses 16px, disclosure summaries 20px; display-only title shortening. New rendered evidence is pending.

## Intentional differences

- Existing supplied brand mark/name retained; the illustrative L mark is not introduced.
- Search shortcut, theme control, mobile navigation and full footer remain functional.
- Actual civic statuses, timestamps and editorial caveats are preserved instead of copying shortened mock data.
- Dark mode is supported, although the selected source depicts light mode only.

## Required fidelity surfaces

- Typography: Inter, explicit home-only override; main hierarchy checked; supporting typography fixes await recapture.
- Spacing/layout: matching search-first composition and three paths, divider-based sections; no nested cards/shadows. Post-fix list rhythm awaits recapture.
- Colours: home-scoped white, deep indigo and cobalt; dark tokens retained separately.
- Assets: original brand asset retained; no new raster illustrations, CSS artwork or mock imagery introduced.
- Copy: existing factual records retained with conservative visual shortening; no dates recast as future meetings.

## Interaction checks

Pending on final revision: search/results, other-topics menu, disclosure, theme toggle and browser console. Focused detail comparisons will cover search/type and archive status wrapping after recapture. Mobile viewport and screen-reader checks remain unverified.

final result: blocked
