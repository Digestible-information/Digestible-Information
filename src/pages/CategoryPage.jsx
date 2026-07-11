import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CategoryPage.css'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const { t } = useLanguage()

  return (
    <div className="category-page">
      <Link to="/" className="category-page__back">
        <ChevronRight size={20} aria-hidden="true" />
        <span>{t.back}</span>
      </Link>
      <h1 className="category-page__title">{t.categories[categoryId] ?? categoryId}</h1>
      <p className="category-page__body">{t.categoryPlaceholder}</p>
    </div>
  )
}
