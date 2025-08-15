const { apiGet, apiDelete, apiPut } = require('../../utils/util.js');
const { mapOrbitRecordData } = require('../../utils/record_helper.js');

Page({
  data: {
    levelTypes: ['光', '冰', '火', '能量', '引力', '开放'],
    levelModes: ['稳定', '波动'],
    levelType: '',
    levelNumber: '',
    levelMode: '',
    levelPart: '',
    partVisible: false,

    recordsVisible: false,
    records: [],

    pageSize: 10,
    totalPage: 0,
    currentPage: 1,
    pages: [],

    allRecordsVisible: true,
    allRecords: [],
    totalDbRecordsCnt: 0,
    allRecordsCurrentPage: 1,
    allRecordsTotalPage: 0,
    allRecordsPages: [],
  },

  onLoad(options) {
    this.getAllRecords();
  },
  onBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

  getAllRecords(page = 1) {
    const { pageSize } = this.data;
    const offset = (page - 1) * pageSize;
    apiGet('all-my-orbit-records', { offset })
      .then((result) => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          totalDbRecordsCnt: cnt,
          allRecords: list,
          allRecordsTotalPage: Math.ceil(cnt / pageSize),
          allRecordsCurrentPage: page,
        });
        this.generateAllRecordsPageNumbers();
      })
      .catch((err) => {
        this.showToast('获取失败', err, 5000);
      });
  },

  getRecords(page) {
    const { levelType, levelMode, levelNumber, levelPart, pageSize } =
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
      allRecordsVisible: false,
      currentPage: page,
    });
    apiGet('my-orbit-record', {
      type,
      mode,
      level,
      offset,
    })
      .then((result) => {
        const cnt = result.total || 0;
        const list = result.records || [];
        this.setData({
          totalPage: Math.ceil(cnt / pageSize),
          records: list,
        });
        this.generatePageNumbers();
      })
      .catch((err) => {
        this.showToast('获取失败', err, 5000);
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

  onAllRecordsPageChange: function (e) {
    const selectedPage = e.currentTarget.dataset.page;

    if (selectedPage == this.data.allRecordsCurrentPage) {
      return;
    }

    this.getAllRecords(selectedPage);
  },

  generatePageNumbers: function () {
    const totalPage = this.data.totalPage;
    const currentPage = this.data.currentPage;
    const pages = [];

    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      let startPage, endPage;

      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage > totalPage - 2) {
        startPage = totalPage - 4;
        endPage = totalPage;
      } else {
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

  generateAllRecordsPageNumbers: function () {
    const totalPage = this.data.allRecordsTotalPage;
    const currentPage = this.data.allRecordsCurrentPage;
    const pages = [];

    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      let startPage, endPage;

      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage > totalPage - 2) {
        startPage = totalPage - 4;
        endPage = totalPage;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    this.setData({
      allRecordsPages: pages,
    });
  },

  showToast(header, body, delay) {
    this.selectComponent('#toast').show(header, body, delay);
  },

  onLevelTypeChange(e) {
    const type = e.detail.value;
    this.setData({
      levelType: type,
    });
    if (type !== '开放') {
      this.setData({ levelMode: '稳定' });
    } else {
      this.setData({ levelMode: '' });
    }
  },

  onLevelModeChange(e) {
    const mode = e.detail.value;
    this.setData({
      levelMode: mode,
    });
  },

  onLevelNumberInput(e) {
    const number = e.detail.value;
    this.setData({
      levelNumber: number,
    });
    this.validatePartDropdown();
  },

  onLevelPartChange(e) {
    this.setData({
      levelPart: e.detail.value,
    });
  },

  validatePartDropdown() {
    const { levelNumber } = this.data;
    const show = levelNumber && levelNumber % 10 === 0;
    this.setData({
      partVisible: show,
    });
  },

  handleDeleteRecord: function(e) {
    const recordId = e.detail.recordId;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          apiDelete(`orbit-record/${recordId}`)
            .then(() => {
              this.showToast('删除成功', '记录已成功删除', 2000);
              if (this.data.allRecordsVisible) {
                this.getAllRecords(this.data.allRecordsCurrentPage);
              } else {
                this.getRecords(this.data.currentPage);
              }
            })
            .catch(err => {
              this.showToast('删除失败', err.data.error, 2000);
            });
        }
      }
    });
  },

  handleEditRecord: function(e) {
    const recordId = e.detail.recordId;
    const record = this.data.allRecords.find(r => r.id === recordId) || this.data.records.find(r => r.id === recordId);
    if (record) {
      this.setData({
        recordToEdit: record,
        editFormVisible: true,
        scrollTop: 0
      });
    }
  },

  handleUpdateRecord: function() {
    const uploadForm = this.selectComponent('#upload-form');
    if (uploadForm) {
      const inputData = uploadForm.getInputData();
      const recordId = this.data.recordToEdit.id;
      const data = mapOrbitRecordData(inputData, this.data.recordToEdit);

      apiPut(`orbit-record/${recordId}`, data)
        .then(() => {
          this.showToast('更新成功', '记录已成功更新', 2000);
          this.setData({ editFormVisible: false, recordToEdit: null });
          if (this.data.allRecordsVisible) {
            this.getAllRecords(this.data.allRecordsCurrentPage);
          } else {
            this.getRecords(this.data.currentPage);
          }
        })
        .catch(err => {
          this.showToast('更新失败', err.data.error, 2000);
        });
    }
  },

  handleCancelEdit: function() {
    this.setData({ editFormVisible: false, recordToEdit: null });
  },
});
