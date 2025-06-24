// pages/index/index.js

// 引入你的工具函数，注意路径是相对路径
const { apiGet } = require('../../utils/util.js');
const announcementUtil = require('../../utils/announcement.js');

Page({
  /**
   * 页面的初始数据
   * 所有在 .wxml 中用 {{}} 绑定的变量都要在这里定义
   */
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V1.2.3',
    blobs: [], // 用于存储背景气泡
    showToast: false, // 控制公告弹窗的显示
    isAnnouncementVisible: false, // 控制公告弹窗是否显示
    announcementBody: '',         // 公告的主要内容
    announcementUpdates: ''     // 公告的更新日志
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

    const announcementData = announcementUtil.showAnnouncement();
    if (announcementData) {
      // 如果返回了数据，说明需要显示公告
      this.setData({
        isAnnouncementVisible: true,
        announcementBody: announcementData.body,
        announcementUpdates: announcementData.updates
      });
    }
  },

  handleShowAnnouncement() {
    const announcementData = announcementUtil.forceDisplayAnnouncement();
    this.setData({
      isAnnouncementVisible: true,
      announcementBody: announcementData.body,
      announcementUpdates: announcementData.updates
    });
  },

  // 5. 新增一个“关闭公告”的事件处理函数
  handleCloseAnnouncement() {
    this.setData({
      isAnnouncementVisible: false
    });
  }
})