/**
 * 消息通知工具
 * 用于处理应用内通知
 */

// 消息类型
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * 检查浏览器API支持情况
 * @returns {Object} API支持状态
 */
export function checkAPISupport() {
  return {
    fileSystem: 'showOpenFilePicker' in window,
    dragDrop: 'draggable' in document.createElement('div'),
    clipboard: 'clipboard' in navigator,
    mediaDevices: 'mediaDevices' in navigator
  };
}

/**
 * 显示应用内状态消息
 * @param {Object} options - 消息选项
 * @param {string} options.message - 消息内容
 * @param {string} options.type - 消息类型 (success, error, info, warning)
 * @param {Function} options.onUpdate - 更新状态的回调函数，接收消息和图标样式参数
 * @param {number} options.duration - 消息显示时长(毫秒)，0表示不自动关闭
 * @returns {Function} 用于手动关闭消息的函数
 */
export function showStatus(options) {
  const {
    message,
    type = NotificationTypes.INFO,
    onUpdate,
    duration = 3000
  } = options;
  
  if (!onUpdate || typeof onUpdate !== 'function') {
    console.error('必须提供onUpdate回调函数');
    return () => {};
  }
  
  // 获取图标样式
  let iconClass;
  switch (type) {
    case NotificationTypes.SUCCESS:
      iconClass = 'bi bi-check-circle-fill text-success';
      break;
    case NotificationTypes.ERROR:
      iconClass = 'bi bi-exclamation-triangle-fill text-danger';
      break;
    case NotificationTypes.WARNING:
      iconClass = 'bi bi-exclamation-circle-fill text-warning';
      break;
    case NotificationTypes.INFO:
    default:
      iconClass = 'bi bi-info-circle-fill text-info';
      break;
  }
  
  // 更新状态
  onUpdate(message, iconClass);
  
  // 自动清除状态
  let timeoutId = null;
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      onUpdate('', '');
    }, duration);
  }
  
  // 返回手动清除函数
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    onUpdate('', '');
  };
} 