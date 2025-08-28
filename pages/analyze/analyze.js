const { apiPost, apiUploadFile } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');

const computedBehavior = require('miniprogram-computed').behavior;

Page({
  behaviors: [computedBehavior],
  data: {
    uploadVisible: true,
    analyzeResultsVisible: false,
    combatPowerScore: '',
    combatPowerBuffedScore: '',
    combatPowerWeakenScore: '',
    combatPowerNonWeakenScore: '',
  },
  computed: {
    noBuffedCP(data) {
      return (Number(data.combatPowerScore)/100).toFixed(0) || 0;
    },
    buffedCP(data) {
      return (Number(data.combatPowerBuffedScore)/100).toFixed(0) || 0;
    },
    nonWeakenCP(data) {
      return Number(data.combatPowerWeakenScore) || 0;
    },
    weakenCP(data) {
      return Number(data.combatPowerNonWeakenScore) || 0;
    },
    nonWeakenCPPercentage(data) {
      const total = data.nonWeakenCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.nonWeakenCP / total) * 100).toFixed(0);
    },
    weakenCPPercentage(data) {
      const total = data.nonWeakenCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.weakenCP / total) * 100).toFixed(0);
    },
  },
  onLoad(options) {},
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

  showToast(header, body, delay) {
    this.selectComponent('#toast').show(header, body, delay);
  },

  onStartUpload() {
    this.setData({
      uploadVisible: true,
      analyzeResultsVisible: false,
    });
  },

  onAnalyzeAgain() {
      this.setData({
          uploadVisible: true,
          analyzeResultsVisible: false,
      })
  },

  onSubmit() {
    const uploadForm = this.selectComponent('#upload-form');
    if (uploadForm) {
      const inputData = uploadForm.getInputData();
      // For analyze page, battle-type is 'analyze'
      const data = mapRecordData(inputData, this.data, 'analyze');

      // Placeholder for actual analysis API call
      // In a real scenario, you would call an API here and then display results
      console.log('Submitting data for analysis:', data);

      // Simulate an API call and display results
      apiPost('analyze', data)
        .then((result) => {
          this.showToast('分析成功', '战绩分析完成！', 3000);
            const { combat_power } = result;
            console.log(result);
            console.log(combat_power);
            this.setData({
            //   uploadVisible: false,
              analyzeResultsVisible: true,
              combatPowerScore: combat_power.Score,
              combatPowerBuffedScore: combat_power.BuffedScore,
              combatPowerWeakenScore: combat_power.WeakenScore,
              combatPowerNonWeakenScore: combat_power.NonWeakenScore,
            });
            console.log(combat_power.Score);
        })
        .catch((err) => {
          console.error('Analysis error:', err);
          this.showToast('分析失败', err.data.error || '未知错误', 5000);
        });
    }
  },

  onOCR() {
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
});
