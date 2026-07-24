import { useParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { resolveProduct } from '../data/products.js'

export function useProduct() {
  const { productId: rawProductId } = useParams()
  const { language } = useLanguage()
  const { productId, product } = resolveProduct(rawProductId)
  return { productId, product, content: product.content[language] }
}
