Component({
  data: {
    isVisible: false,
    body: '',
    updates: ''
  },

  methods: {
    show(body, updates) {
      this.setData({
        isVisible: true,
        body: body,
        updates: updates
      });
    },

    hide() {
      this.setData({
        isVisible: false
      });
    },

    _prepareAnnouncementData() {
      return {
        body: this._getAnnouncementBody(),
        updates: this._getAnnouncementLatestUpdates()
      };
    },

    _getAnnouncementBody() {
      return `猎人小姐你好!
    
            欢迎使用深空面板助手 :)
            库中的面板会用于正在开发的分析功能，感谢你的每一条记录分享~
            更多功能也在开发进程中，敬请期待
            公告可前往本助手首页小喇叭重新查看`
    },

    _getAnnouncementLatestUpdates() {
      return `最新更新
            - 2025-08-05：支持卡总等级与备注
            - 2025-07-22：支持沈星回新搭档与日卡
            - 2025-07-07：小程序版支持
            - 2025-07-06：支持识图功能
            - 2025-07-05：开放档案室。登录后上传记录会与微信账号绑定，个人轨道记录可从档案室查看`
    },

    showAnnouncement() {
      const announcementKey = "2.2.0";
      if (wx.getStorageSync(announcementKey)) {
        return null;
      }
    
      wx.setStorageSync(announcementKey, '1');
    
      const data = this._prepareAnnouncementData();
      this.show(data.body, data.updates);
      return data;
    },

    forceDisplayAnnouncement() {
      const data = this._prepareAnnouncementData();
      this.show(data.body, data.updates);
      return data;
    }
  }
});