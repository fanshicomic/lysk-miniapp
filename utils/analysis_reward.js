function increaseReward(num) {
    const newTries = (wx.getStorageSync('rewardedAnalyses') || 0) + num;
    wx.setStorageSync('rewardedAnalyses', newTries);
}

export { increaseReward };