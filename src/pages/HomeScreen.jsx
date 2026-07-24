import { Fragment, useLayoutEffect, useRef, useState, useEffect } from 'react'
import logo from '../assets/header-logo.svg'
import CategoryChip from '../components/CategoryChip.jsx'
import CategoryListRow from '../components/CategoryListRow.jsx'
import CameraButton from '../components/CameraButton.jsx'
import CategorySheet from '../components/CategorySheet.jsx'
import ImageLightbox from '../components/ImageLightbox.jsx'
import { categories } from '../data/categories.js'
import { allergenIcons } from '../data/allergenIcons.js'
import {
  nutritionStatCards,
  nutritionTableRowIds,
  nutritionSugarBoxIcons,
  nutritionSugarStatCards,
} from '../data/nutritionFacts.js'
import { kosherRows, kosherBadgeSwatchColor } from '../data/kosherInfo.js'
import { manufacturerBodyIcon } from '../data/manufacturerInfo.js'
import { storageRows } from '../data/storageInfo.js'
import { recyclingBinIcons } from '../data/recyclingInfo.js'
import { warningsBodyIcon } from '../data/warningsInfo.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { ALLERGEN_STATEMENT_ORDER, ALLERGEN_STATEMENT_COLORS } from '../i18n/translations.js'
import { useProduct } from '../hooks/useProduct.js'
import './HomeScreen.css'

const LANGUAGES = [
  { code: 'ar', label: 'عربي', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'he', label: 'עברית', dir: 'rtl' },
]

const SHEET_CATEGORIES = new Set(['ingredients', 'allergens', 'nutrition', 'kosher', 'manufacturer', 'storage', 'recycling', 'warnings'])

// Fluid CSS (clamp()-based spacing) handles most short screens on its own. This is the
// last-resort fallback for the extreme cases where even that isn't enough (e.g. an
// iPhone SE with Safari's toolbars visible) — it uniformly shrinks the page so it always
// fits with zero scrolling, instead of letting it overflow.
function useFitToViewport(contentRef, middleRef, syncDeps = []) {
  const [scale, setScale] = useState(1)
  const recalcRef = useRef(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return undefined

    const recalc = () => {
      const viewport = window.visualViewport
      // Pinch-zooming also fires visualViewport's resize event (the visible area
      // shrinks as the user zooms in). Recalculating against that would fight the
      // zoom gesture — shrinking our own transform right as the user grows theirs.
      // Skip while actively zoomed; resume once they're back to 1:1.
      if (viewport && Math.abs(viewport.scale - 1) > 0.01) return
      // .home-screen-middle's own clientHeight already accounts for the header/footer's
      // actual rendered height (they're its flex siblings within the stage), so this is
      // the space actually available to .home-screen — not the full viewport height.
      const availableHeight = middleRef.current?.clientHeight
      // Measure against the true unscaled size — a transform shouldn't affect layout
      // height, but resetting it first guards against that assumption being wrong for
      // the container-query (cqw) sizing used inside CategoryChip/CategoryListRow.
      const previousTransform = content.style.transform
      content.style.transform = 'none'
      const contentHeight = content.scrollHeight
      content.style.transform = previousTransform
      if (!contentHeight) return
      const next = Math.min(1, availableHeight / contentHeight)
      setScale((prev) => (Math.abs(prev - next) > 0.005 ? next : prev))
    }
    recalcRef.current = recalc

    recalc()

    const resizeObserver = new ResizeObserver(recalc)
    resizeObserver.observe(content)
    if (middleRef.current) resizeObserver.observe(middleRef.current)

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', recalc)
    window.addEventListener('resize', recalc)
    window.addEventListener('orientationchange', recalc)

    return () => {
      resizeObserver.disconnect()
      viewport?.removeEventListener('resize', recalc)
      window.removeEventListener('resize', recalc)
      window.removeEventListener('orientationchange', recalc)
    }
  }, [contentRef, middleRef])

  // Content-driven height changes (e.g. switching language re-wraps text to a
  // different height) would otherwise only be picked up a frame later via the
  // ResizeObserver above, causing a visible double-jump. Recalculating here too,
  // synchronously in the same paint as the change, keeps it to one smooth motion.
  useLayoutEffect(() => {
    recalcRef.current?.()
  }, syncDeps)

  return scale
}

