import shadedIcon from '../assets/icons/storage/shaded.svg'
import coolIcon from '../assets/icons/storage/cool.svg'
import dryIcon from '../assets/icons/storage/dry.svg'

// All 3 are black line-art on a transparent background, so they need to invert
// to stay visible once the sheet flips to a black high-contrast background —
// same treatment as kosher/manufacturer's icons.
export const storageRows = [
  { id: 'shaded', icon: shadedIcon, iconWidth: 31, iconHeight: 31, invertOnHighContrast: true },
  { id: 'cool', icon: coolIcon, iconWidth: 28.7, iconHeight: 31.9, invertOnHighContrast: true },
  { id: 'dry', icon: dryIcon, iconWidth: 29.2, iconHeight: 31, invertOnHighContrast: true },
]
