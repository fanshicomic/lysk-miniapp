const { apiGet } = require('../../utils/util.js');
const announcementUtil = require('../../utils/announcement.js');

Page({
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V1.2.3',
    blobs: [],
    showToast: false,
    isAnnouncementVisible: false,
    announcementBody: '',
    announcementUpdates: ''
  },

  onLoad(options) {
    apiGet('ping', {});

    const blobCount = 10;
    const blobArray = [];
    for (let i = 0; i < blobCount; i++) {
      blobArray.push(i);
    }
    
    this.setData({
      blobs: blobArray
    });

    const announcementData = announcementUtil.showAnnouncement();
    if (announcementData) {
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

  handleCloseAnnouncement() {
    this.setData({
      isAnnouncementVisible: false
    });
  }
})