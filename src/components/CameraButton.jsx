import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CameraButton.css'

// Badge geometry lifted from the Figma reference (circle centered at
// 59.5,59.5) — see ScanBadge below for how each piece maps back to it. The
// viewBox's y-range extends above y=0 (see BADGE_TOP_Y/BADGE_BOTTOM_Y) to fit
// the curved label's own gap and ascenders above the ring — the circle/QR
// icon markup below is unmoved, only which portion of that coordinate space
// the SVG actually shows changed.
const BADGE_WIDTH = 119
const CX = 59.5
const CY = 59.5
const MAIN_CIRCLE_R = 49.96
const RING_R = 58.36
const RING_STROKE = 2.28
const BADGE_COLOR = '#29256A'

// The curved label sits on its own arc above the circle, wide enough (330°)
// that even the longest translation (English) never runs out of track —
// unused track is simply blank, so over-sizing this has no visual cost.
// Radius is the ring's own radius plus a gap so the label's descenders don't
// touch the ring.
const TEXT_ARC_RADIUS = RING_R + 18
const TEXT_ARC_HALF_SPAN_DEG = 165
const TEXT_ARC_LENGTH = TEXT_ARC_RADIUS * ((2 * TEXT_ARC_HALF_SPAN_DEG * Math.PI) / 180)
// Blank arc-length between words, in the same user-units as the SVG viewBox.
const WORD_GAP = 5
const LABEL_FONT_SIZE = 19
// However wide the label's own text turns out to be (measured per device/font
// below), the viewBox's *fixed* width used to just be BADGE_WIDTH — too
// narrow once a long label's curve swings past the circle's own footprint,
// silently clipping its outermost letters against the SVG's default
// overflow: hidden. This is the safety margin added on top of the text's
// actual measured extent when widening the viewBox to fit it.
const TEXT_EDGE_MARGIN = 16
// Fixed vertical room above the ring for the label's ascenders (font size is
// constant, so — unlike width — this doesn't need to vary with label length).
const TEXT_TOP_MARGIN = 20
const BADGE_TOP_Y = CY - TEXT_ARC_RADIUS - TEXT_TOP_MARGIN
const BADGE_BOTTOM_Y = CY + RING_R + 3
const BADGE_HEIGHT = BADGE_BOTTOM_Y - BADGE_TOP_Y

function polarPoint(angleDeg) {
  // angleDeg measured clockwise from 12 o'clock, matching how the arc's
  // "left"/"right" endpoints are described below.
  const rad = (angleDeg * Math.PI) / 180
  return [CX + TEXT_ARC_RADIUS * Math.sin(rad), CY - TEXT_ARC_RADIUS * Math.cos(rad)]
}

// Converts an arc-length offset from the top-center point (positive = toward
// the right) into the angleDeg polarPoint expects.
function angleForOffset(offsetFromCenter) {
  return (offsetFromCenter / TEXT_ARC_RADIUS) * (180 / Math.PI)
}

// Each word is placed as a plain (non-path) <text>, rotated to the arc's
// local tangent at its slot — not on an SVG <textPath>. textPath's rtl
// handling turned out to be the actual problem: it rendered correctly in one
// engine and came out mirrored — every word, and every letter within each
// word, backwards — in another, and no combination of `direction`/
// `unicode-bidi`/manually reversing the string (which also breaks Arabic's
// contextual letter joining — initial/medial/final glyph forms are chosen
// from logical adjacency, which reversal scrambles) rendered correctly
// everywhere at once. Plain SVG <text>, by contrast, has consistent,
// long-standing rtl/bidi support across engines — the same way normal HTML
// text does — so rendering each word that way and only handling the curve
// ourselves (via rotate) sidesteps the inconsistency instead of fighting it,
// while leaving every word's characters completely untouched (correct
// native shaping, guaranteed).
//
// Word measurement (getComputedTextLength, hidden pass below) and explicit
// positioning also sidesteps a separate bug this replaced: a single textPath
// run silently drops any glyphs that don't fit within an assumed track
// length once centered — on a device whose font metrics render the label
// wider than assumed, that clipped the first/last letters.
function useWordSlots(label) {
  const words = useMemo(() => label.split(' ').filter(Boolean), [label])
  const measureRefs = useRef([])
  const [widths, setWidths] = useState(null)

  useLayoutEffect(() => {
    setWidths(words.map((_, i) => measureRefs.current[i]?.getComputedTextLength() ?? 0))
  }, [words])

  return { words, measureRefs, widths }
}

