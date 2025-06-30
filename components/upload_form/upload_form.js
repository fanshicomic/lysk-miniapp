import {
    DROPDOWN_VALUES
} from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
    behaviors: [computedBehavior],
    computed: {
        getMatchingOptions() {
            return DROPDOWN_VALUES['对谱'];
        },
        getMatchingBufferOptions() {
            return DROPDOWN_VALUES['对谱加成'];
        },
        getStageOptions() {
            return DROPDOWN_VALUES['阶数'];
        },
        getWeaponOptions() {
            return DROPDOWN_VALUES['武器'];
        },
        getPartnerOptions(data) {
            if (data.selectedPartner !== "") {
                return [data.selectedPartner]
            }
            return DROPDOWN_VALUES['搭档'];
        },
        getPartnerIdentityOptions(data) {
            if (data.selectedPartner !== "") {
                const partnerIdentityKey = data.selectedPartner + "搭档";
                return DROPDOWN_VALUES[partnerIdentityKey] || [];
            } else {
                return [];
            }
        },
        getSunCardOptions(data) {
            if (data.selectedPartner !== "") {
                const sunCardKey = data.selectedPartner + "日卡";
                return DROPDOWN_VALUES[sunCardKey] || [];
            } else {
                return [];
            }            
        }
    },
    properties: {
        levelType: {
            type: String,
            observer: 'onLevelTypeChange'
        },
        selectedPartner: {
            type: String,
            obeserver: 'onPartnerChange'
        }
    },

    data: {
        panelInputs: [],
        inputValues: {
            'matching': ''
        },
    },

    methods: {
        onInput(e) {
            const {
                key
            } = e.currentTarget.dataset;
            let {
                value
            } = e.detail;

            // Replace any non-numeric characters except for a single decimal point
            value = value.replace(/[^\d.]/g, '');

            // Ensure that there's only one decimal point
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }

            this.setData({
                [`inputValues.${key}`]: value
            });
        },

        onPartnerChange(e) {
            const partner = e.detail.value;
            console.log(partner);
            this.setData({
                selectedPartner: partner,
                'inputValues.partner-identity': '',
                'inputValues.sun-card': ''
            })
        },

        onLevelTypeChange(type) {
            if (type !== "开放") {
                const levelPartnerMap = {
                    "光": "沈星回",
                    "冰": "黎深",
                    "火": "祁煜",
                    "能量": "秦彻",
                    "引力": "夏以昼"
                };
                const partner = levelPartnerMap[type];
                this.setData({
                    selectedPartner: partner,
                    'inputValues.partner-identity': '',
                    'inputValues.sun-card': ''
                })
            } else {
                this.setData({
                    selectedPartner: "",
                    'inputValues.partner-identity': '',
                    'inputValues.sun-card': ''
                })
            }
        },
    },

    lifetimes: {
        attached: function () {
        }
    }
});