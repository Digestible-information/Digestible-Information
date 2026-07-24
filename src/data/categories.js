import allergensIcon from '../assets/icons/allergens.svg'
import ingredientsIcon from '../assets/icons/ingredients.svg'
import nutritionIcon from '../assets/icons/nutrition.svg'
import kosherIcon from '../assets/icons/kosher.svg'
import manufacturerIcon from '../assets/icons/manufacturer.svg'
import storageIcon from '../assets/icons/storage.svg'
import recyclingIcon from '../assets/icons/recycling.svg'
import warningsIcon from '../assets/icons/warnings.svg'

export const categories = [
  { id: 'allergens', icon: allergensIcon, color: '#DE0405', group: 'primary' },
  { id: 'ingredients', icon: ingredientsIcon, color: '#43AA49', group: 'primary' },
  { id: 'kosher', icon: kosherIcon, color: '#2FB0E9', group: 'primary' },
  { id: 'nutrition', icon: nutritionIcon, color: '#F5851F', group: 'primary' },
  { id: 'manufacturer', icon: manufacturerIcon, color: '#29256A', group: 'secondary' },
  { id: 'storage', icon: storageIcon, color: '#44157A', group: 'secondary' },
  { id: 'recycling', icon: recyclingIcon, color: '#7E4836', group: 'secondary' },
  { id: 'warnings', icon: warningsIcon, color: '#A51D1E', group: 'secondary' },
]
