import sodiumIcon from '../assets/icons/nutrition/sodium.svg'
import energyIcon from '../assets/icons/nutrition/energy.svg'
import satFatCard from '../assets/icons/nutrition/sat-fat-card.svg'
import spoonIcon from '../assets/icons/nutrition/spoon.svg'
import sugarCubesIcon from '../assets/icons/nutrition/sugar-cubes.svg'

// Physical left-to-right order, matches the Figma stat-card row's x-position
// (sodium x=16, satFat x=140, energy x=265) — rendered inside a dir="ltr"
// wrapper in HomeScreen.jsx, same convention as .category-grid/.product-card.
// satFat has no separate bg+icon layers in Figma (unlike the other two) — it's
// a single flattened image, used as the card's full background instead.
export const nutritionStatCards = [
  { id: 'sodium', bg: '#00AE38', icon: sodiumIcon, iconWidth: 43, iconHeight: 43 },
  { id: 'satFat', flattenedImage: satFatCard },
  { id: 'energy', bg: '#FF7E00', icon: energyIcon, iconWidth: 28.65, iconHeight: 39.94 },
]

// Top-to-bottom order, matches the Figma 2-column fact table.
export const nutritionTableRowIds = ['totalFat', 'transFat', 'cholesterol', 'totalCarbs', 'protein']

export const nutritionSugarBoxIcons = {
  sugar: { icon: spoonIcon, iconWidth: 38, iconHeight: 36 },
  teaspoons: { icon: sugarCubesIcon, iconWidth: 56.98, iconHeight: 26.97 },
}
