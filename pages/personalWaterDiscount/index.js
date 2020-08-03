// pages/personalWaterDiscount/index.js
const service = require('../../service/index.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waterTicket:[],    //水票列表
    noData:false,  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //去水首页
  tobuyWater(){
    wx.redirectTo({
      url: '/pages/water/index',
    })
  },
  //获取水票列表
  getmywaterticket(){
    wx.showLoading({
      title: '加载中',
    })
    service.getmywaterticket({
      userId:wx.getStorageSync('userId')
    }).then(res=>{
      console.log(res)
      wx.hideLoading()
      if(res.data.result==200){
        wx.stopPullDownRefresh()
        let newdata = res.data.data.list
        newdata.forEach(item=>{
          item.explainShow=false
        })
        this.setData({
          noData:newdata.length<1?true:false,
          waterTicket:newdata
        })
      }else{
        this.setData({
          noData:true
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  //立即使用
  nowUse(e){
    let waterXin = wx.getStorageSync('isaddress')
    let isdefault = wx.getStorageSync('isdefault')
    if (!waterXin && !isdefault){
      wx.showToast({
        title: '请在水管家首页添加地址',
        icon: 'none'
      })
      return
    }
    let address=''
    if (waterXin){
      address = `${waterXin.provinceName == waterXin.cityName ? waterXin.cityName : waterXin.provinceName + waterXin.cityName}${waterXin.districtName}${waterXin.address}`
    }else{
      address = `${isdefault.provinceName == isdefault.cityName ? isdefault.cityName : isdefault.provinceName + isdefault.cityName}${isdefault.districtName}${isdefault.address}`
    }
    wx.showLoading({
      title: '加载中',
    })
    let skuCode = e.currentTarget.dataset.skucode
    service.userwaterticket({
      skuCode: skuCode,
      userId: wx.getStorageSync('userId'),
      address: address,
      cityName: waterXin.cityName?waterXin.cityName:isdefault.cityName
    }).then(res=>{
      console.log(res)
      wx.hideLoading()
      if(res.data.result==200){
        wx.setStorageSync('hischoose', '')
        if(res.data.data.goods){
          let waterdata = encodeURIComponent(JSON.stringify(res.data.data))
          wx.redirectTo({
            url: "/pages/shoppingOrder/index?goods=" + waterdata + '&rental=0&type=1',
          })
        }else{
          wx.showToast({
            title: '当前收货地址无对应水商品可使用此水票',
            icon: 'none'
          })
        }
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getmywaterticket()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },
  //使用说明点击
  explainClick(e){
    let ind=e.currentTarget.dataset.ind
    this.data.waterTicket.forEach((item,index)=>{
      if(index==ind){
        item.explainShow = !item.explainShow
      }
    })
    this.setData({
      waterTicket:this.data.waterTicket
    })
    
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
    this.getmywaterticket()
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