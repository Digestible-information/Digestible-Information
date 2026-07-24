---
name: add-product
description: Use whenever adding a new product to the Digestible Information app, or editing/auditing an existing product's data — "add a product", "new product", "onboard a product", "add [brand name]", editing src/data/products.json, or troubleshooting a category sheet that renders blank/broken/undefined for one product. Encodes the full products.json schema (every field each category needs, which fields are conditionally required based on categoryIds, and the fixed id vocabularies for allergens/kosher rows/storage rows/nutrition cards) plus the routing convention that gives every product its own URL — so a new product needs a data entry and a photo, not new code.
disable-model-invocation: false
---

# Adding a new product (Digestible Information app)

Every product is **pure data** — one entry in `src/data/products.json` plus one photo file. No component, route, or translation-file change is needed for a normal new product (only for a genuinely new *kind* of content — see "When you'd need code changes" at the end).

## Routing already gives every product its own URL — nothing to add here

`src/App.jsx` already routes `/` and `/:productId` to the same `<HomeScreen />`. `src/data/products.js`'s `resolveProduct(productId)` looks up that param as a **key** in `products.json`; if it doesn't match, it silently falls back to `DEFAULT_PRODUCT_ID` (currently `'twist'`). So adding a product with key `"cocoPuffs"` to `products.json` immediately makes `/cocoPuffs` a working URL — don't add a route, don't touch `App.jsx`.

If the new product should become the default (`/` with no id), update `DEFAULT_PRODUCT_ID` in `src/data/products.js` too — that's the one code change that's sometimes actually needed.

## Step 1 — the photo

Drop the image at `public/products/<id>/photo.<ext>` (anywhere under `public/` is served as-is at the site root). Match the existing convention: `public/products/twist/photo.png`.

Reference it in the product's JSON as `meta.photo`, **relative to `public/`, no leading slash**: `"photo": "products/<id>/photo.<ext>"`. (`HomeScreen.jsx` prepends `import.meta.env.BASE_URL` itself — don't include it.)

Any aspect ratio works — the product photo container is a fixed square with `object-fit: contain`, so it letterboxes rather than crops or overflows regardless of the source image's shape.

## Step 2 — the `products.json` entry

Top-level key = the product id used in the URL and as `DEFAULT_PRODUCT_ID`'s value. Structure:

```json
{
  "<id>": {
    "meta": { "photo": "products/<id>/photo.<ext>" },
    "categoryIds": ["ingredients", "allergens", "kosher", "nutrition", "storage", "manufacturer", "recycling", "warnings"],
    "kosherRowIds": ["ouDairy", "rabbinicalSeal"],
    "storageRowIds": ["shaded", "cool", "dry"],
    "nutritionColors": { "sodium": "#00AE38", "satFat": "#FF000E", "energy": "#FF7E00", "sugarBox": "#FF000E" },
    "allergens": [{ "id": "eggs", "statement": "contains" }],
    "content": {
      "he": { /* full per-language content block, see below */ },
      "en": { /* same shape, English */ },
      "ar": { /* same shape, Arabic */ }
    }
  }
}
```

### `categoryIds` drives everything else

This array controls two things at once: which chips/rows appear on the home screen, **and** which `CategorySheet` panel exists at all (`HomeScreen.jsx` wraps every sheet in `product.categoryIds.includes('<id>') && (...)`). The 8 valid ids (from `src/data/categories.js`) are fixed — don't invent new ones without adding code (see the end of this doc):

