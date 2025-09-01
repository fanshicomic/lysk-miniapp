import { apiGet } from '../../utils/util.js';

const computedBehavior = require('miniprogram-computed').behavior;

const partnerColors = {
  '黎深': '60, 110, 160', // blue
  // '黎深': '0, 0, 0', // blue
  '沈星回': '255, 255, 0', // yellow
  '祁煜': '60, 10, 100', // purple
  '秦彻': '170, 0, 40', // red
  '夏以昼': '255, 130, 0' // orange
};

function getTopItems(counts, topN) {
  if (!counts || Object.keys(counts).length === 0) {
    return [];
  }
  return Object.entries(counts)
    .map(([name, count]) => {
      const rgb = partnerColors[name];
      const gradient = rgb
        ? `linear-gradient(to right, rgba(${rgb}, 1), rgba(${rgb}, 0))`
        : 'none';
      const img = mapPartnerToPng(name);
      return { name, count, gradient, img };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function mapPartnerToPng(name) {
  let partnerMap = {
    '沈星回': 'xavier',
    '黎深': 'zayne',
    '祁煜': 'rafayle',
    '秦彻': 'sylus',
    '夏以昼': 'caleb',
  }
  return partnerMap[name];
}

Page({
  behaviors: [computedBehavior],
  data: {
    today: '',
    orbit_record_companion_counts: {},
    championships_record_companion_counts: {},
    orbit_record_partner_counts: {},
    championships_record_partner_counts: {},
    currentCard: 0,
    totalCards: 4
  },

  computed: {
    getTopOrbitCompanions(data) {
      return getTopItems(data.orbit_record_companion_counts, 3);
    },
    getTopOrbitPartners(data) {
      return getTopItems(data.orbit_record_partner_counts, 5);
    },
    getTopChampionshipsCompanions(data) {
      return getTopItems(data.championships_record_companion_counts, 3);
    },
    getTopChampionshipsPartners(data) {
      return getTopItems(data.championships_record_partner_counts, 5);
    },
  },

  onLoad(options) {
    this.setData({
      today: this.getTodayDate()
    });
    this.fetchCounts();
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

  async fetchCounts() {
    try {
      const data = await apiGet('news');
      this.setData(data);
    } catch (err) {
      console.error('Failed to fetch news data:', err);
    }
  },
})