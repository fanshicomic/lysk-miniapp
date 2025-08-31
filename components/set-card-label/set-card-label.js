import { DROPDOWN_VALUES } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    companion: {
      type: String,
      value: '',
    },
    card: {
      type: String,
      value: '',
    },
    stage: {
      type: String,
      value: '',
    }
  },
  computed: {
    getSetCardColorMap(data) {
      let card = data.card
      let companion = data.companion
      const pinkCards = ['匿光', '神殿', '点染', '掠心', '锋尖'];
      if (pinkCards.includes(card)) return 'set-card-pink';
      const purpleCards = ['深海', '斑斓', '寂路'];
      if (purpleCards.includes(card)) return 'set-card-purple';
      const redCards = ['夜誓', '拥雪', '夜色', '碧海', '远空', '长昼'];
      if (redCards.includes(card)) return 'set-card-red';
      const greenCards = ['逐光', '睱日', '深渊', '离途', '坠浪'];
      if (greenCards.includes(card)) return 'set-card-green';
      const yellowCards = ['雾海', '末夜', '弦光', '深林'];
      if (yellowCards.includes(card)) return 'set-card-yellow';
      const blueCards = ['永恒', '静谧', '戮夜', '鎏光'];
      if (blueCards.includes(card)) return 'set-card-blue';
      if (card === '心晴') {
        const xavier = DROPDOWN_VALUES['沈星回搭档'];
        const zayne = DROPDOWN_VALUES['黎深搭档'];
        const rafayel = DROPDOWN_VALUES['祁煜搭档'];
        if (xavier.includes(companion)) return 'set-card-red';
        if (zayne.includes(companion)) return 'set-card-pink';
        if (rafayel.includes(companion)) return 'set-card-yellow';
      }
      return 'set-card-none';
    }
  }
});