| id | group | needs these other top-level/content fields |
|---|---|---|
| `ingredients` | primary | `content.<lang>.ingredientsText` |
| `allergens` | primary | top-level `allergens[]`, `content.<lang>.allergenLabels` |
| `kosher` | primary | top-level `kosherRowIds`, `content.<lang>.kosherInfo` |
| `nutrition` | primary | top-level `nutritionColors`, `content.<lang>.nutritionSubtitle` + `.nutritionFacts` |
| `manufacturer` | secondary | `content.<lang>.manufacturerInfo` |
| `storage` | secondary | top-level `storageRowIds`, `content.<lang>.storageInfo` |
| `recycling` | secondary | `content.<lang>.recyclingInfo.bins[]` (each `{ color, segments }`, `color` from `src/data/recyclingInfo.js`'s `recyclingBinIcons`: `orange`, `blue`); optional top-level `recyclingHeight` if the sheet needs a taller budget (e.g. more than one bin) |
| `warnings` | secondary | `content.<lang>.warningsInfo.segments` |

**Only include the fields a category needs if you included that category** — e.g. a product with no `nutrition` in `categoryIds` doesn't need `nutritionColors` at all. But if you *do* include a category, every field in its row above is required — `HomeScreen.jsx` reads them unconditionally (e.g. `product.nutritionColors[item.id]`) once the category is included, so a missing one is a runtime crash (undefined), not a graceful blank.

**Exception: top-level `allergens[]` is read unconditionally, regardless of `categoryIds`.** Unlike `nutritionColors`/`kosherRowIds`/`storageRowIds` (which only get read once their category is in `categoryIds`), `HomeScreen.jsx` computes `allergenGroups` on every render off `product.allergens` directly, with no `categoryIds.includes('allergens')` guard. If you're building a product incrementally (e.g. adding sections one at a time) and haven't gotten to allergens yet, set `"allergens": []` explicitly rather than omitting the key — omitting it crashes the page. (`HomeScreen.jsx` now defaults it to `[]` if missing as a safety net, but don't rely on that — set it explicitly.)

### Fixed id vocabularies — don't invent new ones here

These four fields' values must come from a **fixed set already wired to icons/components** — an id outside the set silently fails to render (icon/label come back `undefined`) rather than erroring loudly, so double check against these lists:

- **`allergens[].id`** (and `content.<lang>.allergenLabels` keys) — from `src/data/allergenIcons.js`: `eggs`, `gluten`, `soy`, `sesame`, `peanuts`, `milk`, `nuts`.
- **`allergens[].statement`** — exactly `"contains"` or `"mayContain"` (from `ALLERGEN_STATEMENT_ORDER` in `src/i18n/translations.js`).
- **`kosherRowIds`** (and `content.<lang>.kosherInfo` keys) — from `src/data/kosherInfo.js`: `ouDairy`, `rabbinicalSeal`. (`kosherInfo.dairyBadge` and `.dairySupervision` are also required but aren't row ids — see the full content shape below.)
- **`storageRowIds`** (and `content.<lang>.storageInfo.labels` keys) — from `src/data/storageInfo.js`: `shaded`, `cool`, `dry`.
- **`nutritionColors` keys** — always exactly `sodium`, `satFat`, `energy`, `sugarBox` (three stat-card ids from `src/data/nutritionFacts.js` plus the sugar/teaspoons box) — these aren't a subset like the others, all four are always required whenever `nutrition` is included.
- **`content.<lang>.nutritionFacts` keys** — always all ten: `sodium`, `satFat`, `energy`, `totalFat`, `transFat`, `cholesterol`, `totalCarbs`, `protein`, `sugar`, `teaspoons` — each `{ "label": "...", "amount": "..." }`. (The first three are the colored stat cards; the middle four are the fact table; `sugar`/`teaspoons` are the sugar box — all fixed, not per-product configurable.)

### Full per-language `content` shape

Every one of `he`/`en`/`ar` needs the same keys, translated (use the existing `"twist"` entry in `products.json` as a copy-paste template — it's the canonical, currently-correct example):

```
brand, productName, productNameBreakAfter (string or null — present on the
  existing "twist" entry but not currently read by any component; keep
  setting it to null for new products unless you've confirmed something
  consumes it again), weightValue,
  ingredientsText,
  allergenLabels: { <one entry per allergen id used in this product> },
  nutritionSubtitle,
  nutritionFacts: { sodium, satFat, energy, totalFat, transFat, cholesterol,
    totalCarbs, protein, sugar, teaspoons } — each { label, amount },
  kosherInfo: {
    dairyBadge: { top, bottom },
    dairySupervision: { line1, line2, line3 },
    ouDairy: { line1, line2Bold, line2Light },       // only if 'ouDairy' in kosherRowIds
    rabbinicalSeal: { line1, line2, line3 },          // only if 'rabbinicalSeal' in kosherRowIds
  },
  manufacturerInfo: {
    producedBy: { label, detail: [...lines] },
    contact: { label, detail: [...lines] },
  },
  storageInfo: { heading, labels: { shaded, cool, dry } },  // only the ones in storageRowIds
  recyclingInfo: { bins: [{ color, segments: [{ text, bold?, highlight? }, ...] }, ...] },
  warningsInfo: { segments: [{ text, bold?, highlight? }, ...] },
```

`kosherInfo.ouDairy`/`.rabbinicalSeal` and `storageInfo.labels`' keys only need entries for the row ids actually listed in `kosherRowIds`/`storageRowIds` — but `dairyBadge`/`dairySupervision` are unconditional whenever `kosher` is in `categoryIds` (they're not gated by `kosherRowIds`, they're the badge/supervision text shown above the per-row list).

`kosherBadgeSwatchColor` (the badge's swatch color) is currently a **global** constant in `kosherInfo.js`, not per-product — every product gets the same one today. If a future product needs a different swatch color, that's a small code change (move it into `product.nutritionColors`-style per-product data), not something to fake in `products.json`.

## Step 3 — verify

```
npm run dev
```

Visit `/<id>` (e.g. `http://localhost:5173/<id>` — check the actual dev port in the terminal output). Check, for **all three languages** (switch via the footer language buttons — no need to reload):

- Product photo, brand, weight, description render.
- Every category chip/row you listed in `categoryIds` opens its sheet with real content — no visible `undefined`, no blank sections.
- Nutrition sheet specifically: all 3 stat cards show their own color, the fact table's 5 rows and the sugar box all have real labels/amounts.
- Browser console has no errors (a missing content key throws or renders `undefined` — open the sheet that's closest to the missing field to narrow it down).

## When you'd need code changes (out of scope for a normal new product)

- A genuinely new allergen, kosher row, or storage condition not in the fixed lists above (needs a new icon asset + an entry in the relevant `src/data/*.js` file, plus new keys in every language of `src/i18n/translations.js` — see that file's own comment above `ALLERGEN_STATEMENT_ORDER` for the allergen case specifically).
- A new *category* (a 9th sheet type beyond the 8 in `src/data/categories.js`) — needs a new icon, a new `CategorySheet` body variant in `CategorySheet.jsx`, and new translation keys.
- A per-product kosher badge swatch color (currently global — see above).
