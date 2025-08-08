Component({
  data: {
    isVisible: false,
    header: '',
    body: '',
    duration: 3000,
  },

  methods: {
    show(header, body, duration) {
      this.setData({
        isVisible: true,
        header: header,
        body: body,
        duration: duration || 3000,
      });

      setTimeout(() => {
        this.hide();
      }, this.data.duration);
    },

    hide() {
      this.setData({
        isVisible: false,
      });
    },
  },
});
