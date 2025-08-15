const { apiGet, apiDelete, apiPut } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');

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
  },

  onLoad(options) {
    this.dataInit();

    this.selectComponent('#announcement').showAnnouncement();
  },
  onBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

  dataInit() {
    apiGet('all-my-championships-records', {})
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
    const { levelType, pageSize } = this.data;
    if (!Number.isInteger(page)) {
      page = 1;
    }
    const level = levelType;
    const offset = (page - 1) * pageSize;
    this.setData({
      recordsVisible: true,
      latestRecordsVisible: false,
      currentPage: page,
    });
    apiGet('my-championships-record', {
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

  handleDeleteRecord: function(e) {
    const recordId = e.detail.recordId;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          apiDelete(`championships-record/${recordId}`)
            .then(() => {
              this.showToast('删除成功', '记录已成功删除', 2000);
              if (this.data.latestRecordsVisible) {
                this.dataInit();
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
    console.log("Edit button clicked, recordId:", e.detail.recordId);
    const recordId = e.detail.recordId;
    const record = this.data.latestRecords.find(r => r.id === recordId) || this.data.records.find(r => r.id === recordId);
    console.log("Found record to edit:", record);
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
      const data = mapRecordData(inputData, this.data.recordToEdit, 'championships');

      apiPut(`championships-record/${recordId}`, data)
        .then(() => {
          this.showToast('更新成功', '记录已成功更新', 2000);
          this.setData({ editFormVisible: false, recordToEdit: null });
          if (this.data.latestRecordsVisible) {
            this.dataInit();
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
