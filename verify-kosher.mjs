import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5184/Digestible-Information/Energybar'
const OUT_DIR = process.argv[2]

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--window-size=430,932'],
  defaultViewport: { width: 430, height: 932 },
})

const page = await browser.newPage()
const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))
page.on('requestfailed', (req) => consoleErrors.push('requestfailed: ' + req.url()))
page.on('response', (res) => {
  if (res.status() === 404) consoleErrors.push('404: ' + res.url())
})

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500)) // splash screen

const languages = [
  { code: 'he', label: 'עברית' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'عربي' },
]

for (const lang of languages) {
  if (lang.code !== 'he') {
    await page.evaluate((label) => {
      const all = Array.from(document.querySelectorAll('button, [role="button"], a, span'))
      const el = all.find((e) => e.textContent.trim() === label)
      if (el) el.click()
    }, lang.label)
    await new Promise((r) => setTimeout(r, 400))
  }

  const opened = await page.evaluate(() => {
    const el = document.querySelector('a.category-chip[href$="/category/kosher"]')
    if (el) {
      el.click()
      return true
    }
    return false
  })

  await new Promise((r) => setTimeout(r, 500))
  await page.screenshot({ path: `${OUT_DIR}/kosher-${lang.code}.png` })

  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const btn = document.querySelector('[aria-label]')
      const all = Array.from(document.querySelectorAll('button'))
      const growBtn = all.find((e) => e.getAttribute('aria-label') && /grow|הגדל|تكبير/i.test(e.getAttribute('aria-label')))
      if (growBtn) growBtn.click()
    })
    await new Promise((r) => setTimeout(r, 150))
  }
  await page.screenshot({ path: `${OUT_DIR}/kosher-${lang.code}-maxfont.png` })

  await page.evaluate(() => {
    const backdrop = document.querySelector('.category-sheet__backdrop')
    if (backdrop) backdrop.click()
  })
  await new Promise((r) => setTimeout(r, 500))

  console.log(lang.code, 'chip-opened:', opened)
}

console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors))
await browser.close()
