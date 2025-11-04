App({
  onLaunch() {
    console.log('小程序初始化完成');
  },
  
  onShow() {
    console.log('小程序显示');
  },
  
  onHide() {
    console.log('小程序隐藏');
  },
  
  globalData: {
    userInfo: null,
    baseURL: 'http://localhost:3000/api'
  }
});