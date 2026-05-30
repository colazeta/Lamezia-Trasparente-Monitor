---
name: Design accessibility / theme regression checks
description: How the lamezia-trasparente web app guards its themed, token-driven design (contrast tiers, color-literal allowlist, theme test).
---

# Automated design-accessibility checks (lamezia-trasparente)

The web app has a vitest suite (jsdom) covering the redesign's polish:
theme toggle/persistence, every page rendering in light+dark, a color-literal
lint, and WCAG contrast on the design tokens. Runs via the `test` validation
gate (now `pnpm -r --if-present run test`, so web + api-server tests both run).

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

## Color-literal allowlist
**Rule:** No `text-white/bg-white/text-black/bg-black` or raw hex outside the
allowlist; everything else must use semantic tokens.
**Why:** Hardcoded colors break in the opposite theme — the whole point of the
token system.
**How to apply:** The intentional fixed dark brand surfaces are `pages/Home.tsx`
and `pages/not-found.tsx` (deep-navy hero, white text is correct there), plus
vendor `components/ui/**` scrims. New such surfaces must be added to the ALLOWED
list in `src/test/design-tokens.test.ts`, not left unguarded.
