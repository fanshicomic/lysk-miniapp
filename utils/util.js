const { API_BASE } = require('server_host.js');

async function apiGet(endpoint, params = {}) {
    const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    const url = `${API_BASE}${endpoint}${query ? '?' + query : ''}`;
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'GET',
            success: res => resolve(res.data),
            fail: reject
        });
    });
}

async function apiPost(endpoint, data) {
    const url = `${API_BASE}${endpoint}`;
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data,
            success: res => resolve(res.data),
            fail: reject
        });
    });
}

export { apiGet, apiPost };