import productsData from './products.json'

export const DEFAULT_PRODUCT_ID = 'twist'

export function resolveProduct(productId) {
  const id = productId && productsData[productId] ? productId : DEFAULT_PRODUCT_ID
  return { productId: id, product: productsData[id] }
}
