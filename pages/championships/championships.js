const { apiGet, apiPost, apiUploadFile } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');
const { increaseReward } = require('../../utils/analysis_reward');
const { DROPDOWN_VALUES } = require('../../utils/constants.js');

Page({
  data: {
    levelTypes: ['A4', 'B4', 'C4'],
    levelType: '',
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

    filterCompanionOptions: {
      '所有搭档': [],
      '沈星回': DROPDOWN_VALUES['沈星回搭档'],
      '黎深': DROPDOWN_VALUES['黎深搭档'],
      '祁煜': DROPDOWN_VALUES['祁煜搭档'],
      '秦彻': DROPDOWN_VALUES['秦彻搭档'],
      '夏以昼': DROPDOWN_VALUES['夏以昼搭档'],
    },
    filterSetcardOptions: {
      '所有日卡': [],
      '沈星回': DROPDOWN_VALUES['沈星回日卡'],
      '黎深': DROPDOWN_VALUES['黎深日卡'],
      '祁煜': DROPDOWN_VALUES['祁煜日卡'],
      '秦彻': DROPDOWN_VALUES['秦彻日卡'],
      '夏以昼': DROPDOWN_VALUES['夏以昼日卡'],
    },
    filteredCompanion: null,
    filteredSetCard: null,
  },

  onApplyFilterFromComponent(e) {
    this.setData({
      filteredCompanion: e.detail.selectedCompanion.secondLevel ? 
        e.detail.selectedCompanion.secondLevel : e.detail.selectedCompanion,
      filteredSetCard: e.detail.selectedSetcard.secondLevel ? 
        e.detail.selectedSetcard.secondLevel : e.detail.selectedSetcard,
    });
    // Now call getRecords with the new filters
    this.getRecords(1); // Assuming we want to reset to page 1 with new filters
  },

  onLoad(options) {
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
    apiGet('latest-championships-records', {})
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

  getRecords(page = 1) {
    const { levelType, pageSize, filteredCompanion, filteredSetCard } = this.data;
    if (!Number.isInteger(page)) {
      page = 1;
    }
    const level = levelType;
    const offset = (page - 1) * pageSize;
    this.setData({
      recordsVisible: true,
      latestRecordsVisible: false,
      uploadVisible: false,
      currentPage: page,
    });
    apiGet('championships-records', {
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
        return apiGet(
          'level-suggestion', {
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
  },

  onStartUpload() {
    this.setData({
      uploadVisible: true,
      latestRecordsVisible: false,
      recordsVisible: false,
    });
  },

  onOcrUpload() {
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
      const data = mapRecordData(inputData, this.data, 'championships');

      apiPost('championships-record', data)
        .then((result) => {
          if (result.status === 'OK') {
            increaseReward(1);
            this.showToast('上传成功', 'Thanks♪(･ω･)ﾉ奖励分析次数+1', 3000);
            this.setData({ uploadVisible: false });
            this.getRecords();
          } else {
            this.showToast('上传失败', result.error || '未知错误', 3000);
          }
        })
        .catch((err) => {
          this.showToast('上传失败', err.data.error || '未知错误', 5000);
        });
    }
  },
});
