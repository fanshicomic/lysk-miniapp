export function showAnnouncement() {
    const announcementKey = "1.2.3"
    if (localStorage.getItem(announcementKey)) return;
    localStorage.setItem(announcementKey, '1');

    prepareAnnouncement();

    const announcement = document.getElementById("announcement");
    announcement.style.display = "block";
}

export function forceDisplayAnnouncement() {
    prepareAnnouncement();

    const announcement = document.getElementById("announcement");
    announcement.style.display = "block";
}

function prepareAnnouncement() {
    const announcementBody = document.getElementById("announcement-general-msg");
    const announcementLatestUpdates = document.getElementById("announcement-latest-updates");
    announcementBody.innerText = getAnnouncementBody();
    announcementLatestUpdates.innerText = getAnnouncementLatestUpdates();

}

function getAnnouncementBody() {
    return `猎人小姐你好!
    
            欢迎使用深空面板助手 :)
            库中的面板会用于正在开发的数据分析功能，感谢你的每一条记录分享~
            更多功能如筛选、排序、截图识别也在开发进程中，敬请期待
            公告可前往本助手首页右上角重新查看`
}

function getAnnouncementLatestUpdates() {
    return `最新更新
            - 2025-06-17：支持搭档利莫里亚海神
            - 2025-06-10：表单阶数显示优化
            - 2025-06-09：新增系统公告功能+防御/生命搭档上传数据验证
            - 2025-06-07：更具体的上传数据验证`
}