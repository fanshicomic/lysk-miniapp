import { apiGet } from '../../utils/util.js';
import { DROPDOWN_VALUES, partnerColors, partnerPhrase, partnerMap } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

function getTopItems(counts, topN) {
  if (!counts || Object.keys(counts).length === 0) {
    return [];
  }
  return Object.entries(counts)
    .map(([name, count]) => {
      const partner = mapCompanionToPartner(name) || name;
      const rgb = partnerColors[partner];
      const phrase = partnerPhrase[partner];
      const gradient = rgb
        ? `linear-gradient(to right, rgba(${rgb}, 1), rgba(${rgb}, 0))`
        : 'none';
      const img = mapPartnerToEng(partner);
      return { name, count, gradient, img, phrase };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function mapPartnerToEng(name) {
  return partnerMap[name];
}

function mapCompanionToPartner(companionName) {
  for (const partner in partnerMap) {
    const companionList = DROPDOWN_VALUES[partner + '搭档'];
    if (companionList && companionList.includes(companionName)) {
      return partner;
    }
  }
  return null;
}

Page({
  behaviors: [computedBehavior],
  data: {
    today: '',
    nickname: '猎人小姐',
    orbit_record_companion_counts: {"传说中的他": 0},
    orbit_record_partner_counts: {"传说中的他": 0},
    orbit_top_cp_records: [{"level": "传说中的那关", "cp": 0}],
    championships_record_companion_counts: {"传说中的他": 0},
    championships_record_partner_counts: {"传说中的他": 0},
    championships_top_cp_records: [{"level": "传说中的那关", "cp": 0}],
    orbit_level_counts: 0,
    championships_level_counts: 0,
    currentCard: 0,
    totalCards: 8
  },

  computed: {
    getTopOrbitCompanions(data) {
      return getTopItems(data.orbit_record_companion_counts, 5);
    },
    getTopOrbitPartners(data) {
      return getTopItems(data.orbit_record_partner_counts, 5);
    },
    getTopChampionshipsCompanions(data) {
      return getTopItems(data.championships_record_companion_counts, 5);
    },
    getTopChampionshipsPartners(data) {
      return getTopItems(data.championships_record_partner_counts, 5);
    },
  },

  onLoad(options) {
    this.setData({
      today: this.getTodayDate()
    });
    this.fetchNews();
    this.fetchNickname();
  },

  onBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

  onNext() {
    this.setData({
      currentCard: (this.data.currentCard + 1) % this.data.totalCards
    });
  },

  onPrev() {
    this.setData({
      currentCard: (this.data.currentCard - 1 + this.data.totalCards) % this.data.totalCards
    });
  },

  getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDay = day < 10 ? '0' + day : day;
    return `${year}-${formattedMonth}-${formattedDay}`;
  },

  async fetchNews() {
    try {
      const data = await apiGet('user-news');
      this.setData(data);
    } catch (err) {
      console.error('Failed to fetch news data:', err);
    }
  },

  fetchNickname() {
    apiGet('user')
      .then((user) => {
        if (user && user.nickname) {
          this.setData({
            nickname: user.nickname,
          });
        }
      })
      .catch((err) => {
        if (err.statusCode === 401 || err.statusCode === 404) {
          this.showToast('无效访问', '请先登录再查看个人战斗报告哦', 2000);
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/index/index' });
          }, 2000);
          return;
        } else {
          console.error('An unexpected error occurred:', err);
          wx.showToast({
            title: '发生未知错误',
            icon: 'none',
          });
        }
      });
  },

  showToast(header, body, delay) {
    this.selectComponent('#toast').show(header, body, delay);
  },
})