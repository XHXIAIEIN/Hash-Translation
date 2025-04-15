<template>
  <app-template
    v-model:csv-content="csvContent"
    :languages="languages"
    :translations="translations"
    :current-preview-lang="currentPreviewLang"
    :status-message="statusMessage"
    :status-icon="statusIcon"
    @handle-file-upload="handleFileUpload"
    @handle-file-drop="handleFileDrop"
    @switch-language="switchLanguage"
    @download-language="downloadLanguage"
    @download-all="downloadAll"
  />
</template>

<script>
import { useCSVProcessor } from './composables/useCSVProcessor'
import { useTranslationState } from './composables/useTranslationState'
import AppTemplate from './components/AppTemplate.vue'
import { ref, watch, computed } from 'vue'

export default {
  name: 'App',
  components: {
    AppTemplate
  },
  setup() {
    const { 
      csvContent, 
      handleCSVUpload, 
      processCSVContent, 
      statusMessage: csvStatusMessage, 
      statusIcon: csvStatusIcon 
    } = useCSVProcessor()
    
    const { 
      languages, 
      translations, 
      currentPreviewLang, 
      updateTranslations, 
      switchLanguage, 
      downloadLanguage, 
      downloadAll,
      statusMessage: translationStatusMessage,
      statusIcon: translationStatusIcon
    } = useTranslationState()

    // 合并状态消息，优先显示最新的消息
    const statusMessage = computed(() => 
      csvStatusMessage.value || translationStatusMessage.value || ''
    )
    
    const statusIcon = computed(() => 
      csvStatusMessage.value ? csvStatusIcon.value : translationStatusIcon.value
    )

    // 自动处理 CSV 内容变化
    watch(csvContent, (newContent) => {
      if (newContent) {
        const result = processCSVContent()
        if (result) {
          updateTranslations(result)
        }
      }
    })

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        handleCSVUpload(file)
      }
    }
    
    const handleFileDrop = (file) => {
      if (file) {
        handleCSVUpload(file)
      }
    }

    return {
      csvContent,
      handleFileUpload,
      handleFileDrop,
      languages,
      translations,
      currentPreviewLang,
      switchLanguage,
      downloadLanguage,
      downloadAll,
      statusMessage,
      statusIcon
    }
  }
}
</script>

<style>
/* 全局样式可以放在这里，但主要样式已经在 assets/styles.css 中 */
</style> 