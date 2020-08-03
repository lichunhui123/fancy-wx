let config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:"",//联系人
    phone:"",//联系电话
    mecName:"",//服务门店
    address:"",//地址
  },
  //打电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.phone //仅为示例，并非真实的电话号码
    })
  },
  //继续下单
  goExpress(){
    wx.redirectTo({
      url:"/pages/express/index"
    })
  },
  //我的订单
  goOrder(){
    wx.redirectTo({
      url:"/pages/expressOrder/index"
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      name:options.name,//联系人
      phone:options.phone,//联系电话
      mecName:options.mecName,//服务门店
      address:options.address,//地址
    })
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