export default function HomeScreen() {
  const [openSheet, setOpenSheet] = useState(null)
  const [imageOpen, setImageOpen] = useState(false)
  const { language, setLanguage, t, dir } = useLanguage()
  const { product, content } = useProduct()
  const buttonRefs = useRef({})
  const [underline, setUnderline] = useState({ left: 0, width: 0 })
  const contentRef = useRef(null)
  const middleRef = useRef(null)
  const scale = useFitToViewport(contentRef, middleRef, [language])

  const includedCategories = categories.filter((category) => product.categoryIds.includes(category.id))
  const primaryCategories = includedCategories.filter((category) => category.group === 'primary')
  const secondaryCategories = includedCategories.filter((category) => category.group === 'secondary')

  const allergenGroups = ALLERGEN_STATEMENT_ORDER.map((statementKey) => ({
    statementKey,
    heading: t.allergenStatements[statementKey],
    headingColor: ALLERGEN_STATEMENT_COLORS[statementKey],
    items: (product.allergens ?? [])
      .filter((allergen) => allergen.statement === statementKey)
      .map((allergen) => ({
        ...allergenIcons.find((icon) => icon.id === allergen.id),
        label: content.allergenLabels[allergen.id],
      })),
  })).filter((group) => group.items.length > 0)

  useLayoutEffect(() => {
    const activeButton = buttonRefs.current[language]
    if (activeButton) {
      setUnderline({ left: activeButton.offsetLeft, width: activeButton.offsetWidth })
    }
  }, [language])

  return (
    <>
      <div className="home-screen-stage">
        <header className="home-screen__header">
          <img src={logo} alt={t.logoAlt} className="home-screen__logo" />
        </header>

        <div className="home-screen-middle" ref={middleRef}>
        <div className="home-screen" ref={contentRef} style={scale < 1 ? { transform: `scale(${scale})` } : undefined}>
          <div className="product-card" dir="ltr">
            <button
              type="button"
              className="product-card__photo-button"
              onClick={() => setImageOpen(true)}
              aria-label={content.brand}
            >
              <img src={`${import.meta.env.BASE_URL}${product.meta.photo}`} alt="" className="product-card__photo" />
            </button>
            <div className="product-card__text" dir={dir}>
              <p className="product-card__heading">
                <span className="product-card__brand">{content.brand}</span>
                <span className="product-card__weight">{content.weightValue}</span>
              </p>
              <p className="product-card__description">{content.productName}</p>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="category-grid" dir="ltr">
            {primaryCategories.map((category) => (
              <CategoryChip
                key={category.id}
                {...category}
                label={t.categories[category.id]}
                onClick={SHEET_CATEGORIES.has(category.id) ? () => setOpenSheet(category.id) : undefined}
              />
            ))}
          </div>

          <div className="more-info-divider">
            <span className="more-info-divider__line" aria-hidden="true" />
            <span className="more-info-divider__label">{t.moreInfo}</span>
            <span className="more-info-divider__line" aria-hidden="true" />
          </div>

          <div className="category-list">
            {secondaryCategories.map((category) => (
              <CategoryListRow
                key={category.id}
                {...category}
                label={t.categories[category.id]}
                onClick={SHEET_CATEGORIES.has(category.id) ? () => setOpenSheet(category.id) : undefined}
              />
            ))}
          </div>

          <CameraButton />
        </div>
        </div>

        <footer className="language-switcher" dir="ltr">
          <div className="language-switcher__row">
            {LANGUAGES.map(({ code, label, dir }, index) => (
              <Fragment key={code}>
                {index > 0 && <span aria-hidden="true">|</span>}
                <button
                  ref={(el) => {
                    buttonRefs.current[code] = el
                  }}
                  type="button"
                  lang={code}
                  dir={dir}
                  className={language === code ? 'language-switcher__active' : undefined}
                  onClick={() => setLanguage(code)}
                >
                  {label}
                </button>
              </Fragment>
            ))}
            <span className="language-switcher__underline" style={{ left: underline.left, width: underline.width }} />
          </div>
        </footer>
      </div>

      {product.categoryIds.includes('ingredients') && (
        <CategorySheet
          open={openSheet === 'ingredients'}
          onClose={() => setOpenSheet(null)}
          title={t.ingredientsTitle}
          bodyText={content.ingredientsText}
          bodyHeightPx={product.ingredientsHeight}
        />
      )}

      {product.categoryIds.includes('allergens') && (
        <CategorySheet
          open={openSheet === 'allergens'}
          onClose={() => setOpenSheet(null)}
          title={t.categories.allergens}
          bodyIcons={allergenGroups}
          bodyHeightPx={product.allergensHeight ?? 500}
        />
      )}

      {product.categoryIds.includes('nutrition') && (
        <CategorySheet
          open={openSheet === 'nutrition'}
          onClose={() => setOpenSheet(null)}
          title={t.nutritionTitle}
          subtitle={content.nutritionSubtitle}
          bodyHeightPx={product.nutritionHeight}
          bodyNutrition={{
            cards: nutritionStatCards.map((item) => ({
              ...item,
              ...content.nutritionFacts[item.id],
              bg: product.nutritionColors[item.id],
            })),
            table: (product.nutritionTableRowIds ?? nutritionTableRowIds).map((id) => ({
              id,
              ...content.nutritionFacts[id],
            })),
            ...(product.nutritionLayout === 'stacked'
              ? {
                  sugarCards: nutritionSugarStatCards.map((item) => ({
                    ...item,
                    ...content.nutritionFacts[item.id],
                    bg: product.nutritionColors.sugarBox,
                  })),
                }
              : {
                  sugarBox: {
                    bg: product.nutritionColors.sugarBox,
                    sugar: { ...nutritionSugarBoxIcons.sugar, ...content.nutritionFacts.sugar },
                    teaspoons: { ...nutritionSugarBoxIcons.teaspoons, ...content.nutritionFacts.teaspoons },
                  },
                }),
          }}
        />
      )}

      {product.categoryIds.includes('kosher') && (
        <CategorySheet
          open={openSheet === 'kosher'}
          onClose={() => setOpenSheet(null)}
          title={t.kosherTitle}
          bodyHeightPx={product.kosherHeight}
          bodyKosher={{
            badgeSwatchColor: kosherBadgeSwatchColor,
            badge: content.kosherInfo.dairyBadge,
            supervision: content.kosherInfo.dairySupervision,
            rows: kosherRows
              .filter((row) => product.kosherRowIds.includes(row.id))
              .map((row) => ({ ...row, ...content.kosherInfo[row.id] })),
          }}
        />
      )}

      {product.categoryIds.includes('manufacturer') && (
        <CategorySheet
          open={openSheet === 'manufacturer'}
          onClose={() => setOpenSheet(null)}
          title={t.manufacturerTitle}
          bodyManufacturer={{
            icon: manufacturerBodyIcon,
            producedBy: content.manufacturerInfo.producedBy,
            contact: content.manufacturerInfo.contact,
          }}
        />
      )}

      {product.categoryIds.includes('storage') && (
        <CategorySheet
          open={openSheet === 'storage'}
          onClose={() => setOpenSheet(null)}
          title={t.storageTitle}
          bodyHeading={content.storageInfo.heading}
          bodyStorage={{
            rows: storageRows
              .filter((row) => product.storageRowIds.includes(row.id))
              .map((row) => ({ ...row, label: content.storageInfo.labels[row.id] })),
          }}
        />
      )}

      {product.categoryIds.includes('recycling') && (
        <CategorySheet
          open={openSheet === 'recycling'}
          onClose={() => setOpenSheet(null)}
          title={t.recyclingTitle}
          bodyHeightPx={product.recyclingHeight}
          bodyRecycling={{
            rows: content.recyclingInfo.bins.map((bin) => ({
              ...recyclingBinIcons[bin.color],
              segments: bin.segments,
            })),
          }}
        />
      )}

      {product.categoryIds.includes('warnings') && (
        <CategorySheet
          open={openSheet === 'warnings'}
          onClose={() => setOpenSheet(null)}
          title={t.warningsTitle}
          bodyWarnings={{
            ...warningsBodyIcon,
            segments: content.warningsInfo.segments,
          }}
        />
      )}

      <ImageLightbox
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        src={`${import.meta.env.BASE_URL}${product.meta.photo}`}
        alt={content.brand}
      />
    </>
  )
}
