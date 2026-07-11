import { X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './ImageLightbox.css'

export default function ImageLightbox({ open, onClose, src, alt }) {
  const { t } = useLanguage()

  return (
    <div
      className={`image-lightbox${open ? ' image-lightbox--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      onClick={onClose}
    >
      <button type="button" className="image-lightbox__close" onClick={onClose} aria-label={t.close}>
        <X size={22} aria-hidden="true" />
      </button>
      <img src={src} alt={alt} className="image-lightbox__image" onClick={(event) => event.stopPropagation()} />
    </div>
  )
}
