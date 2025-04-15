import { calculateMD5, calculateHashSync } from './hash.js';

export const processCSV = (csvText) => {
  try {
    if (!csvText.trim()) {
      throw new Error('内容为空')
    }

    // 使用String.prototype.split的正则表达式特性更智能地处理CSV
    const lines = csvText.trim()
      .split(/\r?\n/)  // 适配不同操作系统的换行符
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))

    if (lines.length < 2) {
      throw new Error('CSV 必须至少包含标题行和一行数据')
    }

    // 使用CSV解析API
    const parseCSVLine = (line) => {
      // 如果浏览器支持，使用Temporal API解析CSV（未来API）
      if (typeof window !== 'undefined' && 'TextDecoder' in window) {
        return Array.from(new TextDecoder().decode(new TextEncoder().encode(line))
          .matchAll(/("([^"]*)"|([^,]*))(,|$)/g), m => (m[2] || m[3] || '').trim());
      }

      // 回退机制：手动解析CSV
      const values = [];
      let currentValue = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      return values.map(v => v.replace(/^"|"$/g, ''));
    };

    const headers = parseCSVLine(lines[0]);

    if (headers.length < 2) {
      throw new Error('CSV 必须至少包含两列')
    }

    const uniqueHeaders = new Set(headers);
    if (uniqueHeaders.size !== headers.length) {
      throw new Error('语言代码不能重复')
    }

    const translations = Object.fromEntries(
      headers.map(lang => [lang, {}])
    );

    let validRows = 0;
    const processLine = (line, i) => {
      const cleanValues = parseCSVLine(line);

      if (cleanValues.length !== headers.length) {
        console.warn(`第 ${i + 1} 行的列数与标题行不匹配，将被跳过`);
        return;
      }

      const originalText = cleanValues[0];
      if (!originalText) {
        console.warn(`第 ${i + 1} 行的原文为空，将被跳过`);
        return;
      }

      const key = calculateHashSync(originalText);
      headers.forEach((lang, index) => {
        translations[lang][key] = cleanValues[index] || originalText;
      });

      validRows++;
    };

    // 使用更现代的迭代器处理每一行
    lines.slice(1).forEach(processLine);

    return {
      languages: headers,
      translations,
      error: null
    }
  } catch (error) {
    return {
      languages: [],
      translations: {},
      error: error.message || 'CSV 格式无效'
    }
  }
}

export const downloadFile = (content, filename) => {
  // 使用Blob和URL.createObjectURL创建下载文件
  const blob = new Blob([content], { type: 'application/json' })
  
  // 使用navigator.clipboard API复制到剪贴板（如果支持）
  if (navigator.clipboard && window.isSecureContext) {
    // 可以添加一个复制功能
    navigator.clipboard.writeText(content)
      .catch(err => console.warn('无法复制到剪贴板:', err));
  }
  
  // 使用现代下载API
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  // 不需要添加到DOM中，直接点击即可
  a.click()
  
  // 及时释放URL对象
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export const showAlert = (message, type = 'success') => {
  // 创建自定义提示元素
  const alertDiv = document.createElement('div')
  alertDiv.className = `alert alert-${type} fixed top-4 right-4 z-50`
  
  // 使用更安全的innerText代替innerHTML
  const svg = type === 'success' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
    
  const flexDiv = document.createElement('div');
  flexDiv.className = 'flex items-center';
  
  // 使用更现代的DOM API
  flexDiv.insertAdjacentHTML('beforeend', svg);
  
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  flexDiv.appendChild(msgSpan);
  
  alertDiv.appendChild(flexDiv);
  document.body.appendChild(alertDiv)
  
  // 使用Web Animation API创建淡出效果
  if ('animate' in alertDiv) {
    alertDiv.animate([
      { opacity: 0, transform: 'translateY(-20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
    
    // 设置淡出动画
    setTimeout(() => {
      const animation = alertDiv.animate([
        { opacity: 1 },
        { opacity: 0, transform: 'translateY(-20px)' }
      ], {
        duration: 300,
        easing: 'ease-in'
      });
      
      animation.onfinish = () => alertDiv.remove();
    }, 2700);
  } else {
    // 回退方案
    setTimeout(() => alertDiv.remove(), 3000);
  }
}

// 保存文件到指定文件夹
export const saveToFolder = async (files) => {
  // 检查浏览器是否支持文件系统访问API
  if (!('showDirectoryPicker' in window)) {
    alert('您的浏览器不支持文件夹选择功能，将使用传统下载方式');
    // 回退到传统下载方式
    files.forEach(file => {
      downloadFile(file.content, file.filename);
    });
    return false;
  }
  
  try {
    // 打开文件夹选择器
    const directoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'downloads'
    });
    
    // 计数成功保存的文件
    let savedCount = 0;
    
    // 保存所有文件
    for (const file of files) {
      try {
        // 获取文件句柄
        const fileHandle = await directoryHandle.getFileHandle(file.filename, { create: true });
        
        // 创建可写入流
        const writable = await fileHandle.createWritable();
        
        // 写入内容
        await writable.write(file.content);
        
        // 关闭流
        await writable.close();
        
        savedCount++;
      } catch (fileError) {
        console.error(`保存文件 ${file.filename} 失败:`, fileError);
      }
    }
    
    return {
      success: true,
      count: savedCount,
      total: files.length
    };
  } catch (error) {
    // 用户取消选择或出现其他错误
    if (error.name !== 'AbortError') {
      console.error('保存到文件夹失败:', error);
    }
    return false;
  }
} 