import { contactsAPIWithLoading } from '../../utils/api.js';
import { validatePhone, validateEmail, showSuccess, showError, compressImage, deepClone } from '../../utils/util.js';

Page({
  data: {
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    photo: '',
    originalData: null,
    errors: {
      name: '',
      phone: '',
      email: ''
    },
    isSubmitting: false,
    hasChanges: false,
    isUploadingPhoto: false
  },
  
  onLoad: function(options) {
    var id = options.id;
    if (id) {
      this.setData({ id: id });
      this.loadContactDetail(id);
    } else {
      showError('无效的联系人ID');
      wx.navigateBack();
    }
  },
  
  // 加载联系人详情
  loadContactDetail: function(id) {
    var that = this;
    contactsAPIWithLoading.getContacts().then(function(contacts) {
      var contact = contacts.find(function(item) {
        return item.id == id;
      });
      
      if (contact) {
        that.setData({
          name: contact.name || '',
          phone: contact.phone || '',
          email: contact.email || '',
          address: contact.address || '',
          photo: contact.photo || '',
          originalData: deepClone(contact)
        });
        
        // 初始化后检查更改状态
        that.updateChanges();
      } else {
        showError('联系人不存在');
        setTimeout(function() {
          wx.navigateBack();
        }, 2000);
      }
    }).catch(function(error) {
      showError('加载失败');
      console.error('加载联系人详情失败:', error);
    });
  },
  
  // 输入处理函数
  onNameInput: function(e) {
    var name = e.detail.value;
    var errors = this.data.errors;
    errors.name = this.validateName(name);
    
    this.setData({ 
      name: name,
      errors: errors
    });
    this.updateChanges();
  },
  
  onPhoneInput: function(e) {
    var phone = e.detail.value;
    var errors = this.data.errors;
    errors.phone = this.validatePhone(phone);
    
    this.setData({ 
      phone: phone,
      errors: errors
    });
    this.updateChanges();
  },
  
  onEmailInput: function(e) {
    var email = e.detail.value;
    var errors = this.data.errors;
    errors.email = this.validateEmail(email);
    
    this.setData({ 
      email: email,
      errors: errors
    });
    this.updateChanges();
  },
  
  onAddressInput: function(e) {
    var address = e.detail.value;
    this.setData({ 
      address: address
    });
    this.updateChanges();
  },
  
  // 验证函数
  validateName: function(name) {
    if (!name || !name.trim()) return '姓名不能为空';
    if (name.length > 20) return '姓名不能超过20个字符';
    return '';
  },
  
  validatePhone: function(phone) {
    if (!phone || !phone.trim()) return '手机号不能为空';
    if (!validatePhone(phone)) return '请输入正确的手机号';
    return '';
  },
  
  validateEmail: function(email) {
    if (email && email.trim() && !validateEmail(email)) return '请输入正确的邮箱格式';
    return '';
  },
  
  // 选择照片
  choosePhoto: function() {
    var that = this;
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      itemColor: '#92A8D1',
      success: function(res) {
        var sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: sourceType,
          maxDuration: 30,
          camera: 'back',
          success: function(chooseRes) {
            if (chooseRes.tempFiles && chooseRes.tempFiles.length > 0) {
              that.setData({ isUploadingPhoto: true });
              
              // 压缩图片
              compressImage(chooseRes.tempFiles[0].tempFilePath).then(function(compressedPath) {
                that.setData({
                  photo: compressedPath,
                  isUploadingPhoto: false
                });
                that.updateChanges();
                showSuccess('照片更新成功');
              }).catch(function(error) {
                that.setData({ isUploadingPhoto: false });
                showError('图片压缩失败');
              });
            }
          },
          fail: function(error) {
            if (error.errMsg !== 'chooseMedia:fail cancel') {
              showError('选择照片失败');
            }
            that.setData({ isUploadingPhoto: false });
          }
        });
      },
      fail: function(error) {
        if (error.errMsg !== 'showActionSheet:fail cancel') {
          showError('操作失败');
        }
      }
    });
  },
  
  // 删除照片
  removePhoto: function() {
    this.setData({ 
      photo: ''
    });
    this.updateChanges();
    showSuccess('照片已删除');
  },
  
  // 预览照片
  previewPhoto: function() {
    if (this.data.photo) {
      wx.previewImage({
        urls: [this.data.photo],
        current: this.data.photo
      });
    }
  },
  
  // 更新更改状态
  updateChanges: function() {
    var that = this;
    // 使用 setTimeout 确保在数据更新后检查
    setTimeout(function() {
      var hasChanges = that.checkChanges();
      that.setData({ hasChanges: hasChanges });
    }, 50);
  },
  
  // 检查是否有更改
  checkChanges: function() {
    var originalData = this.data.originalData;
    var name = this.data.name;
    var phone = this.data.phone;
    var email = this.data.email;
    var address = this.data.address;
    var photo = this.data.photo;
    
    if (!originalData) {
      return false;
    }
    
    // 简单的字符串比较
    var nameChanged = (name || '') !== (originalData.name || '');
    var phoneChanged = (phone || '') !== (originalData.phone || '');
    var emailChanged = (email || '') !== (originalData.email || '');
    var addressChanged = (address || '') !== (originalData.address || '');
    var photoChanged = (photo || '') !== (originalData.photo || '');
    
    var hasChanged = nameChanged || phoneChanged || emailChanged || addressChanged || photoChanged;
    
    return hasChanged;
  },
  
  // 表单验证
  validateForm: function() {
    var name = this.data.name;
    var phone = this.data.phone;
    var email = this.data.email;
    
    var errors = {
      name: this.validateName(name),
      phone: this.validatePhone(phone),
      email: this.validateEmail(email)
    };
    
    this.setData({ errors: errors });
    
    var isValid = !errors.name && !errors.phone && !errors.email;
    
    return isValid;
  },
  
  // 提交修改
  submitForm: function() {
    console.log('提交表单被点击');
    
    if (this.data.isSubmitting) {
      console.log('正在提交中，跳过');
      return;
    }
    
    // 表单验证
    if (!this.validateForm()) {
      console.log('表单验证失败');
      showError('请检查表单信息');
      return;
    }
    
    // 强制检查一次更改
    var currentChanges = this.checkChanges();
    if (!currentChanges) {
      console.log('没有检测到更改');
      showError('没有检测到更改');
      return;
    }
    
    console.log('开始提交数据...');
    this.setData({ isSubmitting: true });
    
    var that = this;
    var id = this.data.id;
    var updateData = {
      name: (this.data.name || '').trim(),
      phone: (this.data.phone || '').trim(),
      email: (this.data.email || '').trim(),
      address: (this.data.address || '').trim(),
      photo: this.data.photo || ''
    };
    
    contactsAPIWithLoading.updateContact(id, updateData).then(function(result) {
      console.log('保存成功');
      showSuccess('保存成功');
      
      // 更新原始数据
      var originalData = that.data.originalData;
      if (originalData) {
        originalData.name = updateData.name;
        originalData.phone = updateData.phone;
        originalData.email = updateData.email;
        originalData.address = updateData.address;
        originalData.photo = updateData.photo;
        
        that.setData({
          originalData: originalData,
          hasChanges: false,
          isSubmitting: false
        });
      }
      
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
      
    }).catch(function(error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
      that.setData({ isSubmitting: false });
    });
  },
  
  // 重置表单
  resetForm: function() {
    var originalData = this.data.originalData;
    if (originalData) {
      this.setData({
        name: originalData.name || '',
        phone: originalData.phone || '',
        email: originalData.email || '',
        address: originalData.address || '',
        photo: originalData.photo || '',
        errors: {
          name: '',
          phone: '',
          email: ''
        }
      });
      this.updateChanges();
      showSuccess('表单已重置');
    }
  },
  
  // 返回确认
  onBack: function() {
    if (this.data.hasChanges) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的更改，确定要返回吗？',
        confirmColor: '#92A8D1',
        success: function(res) {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});