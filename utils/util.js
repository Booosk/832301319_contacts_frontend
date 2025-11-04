// 通用工具函数

/**
 * 格式化日期时间
 */
export function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 验证手机号格式
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 显示成功提示
 */
export function showSuccess(title) {
  return wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  });
}

/**
 * 显示错误提示
 */
export function showError(title) {
  return wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 显示加载中
 */
export function showLoading(title = '加载中...') {
  return wx.showLoading({
    title: title,
    mask: true
  });
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
  return wx.hideLoading();
}

/**
 * 显示确认对话框
 */
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 深拷贝对象
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 压缩图片
 */
export function compressImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: tempFilePath,
      quality: 80,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: reject
    });
  });
}

/**
 * 获取图片信息
 */
export function getImageInfo(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: tempFilePath,
      success: (res) => {
        resolve(res);
      },
      fail: reject
    });
  });
}