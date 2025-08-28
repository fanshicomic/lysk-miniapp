Component({
  data: {
    selected: 0,
    color: "rgba(255, 255, 255, 0.6)",
    selectedColor: "white",
    list: [
      {
        "pagePath": "/pages/orbit/orbit",
        "text": "轨道",
        // "iconPath": "/assets/orbit.png",
        // "selectedIconPath": "/assets/orbit.png"
      },
      {
        "pagePath": "/pages/championships/championships",
        "text": "锦标赛",
        // "iconPath": "/assets/championships.png",
        // "selectedIconPath": "/assets/championships.png"
      },
      {
        "pagePath": "/pages/analyze/analyze",
        "text": "分析我的",
        // "iconPath": "/assets/analyze.png",
        // "selectedIconPath": "/assets/analyze.png"
      }
    ]
  },
  attached() {
    this.updateSelected();
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    },
    updateSelected() {
      const currentPage = getCurrentPages().pop();
      if (currentPage) {
        const pagePath = '/' + currentPage.route;
        const tabIndex = this.data.list.findIndex(item => item.pagePath === pagePath);
        if (tabIndex > -1) {
          this.setData({
            selected: tabIndex
          });
        }
      }
    }
  }
})