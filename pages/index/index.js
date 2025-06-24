// pages/index/index.js

// 引入你的工具函数，注意路径是相对路径
const { apiGet } = require('../../utils/util.js');
const { showAnnouncement, forceDisplayAnnouncement } = require('../../utils/announcement.js');

Page({
  /**
   * 页面的初始数据
   * 所有在 .wxml 中用 {{}} 绑定的变量都要在这里定义
   */
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V1.2.3',
    blobs: [], // 用于存储背景气泡
    showToast: false // 控制公告弹窗的显示
  },

  /**
   * 生命周期函数--监听页面加载
   * 页面加载时执行，相当于你的 <script> 里的初始化代码
   */
  onLoad(options) {
    // 1. wake up a server
    apiGet('ping', {});

    // 2. show announcement
    // showAnnouncement();

    // 3. 创建背景气泡
    // 小程序里不能直接操作DOM，而是通过改变data来驱动UI
    const blobCount = 10;
    const blobArray = [];
    for (let i = 0; i < blobCount; i++) {
      blobArray.push(i);
    }
    // 使用 this.setData 更新数据，WXML会自动渲染
    this.setData({
      blobs: blobArray
    });

    // 你需要在 WXML 里用 wx:for 来循环渲染这些气泡
    // <view class="blobs">
    //   <view wx:for="{{blobs}}" wx:key="index" class="blob"></view>
    // </view>
  },

  /**
   * 用户自定义的事件处理函数
   */
  handleShowAnnouncement: function() {
    // 这里不能直接操作DOM来显示弹窗
    // 而是改变 data 里的变量
    this.setData({
      showToast: true
    });
    
    // 或者调用你封装的函数
    forceDisplayAnnouncement(); 
  }

  // ... 其他生命周期函数和自定义函数
})