const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    suggestions: {
      type: Object,
      value: null,
      observer: function (newVal) {
        // No ECharts related logic here anymore
      }
    }
  },

  computed: {
    lowestCP(data) {
        if (data.suggestions === null || data.suggestions.cps.length === 0) {
          return 0;
        }
        return data.suggestions.cps[0];
    },
    suggestedCP(data) {
        if (data.suggestions) {
            return data.suggestions.suggested_cp;
        }
        return 0;
    },
    getTop3PairsWithPercentage(data) {
      if (data.suggestions === null || data.suggestions.companion_setcard_pairs.length === 0) {
        return 0;
      }

      const pairs = data.suggestions.companion_setcard_pairs;
      const totalCount = pairs.reduce((sum, currentItem) => sum + currentItem.count, 0);
      
      if (totalCount === 0) return [];
    
      const sortedPairs = [...pairs].sort((a, b) => b.count - a.count);
      const top3 = sortedPairs.slice(0, 3);    
      const result = top3.map(item => {
        const percentage = parseFloat(((item.count / totalCount) * 100).toFixed(2));        
        return {
          ...item,
          percentage: percentage
        };
      });
    
      return result;
    },
    getAttackPattern(data) {
      if (data.crit >= data.weak) {
        return '暴击流';
      }
      return '虚弱流';
    },
    getAttackPatternPercentage(data) {
      let crit = data.suggestions.crit;
      let weak = data.suggestions.weak;
      if (crit >= weak) {
        return ((crit / (crit + weak)) * 100).toFixed(0);
      }
      return ((weak / (crit + weak)) * 100).toFixed(0);
    }
  },

  data: {
    // No ECharts related data here anymore
  },

  lifetimes: {
    attached: function () {
        // No ECharts related logic here anymore
    }
  },

  methods: {
    // No ECharts related methods here anymore
  }
})