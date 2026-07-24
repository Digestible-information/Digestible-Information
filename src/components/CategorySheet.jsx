import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import contrastInner from '../assets/icons/sheet/contrast-inner.svg'
import volumeSpeaker from '../assets/icons/sheet/volume-speaker.svg'
import volumeWave1 from '../assets/icons/sheet/volume-wave1.svg'
import volumeWave2 from '../assets/icons/sheet/volume-wave2.svg'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './CategorySheet.css'

const CLOSE_THRESHOLD = 120
const MIN_FONT_STEP = -3
const MAX_FONT_STEP = 3
const BASE_FONT_SIZE = 18
const BODY_TEXT_BASE_FONT_SIZE = 20
const FONT_STEP_SIZE = 3
// Icon grid sizing is fluid (cqw, relative to .category-sheet__icon-grid's own width)
// rather than fixed px, so the 4-column layout scales cleanly on any screen width
// instead of staying a fixed native size. Each icon's larger native dimension is
// normalized to this budget, keeping every allergen icon a similar visual footprint
// regardless of its own aspect ratio (matching the Figma reference).
const ICON_BUDGET_CQW = 15
const LABEL_BASE_CQW = 4.6
// Rendered as explicit rows (rather than one CSS grid) so a partial last row (e.g. 3
// of 7 allergens) can be centered with plain flexbox justify-content — grid-column
// line offsetting for this turned out not to center symmetrically under RTL.
const ICONS_PER_ROW = 4

// Nutrition body sizing follows the same cqw-relative-to-fontStep approach as the
// icon grid above, for the same reason: fixed cards/boxes must not overflow/clip at
// the max font-size step. Budgets are calibrated against the stat-card row's own
// content width (matching each icon's footprint in the Figma reference).
const STAT_CARD_ICON_BUDGET_CQW = 12
const STAT_CARD_LABEL_BASE_CQW = 4.8
const STAT_CARD_VALUE_BASE_CQW = 4.6
// Stat card width now grows with fontStep (not just its text/icons), via the
// row's own gap so it stays consistent with the 3.5% CSS gap: 3 cards fit
// exactly at fontStep 0 (93% / 3), then each step widens every card until
// flex-wrap (see .category-sheet__stat-row) starts dropping cards to their
// own row — 2 per row, then 1 — instead of clipping/squeezing their content.
const STAT_CARD_BASE_PCT = (100 - 2 * 3.5) / 3
const STAT_CARD_GROWTH_PCT = 6
// Fact table / sugar box widths grow with fontStep the same way: base 50%/47.2%
// fits both side-by-side with the row's 2.8% gap exactly at fontStep 0; growing
// steps push their combined width past 100%, so flex-wrap (see
// .category-sheet__fact-row) drops each to its own full-width row instead of
// clipping their nowrap rows. Height scales with iconScale (same multiplier
// already driving icon/text sizes) so the boxes gain room to match.
const FACT_TABLE_BASE_PCT = 50
const SUGAR_BOX_BASE_PCT = 47.2
const FACT_ROW_GROWTH_PCT = 6
const FACT_ROW_BASE_HEIGHT_CQW = 31.02
const SUGAR_BOX_ICON_WRAP_BASE_HEIGHT_CQW = 11.08
// Fact table + sugar box are sized directly off the Figma frame (393px wide iPhone
// mockup, 16px side margins either side of the 361px-wide nutrition container), so
// every px value below is that Figma px divided by 361 and multiplied by 100.
const FIGMA_PX_TO_CQW = 100 / 361
// The app's system-font stack renders Hebrew/Arabic noticeably wider than Figma's
// source font, so the fact table's 5 nowrap rows need a scale-down from the raw
// Figma px to actually fit the 55.1%-wide box without overlapping the divider.
// Scale is picked to fit the longest row across all 3 supported languages
// (Arabic's "إجمالي الكربوهيدرات" / "ملاعق صغيرة" run widest).
const FACT_TABLE_FONT_SCALE = 0.7
const FACT_TABLE_VALUE_BASE_CQW = 21.705 * FIGMA_PX_TO_CQW * FACT_TABLE_FONT_SCALE
const SUGAR_BOX_LABEL_FONT_SCALE = 0.8
const SUGAR_BOX_LABEL_BASE_CQW = 21.705 * FIGMA_PX_TO_CQW * SUGAR_BOX_LABEL_FONT_SCALE
const SUGAR_BOX_VALUE_BASE_CQW = STAT_CARD_VALUE_BASE_CQW
// transFat/cholesterol are sub-items of totalFat in the Figma reference (indented
// under "סך השומנים"), so their labels get an extra inline-start margin.
const FACT_TABLE_INDENTED_ROW_IDS = new Set(['transFat', 'cholesterol'])

