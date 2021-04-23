// pages/drawDiscount/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
		branchId: "",
    discountList:[],   //卡券列表
    cardExplainShow:false,  //卡券说明显示 
    useExplain:'',  //卡券说明
    siteName:'',//门店名称
    noData:false
  },
  //获取卡券
  getDiscountList(no){
    if(no!='no'){
      wx.showLoading({
        title: '加载中',
      })
    }
    service.cloudMarkingOrder({
			branchesId: this.data.branchId,
      skuCode: this.data.goodsCartCode,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log(res)
      if(res.data.result==200){
        let notClaimedList=res.data.data.notClaimedList||[]
        let newlist= [...notClaimedList]
        newlist.forEach(item=>{
          item.cardMoneyT = item.cardMoney?floatObj.divide(item.cardMoney,100):'-'
          item.fullMoneyT = item.fullMoney?floatObj.divide(item.fullMoney,100):'-'
          item.discountRatioT =item.discountRatio?floatObj.divide(item.discountRatio,100):'-'
          item.startTime = item.startTime?item.startTime:'-'
          item.endTime = item.endTime?item.endTime:'-'
        })
        if(newlist.length<1){
          this.setData({
            noData:true
          })
        }
        this.setData({
          discountList:newlist
        })
      }else{
        this.setData({
          noData:true
        })
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(()=>{
      this.setData({
        noData:true
      })
    })
  },
  //卡券说明显示
  cardExplain(e){
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
  cardExplainSure(e){
    this.setData({
      cardExplainShow:false,
    })
  },
  //卡券领取
  rightaway(e){
    wx.showLoading({
      title: '加载中',
    })
    let code = e.target.dataset.caco
    service.cloudDraowOrder({
      userId: wx.getStorageSync('userId'),
      cardCode: code
    }).then(res => {
      console.log(33,res)
      if(res.data.result==200){
        this.getDiscountList('no')
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      goodsCartCode: JSON.parse(options.draowQ)
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
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//选择的站点
		this.setData({
      branchId: currentCloudShop ? currentCloudShop.siteId : "",    //站点id
      siteName:currentCloudShop?currentCloudShop.siteName:"",//门店名称
		});
    this.getDiscountList()
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
    this.getDiscountList()
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