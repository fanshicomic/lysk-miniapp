Component({
  properties: {
    options: {
      type: Array,
      value: [],
    },
    selected: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
  },
  data: {
    open: false,
  },
  methods: {
    toggleSelect() {
      if (!this.data.options.length) return;
      this.setData({
        open: !this.data.open,
      });
      this.triggerEvent(this.data.open ? 'open' : 'close');
    },
    selectOption(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({
        selected: value,
        open: false,
      });
      this.triggerEvent('select', {
        value,
      });
      this.triggerEvent('close');
    },
    closeAll() {
      if (this.data.open) {
        this.setData({
          open: false,
        });
        this.triggerEvent('close');
      }
    },
  },
  lifetimes: {
    attached: function () {},
  },
});