// Kosher body: 3 certification rows (text + icon/badge), sized off the same
// Figma frame/conversion as the nutrition body above. The raw Figma sizes
// overflowed the sheet on first open (before any manual scrolling), so
// everything here is scaled down from that 1:1 conversion, same idea as
// nutrition's FACT_TABLE_FONT_SCALE.
const KOSHER_SCALE = 0.94
const KOSHER_TEXT_BASE_CQW = 21 * FIGMA_PX_TO_CQW * KOSHER_SCALE
const KOSHER_BADGE_TEXT_BASE_CQW = 35.282 * FIGMA_PX_TO_CQW * KOSHER_SCALE

// Manufacturer body: one icon + a two-pair (label/detail) text block — much
// simpler than kosher's 3 rows, so it starts at the raw Figma-to-cqw
// conversion with only a small scale-up for a bit more presence (the sheet's
// own height budget already accounts for this — see .category-sheet--manufacturer).
const MANUFACTURER_SCALE = 1.25
const MANUFACTURER_TEXT_BASE_CQW = 21 * FIGMA_PX_TO_CQW * MANUFACTURER_SCALE

// Storage body: a heading (rendered via the generic bodyHeading prop, same as
// allergens) plus 3 short icon+label rows — the simplest body yet, so no
// scale adjustment to start with.
const STORAGE_SCALE = 1.6
const STORAGE_TEXT_BASE_CQW = 21 * FIGMA_PX_TO_CQW * STORAGE_SCALE

// Recycling body: one centered icon plus one short sentence below it — sized
// off the same Figma-frame conversion as storage, scaled up since there's
// only this one short block of content to fill the sheet with.
const RECYCLING_SCALE = 1.2
const RECYCLING_TEXT_BASE_CQW = 24 * FIGMA_PX_TO_CQW * RECYCLING_SCALE

