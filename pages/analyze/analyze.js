const { apiPost, apiUploadFile } = require('../../utils/util.js');
const { mapRecordData } = require('../../utils/record_helper.js');

const computedBehavior = require('miniprogram-computed').behavior;

const formatNumberWithCommas = (number) => {
  if (number === undefined || number === null) {
    return '0';
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

Page({
  behaviors: [computedBehavior],
  data: {
    uploadVisible: true,
    // analyzeResultsVisible: true,
    combatPowerScore: '',
    combatPowerBuffedScore: '',
    combatPowerWeakenScore: '',
    combatPowerNonWeakenScore: '',
    scrollToView: '',
  },
  computed: {
    noBuffedCP(data) {
      return (Number(data.combatPowerScore) / 100).toFixed(0) || 0;
    },
    buffedCP(data) {
      return (Number(data.combatPowerBuffedScore) / 100).toFixed(0) || 0;
    },
    formattedNoBuffedCP(data) {
      return formatNumberWithCommas(data.noBuffedCP);
    },
    formattedBuffedCP(data) {
      return formatNumberWithCommas(data.buffedCP);
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
          this.setData({
            analyzeResultsVisible: true,
            combatPowerScore: combat_power.Score,
            combatPowerBuffedScore: combat_power.BuffedScore,
            combatPowerWeakenScore: combat_power.WeakenScore,
            combatPowerNonWeakenScore: combat_power.NonWeakenScore,
            scrollToView: 'analysis-results-section',
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
  onResultInfoTap: function () {
    const info = this.selectComponent('#cp_info');
    const title = '战力值说明';
    const body = `这里的数值是战力值。

    加成后战力: 实际战斗战力，由面板战力算上加成（对谱加成与赛季加成）得出。
    纯面板战力: 纯面板战力。

    战力值基于用户面板数值、使用搭档及日卡推算得出，用于评估面板强度。
    以四次共鸣期（顺谱两虚弱或逆谱一虚弱）为单位，基于该搭档推荐排轴推算各技能施放次数来计算得出以该面板对“单个敌人”进行战斗时的战斗强度。

    暴击期与虚弱期百分比代表该面板在对应时期造成的伤害占比。
    
    考虑的因素及对应模拟精确度：
    面板所有基础数值对技能伤害、技能次数的影响（精确）
    卡面等级带来的等级压制影响（精确）
    *无数据则以480计算
    搭档<>日卡<>武器非常规组合（搭档未使用其对应日卡或专武）时的影响（精确）

    搭档非全程的机制buff，如施放特定技能后带来的增益效果（普通）
    *由于当前计算逻辑并不通过模拟实际技能循环，这类的buff无法精确模拟。
    计算这类增益的方式通过计算其生效时间权重折算成全时长平均增益。
    
    聚怪机制，群伤机制（无）
    *战力值的计算纯基于面板及搭档推荐排轴，不考虑实际战斗场景，因此不会对有聚怪机制、群伤机制的搭档或技能进行额外调参增强。用户可自行根据关卡怪物数量等战斗场景对面板进行进一步调整。
    
    强化协助（无）
    *不考虑额外操作`;
    info.show(title, body);
  },
});
