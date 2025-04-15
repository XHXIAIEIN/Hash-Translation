<template>
  <div 
    class="input-area" 
    ref="inputArea"
  >
    <div class="input-header">
      <div class="input-hint">
        <i class="bi bi-info-circle"></i>
        <span>第一行为语言代码，后续每行为翻译内容，用逗号分隔</span>
      </div>
      <div class="input-actions">
        <div class="file-input-wrapper">
          <input
            type="file"
            ref="fileInput"
            class="file-input"
            @change="handleFileSelect"
            accept=".csv,.txt"
          >
        </div>
        <button class="icon-btn" @click="triggerFileInput" title="上传文件">
          <i class="bi bi-cloud-upload"></i>
          <span>上传</span>
        </button>
        <button class="icon-btn primary" @click="processCSV" title="处理">
          <i class="bi bi-check-lg"></i>
          <span>处理</span>
        </button>
      </div>
    </div>
    <div class="input-status" v-if="statusMessage">
      <i :class="statusIcon"></i>
      <span>{{ statusMessage }}</span>
    </div>
    <div class="input-container">
      <textarea
        v-model="csvText"
        class="form-control"
        placeholder="en-US,zh-CN,ja-JP&#10;Hello,你好,こんにちは&#10;Welcome,欢迎,ようこそ&#10;Goodbye,再见,さようなら"
        @input="processCSV"
        ref="textarea"
      ></textarea>
    </div>
  </div>
</template>

<script>
import { checkAPISupport, showStatus, NotificationTypes } from '../utils/notification.js';

export default {
  name: 'InputArea',
  data() {
    return {
      csvText: '',
      statusMessage: '',
      statusIcon: '',
      fileInput: null,
      fileReadController: null
    }
  },
  mounted() {
    this.setupPasteListener();
    this.checkSupportedFeatures();
    
    console.log('InputArea组件已挂载');
  },
  beforeUnmount() {
    if (this.fileReadController) {
      this.fileReadController.abort();
    }
  },
  methods: {
    checkSupportedFeatures() {
      // 检查API支持
      const apiSupport = checkAPISupport();
      if (!apiSupport.fileSystem) {
        console.info('此浏览器不支持文件系统访问API');
      }
    },
    setupPasteListener() {
      const textarea = this.$refs.textarea;
      if (textarea) {
        textarea.addEventListener('paste', async (e) => {
          const clipboardData = e.clipboardData || window.clipboardData;
          const pastedText = clipboardData.getData('text');
          
          if (pastedText.includes(',') && pastedText.includes('\n')) {
            this.csvText = pastedText;
            this.processCSV();
            e.preventDefault();
          }
          
          if (clipboardData.files && clipboardData.files.length > 0) {
            const file = clipboardData.files[0];
            await this.readFile(file);
            e.preventDefault();
          }
        });
      }
    },
    triggerFileInput() {
      if ('showOpenFilePicker' in window) {
        this.useModernFilePicker();
      } else {
        this.$refs.fileInput.click();
      }
    },
    async useModernFilePicker() {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'CSV文件',
              accept: {
                'text/csv': ['.csv', '.txt']
              }
            }
          ],
          multiple: false
        });
        
        const file = await fileHandle.getFile();
        await this.readFile(file);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('选择文件时出错:', error);
          this.showStatusMessage('选择文件失败', NotificationTypes.ERROR);
        }
      }
    },
    async handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      await this.readFile(file);
      e.target.value = '';
    },
    async readFile(file) {
      if (this.fileReadController) {
        this.fileReadController.abort();
      }
      
      this.fileReadController = new AbortController();
      const signal = this.fileReadController.signal;
      
      try {
        this.showStatusMessage('正在读取文件...', NotificationTypes.INFO);
        
        let text;
        if ('readableStream' in Blob.prototype) {
          const stream = file.stream();
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let result = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
            
            if (signal.aborted) {
              reader.cancel();
              throw new DOMException('文件读取已取消', 'AbortError');
            }
          }
          
          result += decoder.decode();
          text = result;
        } else {
          text = await file.text();
        }
        
        this.csvText = text;
        this.processCSV();
        this.showStatusMessage('文件加载成功', NotificationTypes.SUCCESS);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('文件读取已取消');
        } else {
          console.error('读取文件时出错:', error);
          this.showStatusMessage('文件读取失败', NotificationTypes.ERROR);
        }
      } finally {
        this.fileReadController = null;
      }
    },
    processCSV() {
      this.$emit('process-csv', this.csvText);
    },
    showStatusMessage(message, type = NotificationTypes.INFO) {
      showStatus({
        message,
        type,
        onUpdate: (msg, iconClass) => {
          this.statusMessage = msg;
          this.statusIcon = iconClass;
        }
      });
    }
  }
}
</script>

<style scoped>
.input-area {
  padding: 20px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  z-index: 1;
}

.input-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-light);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.file-input-wrapper {
  display: none;
}

.input-container {
  position: relative;
  min-height: 200px;
  width: 100%;
}

textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: vertical;
  font-family: monospace;
  transition: var(--transition);
  position: relative;
  z-index: 1;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.input-status {
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-success {
  color: var(--success-color, #10b981);
}

.text-danger {
  color: var(--danger-color, #ef4444);
}

.text-info {
  color: var(--primary-color, #4a90e2);
}
</style>