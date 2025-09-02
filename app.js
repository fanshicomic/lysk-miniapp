// app.js
App({
  onLaunch() {
    // 1. Check for our custom session token in storage
    const token = wx.getStorageSync('token');
    if (token) {
      // 2. If token exists, check if the session is still valid with WeChat
      wx.checkSession({
        success: () => {
          // Session is valid. User is "logged in".
          // You can now fetch user data from your server if needed.
          // For simplicity, we'll use the cached userInfo.
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            this.globalData.userInfo = userInfo;
          }
          console.log('User is already logged in.');
        },
        fail: () => {
          // Session has expired.
          // Clear storage and treat as a new user.
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          console.log('Session expired, user needs to log in again.');
        },
      });
    } else {
      // No token found, user needs to log in.
      console.log('No token found, user needs to log in.');
    }
  },

  globalData: {
    userInfo: null,
    serverHost: 'https://lysk-battle-record-426168069563.asia-southeast1.run.app',
    ocrServerHost: 'https://ocr-service-426168069563.asia-southeast1.run.app',
    // serverHost: 'http://192.168.0.139:8080',
    // serverHost: 'http://127.0.0.1:8080'
  },
});
