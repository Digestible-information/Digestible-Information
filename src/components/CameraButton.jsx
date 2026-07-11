import { useRef } from 'react'
import cameraIcon from '../assets/camera-icon.svg'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CameraButton.css'

export default function CameraButton() {
  const { t } = useLanguage()
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
    <div className="camera-button">
      <button
        type="button"
        className="camera-button__trigger"
        onClick={() => inputRef.current?.click()}
        aria-label={t.scanMore}
      >
        <img src={cameraIcon} alt="" className="camera-button__icon" />
      </button>
      <span className="camera-button__label">{t.scanMore}</span>
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
