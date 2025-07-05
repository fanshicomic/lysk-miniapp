const app = getApp();

async function apiGet(endpoint, params = {}) {
    const token = wx.getStorageSync('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    const url = `${app.globalData.serverHost}/${endpoint}${query ? '?' + query : ''}`;
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'GET',
            header: headers,
            success: res => resolve(res.data),
            fail: reject
        });
    });
}

async function apiPost(endpoint, data) {
    const token = wx.getStorageSync('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${app.globalData.serverHost}/${endpoint}`;
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'POST',
            header: headers,
            data,
            success: res => resolve(res.data),
            fail: reject
        });
    });
}

export { apiGet, apiPost };