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
    selectedCompanion: {topLevel: "所有搭档", secondLevel: ""},
    selectedSetcard: {topLevel: "所有日卡", secondLevel: ""},
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
        console.log(this.data.selectedCompanion, this.data.selectedSetcard);
        this.triggerEvent('applyfilter', { selectedCompanion: this.data.selectedCompanion, selectedSetcard: this.data.selectedSetcard });
      } else {
        // If collapsed, clicking FAB means open filter
        this.setData({
          isExpanded: true,
        });
      }
    },
    onSelectCompanion(e) {
      this.setData({ selectedCompanion: e.detail });
    },
    onSelectSetcard(e) {
      this.setData({ selectedSetcard: e.detail });
    },
    reset() {
      this.setData({
        selectedCompanion: {topLevel: "所有搭档", secondLevel: ""},
        selectedSetcard: {topLevel: "所有日卡", secondLevel: ""},
      });
      this.selectComponent('#companionFilter').reset();
      this.selectComponent('#setcardFilter').reset();
    }
  },
});