import { DROPDOWN_VALUES } from '../../utils/constants.js';
import { getChampionshipStartDate } from '../../utils/record_helper.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    record: {
      type: Object,
      value: {
        关卡: '',
        关数: '',
        攻击: '',
        生命: '',
        防御: '',
        对谱: '',
        对谱加成: '',
        暴击: '',
        暴伤: '',
        加速回能: '',
        虚弱增伤: '',
        誓约增伤: '',
        誓约回能: '',
        搭档身份: '',
        日卡: '',
        阶数: '',
        武器: '',
        加成: '',
        时间: '',
      },
    },
    recordId: {
      type: String,
      value: '',
    },
    showAdminActions: {
      type: Boolean,
      value: false,
    },
  },
  computed: {
    getLevelDisplay(data) {
      const level = data.record['关数'];
      let label = data.record['关卡'];
      if (data.record['关卡'] == '开放') {
        label += ' ' + data.record['模式'];
      }
      label += ' ' + level.replace(/_/g, ' ');

      if (data.record['加成'] != '') {
        let time = getChampionshipStartDate(data.record['时间']);
        label = time + '期 ' + label;
      }
      return label;
    },
    getSetCardColorMap(data) {
      const card = data.record['日卡'];
      const partner = data.record['搭档身份'];

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
        if (xavier.includes(partner)) return 'set-card-red';
        if (zayne.includes(partner)) return 'set-card-pink';
        if (rafayel.includes(partner)) return 'set-card-yellow';
      }
      return 'set-card-none';
    },
    getPartnerColorMap(data) {
      const partner = data.record['搭档身份'];

      if (partner === '逐光骑士') return 'partner-light-seeker';
      if (partner === '光猎') return 'partner-lumiere';
      if (partner === '暗蚀国王') return 'partner-king-of-darknight';
      if (partner === '永恒先知') return 'partner-foreseer';
      if (partner === '九黎司命') return 'partner-master-of-fate';
      if (partner === '利莫里亚海神') return 'partner-lemurian-sea-god';
      if (partner === '潮汐之神') return 'partner-god-of-the-tides';
      if (partner === '深海潜行者') return 'partner-abyss-walker';
      if (partner === '无尽掠夺者') return 'partner-relentless-conqueror';
      if (partner === '深渊主宰') return 'partner-abysm-sovereign';
      if (partner === '远空执舰官') return 'partner-farspace-colonel';
      if (partner === '终极兵器X-02') return 'partner-ultimate-weapon-X-02';
      return 'partner-normal';
    },
    getMatchingClass(data) {
      const matching = data.record['对谱'];
      return matching === '顺' ? 'is-matching' : 'is-not-matching';
    },
    getMatchingColor(data) {
      const matching = data.record['对谱'];
      return matching === '顺' ? '#42a366' : '#bd4e4b';
    },
    getWeaponClass(data) {
      const weapon = data.record['武器'];
      return weapon === '专武' ? 'weapon-rare' : 'weapon-normal';
    },
    getMatchingCount(data) {
      const count = data.record['对谱加成'];
      const matchingBonus = Number(count) || 0;
      return Math.round(Math.min(matchingBonus, 30) / 5);
    },
    getStarRank(data) {
        const starLevel = data.record['星级'];
        switch (starLevel) {
            case '三星':
                return 3;
            case '二星':
                return 2;
            case '一星':
                return 1;
            default:
                return 0;
        }
    },
    noBuffedCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['Score']) || 0;
    },
    buffedCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['BuffedScore']) || 0;
    },
    nonWeakenCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['NonWeakenScore']) || 0;
    },
    weakenCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['WeakenScore']) || 0;
    },
    buffedCPDividedBy100(data) {
      if (!data.buffedCP) return 0;
      return (data.buffedCP / 100).toFixed(0);
    },
    noBuffedCPDividedBy100(data) {
      if (!data.noBuffedCP) return 0;
      return (data.noBuffedCP / 100).toFixed(0);
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
    nonWeakenCPProgressBarWidth(data) {
      const total = data.nonWeakenCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.nonWeakenCP / total) * 30).toFixed(1);
    },
    weakenCPProgressBarWidth(data) {
      const total = data.nonWeakenCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.weakenCP / total) * 30).toFixed(1);
    }
  },
  methods: {
    onEdit: function () {
      console.log('onEdit called inside record component. Firing event.');
      this.triggerEvent('edit', { recordId: this.data.recordId });
    },
    onDelete: function () {
      this.triggerEvent('delete', { recordId: this.data.recordId });
    },
    onCPSectionTap: function () {
      const info = this.selectComponent('#cp_info');
      const title = '战力值说明';
      const body = `这里的数值是战力值。

      大的数字代表实际战斗战力，由面板战力算上加成（对谱加成与赛季加成）得出。
      小的数字代表纯面板战力。

      战力值基于用户面板数值、使用搭档及日卡推算得出，用于评估面板强度。
      以四次共鸣期（顺谱两虚弱或逆谱一虚弱）为单位，基于该搭档推荐排轴推算各技能施放次数并计算得出以该面板对“单个敌人”进行战斗时的战斗强度。
      
      考虑的因素及对应模拟精确度：
      面板所有基础数值对技能伤害、技能次数的影响（精确）
      卡面等级带来的等级压制影响（精确）
      搭档<>日卡<>武器并非常规组合（搭档使用其对应日卡及专武）时的影响（精确）

      搭档非全程的机制buff，如施放特定技能后带来的增益效果（普通）
      *由于当前计算逻辑并不通过模拟实际技能循环，这类的buff无法精确模拟。
      计算这类增益的方式通过计算其生效时间权重折算成全时长平均增益。
      
      聚怪机制，群伤机制（无）
      *CP值的计算纯基于面板及搭档推荐排轴，不考虑实际战斗场景，因此不会对有聚怪机制、群伤机制的搭档或技能进行额外调参增强。用户可自行根据关卡怪物数量等战斗场景对面板进行进一步调整。
      
      强化协助（无）
      *不考虑额外操作`;
      info.show(title, body);
    },
  },
});
