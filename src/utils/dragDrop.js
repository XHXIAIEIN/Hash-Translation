/**
 * 拖放处理工具
 * 用于处理文件拖放操作
 */

/**
 * 为指定元素启用拖放功能
 * @param {HTMLElement} element - 要启用拖放功能的DOM元素
 * @param {Object} options - 配置选项
 * @param {Function} options.onDragEnter - 拖放进入时的回调
 * @param {Function} options.onDragOver - 拖放悬停时的回调
 * @param {Function} options.onDragLeave - 拖放离开时的回调
 * @param {Function} options.onDrop - 放置文件时的回调
 * @param {Array<string>} options.acceptedTypes - 接受的文件类型
 * @param {Function} options.onFileAccepted - 文件被接受时的回调
 * @param {boolean} options.debug - 是否启用调试日志
 * @returns {Function} - 用于解除事件监听的清理函数
 */
export function enableDragDrop(element, options = {}) {
  if (!element) {
    console.error('未提供有效的DOM元素');
    return () => {};
  }

  const {
    onDragEnter = () => {},
    onDragOver = () => {},
    onDragLeave = () => {},
    onDrop = () => {},
    acceptedTypes = ['text/csv', 'text/plain', 'csv', 'txt'],
    onFileAccepted = () => {},
    debug = false
  } = options;

  // 调试日志
  const log = debug ? console.log : () => {};

  // 用于跟踪拖放进入/离开事件的计数器
  let dragCounter = 0;

  // 检查文件类型是否被接受
  const isFileTypeAccepted = (file) => {
    if (!file) return false;
    
    return acceptedTypes.includes(file.type) || 
           acceptedTypes.some(type => {
             const ext = type.includes('/') ? type.split('/')[1] : type;
             return file.name.toLowerCase().endsWith(`.${ext}`);
           }) ||
           file.name.toLowerCase().endsWith('.csv') || 
           file.name.toLowerCase().endsWith('.txt') ||
           file.type === '';
  };

  // 处理拖放进入
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter++;
    log('拖放进入事件触发', dragCounter);
    
    onDragEnter(e);
  };

  // 处理拖放悬停
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 防止频繁记录日志
    if (debug && Math.random() < 0.05) {
      log('拖放悬停事件');
    }
    
    // 设置拖放效果
    if (e.dataTransfer) {
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const hasAcceptedFile = Array.from(e.dataTransfer.items).some(item => 
          item.kind === 'file' && (
            item.type === 'text/csv' || 
            item.type === 'text/plain' || 
            item.type === '' ||
            (item.getAsFile && isFileTypeAccepted(item.getAsFile()))
          )
        );
        
        e.dataTransfer.dropEffect = hasAcceptedFile ? 'copy' : 'none';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
    }
    
    onDragOver(e);
  };

  // 处理拖放离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 防止事件冒泡导致误判
    if (element.contains(e.relatedTarget)) {
      return; // 仍在目标元素内部
    }
    
    dragCounter--;
    log('拖放离开事件触发', dragCounter);
    
    if (dragCounter <= 0) {
      dragCounter = 0;
      onDragLeave(e);
    }
  };

  // 处理文件放置
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    log('拖放释放事件触发');
    
    // 重置计数器
    dragCounter = 0;
    
    try {
      // 直接从dataTransfer.files获取文件
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        log(`检测到${files.length}个文件`);
        
        // 处理多个文件的情况，优先选择CSV文件
        let selectedFile = files[0];
        if (files.length > 1) {
          const acceptedFile = Array.from(files).find(file => 
            isFileTypeAccepted(file)
          );
          
          if (acceptedFile) selectedFile = acceptedFile;
        }
        
        log(`选中文件: ${selectedFile.name}, 类型: ${selectedFile.type}`);
        
        // 验证文件类型
        if (isFileTypeAccepted(selectedFile)) {
          onFileAccepted(selectedFile);
        }
      } 
      // 尝试从items中获取文件
      else if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const fileItems = Array.from(e.dataTransfer.items)
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile())
          .filter(file => file !== null);
          
        if (fileItems.length > 0) {
          log(`从items中找到${fileItems.length}个文件`);
          
          // 选择最匹配的文件
          const csvFile = fileItems.find(f => isFileTypeAccepted(f));
          const selectedFile = csvFile || fileItems[0];
          
          log(`选中文件: ${selectedFile.name}, 类型: ${selectedFile.type}`);
          
          if (isFileTypeAccepted(selectedFile)) {
            onFileAccepted(selectedFile);
          }
        } else {
          log('未检测到任何文件');
        }
      } else {
        log('未检测到文件');
      }
    } catch (error) {
      console.error('处理拖放文件时出错:', error);
    }
    
    onDrop(e);
  };

  if (debug) {
    log('为元素添加拖放事件监听器', element);
  }
  
  // 添加事件监听器
  element.addEventListener('dragenter', handleDragEnter, false);
  element.addEventListener('dragover', handleDragOver, false);
  element.addEventListener('dragleave', handleDragLeave, false);
  element.addEventListener('drop', handleDrop, false);

  // 返回清理函数
  return () => {
    element.removeEventListener('dragenter', handleDragEnter, false);
    element.removeEventListener('dragover', handleDragOver, false);
    element.removeEventListener('dragleave', handleDragLeave, false);
    element.removeEventListener('drop', handleDrop, false);
    
    if (debug) {
      log('拖放事件监听器已移除');
    }
  };
} 