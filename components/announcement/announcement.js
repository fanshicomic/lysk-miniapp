Component({
  data: {
    isVisible: false,
    body: '',
    updates: ''
  },

  methods: {
    show(body, updates) {
      this.setData({
        isVisible: true,
        body: body,
        updates: updates
      });
    },

    hide() {
      this.setData({
        isVisible: false
      });
    }
  }
});