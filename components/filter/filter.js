Component({
  properties: {
    companionOptions: {
      type: Object,
      value: {},
    },
    setcardOptions: {
      type: Object,
      value: {},
    },
    position: {
      type: String,
      value: 'bottom: 20rpx; right: 20rpx;',
    },
  },
  data: {
    isExpanded: false,
    selection1: '所有搭档',
    selection2: '所有日卡',
  },
  methods: {
    onCloseButtonClick() {
      this.setData({
        isExpanded: false,
      });
    },
    onFabClick() {
      if (this.data.isExpanded) {
        // If expanded, clicking FAB means apply filter
        this.setData({
          isExpanded: false,
        });
        this.triggerEvent('applyfilter', { selection1: this.data.selection1, selection2: this.data.selection2 });
      } else {
        // If collapsed, clicking FAB means open filter
        this.setData({
          isExpanded: true,
        });
      }
    },
    onSelectCompanion(e) {
      this.setData({ selection1: e.detail });
    },
    onSelectSetcard(e) {
      this.setData({ selection2: e.detail });
    },
  },
});