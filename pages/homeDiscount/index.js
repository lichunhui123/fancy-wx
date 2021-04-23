// pages/discount/index.js
const service = require('../../service/index.js');
const until = require('../../utils/util.js')
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discountType:[
      {"title":"未使用",id:"10"},   //10= 未使用，20= 已使用，30= 已过期
      {"title":"已使用",id:"20"},
      {"title":"已过期",id:"30"}],
    unused:"10",   //默认选择未使用
    noData:false,//没有数据
    coupondata:[],  //卡券数据
  },
  //立即使用
  nowUse(){

  },
  //头部状态切换
  headItemClick(e){
    let ind = e.target.dataset.ind;
    this.setData({
      unused:ind,
      noData:false
    },()=>{
      this.setData({
        coupondata:[]
      });
      this.getCoupondata()
    })
  },
  //获取卡券信息
  getCoupondata(){
    wx.showLoading({
      title: '加载中...',
    });
    // 1 = 优惠，2 = 满减，3 = 折扣
    service.getcoupondata({
      skuCodes: [],
      useStatus: this.data.unused,  //10= 未使用，20= 已使用，30= 已过期
      userId: wx.getStorageSync("userId")
    }).then(res=>{
      this.stopPullDownRefresh();
      if(res.data.result==200){
        wx.hideLoading();
        let data=res.data.data;
        if(data){
          data.forEach(item=>{
            item.startTime =until.formitTime(item.startTime,20);
            item.endTime=until.formitTime(item.endTime,20);
            item.cardAmount=floatObj.divide(item.cardAmount,100);
            item.fullAmountPrice=JSON.parse(item.fullAmountPrice);
            item.useThreshold = item.useThreshold?floatObj.divide(item.useThreshold,100):'-'
            item.mecName=item.mecName;
            item.discount = item.cardType==30?floatObj.divide(item.discount,100):floatObj.divide(item.discount,10)
          });
          this.setData({
            coupondata: data
          });
          if(!data||data.length==0){
            this.setData({noData:true});
          }else{
            this.setData({ noData: false });
          }
        }
      }else{
        this.setData({noData:true});
      }
    })
  },
  //更新卡券信息
  tilteMessage(){
    service.queryCardListByUserAndGoodsAndStatus({
       userId: wx.getStorageSync('userId'),
       useStatus:10,
        source:'wx',
    }).then(res=>{
        
    })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu()
    this.setData({
      coupondata: [],
      noData:false,
    });
    this.getCoupondata();
    this.tilteMessage();
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
    this.setData({
      coupondata: [],
      noData:false
    });
    this.getCoupondata();
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