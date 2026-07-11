import { createContext, useContext, useEffect, useState } from 'react'
import { DIRECTIONS, translations } from './translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('appLanguage')
    return translations[stored] ? stored : 'he'
  })

  useEffect(() => {
    localStorage.setItem('appLanguage', language)
    document.documentElement.lang = language
    document.documentElement.dir = DIRECTIONS[language]
  }, [language])

  const value = {
    language,
    setLanguage,
    dir: DIRECTIONS[language],
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
