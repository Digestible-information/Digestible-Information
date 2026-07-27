import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import QrScannerOverlay from './QrScannerOverlay.jsx'
import scanIcon from '../assets/icons/scan-badge/icon.svg'
import scanLabelHe from '../assets/icons/scan-badge/label-he.svg'
import scanLabelEn from '../assets/icons/scan-badge/label-en.svg'
import scanLabelAr from '../assets/icons/scan-badge/label-ar.svg'
import './CameraButton.css'

// Icon is shared across languages; each language has its own label graphic
// and its own padding/offsets, straight from Figma's per-language frames
// (they aren't just mirrored copies of one layout — the padding and the
// icon/label offsets genuinely differ between he/en/ar).
const BADGE_LAYOUT = {
  he: {
    label: scanLabelHe,
    padding: '9px 17px 11px 12px',
    stackWidth: 59.906,
    stackHeight: 69.417,
    icon: { left: 0, top: 9, width: 59.906, height: 60.417 },
    label_: { left: 1, top: 0, width: 56.697, height: 15.322 },
  },
  en: {
    label: scanLabelEn,
    padding: '8px 5px',
    stackWidth: 75.154,
    stackHeight: 72.417,
    // No content transform needed: Figma's "-scale-y-100 rotate-180" on this
    // group exists only to counteract the outer frame itself being mirrored
    // for LTR — since the shape here is mirrored via logical border-radius
    // instead (see CameraButton.css), the icon/label can stay at their
    // plain, unrotated Figma offsets.
    icon: { left: 8, top: 12, width: 59.906, height: 60.417 },
    label_: { left: 0, top: 0, width: 75.154, height: 29.042 },
  },
  ar: {
    label: scanLabelAr,
    padding: '7px 12px',
    stackWidth: 59.906,
    stackHeight: 73.417,
    icon: { left: 0, top: 13, width: 59.906, height: 60.417 },
    label_: { left: 2, top: 0, width: 57.555, height: 20.559 },
  },
}

export default function CameraButton() {
  const { t, language } = useLanguage()
  const [scannerOpen, setScannerOpen] = useState(false)
  const layout = BADGE_LAYOUT[language]

  return (
    <div className="camera-button">
      <button
        type="button"
        className="camera-button__trigger"
        style={{ padding: layout.padding }}
        onClick={() => setScannerOpen(true)}
        aria-label={t.scanMore}
      >
        <span
          className="camera-button__stack"
          style={{ width: layout.stackWidth, height: layout.stackHeight }}
        >
          <img
            src={scanIcon}
            alt=""
            className="camera-button__icon"
            style={{ ...layout.icon }}
          />
          <img
            src={layout.label}
            alt=""
            className="camera-button__label"
            style={{ ...layout.label_ }}
          />
        </span>
      </button>
      <QrScannerOverlay open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  )
}
