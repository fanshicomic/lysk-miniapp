const { apiGet } = require('../../utils/util.js');
const announcementUtil = require('../../utils/announcement.js');
const { LEVEL_TYPES, DROPDOWN_VALUES } = require('../../utils/constants.js');

Page({
  data: {
    panelKeys: ["生命", "攻击", "防御", "暴击", "暴伤", "誓约增伤", "誓约回能", "加速回能", "虚弱增伤", "对谱", "对谱加成", "搭档", "搭档身份", "日卡", "阶数", "武器"],
    levelTypes: ["光", "冰", "火", "能量", "引力", "开放"],
    levelType: '',
    levelNumber: '',
    levelPart: '',
    partVisible: false,
    panelInputs: [],
    actionButtonsVisible: false,
    records: [],
    latestRecords: [],
    totalDbRecordsCnt: 0,

    isToastVisible: false,
    isAnnouncementVisible: false,
    announcementBody: '',
    announcementUpdates: ''
  },

  onLoad(options) {
    // this.showLatestRecords();
    this.dataInit();

    const announcementData = announcementUtil.showAnnouncement();
    if (announcementData) {
      this.setData({
        isAnnouncementVisible: true,
        announcementBody: announcementData.body,
        announcementUpdates: announcementData.updates
      });
    }
  },

  dataInit() {
  },

  handleCloseAnnouncement() {
    this.setData({
      isAnnouncementVisible: false
    });
  },

  // 关卡类型选择
  onLevelTypeChange(e) {
    const type = e.detail.value;
    this.setData({ levelType: type });
    this.validatePartDropdown();
    // this.updatePartnerDropdown();
    this.checkIfReady();
  },

  // 关卡编号输入
  onLevelNumberInput(e) {
    const number = e.detail.value;
    this.setData({ levelNumber: number });
    this.validatePartDropdown();
    // this.checkIfReady();
  },

  // 上下段选择
  onLevelPartChange(e) {
    this.setData({ levelPart: e.detail.value });
    // this.checkIfReady();
  },

  // 校验是否显示上下段
  validatePartDropdown() {
    const { levelType, levelNumber } = this.data;
    // 这里 LEVEL_TYPES 需在 data 或 utils 里定义
    const selected = LEVEL_TYPES.find(l => l.type === levelType);
    const show = selected && levelNumber && levelNumber % 10 === 0 && levelNumber >= 1 && levelNumber <= selected.count;
    this.setData({ partVisible: show });
  },
})