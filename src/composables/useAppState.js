import { useViewState } from './useViewState'
import { useTranslationState } from './useTranslationState'
import { useI18nState } from './useI18nState'

export const useAppState = () => {
  const view = useViewState()
  const translation = useTranslationState()
  const { i18n } = useI18nState()

  return {
    ...view,
    ...translation,
    i18n
  }
} 