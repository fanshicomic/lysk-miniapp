import { apiGet, apiPost, apiPut } from '../../utils/util.js';

Page({
  data: {
    nickname: '猎人小姐', // Default nickname
    newNickname: '',
    editingNickname: false,
    orbitRecordsCount: 0,
    latestOrbitRecord: null,
    championshipRecordsCount: 0,
    latestChampionshipRecord: null,
  },

  onLoad: function (options) {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.showToast('无效访问', '请先登录', 2000);
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/index/index' });
      }, 2000);
      return;
    }

    this.fetchUserNickname();
    this.fetchOrbitRecords();
    this.fetchChampionshipRecords();
  },

  onBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

  fetchUserNickname: function () {
    apiGet('user')
      .then((user) => {
        if (user && user.nickname) {
          this.setData({
            nickname: user.nickname,
          });
        }
      })
      .catch((err) => {
        // If the user is not found, or there is any other error,
        // the default nickname will be used.
        console.error('Failed to fetch user nickname:', err);
      });
  },

  fetchOrbitRecords: function () {
    apiGet('all-my-orbit-records', { limit: 1 })
      .then((result) => {
        this.setData({
          orbitRecordsCount: result.total || 0,
          latestOrbitRecord:
            result.records && result.records.length > 0
              ? result.records[0]
              : null,
        });
      })
      .catch((err) => {
        console.error('Failed to fetch orbit records:', err);
      });
  },

  fetchChampionshipRecords: function () {
    apiGet('all-my-championships-records', { limit: 1 })
      .then((result) => {
        this.setData({
          championshipRecordsCount: result.total || 0,
          latestChampionshipRecord:
            result.records && result.records.length > 0
              ? result.records[0]
              : null,
        });
      })
      .catch((err) => {
        console.error('Failed to fetch championship records:', err);
      });
  },

  onEditNickname: function () {
    this.setData({
      editingNickname: true,
    });
  },

  onCancelEditNickname: function () {
    this.setData({
      editingNickname: false,
      newNickname: '',
    });
  },

  onNicknameInput: function (e) {
    this.setData({
      newNickname: e.detail.value,
    });
  },

  onUpdateNickname: function () {
    if (this.data.newNickname.trim() === '') {
      this.showToast('昵称不能为空', '', 2000);
      return;
    }

    apiGet('user')
      .then((user) => {
        if (user) {
          // User exists, so update
          apiPut('user', { nickname: this.data.newNickname })
            .then(() => {
              this.handleUpdateSuccess();
            })
            .catch((err) => {
              this.showToast('更新失败', err.data.error, 2000);
            });
        }
      })
      .catch((err) => {
        if (err.statusCode === 404) {
          // User does not exist, so create
          apiPost('user', { nickname: this.data.newNickname })
            .then(() => {
              this.handleUpdateSuccess();
            })
            .catch((err) => {
              this.showToast('创建失败', err.data.error, 2000);
            });
        } else {
          this.showToast('获取用户信息失败', err.data.error, 2000);
        }
      });
  },

  handleUpdateSuccess: function () {
    this.setData({
      nickname: this.data.newNickname,
      newNickname: '', // Clear the input after update
      editingNickname: false,
    });
    wx.setStorageSync('nickname', this.data.newNickname);
    this.showToast('更新成功', '昵称已更新', 2000);
  },

  showToast(header, body, delay) {
    this.selectComponent('#toast').show(header, body, delay);
  },

  navigateToOrbit: function () {
    wx.navigateTo({ url: '/pages/my-page-orbit/my-page-orbit' });
  },

  navigateToChampionships: function () {
    wx.navigateTo({
      url: '/pages/my-page-championships/my-page-championships',
    });
  },
});
