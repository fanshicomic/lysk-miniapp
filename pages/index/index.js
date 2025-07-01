const { apiGet } = require('../../utils/util.js');
const announcementUtil = require('../../utils/announcement.js');

Page({
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V1.3.0',
    blobs: [],
    showToast: false,
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
      this.selectComponent('#announcement').show(announcementData.body, announcementData.updates);
    }
  },

  handleShowAnnouncement() {
    const announcementData = announcementUtil.forceDisplayAnnouncement();
    this.selectComponent('#announcement').show(announcementData.body, announcementData.updates);
  },
})