function ScanBadge({ label, dir }) {
  const { words, measureRefs, widths } = useWordSlots(label)

  // Slot 0 is the arc's leftmost position. ltr keeps word order as-is; rtl
  // reads right-to-left, so the first (logically-read-first) word belongs in
  // the rightmost (last) slot instead — each word's own characters are
  // rendered untouched (see useWordSlots), only this slot assignment changes.
  const slotWordIndices = dir === 'rtl' ? [...words.keys()].reverse() : words.map((_, i) => i)

  // Each slot's angle along the arc (see angleForOffset), used both to
  // position/rotate that slot's word and, below, to size the viewBox.
  let slotAngles = null
  // Defaults to the circle/QR icon's own footprint — only widened below once
  // a measured label actually needs more room than that.
  let viewBoxMinX = 0
  let viewBoxWidth = BADGE_WIDTH
  if (widths) {
    const slotWidths = slotWordIndices.map((i) => widths[i])
    const totalWidth = slotWidths.reduce((sum, w) => sum + w, 0) + WORD_GAP * Math.max(0, words.length - 1)
    let cursor = -totalWidth / 2
    slotAngles = slotWidths.map((w) => {
      const center = cursor + w / 2
      cursor += w + WORD_GAP
      return angleForOffset(center)
    })

    // Half the label's arc-length, converted back to how far (in degrees)
    // that reaches around the circle from the top, then to the actual x
    // coordinate that outermost point sits at — same polarPoint math used to
    // position each word.
    const halfSpanDeg = (totalWidth / 2 / TEXT_ARC_RADIUS) * (180 / Math.PI)
    const [rightEdgeX] = polarPoint(halfSpanDeg)
    const [leftEdgeX] = polarPoint(-halfSpanDeg)
    const neededHalfWidth = Math.max(
      BADGE_WIDTH / 2,
      CX - leftEdgeX + TEXT_EDGE_MARGIN,
      rightEdgeX - CX + TEXT_EDGE_MARGIN,
    )
    viewBoxMinX = CX - neededHalfWidth
    viewBoxWidth = neededHalfWidth * 2
  }

  return (
    <svg
      viewBox={`${viewBoxMinX} ${BADGE_TOP_Y} ${viewBoxWidth} ${BADGE_HEIGHT}`}
      className="camera-button__badge"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke={BADGE_COLOR} strokeWidth={RING_STROKE} />
      <circle cx={CX} cy={CY} r={MAIN_CIRCLE_R} fill={BADGE_COLOR} />
      <g transform="translate(33.04 32.67)" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round">
        <path d="M1.15 9.99V3.02C1.15 2.09 1.91 1.33 2.84 1.33H10.17" />
        <path d="M45.39 1.15H52.36C53.29 1.15 54.05 1.91 54.05 2.84V10.17" />
        <path d="M1.15 45.98V52.95C1.15 53.88 1.91 54.64 2.84 54.64H10.17" />
        <path d="M45.39 54.81H52.36C53.29 54.81 54.05 54.05 54.05 53.12V45.79" />
      </g>
      <g transform="translate(38.91 38.92)" fill="white">
        <path d="M12.05 6.1H7.25C6.61487 6.1 6.1 6.61487 6.1 7.25V12.05C6.1 12.6851 6.61487 13.2 7.25 13.2H12.05C12.6851 13.2 13.2 12.6851 13.2 12.05V7.25C13.2 6.61487 12.6851 6.1 12.05 6.1Z" />
        <path d="M0 1.32V17.99C0 18.72 0.59 19.31 1.32 19.31H17.99C18.72 19.31 19.31 18.72 19.31 17.99V1.32C19.31 0.59 18.72 0 17.99 0H1.32C0.59 0 0 0.59 0 1.32ZM14.87 16.19H4.45C3.72 16.19 3.13 15.6 3.13 14.87V4.45C3.13 3.72 3.72 3.13 4.45 3.13H14.87C15.6 3.13 16.19 3.72 16.19 4.45V14.87C16.19 15.6 15.6 16.19 14.87 16.19Z" />
      </g>
      <g transform="translate(60.78 38.92)" fill="white">
        <path d="M12.06 6.1H7.26C6.62487 6.1 6.11 6.61487 6.11 7.25V12.05C6.11 12.6851 6.62487 13.2 7.26 13.2H12.06C12.6951 13.2 13.21 12.6851 13.21 12.05V7.25C13.21 6.61487 12.6951 6.1 12.06 6.1Z" />
        <path d="M0 1.32V17.99C0 18.72 0.59 19.31 1.32 19.31H17.99C18.72 19.31 19.31 18.72 19.31 17.99V1.32C19.31 0.59 18.72 0 17.99 0H1.32C0.59 0 0 0.59 0 1.32ZM14.87 16.19H4.45C3.72 16.19 3.13 15.6 3.13 14.87V4.45C3.13 3.72 3.72 3.13 4.45 3.13H14.87C15.6 3.13 16.19 3.72 16.19 4.45V14.87C16.19 15.6 15.6 16.19 14.87 16.19Z" />
      </g>
      <g transform="translate(38.91 60.79)" fill="white">
        <path d="M12.05 6.11H7.25C6.61487 6.11 6.1 6.62487 6.1 7.26V12.06C6.1 12.6951 6.61487 13.21 7.25 13.21H12.05C12.6851 13.21 13.2 12.6951 13.2 12.06V7.26C13.2 6.62487 12.6851 6.11 12.05 6.11Z" />
        <path d="M0 1.32V17.99C0 18.72 0.59 19.31 1.32 19.31H17.99C18.72 19.31 19.31 18.72 19.31 17.99V1.32C19.31 0.59 18.72 0 17.99 0H1.32C0.59 0 0 0.59 0 1.32ZM14.87 16.19H4.45C3.72 16.19 3.13 15.6 3.13 14.87V4.45C3.13 3.72 3.72 3.13 4.45 3.13H14.87C15.6 3.13 16.19 3.72 16.19 4.45V14.87C16.19 15.6 15.6 16.19 14.87 16.19Z" />
      </g>
      <g transform="translate(60.78 60.99)" fill="white">
        <path d="M7.86 5.04V10.08H0.06V0H3.54V5.04H7.86Z" />
        <path d="M11.57 0H7.86V5.04H11.57V0Z" />
        <path d="M3.54 15.3H0V19.1H3.54V15.3Z" />
        <path d="M11.56 10.08H7.8V13.66H11.56V10.08Z" />
        <path d="M19.31 0.05H15.71V3.83H19.31V0.05Z" />
        <path d="M19.31 10.08V19.1H11.57V13.66H15.71V10.08H19.31Z" />
      </g>
      {/* Off-canvas measurement pass: same plain-text rendering the visible
          words below use, so getComputedTextLength reflects each word's true
          rendered advance on this device/font. */}
      <text fontSize={LABEL_FONT_SIZE} fontWeight="600" x={-9999} y={-9999} aria-hidden="true">
        {words.map((word, i) => (
          <tspan key={i} ref={(el) => (measureRefs.current[i] = el)}>
            {word}
          </tspan>
        ))}
      </text>
      {slotAngles &&
        slotWordIndices.map((wordIndex, slot) => {
          const angle = slotAngles[slot]
          const [x, y] = polarPoint(angle)
          return (
            <text
              key={wordIndex}
              x={x}
              y={y}
              transform={`rotate(${angle} ${x} ${y})`}
              textAnchor="middle"
              fill={BADGE_COLOR}
              fontSize={LABEL_FONT_SIZE}
              fontWeight="600"
              style={{ direction: dir }}
            >
              {words[wordIndex]}
            </text>
          )
        })}
    </svg>
  )
}

export default function CameraButton() {
  const { t, dir } = useLanguage()
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
        <ScanBadge label={t.scanMore} dir={dir} />
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
