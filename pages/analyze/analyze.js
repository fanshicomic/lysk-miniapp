Page({
  data: {},
  onLoad(options) {},
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().updateSelected();
      }
  },
});