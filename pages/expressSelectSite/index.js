// pages/expressSelectSite/index.js
let service = require("../../service/index.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendAddress:"",//寄件地址
    list:null,//门店列表
  },
  //获取附件站点列表
  getList(){
    let t=this;
    let sendAddress=this.data.sendAddress;
    wx.showLoading({title:"加载中..."});
    service.getBranchesByAddrAndBiz({
      cityName:sendAddress.city,
      address:sendAddress.province+sendAddress.city+sendAddress.area+sendAddress.address
    }).then((res)=>{
      console.log(res);
      wx.hideLoading();
      t.stopPullDownRefresh();
      if(res.data.result==200){
        t.setData({list:res.data.data});
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //返回到发快递页
  backToExpress(e){
    let expressInfo=wx.getStorageSync("expressInfo");
    expressInfo.branchesInfo=e.currentTarget.dataset.info;//物品声明价值
    wx.setStorageSync("expressInfo",expressInfo);
    wx.navigateBack();
  },
  //打电话
  callPhone(e){
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  //导航
  navigation(e) {
    let item =  e.currentTarget.dataset.item;
    wx.openLocation({ // 打开微信内置地图，实现导航功能（在内置地图里面打开地图软件）
      latitude: Number(item.lat),//经度
      longitude: Number(item.lng),//纬度
      name: item.mecName,//门店名称
      address:item.address,//地址
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options){
      this.setData({
        sendAddress:JSON.parse(options.sendAddress)
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu();
    this.getList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})