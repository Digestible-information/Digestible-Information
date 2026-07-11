import ouDairyIcon from '../assets/icons/kosher/ou-dairy.svg'
import rabbinicalSealIcon from '../assets/icons/kosher/rabbinical-seal.png'

export const kosherBadgeSwatchColor = '#39C5EC'

// Both are black line-art on a transparent background, so they need to invert
// to stay visible once the sheet flips to a black high-contrast background —
// unlike the fixed-color badge swatch above, which never inverts.
export const kosherRows = [
  // "Orthodox Union - Dairy" stays in English in every language (a certifying
  // body's proper name) — forced ltr so the bidi algorithm doesn't reorder the
  // "-" to the wrong side when the surrounding sheet is he/ar (rtl).
  { id: 'ouDairy', icon: ouDairyIcon, iconWidth: 61, iconHeight: 39, invertOnHighContrast: true, forceLtrText: true },
  { id: 'rabbinicalSeal', icon: rabbinicalSealIcon, iconWidth: 117, iconHeight: 65, invertOnHighContrast: true },
]
