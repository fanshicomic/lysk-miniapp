const { apiGet, apiPost } = require('../../utils/util.js');
const { increaseReward } = require('../../utils/analysis_reward');

const app = getApp();
let videoAd = null;

Page({
  data: {
    title: '深空面板助手',
    subTitle: 'Deepspace Battle Helper V3.0.0',
    blobs: [],
    showToast: false,
    userInfo: null,
    showLoginPanel: false,
    rewardPending: false,
    menuButtonInfo: {}
  },

  onLoad(options) {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuButtonInfo: menuButtonInfo
    });
    
    if (wx.createRewardedVideoAd) {
      this.videoAd = wx.createRewardedVideoAd({ // Store ad instance on `this`
        adUnitId: 'adunit-5467103453353e5d'
      });
      this.videoAd.onLoad(() => {});
      this.videoAd.onError((err) => {
        console.error('激励视频广告加载失败', err);
      });
      this.videoAd.onClose((res) => {
        if (res && res.isEnded) {
          // 1. Set the flag instead of calling the function directly
          this.setData({
            rewardPending: true
          });
        }
      });
    }
    // apiGet('ping', {});

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
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ showLoginPanel: true });
      return;
    }

    apiGet('user')
      .then((user) => {
        if (!user) {
          this.setData({ showLoginPanel: true });
          return;
        }
      })
      .catch((err) => {
        if (err.statusCode === 401 || err.statusCode === 404) {
          this.setData({ showLoginPanel: true });
          return;
        } else {
          console.error('An unexpected error occurred:', err);
          // Optionally, show a generic error toast to the user
          wx.showToast({
            title: '发生未知错误',
            icon: 'none',
          });
          this.setData({ showLoginPanel: true });
          return;
        }
      });

    if (this.data.rewardPending) {
      // 3. Grant the reward now that the page is fully active
      increaseReward(3);
      wx.showToast({
        title: '感谢您的支持！分析次数+3',
        icon: 'success'
      });
      
      // 4. Reset the flag
      this.setData({
        rewardPending: false
      });
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

  handleShowAds() {
    wx.showModal({
      title: '支持一下',
      content: '看个广告支持一下开发者吧！',
      success: (res) => {
        if (res.confirm) {
          if (videoAd) {
            videoAd.show().catch(() => {
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败');
                  wx.showToast({
                    title: '广告显示失败',
                    icon: 'none'
                  });
                });
            });
          } else {
            wx.showToast({
              title: '广告加载失败',
              icon: 'none'
            });
          }
        }
      }
    });
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
