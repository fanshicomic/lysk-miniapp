function increaseReward() {
    const newTries = (wx.getStorageSync('rewardedAnalyses') || 0) + 1;
    wx.setStorageSync('rewardedAnalyses', newTries);
}

export { increaseReward };