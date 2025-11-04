import { contactsAPI } from '../../utils/api.js';
import { showConfirm, showSuccess, showError } from '../../utils/util.js';

Page({
  data: {
    contacts: [],
    searchText: '',
    filteredContacts: [],
    stats: {
      total: 0,
      hasEmail: 0,
      hasAddress: 0,
      hasPhoto: 0
    },
    isLoading: false
  },
  
  onLoad() {
    this.loadContacts();
  },
  
  onShow() {
    this.loadContacts();
  },
  
  onPullDownRefresh() {
    this.loadContacts().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 加载联系人列表
  async loadContacts() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      const contacts = await contactsAPI.getContacts();
      this.setData({ 
        contacts,
        filteredContacts: contacts 
      });
      this.updateStats();
      this.setData({ isLoading: false });
    } catch (error) {
      showError('加载失败');
      this.setData({ isLoading: false });
    }
  },
  
  // 搜索联系人
  onSearchInput(e) {
    const searchText = e.detail.value;
    this.setData({ searchText });
    this.filterContacts();
  },
  
  // 过滤联系人
  filterContacts() {
    const { contacts, searchText } = this.data;
    if (!searchText.trim()) {
      this.setData({ filteredContacts: contacts });
      return;
    }
    
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText.toLowerCase()) || 
      contact.phone.includes(searchText) ||
      (contact.email && contact.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (contact.address && contact.address.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    this.setData({ filteredContacts: filtered });
  },
  
  // 清除搜索
  clearSearch() {
    this.setData({ 
      searchText: '',
      filteredContacts: this.data.contacts 
    });
  },
  
  // 更新统计信息
  updateStats() {
    const { contacts } = this.data;
    const stats = {
      total: contacts.length,
      hasEmail: contacts.filter(c => c.email && c.email.trim()).length,
      hasAddress: contacts.filter(c => c.address && c.address.trim()).length,
      hasPhoto: contacts.filter(c => c.photo && c.photo.trim()).length
    };
    this.setData({ stats });
  },
  
  // 跳转到添加页面
  goToAdd() {
    wx.navigateTo({ 
      url: '/pages/add/add',
      success: () => {
        console.log('跳转到添加页面');
      }
    });
  },
  
  // 编辑联系人
  editContact(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ 
      url: `/pages/edit/edit?id=${id}`,
      success: () => {
        console.log('跳转到编辑页面，ID:', id);
      }
    });
  },
  
  // 删除联系人
  async deleteContact(e) {
    const id = e.currentTarget.dataset.id;
    const contact = this.data.contacts.find(c => c.id == id);
    
    if (!contact) return;
    
    const confirmed = await showConfirm(`确定要删除联系人「${contact.name}」吗？`, '确认删除');
    
    if (confirmed) {
      try {
        await contactsAPI.deleteContact(id);
        showSuccess('删除成功');
        this.loadContacts();
      } catch (error) {
        showError('删除失败');
      }
    }
  },
  
  // 快速拨打电话
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      });
    }
  },
  
  // 复制联系方式
  copyContact(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.currentTarget.dataset.value;
    
    if (value) {
      wx.setClipboardData({
        data: value,
        success: () => {
          showSuccess(`已复制${type}`);
        }
      });
    }
  },
  
  // 预览照片
  previewPhoto(e) {
    const photoUrl = e.currentTarget.dataset.photo;
    
    if (photoUrl) {
      wx.previewImage({
        urls: [photoUrl],
        current: photoUrl
      });
    }
  }
});