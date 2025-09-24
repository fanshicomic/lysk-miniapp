const { apiGet, apiPost, apiUploadFile } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');
const { increaseReward } = require('../../utils/analysis_reward');

const { LEVEL_TYPES, DROPDOWN_VALUES } = require('../../utils/constants.js');

Page({
  data: {
    levelTypes: ['光', '冰', '火', '能量', '引力', '开放'],
    levelModes: ['稳定', '波动'],
    levelType: '',
    levelNumber: '',
    levelMode: '',
    levelPart: '',
    partVisible: false,
    panelInputs: [],
    actionButtonsVisible: false,
    uploadVisible: false,

    recordsVisible: false,
    records: [],

    pageSize: 10,
    totalPage: 0,
    currentPage: 1,
    pages: [],

    latestRecordsVisible: true,
    latestRecords: [],
    totalDbRecordsCnt: 0,
    levelSuggestions: null,
    
    _allFilterCompanionOptions: {
      '所有搭档': [],
      '沈星回': DROPDOWN_VALUES['沈星回搭档'],
      '黎深': DROPDOWN_VALUES['黎深搭档'],
      '祁煜': DROPDOWN_VALUES['祁煜搭档'],
      '秦彻': DROPDOWN_VALUES['秦彻搭档'],
      '夏以昼': DROPDOWN_VALUES['夏以昼搭档'],
    },
    _allFilterSetcardOptions: {
      '所有日卡': [],
      '沈星回': DROPDOWN_VALUES['沈星回日卡'],
      '黎深': DROPDOWN_VALUES['黎深日卡'],
      '祁煜': DROPDOWN_VALUES['祁煜日卡'],
      '秦彻': DROPDOWN_VALUES['秦彻日卡'],
      '夏以昼': DROPDOWN_VALUES['夏以昼日卡'],
    },
    filterCompanionOptions: {},
    filterSetcardOptions: {},
    filteredCompanion: null,
    filteredSetCard: null,
  },

  onApplyFilterFromComponent(e) {
    this.setData({
      filteredCompanion: e.detail.selectedCompanion ? (e.detail.selectedCompanion.secondLevel ? e.detail.selectedCompanion.secondLevel : e.detail.selectedCompanion.topLevel) : null,
      filteredSetCard: e.detail.selectedSetcard ? (e.detail.selectedSetcard.secondLevel ? e.detail.selectedSetcard.secondLevel : e.detail.selectedSetcard.topLevel) : null,
    });
    // Now call getRecords with the new filters
    this.getRecords(1); // Assuming we want to reset to page 1 with new filters
  },

  onLoad(options) {
    this.setData({
      filterCompanionOptions: this.data._allFilterCompanionOptions,
      filterSetcardOptions: this.data._allFilterSetcardOptions,
    });
    this.dataInit();

    this.selectComponent('#announcement').showAnnouncement();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected();
    }
  },
  onBack() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },

  dataInit() {
    apiGet('latest-orbit-records', {})
      .then((result) => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          totalDbRecordsCnt: cnt,
          latestRecords: list,
        });
      })
      .catch((err) => {
        this.showToast('获取失败', err, 5000);
      });
  },

  getRecords(page) {
    const { levelType, levelMode, levelNumber, levelPart, pageSize, filteredCompanion, filteredSetCard } =
      this.data;
    if (!Number.isInteger(page)) {
      page = 1;
    }
    const type = levelType;
    const mode = levelMode;
    const level = levelPart ? levelNumber + '_' + levelPart : levelNumber;
    const offset = (page - 1) * pageSize;
    this.setData({
      recordsVisible: true,
      latestRecordsVisible: false,
      uploadVisible: false,
      currentPage: page,
    });
    apiGet('orbit-records', {
      type,
      mode,
      level,
      offset,
      filteredCompanion,
      filteredSetCard
    })
      .then((result) => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          totalPage: Math.ceil(cnt / pageSize),
          records: list,
        });
        this.generatePageNumbers();

        // After fetching records, fetch level suggestions
        return apiGet('level-suggestion', {
          type,
          mode,
          level,
          filteredCompanion,
          filteredSetCard
        });
      })
      .then((suggestionResult) => {
        this.setData({
          levelSuggestions: suggestionResult,
        });
      })
      .catch((err) => {
        this.showToast('获取失败', err, 5000);
        this.setData({
          levelSuggestions: null, // Clear suggestions on error
        });
      });
  },

  onPageChange: function (e) {
    const selectedPage = e.currentTarget.dataset.page;

    if (selectedPage == this.data.currentPage) {
      return;
    }

    this.setData({
      currentPage: selectedPage,
    });

    this.getRecords(selectedPage);
  },

  generatePageNumbers: function () {
    const totalPage = this.data.totalPage;
    const currentPage = this.data.currentPage;
    const pages = [];

    if (totalPage <= 5) {
      // If 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      // If more than 5 pages, calculate the window
      let startPage, endPage;

      if (currentPage <= 3) {
        // If near the beginning, show pages 1-5
        startPage = 1;
        endPage = 5;
      } else if (currentPage > totalPage - 2) {
        // If near the end, show the last 5 pages
        startPage = totalPage - 4;
        endPage = totalPage;
      } else {
        // Otherwise, center the current page
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    this.setData({
      pages: pages,
    });
  },

  showToast(header, body, delay) {
    this.selectComponent('#toast').show(header, body, delay);
  },

  // 关卡类型选择
  onLevelTypeChange(e) {
    const type = e.detail.value;
    this.setData({
      levelType: type,
    });

    let companionOptions = this.data._allFilterCompanionOptions;
    let setcardOptions = this.data._allFilterSetcardOptions;
    if (type !== '开放') {
      let companionList = {};
      let setcardList = {};
      companionOptions = {};
      setcardOptions = {};
      switch (type) {
        case "光":
          companionList = DROPDOWN_VALUES['沈星回搭档'];
          setcardList = DROPDOWN_VALUES['沈星回日卡'];
          break;
        case "冰":
          companionList = DROPDOWN_VALUES['黎深搭档'];
          setcardList = DROPDOWN_VALUES['黎深日卡'];
          break;
        case "火":
          companionList = DROPDOWN_VALUES['祁煜搭档'];
          setcardList = DROPDOWN_VALUES['祁煜日卡'];
          break;
        case "能量":
          companionList = DROPDOWN_VALUES['秦彻搭档'];
          setcardList = DROPDOWN_VALUES['秦彻日卡'];
          break;
        case "引力":
          companionList = DROPDOWN_VALUES['夏以昼搭档'];
          setcardList = DROPDOWN_VALUES['夏以昼日卡'];
          break;
      }

      companionList.forEach(function(c) {
        companionOptions[c] = [];
      });
      setcardList.forEach(function(c) {
        setcardOptions[c] = [];
      });

      this.setData({
        levelMode: '稳定',
        filterCompanionOptions: companionOptions,
        filterSetcardOptions: setcardOptions,
      });
    } else {
      this.setData({
        levelMode: '',
        filterCompanionOptions: companionOptions,
        filterSetcardOptions: setcardOptions,
      });
    }
    this.checkIfReady();
  },

  onLevelModeChange(e) {
    const mode = e.detail.value;
    this.setData({
      levelMode: mode,
    });
    this.checkIfReady();
  },

  // 关卡编号输入
  onLevelNumberInput(e) {
    const number = e.detail.value;
    this.setData({
      levelNumber: number,
    });
    this.validatePartDropdown();
    this.checkIfReady();
  },

  // 上下段选择
  onLevelPartChange(e) {
    this.setData({
      levelPart: e.detail.value,
    });
    this.checkIfReady();
  },

  // 校验是否显示上下段
  validatePartDropdown() {
    const { levelNumber, levelMode } = this.data;
    const show = levelNumber && (levelNumber % 10 === 0 || (levelMode === "波动" && levelNumber % 5 === 0));
    this.setData({
      partVisible: show,
    });
  },

  checkIfReady() {
    const type = this.data.levelType;
    const mode = this.data.levelMode;
    const number = parseInt(this.data.levelNumber);
    if (mode === '') {
      return;
    }

    const levelUpperBound = LEVEL_TYPES[mode].find((l) => l.type === type);
    let visible = false;
    if (type && number && levelUpperBound) {
      const isValidNumber = number >= 1 && number <= levelUpperBound.count;
      if (isValidNumber) {
        if (number % 10 !== 0) {
          visible = true;
        } else if (
          this.data.levelPart === '上' ||
          this.data.levelPart === '下'
        ) {
          visible = true;
        }
      }
    }
    this.setData({
      actionButtonsVisible: visible,
    });
  },

  onStartUpload() {
    this.setData({
      uploadVisible: true,
      latestRecordsVisible: false,
      recordsVisible: false,
    });
  },

  onOCRUpload() {
    if (!this.data.uploadVisible) {
      this.setData({
        uploadVisible: true,
        latestRecordsVisible: false,
        recordsVisible: false,
      });
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({
          title: '识图中...',
        });
        apiUploadFile('ocr', tempFilePath, 'photo')
          .then((result) => {
            wx.hideLoading();
            if (result.result) {
              const uploadForm = this.selectComponent('#upload-form');
              if (uploadForm) {
                const currentValues = uploadForm.data.inputValues;
                const newValues = { ...currentValues, ...result.result };
                uploadForm.setData({
                  inputValues: newValues,
                });
              }
              this.showToast(
                '识图成功',
                '识图精度有限，请确认数据是否正确!',
                5000
              );
            } else {
              this.showToast(
                '识图失败',
                result.error + ', ' + result.detail,
                5000
              );
            }
          })
          .catch((err) => {
            wx.hideLoading();
            this.showToast('上传失败', '请检查网络连接', 5000);
            console.error('OCR upload failed:', err);
          });
      },
    });
  },

  onSubmit() {
    const uploadForm = this.selectComponent('#upload-form');
    if (uploadForm) {
      const inputData = uploadForm.getInputData();
      const data = mapRecordData(inputData, this.data, 'orbit');

      apiPost('orbit-record', data)
        .then((result) => {
          if (result.status === 'OK') {
            increaseReward(1);
            this.showToast('上传成功', 'Thanks♪(･ω･)ﾉ奖励分析次数+1', 3000);
            this.setData({ uploadVisible: false });
            this.getRecords(1);
          } else {
            this.showToast('上传失败', result.error || '未知错误', 3000);
          }
        })
        .catch((err) => {
          this.showToast('上传失败', err.data.error, 5000);
        });
    }
  },
});
