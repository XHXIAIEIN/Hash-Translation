import { ref } from 'vue'
import { processCSV } from './helpers'

const currentLang = ref('zh-CN')
const translations = ref({})

export const useI18n = () => {
  const loadTranslations = async () => {
    try {
      const response = await fetch('/src/locales/lang.csv')
      const csvText = await response.text()
      const result = processCSV(csvText)
      
      if (result.error) {
        console.error('Failed to load translations:', result.error)
        return
      }

      translations.value = result.translations
    } catch (error) {
      console.error('Failed to load translations:', error)
    }
  }

  const t = (key, params = {}) => {
    const lang = currentLang.value
    let value = translations.value[lang]?.[key] || key

    // 替换参数
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, paramValue)
    })

    return value
  }

  const setLanguage = (lang) => {
    currentLang.value = lang
  }

  const getLanguage = () => {
    return currentLang.value
  }

  return {
    t,
    setLanguage,
    getLanguage,
    loadTranslations
  }
} 