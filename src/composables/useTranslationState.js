import { ref } from 'vue'
import { downloadFile, saveToFolder } from '../utils/helpers'
import { showStatus, NotificationTypes } from '../utils/notification'

export const useTranslationState = () => {
  const languages = ref([])
  const translations = ref({})
  const currentPreviewLang = ref('')
  const statusMessage = ref('')
  const statusIcon = ref('')

  const updateTranslations = (result) => {
    if (!result) return

    languages.value = result.languages
    translations.value = result.translations

    if (!currentPreviewLang.value && languages.value.length > 0) {
      currentPreviewLang.value = languages.value[0]
    }
  }

  const switchLanguage = (lang) => {
    currentPreviewLang.value = lang
  }

  const downloadLanguage = (lang) => {
    if (!translations.value[lang]) {
      showStatus({
        message: `没有 ${lang} 的翻译内容`,
        type: NotificationTypes.ERROR,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
      return
    }

    const content = JSON.stringify(translations.value[lang], null, 2)
    downloadFile(content, `${lang}.json`)
    
    showStatus({
      message: `已下载 ${lang} 文件`,
      type: NotificationTypes.SUCCESS,
      onUpdate: (msg, iconClass) => {
        statusMessage.value = msg
        statusIcon.value = iconClass
      }
    })
  }

  const downloadAll = async () => {
    if (Object.keys(translations.value).length === 0) {
      showStatus({
        message: '没有翻译内容可下载',
        type: NotificationTypes.ERROR,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
      return
    }

    const files = Object.entries(translations.value).map(([lang, content]) => ({
      filename: `${lang}.json`,
      content: JSON.stringify(content, null, 2)
    }))

    const result = await saveToFolder(files)
    
    if (result && result.success) {
      showStatus({
        message: `成功保存${result.count}个文件`,
        type: NotificationTypes.SUCCESS,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
    } else if (result === false) {
      showStatus({
        message: '保存失败或用户取消了操作',
        type: NotificationTypes.INFO,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
    }
  }

  return {
    languages,
    translations,
    currentPreviewLang,
    statusMessage,
    statusIcon,
    updateTranslations,
    switchLanguage,
    downloadLanguage,
    downloadAll
  }
} 