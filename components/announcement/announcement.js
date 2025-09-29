Component({
  data: {
    isVisible: false,
    title: '系统公告',
    body: '',
    updates: '',
  },

  methods: {
    show(title, body, updates) {
      this.setData({
        isVisible: true,
        title: title,
        body: body,
        updates: updates,
      });
    },

    hide() {
      this.setData({
        isVisible: false,
      });
    },

    _prepareAnnouncementData() {
      return {
        body: this._getAnnouncementBody(),
        updates: this._getAnnouncementLatestUpdates(),
      };
    },

    _getAnnouncementBody() {
      return `猎人小姐你好!
    
            欢迎使用深空面板助手 :)
            感谢你的每一条记录分享~
            公告可前往首页小喇叭重新查看`;
    },

    _getAnnouncementLatestUpdates() {
      return `最新更新
            - 2025-09-25：支持搭档和日卡的筛选
            - 2025-09-22：支持黎深新搭档与日卡
            - 2025-09-02：
              - 增加战力显示、通关推荐、面板分析
              - 增加趣闻报页面，可以查看基于库中面板的数据统计
            - 2025-08-17：
              - 支持编辑与删除个人面板记录
              - 波动模式支持选择星级
            - 2025-08-08：
              - 个人档案室新改版
              - 用户可设置昵称，记录有备注时会显示个人昵称
            - 2025-08-05：支持卡总等级与备注
            - 2025-07-22：支持沈星回新搭档与日卡
            - 2025-07-07：小程序版支持`;
    },

    showAnnouncement() {
      const announcementKey = '3.1.0';
      if (wx.getStorageSync(announcementKey)) {
        return null;
      }

      wx.setStorageSync(announcementKey, '1');

      const data = this._prepareAnnouncementData();
      this.show(data.title, data.body, data.updates);
      return data;
    },

    forceDisplayAnnouncement() {
      const data = this._prepareAnnouncementData();
      this.show(data.title, data.body, data.updates);
      return data;
    },
  },
});
