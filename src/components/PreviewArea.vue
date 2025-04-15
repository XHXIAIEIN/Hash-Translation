<template>
  <div class="preview-area">
    <div class="preview-header">
      <div class="preview-toggle">
        <button
          class="icon-btn"
          :class="{ active: !isJsonView }"
          @click="switchView(false)"
          title="表格视图"
        >
          <i class="bi bi-table"></i>
          <span>表格</span>
        </button>
        <button
          class="icon-btn"
          :class="{ active: isJsonView }"
          @click="switchView(true)"
          title="JSON视图"
        >
          <i class="bi bi-braces"></i>
          <span>JSON</span>
        </button>
      </div>
    </div>
    <div class="preview-content" :class="{ 'json-view': isJsonView }">
      <div v-if="!currentLang || !translations[currentLang]" class="empty-state">
        <i class="bi bi-file-text"></i>
        <p>暂无数据</p>
      </div>
      <template v-else>
        <pre v-if="isJsonView" class="json-content">{{ formatJson(translations[currentLang]) }}</pre>
        <table v-else class="translation-table">
          <thead>
            <tr>
              <th>原文</th>
              <th>翻译</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in translations[currentLang]" :key="key">
              <td class="key-cell">{{ key }}</td>
              <td class="value-cell">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PreviewArea',
  props: {
    currentLang: {
      type: String,
      required: true
    },
    translations: {
      type: Object,
      required: true
    },
    isJsonView: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    switchView(isJson) {
      this.$emit('switch-view', isJson)
    },
    formatJson(obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
}
</script>

<style scoped>
.preview-area {
  padding: 20px;
}

.preview-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-toggle {
  display: flex;
  gap: 8px;
}

.preview-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.json-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 500px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

.translation-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  white-space: nowrap;
}

.translation-table th,
.translation-table td {
  padding: 12px;
  border: 1px solid var(--border-color);
  text-align: left;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.translation-table th {
  background: var(--bg-color);
  font-weight: 600;
}

.translation-table tr:hover {
  background: var(--hover-bg);
}

.key-cell {
  width: 19rem;
  min-width: 19rem;
  max-width: 19rem;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value-cell {
  width: auto;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
  font-family: monospace;
  font-size: 13px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--border-color);
}
</style> 