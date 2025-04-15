import { ref } from 'vue'

export const useViewState = () => {
  const isPreviewMode = ref(false)
  const isJsonView = ref(false)

  const switchMode = (isPreview) => {
    isPreviewMode.value = isPreview
  }

  const switchView = (isJson) => {
    isJsonView.value = isJson
  }

  return {
    isPreviewMode,
    isJsonView,
    switchMode,
    switchView
  }
} 