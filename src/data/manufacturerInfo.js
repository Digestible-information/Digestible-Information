import factoryIcon from '../assets/icons/manufacturer/factory.svg'

// Black line-art on a transparent background, so it needs to invert to stay
// visible once the sheet flips to a black high-contrast background — same
// treatment as kosher's OU-D logo/seal.
export const manufacturerBodyIcon = {
  icon: factoryIcon,
  iconWidth: 45,
  iconHeight: 44,
  invertOnHighContrast: true,
}
