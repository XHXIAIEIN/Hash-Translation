import { ref } from 'vue'
import { useI18n } from '../utils/i18n'

export const useI18nState = () => {
  const i18n = useI18n()
  
  // 加载翻译
  i18n.loadTranslations()

  return {
    i18n
  }
} 