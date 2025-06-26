import { DROPDOWN_VALUES } from '../../utils/constants.js';

Component({
  properties: {
    levelType: {
      type: String,
      observer: 'updatePartnerOptions'
    }
  },

  data: {
    panelInputs: [],
    inputValues: {},
    partnerOptions: DROPDOWN_VALUES["搭档"]
  },

  methods: {
    onInput(e) {
      const { key } = e.currentTarget.dataset;
      let { value } = e.detail;

      // Replace any non-numeric characters except for a single decimal point
      value = value.replace(/[^\d.]/g, '');

      // Ensure that there's only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }

      this.setData({
        [`inputValues.${key}`]: value
      });
    },

    updatePartnerOptions(levelType) {
      if (levelType === "开放") {
        this.setData({
          partnerOptions: DROPDOWN_VALUES["搭档"]
        });
        this.generatePanelInputs();
        return;
      }

      const levelPartnerMap = {
        "光": "沈星回",
        "冰": "黎深",
        "火": "祁煜",
        "能量": "秦彻",
        "引力": "夏以昼"
      };

      this.setData({
        partnerOptions: [levelPartnerMap[levelType]]
      });
      this.generatePanelInputs();
    },

    generatePanelInputs() {
      const PANEL_KEYS = ["生命", "攻击", "防御", "暴击", "暴伤", "誓约增伤", "誓约回能", "加速回能", "虚弱增伤", "对谱", "对谱加成", "搭档", "搭档身份", "日卡", "阶数", "武器"];
      const panelInputs = [];
      let row = [];

      PANEL_KEYS.forEach((key, index) => {
        const isDropdown = !!DROPDOWN_VALUES[key];
        const input = { key, isDropdown };
        if (isDropdown) {
          if (key === '搭档') {
            input.options = this.data.partnerOptions;
          } else {
            input.options = DROPDOWN_VALUES[key];
          }
        }
        row.push(input);

        if (row.length === 2 || index === PANEL_KEYS.length - 1) {
          panelInputs.push(row);
          row = [];
        }
      });

      this.setData({ panelInputs });
    }
  },

  lifetimes: {
    attached: function() {
      this.generatePanelInputs();
    }
  }
});
