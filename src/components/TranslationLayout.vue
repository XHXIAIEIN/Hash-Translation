<template>
  <div class="flex flex-col h-screen bg-white">
    <!-- 主要内容区 -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- 顶部操作栏 -->
      <div class="flex justify-between items-center p-4 bg-light border-b border-border-color">
        <!-- 左侧：模式切换 -->
        <div class="flex gap-2">
          <button 
            class="btn icon-btn flex items-center justify-center" 
            :class="{ active: isEditMode }"
            @click="isEditMode = true"
            title="编辑模式"
          >
            <i class="icon-edit"></i>
          </button>
          <button 
            class="btn icon-btn flex items-center justify-center" 
            :class="{ active: !isEditMode }"
            @click="isEditMode = false"
            title="预览模式"
          >
            <i class="icon-preview"></i>
          </button>
        </div>

        <!-- 中间：状态消息 -->
        <div v-if="statusMessage" class="flex items-center gap-2 px-3 py-1 bg-light-hover rounded-full text-sm transition-opacity duration-300">
          <i :class="statusIcon"></i>
          <span>{{ statusMessage }}</span>
        </div>

        <!-- 右侧：文件操作 -->
        <div class="flex gap-2">
          <div class="relative inline-block">
            <input 
              type="file" 
              accept=".csv" 
              @change="handleFileUpload($event)"
              class="absolute w-full h-full opacity-0 cursor-pointer z-10"
            >
            <button class="btn primary-outline flex items-center gap-1" title="上传 CSV">
              <i class="icon-upload flex-shrink-0"></i>
              <span class="text-sm">上传CSV</span>
            </button>
          </div>
          <button class="btn primary-outline flex items-center gap-1" @click="downloadAll" title="保存所有语言文件到文件夹">
            <i class="icon-download flex-shrink-0"></i>
            <span class="text-sm">保存全部</span>
          </button>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-if="isEditMode" class="flex flex-col flex-1 p-4 relative">
        <textarea 
          :value="csvContent"
          @input="$emit('update:csvContent', $event.target.value)"
          class="flex-1 p-4 border border-border-color rounded resize-none font-mono relative z-10"
          placeholder="在此输入或粘贴 CSV 内容..."
          ref="textarea"
        ></textarea>
        <div class="drag-overlay" :class="{ active: isDragging }">
          <i class="icon-upload"></i>
          <span>释放鼠标上传文件</span>
        </div>
      </div>

      <!-- 预览模式 - 响应式布局 -->
      <div v-else class="flex flex-col md:flex-row flex-1 overflow-hidden">
        <!-- 使用响应式语言导航组件 -->
        <language-nav 
          :languages="languages" 
          :current-lang="currentPreviewLang"
          :translations="translations"
          @change="switchLanguage"
          @download="downloadLanguage"
        />

        <!-- 右侧内容区 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- 视图切换 -->
          <div class="flex items-center h-12 px-3 border-b border-border-color">
            <div class="flex gap-2">
              <button 
                class="btn icon-btn flex items-center justify-center" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="表格视图"
              >
                <i class="icon-table block"></i>
              </button>
              <button 
                class="btn icon-btn flex items-center justify-center" 
                :class="{ active: viewMode === 'json' }"
                @click="viewMode = 'json'"
                title="JSON 视图"
              >
                <i class="icon-json block"></i>
              </button>
            </div>
          </div>

          <!-- 表格视图 -->
          <div v-if="viewMode === 'table'" class="flex-1 overflow-auto p-4">
            <table v-if="translations[currentPreviewLang]" class="translation-table">
              <tbody>
                <tr v-for="(translation, key) in translations[currentPreviewLang]" :key="key" class="hover:bg-gray-50">
                  <td class="w-52 min-w-52 max-w-52 font-mono text-sm" :title="key">{{ key }}</td>
                  <td class="w-auto font-mono text-sm" :title="translation">{{ translation }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!translations[currentPreviewLang]" class="flex justify-center items-center h-full text-gray-500 font-mono text-sm">
              暂无翻译内容
            </div>
          </div>

          <!-- JSON 视图 -->
          <div v-else class="flex-1 overflow-auto p-4">
            <div v-if="translations[currentPreviewLang]" class="json-view h-full">
              <div class="json-content h-full">
                <pre class="w-full h-full whitespace-pre-wrap font-mono text-sm rounded border border-gray-200 p-4 overflow-auto">{{ JSON.stringify(translations[currentPreviewLang], null, 2) }}</pre>
              </div>
            </div>
            <div v-else class="flex justify-center items-center h-full text-gray-500 font-mono text-sm">
              暂无翻译内容
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import LanguageNav from './LanguageNav.vue'
import { enableDragDrop } from '../utils/dragDrop.js'

export default {
  name: 'AppTemplate',
  components: {
    LanguageNav
  },
  props: {
    csvContent: String,
    languages: Array,
    translations: Object,
    currentPreviewLang: String,
    statusMessage: String,
    statusIcon: String
  },
  emits: [
    'handle-file-upload',
    'handle-file-drop',
    'switch-language',
    'download-language',
    'download-all',
    'update:csvContent'
  ],
  setup(props, { emit }) {
    const isEditMode = ref(true)
    const viewMode = ref('table')
    const isDragging = ref(false)
    const textarea = ref(null)
    let dragDropCleanup = null

    const switchLanguage = (lang) => {
      emit('switch-language', lang)
    }

    const downloadLanguage = (lang) => {
      emit('download-language', lang)
    }

    const downloadAll = () => {
      emit('download-all')
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('handle-file-upload', event)
      }
    }

    // 设置拖放功能
    const setupDragDrop = () => {
      if (textarea.value) {
        console.log('设置拖放功能')
        dragDropCleanup = enableDragDrop(textarea.value, {
          onDragEnter: () => {
            isDragging.value = true
          },
          onDragLeave: () => {
            isDragging.value = false
          },
          onDrop: () => {
            isDragging.value = false
          },
          onFileAccepted: (file) => {
            emit('handle-file-drop', file)
          },
          acceptedTypes: ['text/csv', 'text/plain', 'csv', 'txt'],
          debug: false
        })
      }
    }

    // 监听模式变化，重新设置拖放
    watch(isEditMode, (newValue) => {
      if (dragDropCleanup) {
        dragDropCleanup()
        dragDropCleanup = null
      }
      
      if (newValue) {
        // 延迟初始化，确保DOM已更新
        setTimeout(setupDragDrop, 100)
      }
    })

    // 初始化
    onMounted(() => {
      // 加载默认模板
      if (!props.csvContent) {
        emit('update:csvContent', `en-US,zh-CN,ja-JP,fr-FR,de-DE,es-ES,pt-BR,ru-RU,uk-UA,th-TH,vi-VN
Hello,你好,こんにちは,Bonjour,Hallo,Hola,Olá,Привет,Привіт,สวัสดี,Xin chào
Goodbye,再见,さようなら,Au revoir,Auf Wiedersehen,Adiós,Adeus,До свидания,До побачення,ลาก่อน,Tạm biệt
Thank you,谢谢,ありがとう,Merci,Danke,Gracias,Obrigado,Спасибо,Дякую,ขอบคุณ,Cảm ơn
Welcome,欢迎,ようこそ,Bienvenue,Willkommen,Bienvenido,Bem-vindo,Добро пожаловать,Ласкаво просимо,ยินดีต้อนรับ,Chào mừng
Confirm,确认,確認,Confirmer,Bestätigen,Confirmar,Confirmar,Подтвердить,Підтвердити,ยืนยัน,Xác nhận
Cancel,取消,キャンセル,Annuler,Abbrechen,Cancelar,Cancelar,Отмена,Скасувати,ยกเลิก,Hủy bỏ`)
      }
      
      // 延迟初始化拖放功能，确保DOM已挂载
      setTimeout(setupDragDrop, 100)
    })
    
    // 清理拖放功能
    onBeforeUnmount(() => {
      if (dragDropCleanup) {
        dragDropCleanup()
      }
    })

    return {
      isEditMode,
      viewMode,
      isDragging,
      textarea,
      switchLanguage,
      downloadLanguage,
      downloadAll,
      handleFileUpload
    }
  }
}
</script>

