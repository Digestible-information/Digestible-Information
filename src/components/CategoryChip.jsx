import { Link } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CategoryChip.css'

export default function CategoryChip({ id, label, icon, color, onClick }) {
  const { dir } = useLanguage()
  const handleClick = (event) => {
    if (onClick) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div className="category-chip-container">
      <Link
        to={`/category/${id}`}
        className="category-chip"
        style={{ '--chip-color': color }}
        dir={dir}
        onClick={handleClick}
      >
        <img src={icon} alt="" className={`category-chip__icon category-chip__icon--${id}`} aria-hidden="true" />
        <span className="category-chip__label">{label.replaceAll('/', '/​')}</span>
        <span className="category-chip__tab">
          <ChevronUp size={16} className="category-chip__chevron" aria-hidden="true" />
        </span>
      </Link>
    </div>
  )
}
