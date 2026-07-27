import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
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
  const canvasRef = useRef(document.createElement('canvas'))
  const streamRef = useRef(null)
  const frameRef = useRef(null)
  const [error, setError] = useState(null)
  const [notFoundFlash, setNotFoundFlash] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    setError(null)

    const scanFrame = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data) {
          const productId = extractProductId(code.data)
          if (productId) {
            onClose()
            navigate(`/${productId}`)
            return
          }
          setNotFoundFlash(true)
          setTimeout(() => setNotFoundFlash(false), 1200)
        }
      }
      frameRef.current = requestAnimationFrame(scanFrame)
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        frameRef.current = requestAnimationFrame(scanFrame)
      })
      .catch(() => {
        if (!cancelled) setError(t.qrScannerError)
      })

    return () => {
      cancelled = true
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
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
