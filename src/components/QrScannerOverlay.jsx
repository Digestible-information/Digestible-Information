import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import { X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import productsData from '../data/products.json'
import './QrScannerOverlay.css'

// Accepts either a bare product id ("Energybar") or a full/relative URL that
// ends with one ("https://.../Energybar", "/Energybar") — whatever a printed
// QR code on packaging happens to encode.
function extractProductId(rawValue) {
  const candidate = rawValue.trim().split(/[/?#]/).filter(Boolean).pop() ?? ''
  const matchedKey = Object.keys(productsData).find((key) => key.toLowerCase() === candidate.toLowerCase())
  return matchedKey ?? null
}

export default function QrScannerOverlay({ open, onClose }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const notFoundTimerRef = useRef(null)
  const [error, setError] = useState(null)
  const [notFoundFlash, setNotFoundFlash] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    setError(null)

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const productId = extractProductId(result.data)
        if (productId) {
          onClose()
          navigate(`/${productId}`)
          return
        }
        setNotFoundFlash(true)
        clearTimeout(notFoundTimerRef.current)
        notFoundTimerRef.current = setTimeout(() => setNotFoundFlash(false), 1200)
      },
      { preferredCamera: 'environment' },
    )

    scanner.start().catch(() => {
      if (!cancelled) setError(t.qrScannerError)
    })

    return () => {
      cancelled = true
      clearTimeout(notFoundTimerRef.current)
      scanner.stop()
      scanner.destroy()
    }
  }, [open, navigate, onClose, t.qrScannerError])

  if (!open) return null

  return (
    <div className="qr-scanner" role="dialog" aria-modal="true">
      <button type="button" className="qr-scanner__close" onClick={onClose} aria-label={t.close}>
        <X size={22} aria-hidden="true" />
      </button>
      {error ? (
        <p className="qr-scanner__message qr-scanner__message--error">{error}</p>
      ) : (
        <>
          <video ref={videoRef} className="qr-scanner__video" playsInline muted />
          <div className="qr-scanner__frame" aria-hidden="true" />
          <p className="qr-scanner__message">
            {notFoundFlash ? t.qrScannerNotFound : t.qrScannerInstructions}
          </p>
        </>
      )}
    </div>
  )
}