<style scoped>
.translation-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  white-space: nowrap;
}

.translation-table th,
.translation-table td {
  padding: 8px;
  border: 1px solid #ddd;
  line-height: 1.6;
  font-family: monospace;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.translation-table th:first-child,
.translation-table td:first-child {
  width: 240px;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.translation-table th:last-child,
.translation-table td:last-child {
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.translation-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.translation-table tr {
  transition: background-color 0.15s ease;
}

.translation-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.json-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-content {
  flex: 1;
  width: 100%;
}

.json-content pre {
  margin: 0;
  border: 1px solid #ddd;
  color: #333;
  line-height: 1.6;
  font-size: 13px;
  background-color: white;
}

.lang-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.lang-item:hover {
  background-color: #f5f5f5;
}

.lang-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.lang-download-btn {
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.lang-item:hover .lang-download-btn {
  opacity: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
  border: 1px solid #ddd;
  background-color: white;
  height: 36px;
}

.btn:hover {
  background-color: #f5f5f5;
}

.btn.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.btn.primary-outline {
  border-color: #4a90e2;
  color: #4a90e2;
  padding: 0.5rem 0.75rem;
  min-width: 86px;
}

.btn.primary-outline:hover {
  background-color: #e6f7ff;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(74, 144, 226, 0.1);
  border: 3px dashed #4a90e2;
  border-radius: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 50;
  pointer-events: none;
}

.drag-overlay.active {
  opacity: 1;
  background-color: rgba(74, 144, 226, 0.2);
}

.drag-overlay i {
  font-size: 36px;
  margin-bottom: 1rem;
  color: #4a90e2;
  animation: bounce 1s infinite;
}

.drag-overlay span {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 状态图标样式 */
.text-success {
  color: #10b981;
}

.text-danger {
  color: #ef4444;
}

.text-warning {
  color: #f59e0b;
}

.text-info {
  color: #4a90e2;
}

/* 状态消息样式 */
.bg-light-hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.rounded-full {
  border-radius: 9999px;
}

.transition-opacity {
  transition-property: opacity;
}

.duration-300 {
  transition-duration: 300ms;
}
</style> 