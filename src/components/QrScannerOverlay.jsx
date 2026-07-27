import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readBarcodes, prepareZXingModule } from 'zxing-wasm/reader'
import zxingWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import { X, ExternalLink } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import productsData from '../data/products.json'
import './QrScannerOverlay.css'

// Serve the wasm binary from our own bundle instead of zxing-wasm's default
// jsDelivr CDN fallback, so scanning doesn't depend on a third-party host.
prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => (path.endsWith('.wasm') ? zxingWasmUrl : prefix + path),
  },
})

const READER_OPTIONS = { formats: ['QRCode'], tryHarder: true, maxNumberOfSymbols: 1 }

// Accepts a bare product id ("Energybar") — whatever's left after a printed
// QR code on packaging is confirmed not to be a URL (see resolveAction below).
function extractProductId(rawValue) {
  const candidate = rawValue.trim().split(/[/?#]/).filter(Boolean).pop() ?? ''
  const matchedKey = Object.keys(productsData).find((key) => key.toLowerCase() === candidate.toLowerCase())
  return matchedKey ?? null
}

// A QR code on real packaging can encode anything: our own product URL, or a
// third-party "dynamic" QR shortlink (e.g. me-qr.com) that only resolves to
// the real destination once a browser actually requests it and follows the
// redirect. We can't peek at where a shortlink goes with client-side string
// parsing — so for any URL, a real navigation is used and the browser
// resolves it (redirects included), same as tapping the link anywhere else
// would. A bare id resolves to an in-app route instead.
function resolveAction(rawValue, navigate) {
  const value = rawValue.trim()
  if (/^https?:\/\//i.test(value)) {
    return () => {
      window.location.href = value
    }
  }
  const productId = extractProductId(value)
  if (productId) {
    return () => navigate(`/${productId}`)
  }
  return null
}

export default function QrScannerOverlay({ open, onClose }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const notFoundTimerRef = useRef(null)
  const pendingRef = useRef(null)
  const [error, setError] = useState(null)
  const [notFoundFlash, setNotFoundFlash] = useState(false)
  const [pending, setPending] = useState(null)

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    let decoding = false
    setError(null)
    setPending(null)
    pendingRef.current = null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const scanFrame = async () => {
      if (cancelled) return
      const video = videoRef.current
      // Skip decoding while a match is awaiting the user's tap-to-confirm —
      // the camera stream stays live behind the banner, same as iOS's own
      // QR banner, but we don't burn cycles decoding frames no one asked for.
      if (!pendingRef.current && video && !decoding && video.readyState === video.HAVE_ENOUGH_DATA) {
        decoding = true
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        try {
          const [result] = await readBarcodes(imageData, READER_OPTIONS)
          if (!cancelled && result?.text) {
            const run = resolveAction(result.text, navigate)
            if (run) {
              const next = { label: result.text, run }
              pendingRef.current = next
              setPending(next)
            } else {
              setNotFoundFlash(true)
              clearTimeout(notFoundTimerRef.current)
              notFoundTimerRef.current = setTimeout(() => setNotFoundFlash(false), 1200)
            }
          }
        } catch {
          // Decode failure on this frame — just try the next one.
        }
        decoding = false
      }
      if (!cancelled) rafRef.current = requestAnimationFrame(scanFrame)
    }

    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
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
        rafRef.current = requestAnimationFrame(scanFrame)
      })
      .catch(() => {
        if (!cancelled) setError(t.qrScannerError)
      })

    return () => {
      cancelled = true
      clearTimeout(notFoundTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [open, navigate, t.qrScannerError])

  const handleConfirm = () => {
    const run = pendingRef.current?.run
    onClose()
    run?.()
  }

  const handleDismiss = () => {
    pendingRef.current = null
    setPending(null)
  }

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
          {pending ? (
            <div className="qr-scanner__confirm">
              <button type="button" className="qr-scanner__confirm-open" onClick={handleConfirm}>
                <ExternalLink size={18} aria-hidden="true" />
                <span className="qr-scanner__confirm-label">{pending.label}</span>
              </button>
              <button type="button" className="qr-scanner__confirm-dismiss" onClick={handleDismiss}>
                {t.qrScannerKeepScanning}
              </button>
            </div>
          ) : (
            <p className="qr-scanner__message">
              {notFoundFlash ? t.qrScannerNotFound : t.qrScannerInstructions}
            </p>
          )}
        </>
      )}
    </div>
  )
}
