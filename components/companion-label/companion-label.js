import { DROPDOWN_VALUES } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    companion: {
      type: String,
      value: '',
    },
  },
  computed: {
    getPartnerColorMap(data) {
      if (data.companion === '逐光骑士') return 'companion-light-seeker';
      if (data.companion === '光猎') return 'companion-lumiere';
      if (data.companion === '暗蚀国王') return 'companion-king-of-darknight';
      if (data.companion === '永恒先知') return 'companion-foreseer';
      if (data.companion === '九黎司命') return 'companion-master-of-fate';
      if (data.companion === '利莫里亚海神') return 'companion-lemurian-sea-god';
      if (data.companion === '潮汐之神') return 'companion-god-of-the-tides';
      if (data.companion === '深海潜行者') return 'companion-abyss-walker';
      if (data.companion === '无尽掠夺者') return 'companion-relentless-conqueror';
      if (data.companion === '深渊主宰') return 'companion-abysm-sovereign';
      if (data.companion === '远空执舰官') return 'companion-farspace-colonel';
      if (data.companion === '终极兵器X-02') return 'companion-ultimate-weapon-X-02';
      return 'companion-normal';
    }
  }
});