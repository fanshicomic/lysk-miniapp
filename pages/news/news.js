import { apiGet } from '../../utils/util.js';
import { DROPDOWN_VALUES } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

const partnerColors = {
  '黎深': '60, 110, 160', // blue
  '沈星回': '255, 205, 70', // yellow
  '祁煜': '60, 10, 100', // purple
  '秦彻': '170, 0, 40', // red
  '夏以昼': '255, 130, 0' // orange
};

const partnerPhrase = {
  '黎深': '不算加班，毕竟是和你一起',
  '沈星回': '下班了还要打流浪体吗？',
  '祁煜': '给流浪体看看我们的默契',
  '秦彻': '小意思，热身都不够',
  '夏以昼': '休息时就打这个放松？陪你'
};

const partnerMap = {
  '沈星回': 'xavier',
  '黎深': 'zayne',
  '祁煜': 'rafayle',
  '秦彻': 'sylus',
  '夏以昼': 'caleb',
};

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
    orbit_record_companion_counts: {},
    championships_record_companion_counts: {},
    orbit_record_partner_counts: {},
    championships_record_partner_counts: {},
    top_most_records_levels: {},
    currentCard: 0,
    totalCards: 5
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