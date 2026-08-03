import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import ar from "./locales/ar"
import fr from "./locales/fr"
import en from "./locales/en"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ar, fr, en },
    fallbackLng: "ar",
    lng: "ar",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ecomland-lang",
    },
  })

// Apply RTL direction when Arabic is active
const applyDir = (lang: string) => {
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr")
  document.documentElement.setAttribute("lang", lang)
}

applyDir(i18n.language)
i18n.on("languageChanged", applyDir)

export default i18n
