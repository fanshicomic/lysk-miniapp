const {
    apiGet,
    apiPost
} = require('../../utils/util.js');

const {
    LEVEL_TYPES
} = require('../../utils/constants.js');

Page({
    data: {
        levelTypes: ["光", "冰", "火", "能量", "引力", "开放"],
        levelModes: ["稳定", "波动"],
        levelType: '',
        levelNumber: '',
        levelMode: '',
        levelPart: '',
        partVisible: false,
        panelInputs: [],
        actionButtonsVisible: false,
        uploadVisible: false,

        recordsVisible: false,
        records: [],

        pageSize: 10,
        totalPage: 0,
        currentPage: 1,
        pages: [],

        latestRecordsVisible: true,
        latestRecords: [],
        totalDbRecordsCnt: 0,
    },

    onLoad(options) {
        this.dataInit();

        this.selectComponent('#announcement').showAnnouncement();
    },
    onBack() {
        wx.navigateBack({
            delta: 1
        });
    },

    dataInit() {
        apiGet('latest-orbit-records', {})
            .then(result => {
                const cnt = result.total || 0;
                const list = result.records || [];
                this.setData({
                    totalDbRecordsCnt: cnt,
                    latestRecords: list
                });
            })
            .catch(err => {
                this.showToast("获取失败", err, 5000)
            });
    },

    getRecords(page) {
        const {
            levelType,
            levelMode,
            levelNumber,
            levelPart,
            pageSize
        } = this.data;
        if (!Number.isInteger(page)) {
            page = 1;
        }
        const type = levelType;
        const mode = levelMode;
        const level = levelPart ? levelNumber + '_' + levelPart : levelNumber;
        const offset = (page - 1) * pageSize;
        this.setData({
            recordsVisible: true,
            latestRecordsVisible: false,
            currentPage: page
        });
        apiGet('orbit-records', {
                type,
                mode,
                level,
                offset
            })
            .then(result => {
                const cnt = result.total || 0;
                const list = result.records || [];
                this.setData({
                    totalPage: Math.ceil(cnt / pageSize),
                    records: list
                });
                this.generatePageNumbers();
            })
            .catch(err => {
                this.showToast("获取失败", err, 5000)
            });
    },

    onPageChange: function (e) {
        const selectedPage = e.currentTarget.dataset.page;

        if (selectedPage == this.data.currentPage) {
            return;
        }

        this.setData({
            currentPage: selectedPage
        });

        this.getRecords(selectedPage);
    },

    generatePageNumbers: function () {
        const totalPage = this.data.totalPage;
        const currentPage = this.data.currentPage;
        const pages = [];

        if (totalPage <= 5) {
            // If 5 or fewer pages, show all page numbers
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            // If more than 5 pages, calculate the window
            let startPage, endPage;

            if (currentPage <= 3) {
                // If near the beginning, show pages 1-5
                startPage = 1;
                endPage = 5;
            } else if (currentPage > totalPage - 2) {
                // If near the end, show the last 5 pages
                startPage = totalPage - 4;
                endPage = totalPage;
            } else {
                // Otherwise, center the current page
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        this.setData({
            pages: pages
        });
    },

    showToast(header, body, delay) {
        this.selectComponent('#toast').show(header, body, delay);
    },

    // 关卡类型选择
    onLevelTypeChange(e) {
        const type = e.detail.value;
        this.setData({
            levelType: type
        });
        if (type !== '开放') {
            this.setData({ levelMode: '稳定' });
        } else {
            this.setData({ levelMode: '' });
        }
        this.checkIfReady();
    },

    onLevelModeChange(e) {
        const mode = e.detail.value;
        this.setData({
            levelMode: mode
        });
        this.checkIfReady();
    },

    // 关卡编号输入
    onLevelNumberInput(e) {
        const number = e.detail.value;
        this.setData({
            levelNumber: number
        });
        this.validatePartDropdown();
        this.checkIfReady();
    },

    // 上下段选择
    onLevelPartChange(e) {
        this.setData({
            levelPart: e.detail.value
        });
        this.checkIfReady();
    },

    // 校验是否显示上下段
    validatePartDropdown() {
        const {
            levelNumber
        } = this.data;
        const show = levelNumber && levelNumber % 10 === 0;
        this.setData({
            partVisible: show
        });
    },

    checkIfReady() {
        const type = this.data.levelType;
        const mode = this.data.levelMode;
        const number = parseInt(this.data.levelNumber);
        if (mode === '') {
            return;
        }

        const levelUpperBound = LEVEL_TYPES[mode].find(l => l.type === type);
        let visible = false;
        if (type && number && levelUpperBound) {
            const isValidNumber = number >= 1 && number <= levelUpperBound.count;
            if (isValidNumber) {
                if (number % 10 !== 0) {
                    visible = true;
                } else if (this.data.levelPart === "上" || this.data.levelPart === "下") {
                    visible = true;
                }
            }
        }
        this.setData({
            actionButtonsVisible: visible
        });
    },

    onStartUpload() {
        this.setData({
            uploadVisible: true,
            latestRecordsVisible: false
        });
    },

    onSubmit() {
        const uploadForm = this.selectComponent('#upload-form');
        if (uploadForm) {
            const inputData = uploadForm.getInputData();
            const { levelType, levelMode, levelNumber, levelPart } = this.data;
            const level = levelPart ? `${levelNumber}_${levelPart}` : levelNumber;
            let stage = inputData['stage']
            if (stage !== '无套装') {
                stage = stage.substring(0, stage.length - 5);
            }
            const data = {
                '生命': inputData['hp'],
                '攻击': inputData['attack'],
                '防御': inputData['defence'],
                '暴击': inputData['crit-rate'],
                '暴伤': inputData['crit-dmg'],
                '誓约增伤': inputData['oath-boost'],
                '誓约回能': inputData['oath-regen'],
                '加速回能': inputData['energy-regen'],
                '虚弱增伤': inputData['weaken-boost'],
                '对谱': inputData['matching'],
                '对谱加成': inputData['matching-buff'],
                '搭档': inputData['partner'],
                '搭档身份': inputData['partner-identity'],
                '日卡': inputData['sun-card'],
                '阶数': stage,
                '武器': inputData['weapon'],
                '关卡': levelType,
                '模式': levelMode,
                '关数': level,
                '时间': new Date().toISOString()
            };

            apiPost('orbit-record', data)
                .then(result => {
                    if (result.status === 'OK') {
                        this.showToast("上传成功", "Thanks♪(･ω･)ﾉ感谢您的使用！", 3000);
                        this.setData({ uploadVisible: false });
                        this.getRecords(1);
                    } else {
                        this.showToast("上传失败", result.error || '未知错误', 3000);
                    }
                })
                .catch(err => {
                    console.error('Post error:', err);
                    this.showToast("上传失败", "网络请求失败，请稍后再试。", 5000);
                });
        }
    }
})