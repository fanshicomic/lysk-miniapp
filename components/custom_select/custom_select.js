Component({
    properties: {
        options: {
            type: Array,
            value: []
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
        _autoRefreshOptions(options) {
            if (options.length === 1) {
                if (this.data.selected !== options[0]) {
                    this.setData({
                        selected: options[0]
                    });
                    this.triggerEvent('select', {
                        value: options[0]
                    });
                }
            } else if (options.length > 1) {
                if (this.data.selected !== '') {
                    this.setData({
                        selected: ''
                    });
                    this.triggerEvent('select', {
                        value: ''
                    });
                }
            }
        },
        refreshSelection() {
            this._autoRefreshOptions(this.data.options);
        }
    },
    lifetimes: {
        attached: function () {
            this.refreshSelection();
        }
    }
});