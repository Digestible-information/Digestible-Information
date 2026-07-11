import sesame from '../assets/icons/allergens/sesame.svg'
import soy from '../assets/icons/allergens/soy.svg'
import gluten from '../assets/icons/allergens/gluten.svg'
import eggs from '../assets/icons/allergens/eggs.svg'
import nuts from '../assets/icons/allergens/nuts.svg'
import milk from '../assets/icons/allergens/milk.svg'
import peanuts from '../assets/icons/allergens/peanuts.svg'

// Order matches the Figma layout's RTL reading order (right to left):
// row 1 — eggs, gluten, soy, sesame; row 2 — peanuts, milk, nuts.
// width/height are each icon's native SVG viewBox aspect ratio, used to size
// them without distortion (the source SVGs use preserveAspectRatio="none",
// so they need an explicit aspect-ratio rather than relying on object-fit).
export const allergenIcons = [
  { id: 'eggs', icon: eggs, width: 38, height: 54 },
  { id: 'gluten', icon: gluten, width: 27, height: 68 },
  { id: 'soy', icon: soy, width: 46, height: 46 },
  { id: 'sesame', icon: sesame, width: 38, height: 36 },
  { id: 'peanuts', icon: peanuts, width: 49, height: 55 },
  { id: 'milk', icon: milk, width: 32, height: 62 },
  { id: 'nuts', icon: nuts, width: 64, height: 55 },
]
