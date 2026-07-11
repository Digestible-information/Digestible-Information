import { Link } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CategoryListRow.css'

export default function CategoryListRow({ id, label, icon, color, onClick, disabled }) {
  const { dir } = useLanguage()
  const handleClick = (event) => {
    if (onClick) {
      event.preventDefault()
      onClick()
    }
  }

  const content = (
    <>
      <img src={icon} alt="" className="category-list-row__icon" aria-hidden="true" />
      <span className="category-list-row__label">{label.replaceAll('/', '/​')}</span>
      <ChevronUp size={16} className="category-list-row__chevron" aria-hidden="true" />
    </>
  )

  return (
    <div className="category-list-row-container">
      {disabled ? (
        <div
          className="category-list-row category-list-row--disabled"
          style={{ '--row-color': color }}
          dir={dir}
          aria-disabled="true"
        >
          {content}
        </div>
      ) : (
        <Link
          to={`/category/${id}`}
          className="category-list-row"
          style={{ '--row-color': color }}
          dir={dir}
          onClick={handleClick}
        >
          {content}
        </Link>
      )}
    </div>
  )
}
