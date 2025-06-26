Component({
    properties: {
        options: {
        type: Array,
        value: [],
        observer: function(newVal) {
          this._autoSelectSingleOption(newVal);
        }
      },
        selected: {
            type: String,
            value: ''
        },
        title: {
            type: String,
            value: ''
        }
    },
    data: {
        open: false
    },
    methods: {
        toggleSelect() {
            if (!this.data.options.length) return;
            this.setData({
                open: !this.data.open
            });
            this.triggerEvent(this.data.open ? 'open' : 'close');
        },
        selectOption(e) {
            const value = e.currentTarget.dataset.value;
            this.setData({
                selected: value,
                open: false
            });
            this.triggerEvent('select', {
                value
            });
            this.triggerEvent('close');
        },
        closeAll() {
            if (this.data.open) {
                this.setData({
                    open: false
                });
                this.triggerEvent('close');
            }
        },
        _autoSelectSingleOption(options) {
            if (options.length === 1 && this.data.selected !== options[0]) {
                this.setData({ selected: options[0] });
                this.triggerEvent('select', { value: options[0] });
            }
        }
    },
    lifetimes: {
        attached: function () {
            this._autoSelectSingleOption(this.data.options);
        }
    }
});