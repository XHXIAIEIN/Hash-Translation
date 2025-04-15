/**
 * 哈希计算工具
 * 提供字符串哈希计算功能，用于生成唯一标识符
 */

/**
 * 使用Web Crypto API异步计算MD5哈希值
 * @param {string} str - 需要计算哈希的字符串
 * @returns {Promise<string>} 返回十六进制表示的MD5哈希值
 */
export const calculateMD5 = async (str) => {
  // 使用Web Crypto API实现MD5
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  // 使用SubtleCrypto API计算MD5哈希
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  
  // 将ArrayBuffer转换为字节数组
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // 将字节转换为十六进制字符串
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * 同步计算字符串哈希值 (基于FNV-1a算法的变种)
 * 注意：这不是标准MD5，但生成的哈希足够用于唯一标识符
 * @param {string} str - 需要计算哈希的字符串
 * @returns {string} 返回十六进制表示的哈希值
 */
export const calculateHashSync = (str) => {
  // 简单的字符串哈希函数实现
  const hash = str.split('').reduce((hash, char) => {
    const charCode = char.charCodeAt(0);
    return ((hash << 5) - hash) + charCode | 0; // 位运算确保结果是32位整数
  }, 0);
  
  // 转换为十六进制字符串并填充到32位长度
  return (hash >>> 0).toString(16).padStart(8, '0') + 
         Math.abs(hash ^ (hash >>> 16)).toString(16).padStart(8, '0') +
         Math.abs((hash << 8) ^ (hash >>> 8)).toString(16).padStart(8, '0') +
         Math.abs((hash << 16) ^ hash).toString(16).padStart(8, '0');
}

/**
 * 生成随机UUID
 * @returns {string} 返回随机生成的UUID
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  
  // 回退实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 