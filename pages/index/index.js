const { apiGet } = require('../../utils/util.js');

const app = getApp();

Page({
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V2.2.0',
    blobs: [],
    showToast: false,
    userInfo: null, // We can keep this for potential future use
    showLoginPanel: false, // Controls the visibility of the login panel
  },

  onLoad(options) {
    apiGet('ping', {});

    const blobCount = 10;
    const blobArray = [];
    for (let i = 0; i < blobCount; i++) {
      blobArray.push(i);
    }

    this.setData({
      blobs: blobArray,
    });

    this.selectComponent('#announcement').showAnnouncement();
  },

  onShow() {
    // Check if a token exists. If not, show the login panel.
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ showLoginPanel: true });
    } else {
      this.setData({ showLoginPanel: false });
    }
  },

  handleLogin() {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // Send the code to the backend to get a token
          this.authenticate(loginRes.code);
        } else {
          console.error('wx.login failed! ' + loginRes.errMsg);
          wx.showToast({
            title: '登录失败',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        console.error('wx.login call failed:', err);
        wx.showToast({
          title: '登录接口调用失败',
          icon: 'none',
        });
      },
    });
  },

  authenticate(code) {
    wx.request({
      url: `${app.globalData.serverHost}/login`,
      method: 'POST',
      data: {
        code: code,
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.token) {
          console.log('Login successful. Received token:', res.data.token);
          wx.setStorageSync('token', res.data.token);
          this.setData({ showLoginPanel: false }); // Hide panel on success
          wx.showToast({
            title: '登录成功',
            icon: 'success',
          });
        } else {
          console.error('Authentication failed on server:', res);
          wx.showToast({
            title: res.data.error || '服务器认证失败',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        console.error('Request to backend failed:', err);
        wx.showToast({
          title: '请求后端失败',
          icon: 'none',
        });
      },
    });
  },

  handleSkipLogin() {
    this.setData({ showLoginPanel: false });
  },

  handleShowAnnouncement() {
    this.selectComponent('#announcement').forceDisplayAnnouncement();
  },

  onShareAppMessage: function (res) {
    return {
      title: '深空面板助手',
      path: '/pages/index/index',
      imageUrl: '/assets/sharing.jpg',
    };
  },

  onShareTimeline: function () {
    return {
      title: '深空面板助手',
      query: 'from=timeline',
      imageUrl: '/assets/sharing.jpg',
    };
  },
});
