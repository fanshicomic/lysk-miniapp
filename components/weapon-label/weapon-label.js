import { DROPDOWN_VALUES } from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {    
    weapon: {
      type: String,
      value: '',
    }
  },
  computed: {
    getWeaponClass(data) {
      return data.weapon === '专武' ? 'weapon-rare' : 'weapon-normal';
    }
  }
});