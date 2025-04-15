<template>
  <div class="language-nav-container">
    <!-- 响应式语言导航 -->
    <div class="language-tabs-wrapper">
      <div ref="tabsContainer" class="language-tabs" @scroll="handleScroll">
        <div class="language-tabs-inner">
          <div 
            v-for="lang in languages" 
            :key="lang" 
            class="language-tab"
            :class="{ 'active': currentLang === lang }"
            @click="$emit('change', lang)"
          >
            <span class="language-name">{{ lang }}</span>
            <button 
              v-if="translations && translations[lang]"
              class="download-btn ml-auto"
              @click.stop="$emit('download', lang)"
              title="下载语言文件"
            >
              <i class="icon-download-single"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanguageNav',
  props: {
    languages: {
      type: Array,
      required: true
    },
    currentLang: {
      type: String,
      default: ''
    },
    translations: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      scrollPosition: 0,
      maxScroll: 0,
      isLargeScreen: false
    }
  },
  mounted() {
    this.checkScreenSize();
    this.calculateMaxScroll();
    
    // 监听窗口尺寸变化
    window.addEventListener('resize', this.handleResize);
    
    // 初始滚动到当前选中语言
    this.$nextTick(() => {
      this.scrollToActive();
    });
  },
  beforeUnmount() {
    // 清理事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    currentLang() {
      // 当选择的语言改变时，滚动到该位置
      this.$nextTick(() => {
        this.scrollToActive();
      });
    }
  },
  methods: {
    handleScroll(e) {
      // 更新滚动位置
      this.scrollPosition = e.target.scrollLeft;
      this.calculateMaxScroll();
    },
    calculateMaxScroll() {
      if (this.$refs.tabsContainer) {
        const container = this.$refs.tabsContainer;
        this.maxScroll = container.scrollWidth - container.clientWidth;
      }
    },
    checkScreenSize() {
      // 检查是否为大屏幕
      this.isLargeScreen = window.innerWidth >= 768;
    },
    handleResize() {
      this.checkScreenSize();
      this.calculateMaxScroll();
      this.scrollToActive();
    },
    scrollToActive() {
      if (!this.$refs.tabsContainer || this.isLargeScreen) return;
      
      // 找到当前活跃的标签
      const activeTab = this.$el.querySelector('.language-tab.active');
      if (activeTab) {
        // 计算需要滚动的位置，使活跃标签居中
        const container = this.$refs.tabsContainer;
        const tabCenter = activeTab.offsetLeft + activeTab.offsetWidth / 2;
        const containerCenter = container.clientWidth / 2;
        
        container.scrollLeft = tabCenter - containerCenter;
      }
    }
  },
  emits: ['change', 'download']
}
</script>

<style scoped>
.language-nav-container {
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-light, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #e1e4e8);
  position: relative;
}

.language-tabs-wrapper {
  position: relative;
  width: 100%;
}

.language-tabs {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
  -webkit-overflow-scrolling: touch; /* iOS 滚动平滑 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

/* 隐藏 Webkit 浏览器的滚动条 */
.language-tabs::-webkit-scrollbar {
  display: none;
}

.language-tabs-inner {
  display: flex;
  flex-wrap: nowrap;
  padding: 0 4px;
  min-width: min-content; /* 确保内容不会被压缩 */
}

.language-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  color: var(--text-color, #4a5568);
}

.language-tab:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.language-tab.active {
  color: var(--primary-color, #1890ff);
  border-bottom-color: var(--primary-color, #1890ff);
  font-weight: 500;
}

.language-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-btn {
  opacity: 0;
  background: transparent;
  border: none;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.language-tab:hover .download-btn {
  opacity: 0.8;
}

.language-tab.active .download-btn {
  color: var(--primary-color, #1890ff);
}

.download-btn:hover {
  opacity: 1 !important;
}

/* 中等屏幕及以上尺寸的响应式布局 */
@media (min-width: 768px) {
  .language-nav-container {
    width: 200px;
    min-width: 200px;
    height: 100%;
    border-right: 1px solid var(--border-color, #e1e4e8);
    border-bottom: none;
  }

  .language-tabs {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .language-tabs-inner {
    flex-direction: column;
    padding: 0;
  }

  .language-tab {
    justify-content: flex-start;
    padding: 12px 16px;
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .language-tab.active {
    border-bottom-color: transparent;
    border-left-color: var(--primary-color, #1890ff);
    background-color: rgba(24, 144, 255, 0.05);
  }
}
</style> 