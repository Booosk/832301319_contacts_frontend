# 代码规范文档

基于微信小程序官方开发规范和行业最佳实践

## 1. 文件命名规范
- 页面文件：小写字母，如 `index`, `add-contact`
- 组件文件：小写字母+连字符，如 `user-card`
- JS文件：小驼峰命名，如 `contactManager.js`
## 2. 目录结构规范
project/
├── pages/ # 页面文件
├── components/ # 自定义组件
├── utils/ # 工具函数
├── images/ # 图片资源
└── styles/ # 样式文件

## 3. JavaScript 规范
- 使用 ES6+ 语法
- 变量使用 const/let
- 函数使用箭头函数
- 导出使用 export/import

## 4. WXML 规范
- 使用2个空格缩进
- 属性使用双引号
- 标签必须正确闭合

## 5. CSS 规范
- 使用 rpx 单位
- 类名使用小写连字符
- 遵循 BEM 命名规范
