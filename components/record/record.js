import {
    DROPDOWN_VALUES
} from '../../utils/constants.js';

const computedBehavior = require('miniprogram-computed').behavior;

Component({
    behaviors: [computedBehavior],
    properties: {
        record: {
            type: Object,
            value: {
                "关卡": "",
                "关数": "",
                "攻击": "",
                "生命": "",
                "防御": "",
                "对谱": "",
                "对谱加成": "",
                "暴击": "",
                "暴伤": "",
                "加速回能": "",
                "虚弱增伤": "",
                "誓约增伤": "",
                "誓约回能": "",
                "搭档身份": "",
                "日卡": "",
                "阶数": "",
                "武器": "",
                "加成": "",
                "时间": ""
            }
        }
    },
    computed: {
        getLevelDisplay(data) {
            const level = data.record['关数'];
            let label = data.record['关卡'];
            if (data.record['关卡'] == '开放') {
                label += ' ' + data.record['模式'];
            }
            label += ' ' + level.replace(/_/g, ' ');
            return label
        },
        getSetCardColorMap(data) {
            const card = data.record['日卡'];
            const partner = data.record['搭档身份'];

            const pinkCards = ["匿光", "神殿", "点染", "掠心", "锋尖"];
            if (pinkCards.includes(card)) return "set-card-pink";
            const purpleCards = ["深海", "斑斓", "寂路"];
            if (purpleCards.includes(card)) return "set-card-purple";
            const redCards = ["拥雪", "夜色", "碧海", "远空", "长昼"];
            if (redCards.includes(card)) return "set-card-red";
            const greenCards = ["逐光", "睱日", "深渊", "离途", "坠浪"];
            if (greenCards.includes(card)) return "set-card-green";
            const yellowCards = ["雾海", "末夜", "弦光", "深林"];
            if (yellowCards.includes(card)) return "set-card-yellow";
            const blueCards = ["永恒", "静谧", "戮夜"];
            if (blueCards.includes(card)) return "set-card-blue";
            if (card === "心晴") {
                const xavier = DROPDOWN_VALUES['沈星回搭档'];
                const zayne =  DROPDOWN_VALUES['黎深搭档'];
                const rafayel = DROPDOWN_VALUES['祁煜搭档'];
                if (xavier.includes(partner)) return "set-card-red";
                if (zayne.includes(partner)) return "set-card-pink";
                if (rafayel.includes(partner)) return "set-card-yellow";
            }
            return "set-card-none";
        },
        getPartnerColorMap(data) {
            const partner = data.record['搭档身份'];

            if (partner === "逐光骑士") return "partner-light-seeker";
            if (partner === "光猎") return "partner-lumiere";
            if (partner === "永恒先知") return "partner-foreseer";
            if (partner === "九黎司命") return "partner-master-of-fate";
            if (partner === "利莫里亚海神") return "partner-lemurian-sea-god";
            if (partner === "潮汐之神") return "partner-god-of-the-tides";
            if (partner === "深海潜行者") return "partner-abyss-walker";
            if (partner === "无尽掠夺者") return "partner-relentless-conqueror";
            if (partner === "深渊主宰") return "partner-abysm-sovereign";
            if (partner === "远空执舰官") return "partner-farspace-colonel";
            if (partner === "终极兵器X-02") return "partner-ultimate-weapon-X-02";
            return "partner-normal";
        },
        getMatchingClass(data) {
            const matching = data.record["对谱"];
            return matching === "顺" ? "is-matching" : "is-not-matching";
        },
        getMatchingColor(data) {
            const matching = data.record["对谱"];
            return matching === "顺" ? "#42a366" : "#bd4e4b";
        },
        getWeaponClass(data) {
            const weapon = data.record['武器'];
            return weapon === "专武" ? "weapon-rare" : "weapon-normal";
        },
        getMatchingCount(data) {
            const count = data.record["对谱加成"];
            const matchingBonus = Number(count) || 0;
            return Math.round(Math.min(matchingBonus, 30) / 5);
        },
    },
    methods: {
    }
});