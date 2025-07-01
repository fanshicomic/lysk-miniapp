const {
    apiGet,
    apiPost
} = require('../../utils/util.js');
const announcementUtil = require('../../utils/announcement.js');
const {
    LEVEL_TYPES,
    DROPDOWN_VALUES
} = require('../../utils/constants.js');

Page({
    data: {
        panelKeys: ["生命", "攻击", "防御", "暴击", "暴伤", "誓约增伤", "誓约回能", "加速回能", "虚弱增伤", "对谱", "对谱加成", "搭档", "搭档身份", "日卡", "阶数", "武器"],
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

        isToastVisible: false,
        toastHeader: '',
        toastBody: '',
        isAnnouncementVisible: false,
        announcementBody: '',
        announcementUpdates: ''
    },

    onLoad(options) {
        this.dataInit();

        const announcementData = announcementUtil.showAnnouncement();
        if (announcementData) {
            this.setData({
                isAnnouncementVisible: true,
                announcementBody: announcementData.body,
                announcementUpdates: announcementData.updates
            });
        }
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

    getRecords(page = 1) {
        const {
            levelType,
            levelMode,
            levelNumber,
            levelPart,
            pageSize
        } = this.data;
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

    handleCloseAnnouncement() {
        this.setData({
            isAnnouncementVisible: false
        });
    },

    showToast(header, body, delay) {
        this.data.toastHeader = header;
        this.data.toastBody = body;
        this.data.isToastVisible = true;

        setTimeout(() => {
            this.data.toastHeader = '';
            this.data.toastBody = '';
            this.data.isToastVisible = false;
        }, delay)
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
            console.log(inputData);
        }
    }
})