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
    getMatchingClass(data) {
      const matching = data.record['对谱'];
      return matching === '顺' ? 'is-matching' : 'is-not-matching';
    },
    getMatchingColor(data) {
      const matching = data.record['对谱'];
      return matching === '顺' ? '#42a366' : '#bd4e4b';
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
      if (!combatPowerDetails || combatPowerDetails['Score'] === '0') return 0;
      return Number(combatPowerDetails['Score']) || 0;
    },
    buffedCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails || combatPowerDetails['BuffedScore'] === '0') return 0;
      return Number(combatPowerDetails['BuffedScore']) || 0;
    },
    critCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['CritScore']) || 0;
    },
    weakenCP(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return 0;
      return Number(combatPowerDetails['WeakenScore']) || 0;
    },
    critCPPercentage(data) {
      const total = data.critCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.critCP / total) * 100).toFixed(0);
    },
    weakenCPPercentage(data) {
      const total = data.critCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.weakenCP / total) * 100).toFixed(0);
    },
    critCPProgressBarWidth(data) {
      const total = data.critCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.critCP / total) * 30).toFixed(1);
    },
    weakenCPProgressBarWidth(data) {
      const total = data.critCP + data.weakenCP;
      if (total === 0) return '0.0';
      return ((data.weakenCP / total) * 30).toFixed(1);
    },
    cpEvaluation(data) {
      const combatPowerDetails = data.record['战力值'];
      if (!combatPowerDetails) return '';
      return combatPowerDetails['Evaluation'];
    },
    cpEvaluationClass(data) {
      if (!data.cpEvaluation) {
        return '';
      }
      switch (data.cpEvaluation) {
        case '溢出':
          return 'cp-eval-high';
        case '标准':
          return 'cp-eval-mid';
        case '极限':
          return 'cp-eval-low';
        default:
          return '';
      }
    },
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

      大的数字: 实际战斗战力，由面板战力算上加成（对谱加成与赛季加成）得出。
      小的数字: 纯面板战力。
      同关卡战力从高至低排序，前25%战力标为溢出，后25%标为极限，其余为标准。
      *若该关卡面板<5，则全标为标准。
      *该排序基于库中面板。

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
  },
});
