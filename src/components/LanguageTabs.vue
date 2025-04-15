<template>
  <div class="language-tabs">
    <div
      v-for="lang in languages"
      :key="lang"
      class="language-tab"
      :class="{ active: currentLang === lang }"
      @click="switchLanguage(lang)"
    >
      <span class="lang-code">{{ lang }}</span>
      <div class="language-actions">
        <button
          class="icon-btn small"
          @click.stop="downloadLanguage(lang)"
          title="下载"
        >
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanguageTabs',
  props: {
    languages: {
      type: Array,
      required: true
    },
    currentLang: {
      type: String,
      required: true
    },
    translations: {
      type: Object,
      required: true
    }
  },
  methods: {
    switchLanguage(lang) {
      this.$emit('switch-language', lang)
    },
    downloadLanguage(lang) {
      this.$emit('download-language', lang)
    }
  }
}
</script>

<style scoped>
.language-tabs {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid var(--border-color);
}

.language-tab {
  position: relative;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-tab:hover {
  background: var(--hover-bg);
}

.language-tab.active {
  background: var(--primary-color);
  color: white;
}

.language-actions {
  position: absolute;
  right: 8px;
  opacity: 0;
  transition: var(--transition);
}

.language-tab:hover .language-actions {
  opacity: 1;
}

.icon-btn.small {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.icon-btn.small:hover {
  opacity: 0.8;
}
</style> 