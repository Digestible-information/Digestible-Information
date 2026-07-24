import recyclingBinIconOrange from '../assets/icons/recycling-bin.png'
import recyclingBinIconBlue from '../assets/icons/recycling-bin-blue.svg'

// Full-color illustrations (own baked-in black icon/white text, not black
// line-art on transparent like storage/manufacturer's icons), so they aren't
// inverted in high-contrast mode. iconWidth/iconHeight is each bin's size in
// the original single-centered-bin Figma frame (still used as-is by "twist");
// rowIconWidth/rowIconHeight is the smaller size from the newer multi-bin
// Figma frame, used by CategorySheet.jsx's row layout when a product has more
// than one bin (e.g. "Energybar").
export const recyclingBinIcons = {
  orange: {
    icon: recyclingBinIconOrange,
    iconWidth: 122,
    iconHeight: 166,
    rowIconWidth: 80,
    rowIconHeight: 108,
    invertOnHighContrast: false,
    highlightColor: '#EF531E',
  },
  blue: {
    icon: recyclingBinIconBlue,
    iconWidth: 122,
    iconHeight: 166,
    rowIconWidth: 80,
    rowIconHeight: 109,
    invertOnHighContrast: false,
    highlightColor: '#155CA9',
  },
}
