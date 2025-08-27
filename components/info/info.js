Component({
  data: {
    isVisible: false,
    title: '',
    body: '',
  },

  methods: {
    show(title, body) {
      this.setData({
        isVisible: true,
        title: title,
        body: body,
      });
    },

    hide() {
      this.setData({
        isVisible: false,
      });
    },

    showInfo() {
      this.show(data.title, data.body);
    },
  },
});
