---
name: Design accessibility / theme regression checks
description: How the lamezia-trasparente web app guards its themed, token-driven design (contrast tiers, color-literal allowlist, theme test).
---

# Automated design-accessibility checks (lamezia-trasparente)

The web app has a vitest suite (jsdom) covering the redesign's polish:
theme toggle/persistence, every page rendering in light+dark, a color-literal
lint, WCAG contrast on the design tokens, and an axe-core a11y audit. Runs via
the `test` validation gate (now `pnpm -r --if-present run test`, so web +
api-server tests both run).

## axe-core accessibility audit
**Rule:** `src/test/accessibility.test.tsx` runs `axe.run` against every page
(light+dark) and fails on any `serious`/`critical` violation. The shared
page/provider/mock harness lives in `src/test/pages-harness.tsx` (reused by
`pages-render.test.tsx`). `color-contrast` is disabled there (covered by
`contrast.test.ts`; unreliable in jsdom). Intentional exceptions go in the
`ALLOWED_RULES` allowlist with a justifying comment — keep it tiny.
**Why:** Radix `Select` triggers render `role="combobox"`, whose accessible name
is NOT computed from inner text, so every `SelectTrigger` needs an explicit
`aria-label` or axe flags `button-name` (critical).
**How to apply:** Any new `SelectTrigger` (or icon-only button) must carry an
`aria-label`, or the audit will fail.

## Contrast tiering decision
**Rule:** A handful of token pairs intentionally meet only AA *large-text*
(>= 3:1), not AA normal (>= 4.5:1): `brand-foreground/brand`,
`success-foreground/success`, `destructive-foreground/destructive`,
`sidebar-primary-foreground/sidebar-primary`. All body-text pairs must stay
>= 4.5:1.
**Why:** Those tokens back badges, pills, primary CTAs and chart fills that
always use large/bold type, where 3:1 is the correct WCAG AA criterion. Forcing
4.5:1 there would muddy the brand vermilion / blue.
**How to apply:** If you re-tune the palette in `src/index.css`, keep body-text
pairs >= 4.5 and the four accent pairs >= 3. The contrast test enforces this for
both `:root` and `.dark`.

## Capturing dark mode in the screenshot tool
**Rule:** The app-preview screenshot browser cannot have its `rlt-theme`
localStorage cleared and defaults to light (system pref). To do a *visual* dark
pass, temporarily hardcode `getInitialTheme()` in
`src/components/theme/ThemeProvider.tsx` to `return "dark"`, screenshot, then
revert.
**Why:** A visual dark pass (task: verifica visiva tema scuro) found every main
public page already coherent — backgrounds/cards/borders/accents all use the
`.dark` tokens, no residual light surfaces. The token system holds up; don't
chase phantom fixes.
**How to apply:** Only force-dark transiently for capture; always restore the
real localStorage→system fallback before finishing.

## Color-literal allowlist
**Rule:** No `text-white/bg-white/text-black/bg-black` or raw hex outside the
allowlist; everything else must use semantic tokens.
**Why:** Hardcoded colors break in the opposite theme — the whole point of the
token system.
**How to apply:** The intentional fixed dark brand surfaces are `pages/Home.tsx`
and `pages/not-found.tsx` (deep-navy hero, white text is correct there), plus
vendor `components/ui/**` scrims. New such surfaces must be added to the ALLOWED
list in `src/test/design-tokens.test.ts`, not left unguarded.
