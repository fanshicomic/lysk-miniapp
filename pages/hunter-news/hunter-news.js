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
    orbit_record_companion_counts: {},
    championships_record_companion_counts: {},
    orbit_record_partner_counts: {},
    championships_record_partner_counts: {},
    top_most_records_levels: {},
    orbit_level_counts: 0,
    currentCard: 0,
    totalCards: 6
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
      const data = await apiGet('news');
      this.setData(data);
    } catch (err) {
      console.error('Failed to fetch news data:', err);
    }
  },
})