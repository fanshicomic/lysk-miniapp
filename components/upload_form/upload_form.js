import { DROPDOWN_VALUES } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  computed: {
    getStarLevelOptions() {
      return DROPDOWN_VALUES['星级'];
    },
    getMatchingOptions() {
      return DROPDOWN_VALUES['对谱'];
    },
    getMatchingBuffOptions() {
      return DROPDOWN_VALUES['对谱加成'];
    },
    getStageOptions() {
      return DROPDOWN_VALUES['阶数'];
    },
    getWeaponOptions() {
      return DROPDOWN_VALUES['武器'];
    },
    getPartnerOptions(data) {
      switch (data.levelType) {
        case '光':
          return ['沈星回'];
        case '冰':
          return ['黎深'];
        case '火':
          return ['祁煜'];
        case '能量':
          return ['秦彻'];
        case '引力':
          return ['夏以昼'];
        default:
          return DROPDOWN_VALUES['搭档'];
      }
    },
    getPartnerIdentityOptions(data) {
      if (data.selectedPartner !== '') {
        const partnerIdentityKey = data.selectedPartner + '搭档';
        return DROPDOWN_VALUES[partnerIdentityKey] || [];
      } else {
        return [];
      }
    },
    getSunCardOptions(data) {
      if (data.selectedPartner !== '') {
        const sunCardKey = data.selectedPartner + '日卡';
        return DROPDOWN_VALUES[sunCardKey] || [];
      } else {
        return [];
      }
    },
    getChampionshipsBuffOptions() {
      return DROPDOWN_VALUES['加成'];
    },
  },
  properties: {
    isAnalyze: {
      type: Boolean,
    },
    battleType: {
      type: String,
    },
    levelMode: {
      type: String,
    },
    levelType: {
      type: String,
      observer: 'onLevelTypeChange',
    },
    selectedPartner: {
      type: String,
      obeserver: 'onPartnerChange',
    },
    initialData: {
      type: Object,
      observer: function (newData) {
        if (newData) {
          this.setData({
            inputValues: {
              hp: newData.生命,
              attack: newData.攻击,
              defence: newData.防御,
              'crit-rate': newData.暴击,
              'crit-dmg': newData.暴伤,
              'oath-boost': newData.誓约增伤,
              'oath-regen': newData.誓约回能,
              'energy-regen': newData.加速回能,
              'weaken-boost': newData.虚弱增伤,
              matching: newData.对谱,
              'matching-buff': newData.对谱加成,
              'partner-identity': newData.搭档身份,
              'sun-card': newData.日卡,
              stage: this.matchStageFromBEToFE(newData.阶数),
              weapon: newData.武器,
              'championships-buff': newData.加成,
              'card-total-level': newData.卡总等级,
              'star-level': newData.星级,
              note: newData.备注,
            },
            selectedPartner: this.matchPartner(newData.搭档身份),
            levelMode: newData.模式,
          });
        }
      },
    },
  },

  data: {
    panelInputs: [],
    inputValues: {
      hp: '',
      attack: '',
      defence: '',
      'crit-rate': '',
      'crit-dmg': '',
      'oath-boost': '',
      'oath-regen': '',
      'energy-regen': '',
      'weaken-boost': '',
      matching: '',
      'matching-buff': '',
      'partner-identity': '',
      'sun-card': '',
      stage: '',
      weapon: '',
      'championships-buff': '',
      'card-total-level': '',
      'star-level': '',
      note: '',
    },
  },

  methods: {
    onDigitInput(value) {
      // Replace any non-numeric characters except for a single decimal point
      value = value.replace(/[^\d.]/g, '');

      // Ensure that there's only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      return value;
    },

    onInput(e) {
      const { key } = e.currentTarget.dataset;
      let { value } = e.detail;
      const { type } = e.currentTarget.dataset;

      if (type === 'digit') {
        value = this.onDigitInput(value);
      }

      this.setData({
        [`inputValues.${key}`]: value,
      });
    },

    onSelectChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.setData({
        [`inputValues.${key}`]: value,
      });
    },

    onPartnerChange(e) {
      const partner = e.detail.value;
      this.setData({
        selectedPartner: partner,
        'inputValues.partner-identity': '',
        'inputValues.sun-card': '',
      });
    },

    onLevelTypeChange(type) {
      if (type !== '开放') {
        const levelPartnerMap = {
          光: '沈星回',
          冰: '黎深',
          火: '祁煜',
          能量: '秦彻',
          引力: '夏以昼',
        };
        const partner = levelPartnerMap[type];
        this.setData({
          selectedPartner: partner,
          'inputValues.partner-identity': '',
          'inputValues.sun-card': '',
        });
      } else {
        this.setData({
          selectedPartner: '',
          'inputValues.partner-identity': '',
          'inputValues.sun-card': '',
        });
      }
    },

    getInputData() {
      let res = this.data.inputValues;
      res['partner'] = this.data.selectedPartner;
      return res;
    },

    matchStageFromBEToFE(stage) {
      let stageMap = {
        I: 'I (零阶)',
        II: 'II (一阶)',
        III: 'III (二阶)',
        IV: 'IV (三阶)',
      };

      return stageMap[stage];
    },

    matchPartner(partnerIdentity) {
      const partners = {
        沈星回: DROPDOWN_VALUES['沈星回搭档'],
        黎深: DROPDOWN_VALUES['黎深搭档'],
        祁煜: DROPDOWN_VALUES['祁煜搭档'],
        秦彻: DROPDOWN_VALUES['秦彻搭档'],
        夏以昼: DROPDOWN_VALUES['夏以昼搭档'],
      };

      for (const partner in partners) {
        if (partners[partner].includes(partnerIdentity)) {
          return partner;
        }
      }
      return ''; // Return empty string if no match is found
    },
  },

  lifetimes: {
    attached: function () {},
  },
});
