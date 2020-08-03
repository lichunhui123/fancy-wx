// pages/discountChoose/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsCartCode:[],   //商品cartCode
    userId:wx.getStorageSync('userId'),   //用户id
    discountList:[],     //卡券列表
    noselect:false,   //不使用卡券
  },
  //不使用点击
  noUse(){
    this.setData({
      noselect:true
    },()=>{
      if(this.data.noselect){
        let newdata = this.data.discountList.map(item => {
          item.select=false
          return item
        })
        this.setData({
          discountList:newdata
        })
        wx.setStorageSync('discount', '不使用')
        wx.navigateBack({
        })
      }
    })
  },
  //卡券点击
  cardClick(e){
    let cardOrderId = e.currentTarget.dataset.itemdata.cardOrderId
    let newdata=this.data.discountList.map(item=>{
      if (item.cardOrderId == cardOrderId){
        if(item.select){
          item.select=true
        }else{
          item.select = !item.select
        }
        wx.setStorageSync('discount', item)
        wx.navigateBack({
        })
      }else{
        item.select=false
      }
      return item
    })
    this.setData({
      noselect:false,
      discountList:newdata
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsCartCode: JSON.parse(options.cartCode)
    })
  },
  //获取卡券
  getDiscountList(){
    wx.showLoading({
      title: '加载中',
    })
    service.getcoupon({
      skuInfoDtos: this.data.goodsCartCode,
      userCode: wx.getStorageSync('userId')
    }).then(res => {
      wx.hideLoading()
      if(res.data.result==200){
        let list=res.data.data
        list.forEach(item=>{
          item.discountAmount = floatObj.divide(item.discountAmount,100).toFixed(2)
          item.startTime = item.startTime?item.startTime.substring(0, 11):''
          item.endTime = item.endTime?item.endTime.substring(0, 11):''
          item.select=false
        })
        this.setData({
          discountList:list
        },()=>{
          this.getbestCoupon()
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //获取最优的卡券
  getbestCoupon() {
    service.getbestcoupon({
      skuInfoDtos: this.data.goodsCartCode,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.result == 200) {
        let data = res.data.data
        let storage=wx.getStorageSync('discount')
        if (storage) {       
          if (storage == '不使用') {
            this.setData({
              noselect: true
            })
          } else {
            let newdata = this.data.discountList.map(item => {
              if (item.cardOrderId == storage.cardOrderId) {
                item.select = true
              }
              return item
            })
            this.setData({
              discountList: newdata
            })
          }
        }else{
          let newdata=this.data.discountList.map(item=>{
            if (item.cardOrderId == data.cardOrderId){
              item.select=true
            }
            return item
          })
          this.setData({
            discountList:newdata
          })
        }
      }
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
    wx.hideShareMenu()
    this.setData({
      userId: wx.getStorageSync('userId'),   //用户id
    })
    this.getDiscountList()
    let discountcode = wx.getStorageSync('discount') ? wx.getStorageSync('discount'): ''
    if (discountcode && discountcode=="不使用") {
      this.setData({
        noselect:true
      })
    }
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