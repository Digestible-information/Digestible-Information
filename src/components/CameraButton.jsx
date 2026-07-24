import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import scanBadgeHe from '../assets/icons/scan-badge/he.svg'
import scanBadgeEn from '../assets/icons/scan-badge/en.svg'
import scanBadgeAr from '../assets/icons/scan-badge/ar.svg'
import './CameraButton.css'

// One pre-designed badge per language (exported from Figma, curved label
// baked in) rather than building the curve dynamically — text-on-a-curve
// turned out to render inconsistently enough across engines (rtl order,
// upright orientation, clipping long labels) that a static per-language
// asset is the reliable choice. Each has its own natural aspect ratio
// (English's longer label makes for a wider badge) — CameraButton.css sizes
// off a fixed height with width left to follow that ratio, so swapping
// language doesn't need any JS-computed geometry at all.
const SCAN_BADGE_BY_LANGUAGE = {
  he: scanBadgeHe,
  en: scanBadgeEn,
  ar: scanBadgeAr,
}

export default function CameraButton() {
  const { t, language } = useLanguage()
  const inputRef = useRef(null)

  const handleCapture = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: wire up to the real scan/product-lookup flow
      console.log('Captured file:', file)
    }
    event.target.value = ''
  }

  return (
    <div className="camera-button" dir="ltr">
      <button
        type="button"
        className="camera-button__trigger"
        onClick={() => inputRef.current?.click()}
        aria-label={t.scanMore}
      >
        <img src={SCAN_BADGE_BY_LANGUAGE[language]} alt="" className="camera-button__badge" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="camera-button__input"
      />
    </div>
  )
}
