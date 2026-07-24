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

// Top-to-bottom order, matches the Figma 2-column fact table. Default for
// products that don't set their own `nutritionTableRowIds` (see products.json).
export const nutritionTableRowIds = ['totalFat', 'transFat', 'cholesterol', 'totalCarbs', 'protein']

export const nutritionSugarBoxIcons = {
  sugar: { icon: sugarCubesIcon, iconWidth: 39, iconHeight: 37 },
  teaspoons: { icon: spoonIcon, iconWidth: 58, iconHeight: 27 },
}

// Stacked-layout variant (e.g. "Energybar", see products.json's
// `nutritionLayout: "stacked"`): sugar/teaspoons render as their own row of
// stat-card-styled boxes — same fixed card size as nutritionStatCards above
// (not a custom wider card), so all 5 nodes share one visual scale and this
// 2-card row simply centers under the 3-card row via the row's own
// justify-content instead of stretching to fill it. iconWidth/iconHeight
// (same values as nutritionSugarBoxIcons) keep each icon at its own original
// sugar-box size — a flat spoon, a small cube pair — instead of stretching
// edge-to-edge like the top row's icons do.
// Physical left-to-right order matches the Figma reference (teaspoons box
// on the left, sugars box on the right).
export const nutritionSugarStatCards = [
  { id: 'teaspoons', icon: spoonIcon, iconWidth: 58, iconHeight: 27 },
  { id: 'sugar', icon: sugarCubesIcon, iconWidth: 39, iconHeight: 37 },
]

// Sub-item groupings within the fact table: each group's parent row is
// bracketed to its children (e.g. transFat/cholesterol nest under totalFat),
// matching Figma's connector glyph. Keyed off row id rather than position, so
// CategorySheet only draws a bracket for a group whose parent+children are
// actually present in a given product's own `nutritionTableRowIds` order.
export const nutritionTableIndentGroups = [
  { parentId: 'totalFat', childIds: ['transFat', 'cholesterol'] },
  { parentId: 'totalCarbs', childIds: ['polyols'] },
]
