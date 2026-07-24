import { useEffect, useRef, useState } from 'react'
import splashGif from '../assets/splash.gif'
import './SplashScreen.css'

const DISPLAY_MS = 6000
const FADE_MS = 500
const MAX_WAIT_MS = 3000

export default function SplashScreen({ onFinished }) {
  const [fading, setFading] = useState(false)
  const startedRef = useRef(false)
  const startCountdownRef = useRef(() => {})

  useEffect(() => {
    let fadeTimer
    let doneTimer

    startCountdownRef.current = () => {
      if (startedRef.current) return
      startedRef.current = true
      fadeTimer = setTimeout(() => setFading(true), DISPLAY_MS - FADE_MS)
      doneTimer = setTimeout(() => onFinished(), DISPLAY_MS)
    }

    // Safety net: if the gif never fires 'load' (slow network, etc.), don't
    // leave the user stuck on a blank screen.
    const fallbackTimer = setTimeout(() => startCountdownRef.current(), MAX_WAIT_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
      clearTimeout(fallbackTimer)
    }
  }, [onFinished])

  return (
    <div className={`splash-screen${fading ? ' splash-screen--fading' : ''}`}>
      <img
        className="splash-screen__video"
        src={splashGif}
        alt=""
        aria-hidden="true"
        onLoad={() => startCountdownRef.current()}
      />
    </div>
  )
}
