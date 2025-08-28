const { apiPost } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');

Page({
  data: {
    uploadVisible: false,
    analyzeResultsVisible: false,
    analyzeResults: '',
  },
  onLoad(options) {},
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
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
      apiPost('analyze-record', data)
        .then((result) => {
          if (result.status === 'OK') {
            this.showToast('分析成功', '战绩分析完成！', 3000);
            this.setData({
              uploadVisible: false,
              analyzeResultsVisible: true,
              analyzeResults: JSON.stringify(result.data, null, 2), // Displaying raw result for now
            });
          } else {
            this.showToast('分析失败', result.error || '未知错误', 3000);
          }
        })
        .catch((err) => {
          console.error('Analysis error:', err);
          this.showToast('分析失败', err.data.error || '未知错误', 5000);
        });
    }
  },
});
