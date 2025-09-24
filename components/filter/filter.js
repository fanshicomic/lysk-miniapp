Component({
  properties: {
    options1: {
      type: Object,
      value: {},
    },
    options2: {
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
    selection1: null,
    selection2: null,
  },
  methods: {
    toggleExpansion() {
      this.setData({
        isExpanded: !this.data.isExpanded,
      });
      if (!this.data.isExpanded) {
        this.triggerEvent('close', { selection1: this.data.selection1, selection2: this.data.selection2 });
      }
    },
    onSelect1(e) {
      this.setData({ selection1: e.detail });
      this.triggerEvent('select', { selection1: e.detail, selection2: this.data.selection2 });
    },
    onSelect2(e) {
      this.setData({ selection2: e.detail });
      this.triggerEvent('select', { selection1: this.data.selection1, selection2: e.detail });
    },
  },
});
