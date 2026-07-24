import sodiumIcon from '../assets/icons/nutrition/sodium.svg'
import energyIcon from '../assets/icons/nutrition/energy.svg'
import satFatIcon from '../assets/icons/nutrition/sat-fat.svg'
import spoonIcon from '../assets/icons/nutrition/spoon.svg'
import sugarCubesIcon from '../assets/icons/nutrition/sugar-cubes.svg'

// Physical left-to-right order, matches the Figma stat-card row's x-position
// (sodium x=16, satFat x=140, energy x=265) — rendered inside a dir="ltr"
// wrapper in HomeScreen.jsx, same convention as .category-grid/.product-card.
// `bg` isn't set here — each product provides its own card colors (see
// products.json's per-product `nutritionColors`), merged in by HomeScreen.
export const nutritionStatCards = [
  { id: 'sodium', icon: sodiumIcon, iconWidth: 43, iconHeight: 43 },
  { id: 'satFat', icon: satFatIcon, iconWidth: 30, iconHeight: 41 },
  { id: 'energy', icon: energyIcon, iconWidth: 28.65, iconHeight: 39.94 },
]

// Top-to-bottom order, matches the Figma 2-column fact table.
export const nutritionTableRowIds = ['totalFat', 'transFat', 'cholesterol', 'totalCarbs', 'protein']

export const nutritionSugarBoxIcons = {
  sugar: { icon: sugarCubesIcon, iconWidth: 39, iconHeight: 37 },
  teaspoons: { icon: spoonIcon, iconWidth: 58, iconHeight: 27 },
}
