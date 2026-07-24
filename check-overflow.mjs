import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5184/Digestible-Information/Energybar'

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--window-size=430,932'],
  defaultViewport: { width: 430, height: 932 },
})
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500))

await page.evaluate((label) => {
  const all = Array.from(document.querySelectorAll('button, [role="button"], a, span'))
  const el = all.find((e) => e.textContent.trim() === label)
  if (el) el.click()
}, 'English')
await new Promise((r) => setTimeout(r, 400))

await page.evaluate(() => {
  const el = document.querySelector('a.category-chip[href$="/category/kosher"]')
  if (el) el.click()
})
await new Promise((r) => setTimeout(r, 500))

const info = await page.evaluate(() => {
  const sheet = document.querySelector('.category-sheet--kosher')
  const body = document.querySelector('.category-sheet__body') || sheet
  const rowTexts = Array.from(document.querySelectorAll('.category-sheet__kosher-row-text'))
  const badge = document.querySelector('.category-sheet__kosher-badge')
  const results = {
    sheetScrollWidth: sheet?.scrollWidth,
    sheetClientWidth: sheet?.clientWidth,
    bodyScrollWidth: body?.scrollWidth,
    bodyClientWidth: body?.clientWidth,
    rows: rowTexts.map((t) => ({
      text: t.textContent,
      rect: t.getBoundingClientRect().toJSON ? JSON.parse(JSON.stringify(t.getBoundingClientRect())) : null,
      scrollWidth: t.scrollWidth,
      clientWidth: t.clientWidth,
    })),
    badgeRect: badge ? JSON.parse(JSON.stringify(badge.getBoundingClientRect())) : null,
  }
  return results
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
