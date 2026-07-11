---
name: rtl-icon-text-order
description: Use whenever laying out an icon/image/badge next to a translatable text block in this app (CategorySheet body rows, category chips, certification rows, etc.) across the 3 supported languages (en/he/ar). Encodes this app's icon-always-first convention, achieved via plain dir-mirroring (fixed DOM order), not per-direction branching. Trigger on: "icon and text order", "rtl layout", "right to left", "left to right", "mirroring", "reading order" for any row combining an image/icon/badge with text.
disable-model-invocation: false
---

# RTL/LTR icon-and-text row ordering (Digestible Information app)

This app supports 3 languages via `useLanguage()` → `{ dir, t }`: `en` (ltr), `he`/`ar` (rtl).

## The rule (confirmed directly by the user — do not re-derive or "fix" this again)

For any row that pairs a translatable text block with an icon/image/badge, the **icon always comes first** in reading order, in every language:

- **English (ltr)**: icon on screen-LEFT, text on screen-RIGHT.
- **Hebrew/Arabic (rtl)**: icon on screen-RIGHT, text on screen-LEFT.

This is a **single universal DOM order** (`[icon, text]`), not a per-direction branch. An earlier version of this fix wrongly special-cased rtl only (keeping `[text, icon]` for ltr and swapping to `[icon, text]` for rtl) — that broke English, which needs the icon first too. The correct fix is plain, unforced dir-mirroring: keep DOM order as `[icon, text]` always, and let the browser's natural bidi/flex mirroring place it correctly per direction — no `dir === 'rtl'` branching needed for this ordering.

## How to implement

```jsx
<div className="row">
  <IconOrBadge />
  <TextBlock />
</div>
```

No conditional on `dir` for the ordering itself — just don't force `dir="ltr"` on the row (that would break the mirroring). Reference implementation: `KosherBody` in `src/components/CategorySheet.jsx` (the 3 certification rows: dairy badge, OU-D logo, rabbinical seal).

## Related bidi gotchas already hit in this app (don't re-debug these from scratch)

- **Fixed-language text embedded inside an rtl container can reorder itself.** "Orthodox Union - Dairy" (kept in English in every language, including he/ar) rendered as "Dairy -" inside Hebrew/Arabic rows until given an explicit `dir="ltr"` on that specific text block. Any English/Latin phrase embedded inside an RTL row needs `dir="ltr"` if it contains punctuation (hyphens, etc.) the bidi algorithm might reorder.
- **Number/unit order in nutrition facts**: RTL languages in this app still keep the number visual-left, unit visual-right (per Figma), even in he/ar — implemented via `renderAmount()` in `CategorySheet.jsx` using explicit flexbox + `direction: dir`, not inline bidi reordering (proved inconsistent across browsers/scripts for this).
- **Nutrition's stat-row/fact-table are the one deliberate exception** to normal RTL-aware layout: they're hardcoded `dir="ltr"` regardless of app language, matching a universal nutrition-label convention from Figma. Don't copy that forced-ltr pattern elsewhere (like kosher rows) without a similarly strong universal-convention reason — it's the exception, not the default.

## When this applies

Any new `CategorySheet` body, category chip, or list row that pairs an icon/image/badge with translatable text across all 3 languages.
