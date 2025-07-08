Component({
  data: {
    showModal: false
  },
  methods: {
    showQRCode() {
      this.setData({ showModal: true });
    },
    hideQRCode() {
      this.setData({ showModal: false });
    }
  }
})