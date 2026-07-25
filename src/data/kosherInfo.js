import ouDairyIcon from '../assets/icons/kosher/ou-dairy.svg'
import rabbinicalSealIcon from '../assets/icons/kosher/rabbinical-seal.png'
import regionalRabbinateIcon from '../assets/icons/kosher/regional-rabbinate.svg'
import badatzBeitYosefIcon from '../assets/icons/kosher/badatz-beit-yosef.png'

// All are black line-art on a transparent background, so they need to invert
// to stay visible once the sheet flips to a black high-contrast background —
// unlike the fixed-color badge swatch (see product.kosherBadgeSwatchColor in
// products.json), which never inverts.
export const kosherRows = [
  // "Orthodox Union - Dairy" stays in English in every language (a certifying
  // body's proper name) — forced ltr so the bidi algorithm doesn't reorder the
  // "-" to the wrong side when the surrounding sheet is he/ar (rtl).
  { id: 'ouDairy', icon: ouDairyIcon, iconWidth: 61, iconHeight: 39, invertOnHighContrast: true, forceLtrText: true },
  { id: 'rabbinicalSeal', icon: rabbinicalSealIcon, iconWidth: 117, iconHeight: 65, invertOnHighContrast: true },
  { id: 'regionalRabbinate', icon: regionalRabbinateIcon, iconWidth: 85, iconHeight: 84, invertOnHighContrast: true },
  { id: 'badatzBeitYosef', icon: badatzBeitYosefIcon, iconWidth: 136, iconHeight: 94, invertOnHighContrast: true },
]
