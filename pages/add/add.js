import { contactsAPIWithLoading } from '../../utils/api.js';
import { validatePhone, validateEmail, showSuccess, showError, compressImage } from '../../utils/util.js';

Page({
  data: {
    name: '',
    phone: '',
    email: '',
    address: '',
    photo: '',
    errors: {
      name: '',
      phone: '',
      email: ''
    },
    isSubmitting: false,
    isUploadingPhoto: false
  },
  
  // 输入处理函数
  onNameInput(e) {
    const name = e.detail.value;
    this.setData({ 
      name,
      'errors.name': this.validateName(name) 
    });
  },
  
  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ 
      phone,
      'errors.phone': this.validatePhone(phone) 
    });
  },
  
  onEmailInput(e) {
    const email = e.detail.value;
    this.setData({ 
      email,
      'errors.email': this.validateEmail(email) 
    });
  },
  
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },
  
  // 验证函数
  validateName(name) {
    if (!name.trim()) return '姓名不能为空';
    if (name.length > 20) return '姓名不能超过20个字符';
    return '';
  },
  
  validatePhone(phone) {
    if (!phone.trim()) return '手机号不能为空';
    if (!validatePhone(phone)) return '请输入正确的手机号';
    return '';
  },
  
  validateEmail(email) {
    if (email && !validateEmail(email)) return '请输入正确的邮箱格式';
    return '';
  },
  
  // 表单验证
  validateForm() {
    const { name, phone, email } = this.data;
    const errors = {
      name: this.validateName(name),
      phone: this.validatePhone(phone),
      email: this.validateEmail(email)
    };
    
    this.setData({ errors });
    
    return !errors.name && !errors.phone && !errors.email;
  },
  
  // 选择照片
  async choosePhoto() {
    try {
      const res = await wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        itemColor: '#92A8D1'
      });
      
      const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
      
      const chooseRes = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: sourceType,
        maxDuration: 30,
        camera: 'back'
      });
      
      if (chooseRes.tempFiles && chooseRes.tempFiles.length > 0) {
        this.setData({ isUploadingPhoto: true });
        
        // 压缩图片
        const compressedPath = await compressImage(chooseRes.tempFiles[0].tempFilePath);
        
        this.setData({
          photo: compressedPath,
          isUploadingPhoto: false
        });
        
        showSuccess('照片上传成功');
      }
    } catch (error) {
      if (error.errMsg !== 'showActionSheet:fail cancel') {
        showError('选择照片失败');
      }
      this.setData({ isUploadingPhoto: false });
    }
  },
  
  // 删除照片
  removePhoto() {
    this.setData({ photo: '' });
    showSuccess('照片已删除');
  },
  
  // 预览照片
  previewPhoto() {
    if (this.data.photo) {
      wx.previewImage({
        urls: [this.data.photo],
        current: this.data.photo
      });
    }
  },
  
  // 提交表单
  async submitForm() {
    if (this.data.isSubmitting) return;
    
    if (!this.validateForm()) {
      showError('请检查表单信息');
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    const { name, phone, email, address, photo } = this.data;
    
    try {
      await contactsAPIWithLoading.addContact({ 
        name: name.trim(), 
        phone: phone.trim(), 
        email: email.trim(), 
        address: address.trim(),
        photo: photo
      });
      
      showSuccess('添加成功');
      
      // 重置表单
      setTimeout(() => {
        this.resetForm();
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      showError('添加失败，请重试');
    } finally {
      this.setData({ isSubmitting: false });
    }
  },
  
  // 重置表单
  resetForm() {
    this.setData({
      name: '',
      phone: '',
      email: '',
      address: '',
      photo: '',
      errors: {
        name: '',
        phone: '',
        email: ''
      }
    });
  },
  
  // 快速填充测试数据
  fillTestData() {
    this.setData({
      name: '测试用户',
      phone: '13812345678',
      email: 'test@example.com',
      address: '北京市朝阳区',
      errors: {
        name: '',
        phone: '',
        email: ''
      }
    });
  }
});