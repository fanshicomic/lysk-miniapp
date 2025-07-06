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

async function apiUploadFile(endpoint, filePath, fileName) {
    const token = wx.getStorageSync('token');
    const headers = { 'Content-Type': 'multipart/form-data' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${app.globalData.ocrServerHost}/${endpoint}`;
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url,
            filePath,
            name: fileName,
            header: headers,
            dataType: 'binary',
            success: res => {
                const result = JSON.parse(res.data);
                if (result.result) {
                    const mapping = {
                        "生命": "hp",
                        "攻击": "attack",
                        "防御": "defence",
                        "暴击": "crit-rate",
                        "暴伤": "crit-dmg",
                        "誓约增伤": "oath-boost",
                        "誓约回能": "oath-regen",
                        "加速回能": "energy-regen",
                        "虚弱增伤": "weaken-boost"
                    };
                    const mappedResult = {};
                    for (const [key, value] of Object.entries(result.result)) {
                        if (mapping[key]) {
                            mappedResult[mapping[key]] = value;
                        }
                    }
                    result.result = mappedResult;
                }
                resolve(result);
            },
            fail: reject
        });
    });
}

export { apiGet, apiPost, apiUploadFile };