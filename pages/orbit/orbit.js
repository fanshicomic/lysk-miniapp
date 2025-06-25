const { apiGet, apiPost } = require('../../utils/util.js');
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
    uploadVisible: false,

    recordsVisible: false,
    records: [],
    pageSize: 10,
    page: 1,

    latestRecordsVisible: true,
    latestRecords: [],
    totalDbRecordsCnt: 0,

    isToastVisible: false,
    toastHeader: '',
    toastBody: '',
    isAnnouncementVisible: false,
    announcementBody: '',
    announcementUpdates: ''
  },

  onLoad(options) {
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
  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  dataInit() {
    apiGet('latest-orbit-records', {})
    .then(result => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          totalDbRecordsCnt: cnt,
          latestRecords: list
        });
      })
      .catch(err => {
        console.error("获取失败", err);
        this.showToast("获取失败", err, 5000)
      });
  },

  getRecords() {
    const { levelType, levelNumber, page, pageSize } = this.data;
    const type = levelType;
    const level = levelNumber;
    const offset = (page - 1) * pageSize;
    console.log
    this.setData({
        recordsVisible: true,
        latestRecordsVisible: false
    });
    apiGet('orbit-records', {type, level, offset})
    .then(result => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          page: Math.ceil(cnt / this.pageSize),
          records: list
        });
      })
      .catch(err => {
        console.error("获取失败", err);
        this.showToast("获取失败", err, 5000)
      });
  },

  handleCloseAnnouncement() {
    this.setData({
      isAnnouncementVisible: false
    });
  },

  showToast(header, body, delay) {
    this.data.toastHeader = header;
    this.data.toastBody = body;
    this.data.isToastVisible = true;

    setTimeout(() => {
        this.data.toastHeader = '';
        this.data.toastBody = '';
        this.data.isToastVisible = false;
    }, delay)
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
    this.checkIfReady();
  },

  // 上下段选择
  onLevelPartChange(e) {
    this.setData({ levelPart: e.detail.value });
    this.checkIfReady();
  },

  // 校验是否显示上下段
  validatePartDropdown() {
    const { levelType, levelNumber } = this.data;
    // 这里 LEVEL_TYPES 需在 data 或 utils 里定义
    const selected = LEVEL_TYPES.find(l => l.type === levelType);
    const show = selected && levelNumber && levelNumber % 10 === 0 && levelNumber >= 1 && levelNumber <= selected.count;
    this.setData({ partVisible: show });
  },

  checkIfReady() {
    const type = this.data.levelType;
    const number = parseInt(this.data.levelNumber);
    const levelUpperBound = LEVEL_TYPES.find(l => l.type === type);
    let visible = false;
    if (type && number && levelUpperBound) {
        const isValidNumber = number >= 1 && number <= levelUpperBound.count;
        if (isValidNumber) {
            if (number % 10 !== 0) {
                visible = true;
            } else if (this.data.levelPart === "上" || this.data.levelPart === "下") {
                visible = true;
            }
        }
    }
    this.setData({ actionButtonsVisible: visible });
  },
})