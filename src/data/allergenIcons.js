// Order matches the Figma layout's RTL reading order (right to left):
// row 1 — eggs, gluten, soy, sesame; row 2 — peanuts, milk, nuts.
// width/height are each icon's native SVG viewBox aspect ratio, used to size
// them without distortion (the source SVGs use preserveAspectRatio="none",
// so they need an explicit aspect-ratio rather than relying on object-fit).
// Actual icon rendering lives in AllergenIcon.jsx (inline SVG, indexed by
// this same id) — these are just the sizing metrics.
export const allergenIcons = [
  { id: 'eggs', width: 38, height: 54 },
  { id: 'gluten', width: 27, height: 68 },
  { id: 'soy', width: 46, height: 46 },
  { id: 'sesame', width: 38, height: 36 },
  { id: 'peanuts', width: 49, height: 55 },
  { id: 'milk', width: 32, height: 62 },
  { id: 'nuts', width: 64, height: 55 },
]
