import { showError, showLoading, hideLoading } from './util.js';

const baseURL = 'http://localhost:3000/api';

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// API方法
export const contactsAPI = {
  // 获取联系人列表
  getContacts: () => request('/contacts', 'GET'),
  
  // 添加联系人
  addContact: (data) => request('/contacts', 'POST', data),
  
  // 修改联系人
  updateContact: (id, data) => request(`/contacts/${id}`, 'PUT', data),
  
  // 删除联系人
  deleteContact: (id) => request(`/contacts/${id}`, 'DELETE')
};

// 带加载状态的API方法
export const contactsAPIWithLoading = {
  getContacts: async () => {
    showLoading('加载中...');
    try {
      const result = await contactsAPI.getContacts();
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  },

  addContact: async (data) => {
    showLoading('添加中...');
    try {
      const result = await contactsAPI.addContact(data);
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  },

  updateContact: async (id, data) => {
    showLoading('保存中...');
    try {
      const result = await contactsAPI.updateContact(id, data);
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  },

  deleteContact: async (id) => {
    showLoading('删除中...');
    try {
      const result = await contactsAPI.deleteContact(id);
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  }
};