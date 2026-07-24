import chokingHazardIcon from '../assets/icons/warning-choking-hazard.svg'

// Solid-color icon (#EA2427), not black line-art — a plain invert(1) would turn
// it cyan, not white, so its high-contrast style uses brightness(0) invert(1)
// instead (see .category-sheet__warnings-icon--invertible in CategorySheet.css).
export const warningsBodyIcon = {
  icon: chokingHazardIcon,
  iconWidth: 108,
  iconHeight: 89,
  invertOnHighContrast: true,
}
