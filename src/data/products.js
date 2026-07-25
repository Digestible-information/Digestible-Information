import productsData from './products.json'

export const DEFAULT_PRODUCT_ID = 'twist'

export function resolveProduct(productId) {
  const matchedKey =
    productId && Object.keys(productsData).find((key) => key.toLowerCase() === productId.toLowerCase())
  const id = matchedKey ?? DEFAULT_PRODUCT_ID
  return { productId: id, product: productsData[id] }
}
