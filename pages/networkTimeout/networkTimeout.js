Page({
    onLoad(){
        wx.hideLoading();
    },
    goRefresh(){
        wx.switchTab({
            url:"/pages/home/index"
        })
    }
});