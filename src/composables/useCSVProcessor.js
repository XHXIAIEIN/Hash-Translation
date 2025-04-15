import { ref } from 'vue'
import { processCSV, showAlert } from '../utils/helpers'
import { showStatus, NotificationTypes } from '../utils/notification'

export const useCSVProcessor = () => {
  const csvContent = ref('')
  const statusMessage = ref('')
  const statusIcon = ref('')

  const handleCSVUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      csvContent.value = e.target.result
      showStatus({
        message: 'CSV 文件已加载',
        type: NotificationTypes.SUCCESS,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
    }
    reader.readAsText(file)
  }

  const processCSVContent = () => {
    if (!csvContent.value) {
      showStatus({
        message: '请先上传或输入 CSV 内容',
        type: NotificationTypes.ERROR,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
      return null
    }

    const result = processCSV(csvContent.value)
    if (result.error) {
      showStatus({
        message: result.error,
        type: NotificationTypes.ERROR,
        onUpdate: (msg, iconClass) => {
          statusMessage.value = msg
          statusIcon.value = iconClass
        }
      })
      return null
    }

    showStatus({
      message: 'CSV 处理成功',
      type: NotificationTypes.SUCCESS,
      onUpdate: (msg, iconClass) => {
        statusMessage.value = msg
        statusIcon.value = iconClass
      }
    })
    return result
  }

  const resetCSVContent = () => {
    csvContent.value = ''
  }

  return {
    csvContent,
    statusMessage,
    statusIcon,
    handleCSVUpload,
    processCSVContent,
    resetCSVContent
  }
} 