function NutritionBody({ data, fontStep, iconScale, dir }) {
  const fontPx = (baseCqw) => `calc(${baseCqw}cqw + ${fontStep * FONT_STEP_SIZE}px)`
  const statCardWidthPct = Math.max(10, STAT_CARD_BASE_PCT + fontStep * STAT_CARD_GROWTH_PCT)
  const factTableWidthPct = Math.max(20, FACT_TABLE_BASE_PCT + fontStep * FACT_ROW_GROWTH_PCT)
  const sugarBoxWidthPct = Math.max(20, SUGAR_BOX_BASE_PCT + fontStep * FACT_ROW_GROWTH_PCT)
  const factRowHeight = `${FACT_ROW_BASE_HEIGHT_CQW * iconScale}cqw`
  // At fontStep 0 the two widths + gap add up to exactly 100%, so they still
  // fit side-by-side (table first, matching the original/default layout);
  // any step above that overflows and .category-sheet__fact-row's flex-wrap
  // drops the table to its own row below — flip the visual order there so
  // the sugar box leads instead of the table sitting on top alone.
  const factRowStacked = fontStep > 0
  const sugarBoxIconWrapHeight = `${SUGAR_BOX_ICON_WRAP_BASE_HEIGHT_CQW * iconScale}cqw`

  // The bracket only needs to span whichever indented rows are consecutive in
  // data.table (transFat/cholesterol) — computed as a fraction of the table's
  // row count rather than a guessed percentage, so it stays exact regardless
  // of how many rows the table has or what font scale they're rendered at
  // (all rows share the same line-height, so each is an equal-height slice).
  // The two rows' line-boxes include leading below the glyphs, so a full
  // 2-row-tall bracket overshoots past the actual text — trimmed a quarter
  // row-height short of the full box to land right at the text instead.
  const firstIndentedIndex = data.table.findIndex((row) => FACT_TABLE_INDENTED_ROW_IDS.has(row.id))
  const indentedRowCount = data.table.filter((row) => FACT_TABLE_INDENTED_ROW_IDS.has(row.id)).length
  const bracketTopPct = (100 * firstIndentedIndex) / data.table.length
  const bracketHeightPct = (100 * (indentedRowCount - 0.25)) / data.table.length

  // The stem is horizontally centered under the parent row's ("totalFat") first
  // word in every language — measured live since word width depends entirely on
  // the font/language and isn't a fixed em value. The indented rows' own margin
  // is pushed out by that same measurement (plus the original 0.8em reach) so
  // the tick/foot always have room to connect the stem to the text without
  // ever overlapping it, no matter how wide that first word is.
  const parentRow = data.table[firstIndentedIndex - 1]
  const [parentFirstWord, ...parentRestWords] = parentRow.label.split(' ')
  const parentRest = parentRestWords.join(' ')
  const firstWordRef = useRef(null)
  const [firstWordWidthPx, setFirstWordWidthPx] = useState(0)

  useLayoutEffect(() => {
    const el = firstWordRef.current
    if (!el) return
    const measure = () => setFirstWordWidthPx(el.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [parentFirstWord, fontStep])

  const stemCenterPx = firstWordWidthPx / 2
  const indentMarginStyle = `calc(${stemCenterPx}px + 0.8em)`

  // flexbox (not inline-text bidi) so value-then-unit order is fixed by DOM
  // order + the `direction` below, regardless of what characters the unit
  // contains — relying on inline bidi reordering here proved inconsistent
  // across browsers/scripts (gershayim vs plain apostrophe, he vs ar, etc).
  // Splitting on the first space also lets the unit render smaller than the
  // value, matching the Figma reference, in every language.
  const renderAmount = (amount) => {
    const spaceIdx = amount.indexOf(' ')
    const value = spaceIdx === -1 ? amount : amount.slice(0, spaceIdx)
    const unit = spaceIdx === -1 ? null : amount.slice(spaceIdx + 1)
    return (
      <span style={{ display: 'inline-flex', direction: dir, alignItems: 'baseline', gap: '0.2em' }}>
        <span>{value}</span>
        {unit && <span style={{ fontSize: '0.7em' }}>{unit}</span>}
      </span>
    )
  }

  return (
    <div className="category-sheet__nutrition">
      <div className="category-sheet__stat-row" dir="ltr">
        {data.cards.map((card) =>
          card.flattenedImage ? (
            <div
              key={card.id}
              className="category-sheet__stat-card category-sheet__stat-card--flattened"
              style={{ width: `${statCardWidthPct}%` }}
            >
              <img src={card.flattenedImage} alt="" className="category-sheet__stat-card-bg-img" />
              <span className="category-sheet__stat-card-label" style={{ fontSize: fontPx(STAT_CARD_LABEL_BASE_CQW) }}>
                {card.label}
              </span>
              {/* The icon is baked into the background image above (already positioned in
                  this middle zone), so this spacer just reserves the same flexible middle
                  space the other two cards' real <img> icons occupy — nothing to render. */}
              <span className="category-sheet__stat-card-icon-wrap" aria-hidden="true" />
              <span className="category-sheet__stat-card-divider" />
              <span className="category-sheet__stat-card-value" style={{ fontSize: fontPx(STAT_CARD_VALUE_BASE_CQW) }}>
                {renderAmount(card.amount)}
              </span>
            </div>
          ) : (
            <div
              key={card.id}
              className="category-sheet__stat-card"
              style={{ backgroundColor: card.bg, width: `${statCardWidthPct}%` }}
            >
              <span className="category-sheet__stat-card-label" style={{ fontSize: fontPx(STAT_CARD_LABEL_BASE_CQW) }}>
                {card.label}
              </span>
              <span className="category-sheet__stat-card-icon-wrap">
                <img
                  src={card.icon}
                  alt=""
                  className="category-sheet__stat-card-icon"
                  style={{
                    width: `${card.iconWidth * ((STAT_CARD_ICON_BUDGET_CQW / Math.max(card.iconWidth, card.iconHeight)) * iconScale)}cqw`,
                    height: `${card.iconHeight * ((STAT_CARD_ICON_BUDGET_CQW / Math.max(card.iconWidth, card.iconHeight)) * iconScale)}cqw`,
                  }}
                />
              </span>
              <span className="category-sheet__stat-card-divider" />
              <span className="category-sheet__stat-card-value" style={{ fontSize: fontPx(STAT_CARD_VALUE_BASE_CQW) }}>
                {renderAmount(card.amount)}
              </span>
            </div>
          ),
        )}
      </div>

      <div className="category-sheet__fact-row" dir="ltr">
        <div
          className="category-sheet__sugar-box"
          dir={dir}
          style={{ flexBasis: `${sugarBoxWidthPct}%`, height: factRowHeight, order: factRowStacked ? 1 : 2 }}
        >
          {[data.sugarBox.sugar, data.sugarBox.teaspoons].map((item, index) => (
            <div key={index} className="category-sheet__sugar-box-col">
              <span className="category-sheet__sugar-box-label" style={{ fontSize: fontPx(SUGAR_BOX_LABEL_BASE_CQW) }}>
                {item.label}
              </span>
              <span className="category-sheet__sugar-box-icon-wrap" style={{ height: sugarBoxIconWrapHeight }}>
                <img
                  src={item.icon}
                  alt=""
                  className="category-sheet__sugar-box-icon"
                  style={{
                    width: `${item.iconWidth * FIGMA_PX_TO_CQW * iconScale}cqw`,
                    height: `${item.iconHeight * FIGMA_PX_TO_CQW * iconScale}cqw`,
                  }}
                />
              </span>
              <span className="category-sheet__sugar-box-divider" />
              <span
                className="category-sheet__sugar-box-value"
                style={{ fontSize: fontPx(SUGAR_BOX_VALUE_BASE_CQW) }}
              >
                {renderAmount(item.amount)}
              </span>
            </div>
          ))}
        </div>

        <div
          className="category-sheet__fact-table"
          dir={dir}
          style={{ flexBasis: `${factTableWidthPct}%`, height: factRowHeight, order: factRowStacked ? 2 : 1 }}
        >
          <div className="category-sheet__fact-table-labels">
            <div className="category-sheet__fact-table-labels-inner">
              <span
                className="category-sheet__fact-table-sub-bracket"
                aria-hidden="true"
                style={{
                  top: `${bracketTopPct}%`,
                  height: `${bracketHeightPct}%`,
                  // Same font-size as the rows, so the CSS width (0.8em) matches the
                  // rows' marginInlineStart exactly and the tick/foot reach the text.
                  fontSize: fontPx(FACT_TABLE_VALUE_BASE_CQW),
                }}
              >
                {/* Plain CSS lines (not an SVG) so the stem/tick/foot render at the
                    exact same fixed thickness — an SVG stretched non-uniformly to fit
                    (via preserveAspectRatio="none") renders anisotropic strokes, making
                    the horizontal ticks look bolder than the vertical stem. */}
                <span
                  className="category-sheet__fact-table-sub-bracket-stem"
                  style={{ insetInlineStart: `${stemCenterPx - 0.625}px` }}
                />
                {/* Tick/foot always reach from the stem's position (wherever the first
                    word's width puts it) over to the indented text — a fixed 0.8em
                    beyond the stem, matching how far out that text's own margin starts. */}
                <span
                  className="category-sheet__fact-table-sub-bracket-tick"
                  style={{ insetInlineStart: `${stemCenterPx}px`, width: '0.8em' }}
                />
                <span
                  className="category-sheet__fact-table-sub-bracket-foot"
                  style={{ insetInlineStart: `${stemCenterPx}px`, width: '0.8em' }}
                />
              </span>
              {data.table.map((row, index) => (
                <span
                  key={row.id}
                  style={{
                    fontSize: fontPx(FACT_TABLE_VALUE_BASE_CQW),
                    marginInlineStart: FACT_TABLE_INDENTED_ROW_IDS.has(row.id) ? indentMarginStyle : 0,
                  }}
                >
                  {index === firstIndentedIndex - 1 ? (
                    <>
                      <span ref={firstWordRef}>{parentFirstWord}</span>
                      {parentRest ? ` ${parentRest}` : ''}
                    </>
                  ) : (
                    row.label
                  )}
                </span>
              ))}
            </div>
          </div>
          <span className="category-sheet__fact-table-divider" />
          <div className="category-sheet__fact-table-values">
            <div className="category-sheet__fact-table-values-inner">
              {data.table.map((row) => (
                <span key={row.id} style={{ fontSize: fontPx(FACT_TABLE_VALUE_BASE_CQW) }}>
                  {renderAmount(row.amount)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KosherBody({ data, fontStep, iconScale }) {
  // KOSHER_TEXT_BASE_CQW/KOSHER_BADGE_TEXT_BASE_CQW are scaled down (via
  // KOSHER_SCALE) to fit the body without overflow at fontStep 0 — but the
  // font stepper's -3px-per-step is a fixed amount, so at MIN_FONT_STEP that
  // fixed subtraction shrinks a small base disproportionately (unlike the
  // icons, which scale by a multiplier and shrink smoothly by comparison).
  // Floor it so the smallest step stays legible instead of nearly invisible.
  const fontPx = (baseCqw) => `max(10px, calc(${baseCqw}cqw + ${fontStep * FONT_STEP_SIZE}px))`
  const textStyle = { fontSize: fontPx(KOSHER_TEXT_BASE_CQW) }
  // See .claude/skills/rtl-icon-text-order — icon always reads first (DOM
  // order: icon, then text), in every language. Natural dir-mirroring then
  // puts it on the correct side per direction: left in ltr (English), right
  // in rtl (Hebrew/Arabic) — no per-direction branching needed here.

  const supervisionText = data.supervision && (
    <div className="category-sheet__kosher-row-text" style={textStyle}>
      <p>{data.supervision.line1}</p>
      <p>{data.supervision.line2}</p>
      {data.supervision.line3 && <p>{data.supervision.line3}</p>}
    </div>
  )
  // One-off text+swatch layout (not a repeatable icon), so it's rendered
  // directly here rather than driven from data.rows like the other two.
  // Optional: a future non-dairy/non-kosher product can omit `badge` entirely.
  const badge = data.badge && (
    <div className="category-sheet__kosher-badge">
      <span className="category-sheet__kosher-badge-label" style={{ fontSize: fontPx(KOSHER_BADGE_TEXT_BASE_CQW) }}>
        {data.badge.top}
      </span>
      <span
        className="category-sheet__kosher-badge-swatch"
        style={{ fontSize: fontPx(KOSHER_BADGE_TEXT_BASE_CQW), background: data.badgeSwatchColor }}
      >
        {data.badge.bottom}
      </span>
    </div>
  )

  return (
    <div className="category-sheet__kosher">
      {(badge || supervisionText) && (
        <div className="category-sheet__kosher-row">
          {badge}
          {supervisionText}
        </div>
      )}

      {data.rows.map((row) => {
        const text = (
          <div className="category-sheet__kosher-row-text" style={textStyle} dir={row.forceLtrText ? 'ltr' : undefined}>
            {row.line2Bold ? (
              // "Orthodox Union" reads as the certifying body's name (bold),
              // "- Dairy" is just the sub-designation (lighter) — Figma splits
              // them across 2 lines with "Orthodox" alone on the first.
              <>
                <p style={{ fontWeight: 700 }}>{row.line1}</p>
                <p>
                  <span style={{ fontWeight: 700 }}>{row.line2Bold}</span> <span style={{ fontWeight: 400 }}>{row.line2Light}</span>
                </p>
              </>
            ) : (
              <>
                <p>{row.line1}</p>
                {row.line2 && <p>{row.line2}</p>}
                {row.line3 && <p>{row.line3}</p>}
              </>
            )}
          </div>
        )
        const icon = (
          <img
            src={row.icon}
            alt=""
            className={`category-sheet__kosher-icon${row.invertOnHighContrast ? ' category-sheet__kosher-icon--invertible' : ''}`}
            style={{
              width: `${row.iconWidth * FIGMA_PX_TO_CQW * KOSHER_SCALE * iconScale}cqw`,
              height: `${row.iconHeight * FIGMA_PX_TO_CQW * KOSHER_SCALE * iconScale}cqw`,
            }}
          />
        )
        return (
          <div key={row.id} className="category-sheet__kosher-row">
            {icon}
            {text}
          </div>
        )
      })}
    </div>
  )
}

function ManufacturerBody({ data, fontStep, iconScale }) {
  const fontPx = (baseCqw) => `max(10px, calc(${baseCqw}cqw + ${fontStep * FONT_STEP_SIZE}px))`
  const textStyle = { fontSize: fontPx(MANUFACTURER_TEXT_BASE_CQW) }

  // Both label lines need bold (not just the block's first line), so this
  // is explicit per-paragraph styling rather than the kosher rows' generic
  // `p:first-child` CSS rule — same reasoning as the ouDairy special case.
  const pair = (labelDetail) => (
    <div className="category-sheet__manufacturer-pair">
      <p style={{ fontWeight: 700 }}>{labelDetail.label}</p>
      {labelDetail.detail.map((line) => (
        <p key={line} style={{ fontWeight: 400 }}>
          {line}
        </p>
      ))}
    </div>
  )

  return (
    <div className="category-sheet__manufacturer">
      <div className="category-sheet__manufacturer-row">
        {/* See .claude/skills/rtl-icon-text-order — icon always reads first
            (DOM order: icon, then text), in every language. */}
        <img
          src={data.icon.icon}
          alt=""
          className={`category-sheet__manufacturer-icon${data.icon.invertOnHighContrast ? ' category-sheet__manufacturer-icon--invertible' : ''}`}
          style={{
            width: `${data.icon.iconWidth * FIGMA_PX_TO_CQW * MANUFACTURER_SCALE * iconScale}cqw`,
            height: `${data.icon.iconHeight * FIGMA_PX_TO_CQW * MANUFACTURER_SCALE * iconScale}cqw`,
          }}
        />
        <div className="category-sheet__manufacturer-text" style={textStyle}>
          {pair(data.producedBy)}
          {pair(data.contact)}
        </div>
      </div>
    </div>
  )
}

function StorageBody({ data, fontStep, iconScale }) {
  const fontPx = (baseCqw) => `max(10px, calc(${baseCqw}cqw + ${fontStep * FONT_STEP_SIZE}px))`

  return (
    <div className="category-sheet__storage">
      {data.rows.map((row) => (
        <div key={row.id} className="category-sheet__storage-row">
          {/* See .claude/skills/rtl-icon-text-order — icon always reads first
              (DOM order: icon, then label), in every language. */}
          <img
            src={row.icon}
            alt=""
            className={`category-sheet__storage-icon${row.invertOnHighContrast ? ' category-sheet__storage-icon--invertible' : ''}`}
            style={{
              width: `${row.iconWidth * FIGMA_PX_TO_CQW * iconScale}cqw`,
              height: `${row.iconHeight * FIGMA_PX_TO_CQW * iconScale}cqw`,
            }}
          />
          <span className="category-sheet__storage-label" style={{ fontSize: fontPx(STORAGE_TEXT_BASE_CQW) }}>
            {row.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function RecyclingBody({ data, fontStep, iconScale }) {
  const fontPx = (baseCqw) => `max(10px, calc(${baseCqw}cqw + ${fontStep * FONT_STEP_SIZE}px))`

  return (
    <div className="category-sheet__recycling">
      <img
        src={data.icon}
        alt=""
        className={`category-sheet__recycling-icon${data.invertOnHighContrast ? ' category-sheet__recycling-icon--invertible' : ''}`}
        style={{
          width: `${data.iconWidth * FIGMA_PX_TO_CQW * RECYCLING_SCALE * iconScale}cqw`,
          height: `${data.iconHeight * FIGMA_PX_TO_CQW * RECYCLING_SCALE * iconScale}cqw`,
        }}
      />
      <p className="category-sheet__recycling-text" style={{ fontSize: fontPx(RECYCLING_TEXT_BASE_CQW) }}>
        {data.segments.map((segment, index) => (
          <span
            key={index}
            style={{
              fontWeight: segment.bold ? 700 : 400,
              color: segment.highlight ? '#EF531E' : undefined,
            }}
          >
            {segment.text}
          </span>
        ))}
      </p>
    </div>
  )
}

function pickBestVoice(voices, langPrefix) {
  const matches = voices.filter((v) => v.lang?.toLowerCase().startsWith(langPrefix))
  if (matches.length === 0) return null
  // Network-backed voices (localService: false) are typically higher quality
  // than the device's built-in offline voice.
  return matches.find((v) => !v.localService) || matches[0]
}

export default function CategorySheet({
  open,
  onClose,
  title,
  subtitle,
  bodyHeading,
  bodyHeadingColor,
  bodyText,
  bodyIcons,
  bodyNutrition,
  bodyKosher,
  bodyManufacturer,
  bodyStorage,
  bodyRecycling,
}) {
  const { t, dir } = useLanguage()
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [fontStep, setFontStep] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const startY = useRef(0)
  const volumeIconFilter = highContrast !== speaking ? 'invert(1)' : 'none'
  const iconScale = (BASE_FONT_SIZE + fontStep * FONT_STEP_SIZE) / BASE_FONT_SIZE

  useEffect(() => {
    if (!open) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [open])

  useEffect(() => () => window.speechSynthesis.cancel(), [])

  // Warm up the voice list ahead of time. speechSynthesis.getVoices() is empty
  // on first use until the browser loads it asynchronously (voiceschanged), and
  // speak() must be called synchronously inside the click handler to count as
  // user-triggered — awaiting the voice list inside the click handler pushes
  // speak() past that window, so the first click silently does nothing.
  useEffect(() => {
    window.speechSynthesis.getVoices()
    const warmUp = () => window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener('voiceschanged', warmUp)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', warmUp)
  }, [])

  const handleToggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const voice = pickBestVoice(window.speechSynthesis.getVoices(), t.speechLang.split('-')[0])

    const factToSpeech = (fact) => `${fact.label} ${fact.amount}`
    // The stat-row and fact-row are hardcoded dir="ltr" (matching the Figma layout
    // order regardless of language), so their DOM order is always physically left-to-
    // right. Narration should still follow natural reading order, so for RTL languages
    // that means starting from the visually-rightmost (last) item.
    const inReadingOrder = (list) => (dir === 'rtl' ? [...list].reverse() : list)
    const spokenBody = bodyNutrition
      ? [
          ...inReadingOrder(bodyNutrition.cards).map(factToSpeech),
          ...inReadingOrder(bodyNutrition.table).map(factToSpeech),
          factToSpeech(bodyNutrition.sugarBox.sugar),
          factToSpeech(bodyNutrition.sugarBox.teaspoons),
        ].join(', ')
      : bodyKosher
      ? [
          bodyKosher.badge && `${bodyKosher.badge.top} ${bodyKosher.badge.bottom}`,
          bodyKosher.supervision &&
            [bodyKosher.supervision.line1, bodyKosher.supervision.line2, bodyKosher.supervision.line3]
              .filter(Boolean)
              .join(' '),
          // ouDairy uses line2Bold/line2Light instead of line2/line3 (see KosherBody's
          // rendering split below) — read those too, or its "Union - Dairy" half gets
          // silently dropped from speech.
          ...bodyKosher.rows.map((row) =>
            row.line2Bold
              ? [row.line1, row.line2Bold, row.line2Light].filter(Boolean).join(' ')
              : [row.line1, row.line2, row.line3].filter(Boolean).join(' '),
          ),
        ]
          .filter(Boolean)
          .join(', ')
      : bodyManufacturer
      ? [
          `${bodyManufacturer.producedBy.label} ${bodyManufacturer.producedBy.detail.join(' ')}`,
          `${bodyManufacturer.contact.label} ${bodyManufacturer.contact.detail.join(' ')}`,
        ].join(', ')
      : bodyStorage
      ? bodyStorage.rows.map((row) => row.label).join(', ')
      : bodyRecycling
      ? bodyRecycling.segments.map((segment) => segment.text).join('')
      : bodyIcons
      ? bodyIcons.flatMap((group) => [group.heading, ...group.items.map((item) => item.label)]).join(', ')
      : bodyText
    const speechLead = bodyHeading || subtitle
    const utterance = new SpeechSynthesisUtterance(speechLead ? `${speechLead} ${spokenBody}` : spokenBody)
    utterance.lang = t.speechLang
    utterance.rate = 0.92
    if (voice) utterance.voice = voice
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const handlePointerDown = (event) => {
    startY.current = event.clientY
    setDragging(true)
    event.target.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragging) return
    const delta = Math.max(0, event.clientY - startY.current)
    setDragY(delta)
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    if (dragY > CLOSE_THRESHOLD) {
      onClose()
    }
    setDragY(0)
  }

  return (
    <>
      <div
        className={`category-sheet__backdrop${open ? ' category-sheet__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`category-sheet${bodyNutrition ? ' category-sheet--nutrition' : ''}${bodyKosher ? ' category-sheet--kosher' : ''}${bodyManufacturer ? ' category-sheet--manufacturer' : ''}${bodyStorage ? ' category-sheet--storage' : ''}${bodyRecycling ? ' category-sheet--recycling' : ''}${open ? ' category-sheet--open' : ''}${highContrast ? ' category-sheet--high-contrast' : ''}`}
        style={dragging ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="category-sheet__handle-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="category-sheet__handle" />
          {/* Zero-width space after "/" lets long slash-separated titles (e.g.
              manufacturer's "Manufacturer/Importer/Distributor details") wrap
              at a slash instead of overflowing the sheet — same treatment
              CategoryChip/CategoryListRow already use for their labels. */}
          <h2 className="category-sheet__title">{title.replaceAll('/', '/​')}</h2>
          {subtitle && <p className="category-sheet__subtitle">{subtitle}</p>}
        </div>

        <div className="category-sheet__controls">
          <button
            type="button"
            className="category-sheet__control"
            onClick={() => setHighContrast((v) => !v)}
            aria-pressed={highContrast}
          >
            <span className="category-sheet__control-icon">
              <span className="contrast-icon" aria-hidden="true">
                <img src={contrastInner} alt="" className="contrast-icon__ring" />
                <span className="contrast-icon__fill" />
              </span>
            </span>
            <span className="category-sheet__control-label">{t.contrast}</span>
          </button>

          <div className="category-sheet__font-toggle" dir="ltr">
            <button
              type="button"
              className="category-sheet__font-btn"
              onClick={() => setFontStep((s) => Math.max(MIN_FONT_STEP, s - 1))}
              disabled={fontStep <= MIN_FONT_STEP}
              aria-label={t.shrinkText}
              dir={dir}
            >
              {t.fontGlyph}-
            </button>
            <span className="category-sheet__font-toggle-divider" />
            <button
              type="button"
              className="category-sheet__font-btn"
              onClick={() => setFontStep((s) => Math.min(MAX_FONT_STEP, s + 1))}
              disabled={fontStep >= MAX_FONT_STEP}
              aria-label={t.growText}
              dir={dir}
            >
              {t.fontGlyph}+
            </button>
          </div>

          <button
            type="button"
            className={`category-sheet__control${speaking ? ' category-sheet__control--active' : ''}`}
            onClick={handleToggleSpeech}
            aria-pressed={speaking}
          >
            <span className="category-sheet__control-icon">
              <span className="volume-icon" aria-hidden="true" style={{ filter: volumeIconFilter }}>
                <img src={volumeSpeaker} alt="" className="volume-icon__speaker" />
                <img src={volumeWave1} alt="" className="volume-icon__wave1" />
                <img src={volumeWave2} alt="" className="volume-icon__wave2" />
              </span>
            </span>
            <span className="category-sheet__control-label">{speaking ? t.listening : t.listen}</span>
          </button>
        </div>

        <div className="category-sheet__body">
          {bodyHeading && (
            <p
              className="category-sheet__body-heading"
              style={{
                fontSize: `${BASE_FONT_SIZE + 4 + fontStep * FONT_STEP_SIZE}px`,
                color: highContrast ? '#FFFFFF' : bodyHeadingColor,
              }}
            >
              {bodyHeading}
            </p>
          )}
          {bodyNutrition ? (
            <NutritionBody data={bodyNutrition} fontStep={fontStep} iconScale={iconScale} dir={dir} />
          ) : bodyKosher ? (
            <KosherBody data={bodyKosher} fontStep={fontStep} iconScale={iconScale} />
          ) : bodyManufacturer ? (
            <ManufacturerBody data={bodyManufacturer} fontStep={fontStep} iconScale={iconScale} />
          ) : bodyStorage ? (
            <StorageBody data={bodyStorage} fontStep={fontStep} iconScale={iconScale} />
          ) : bodyRecycling ? (
            <RecyclingBody data={bodyRecycling} fontStep={fontStep} iconScale={iconScale} />
          ) : bodyIcons ? (
            <div className="category-sheet__icon-groups">
              {bodyIcons.map((group) => (
                <div key={group.statementKey} className="category-sheet__icon-group">
                  <p
                    className="category-sheet__body-heading"
                    style={{
                      fontSize: `${BASE_FONT_SIZE + 4 + fontStep * FONT_STEP_SIZE}px`,
                      color: highContrast ? '#FFFFFF' : bodyHeadingColor,
                    }}
                  >
                    {group.heading}
                  </p>
                  <div className="category-sheet__icon-grid">
                    {[group.items.slice(0, ICONS_PER_ROW), group.items.slice(ICONS_PER_ROW)]
                      .filter((row) => row.length > 0)
                      .map((row, rowIndex) => (
                        <div key={rowIndex} className="category-sheet__icon-row">
                          {row.map((item) => {
                            const iconBudgetCqw = (ICON_BUDGET_CQW / Math.max(item.width, item.height)) * iconScale
                            return (
                              <div key={item.id} className="category-sheet__icon-item">
                                <img
                                  src={item.icon}
                                  alt=""
                                  className="category-sheet__icon-item-img"
                                  style={{
                                    width: `${item.width * iconBudgetCqw}cqw`,
                                    height: `${item.height * iconBudgetCqw}cqw`,
                                  }}
                                />
                                <span
                                  className="category-sheet__icon-item-label"
                                  style={{ fontSize: `calc(${LABEL_BASE_CQW}cqw + ${fontStep * FONT_STEP_SIZE}px)` }}
                                >
                                  {item.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: `${BODY_TEXT_BASE_FONT_SIZE + fontStep * FONT_STEP_SIZE}px` }}>{bodyText}</p>
          )}
        </div>
      </div>
    </>
  )
}
