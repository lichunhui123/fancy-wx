// pages/discountChoose/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsCartCode:[],   //商品cartCode
    discountList:[],     //未领取卡券列表
    noselect:false,   //不使用卡券
    branchesId:'',  //网点id
    useExplain:'',  //卡券说明
    offcomGoodMoney:0 , //未参与活动商品总额
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
        wx.setStorageSync('cloudiscount', 'nouse')
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
        wx.setStorageSync('cloudiscount', item)
        wx.navigateBack({})
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
      goodsCartCode: JSON.parse(options.cartCode),
      offcomGoodMoney: options.offcomGoodMoney
    })
  },
  //获取卡券
  getDiscountList(){
    wx.showLoading({
      title: '加载中',
    });
    service.cloudUsableOrder({
      branchesId: this.data.branchesId,
      proList: this.data.goodsCartCode,
      useStatus:10,  //未使用卡券
      userId: wx.getStorageSync('userId'),
      //price:this.data.offcomGoodMoney
    }).then(res => {
      wx.hideLoading()
      console.log(res)
      if(res.data.result==200){
        let list=res.data.data
        list.forEach(item=>{
          item.cardMoneyT = item.cardAmount?floatObj.divide(item.cardAmount,100):'-'
          item.fullMoneyT = item.fullMoney?floatObj.divide(item.fullMoney,100):'-'
          item.useThresholdT = item.useThreshold?floatObj.divide(item.useThreshold,100):'-'
          item.discountRatioT =item.discount?floatObj.divide(item.discount,100):'-'
          item.startTime = item.startTime?item.startTime:'-'
          item.endTime = item.endTime?item.endTime:'-'
          item.cardName= item.cardName?item.cardName:'-'
          item.select=false
        })
        this.setData({
          discountList:list
        },()=>{
          // this.getbestCoupon()
          this.chooseGl()
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  // 获取最优的卡券
  // getbestCoupon() {
  //   service.getbestcoupon({
  //     skuInfoDtos: this.data.goodsCartCode,
  //     userId: wx.getStorageSync('userId')
  //   }).then(res => {
  //     if (res.data.result == 200) {
  //       let data = res.data.data
  //       let storage=wx.getStorageSync('cloudiscount')
  //       if (storage) {       
  //         if (storage == '不使用') {
  //           this.setData({
  //             noselect: true
  //           })
  //         } else {
  //           let newdata = this.data.discountList.map(item => {
  //             if (item.cardOrderId == storage.cardOrderId) {
  //               item.select = true
  //             }
  //             return item
  //           })
  //           this.setData({
  //             discountList: newdata
  //           })
  //         }
  //       }else{
  //         let newdata=this.data.discountList.map(item=>{
  //           if (item.cardOrderId == data.cardOrderId){
  //             item.select=true
  //           }
  //           return item
  //         })
  //         this.setData({
  //           discountList:newdata
  //         })
  //       }
  //     }
  //   })
  // },
  //卡券说明显示
  cardExplain(e){
    console.log(e)
    let explain =e.target.dataset.explain
    if(explain){
      this.setData({
        cardExplainShow:true,
        useExplain:e.target.dataset.explain
      })
    }else{
      wx.showToast({
        title: '暂无卡券说明！',
        duration: 2000,
        icon: 'none'
      })
    }
    
  },
  //卡券说明隐藏
  cardExplainSure(){
    this.setData({
      cardExplainShow:false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  chooseGl(){
    let discountcode = wx.getStorageSync('cloudiscount')
    if ( discountcode!="nouse") {
      console.log(discountcode,this.data.discountList)
      let newdata = this.data.discountList.map(item => {
        if (item.cardOrderId == discountcode.cardOrderId) {
          item.select = true
        }
        return item
      })
      this.setData({
        discountList: newdata
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu()
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    this.setData({
      branchesId:currentCloudShop?currentCloudShop.siteId:'',
    })
    this.getDiscountList()
    let discountcode = wx.getStorageSync('cloudiscount')
    if ( discountcode=="nouse") {
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