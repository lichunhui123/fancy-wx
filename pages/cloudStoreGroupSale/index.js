const app = getApp();
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:wx.getStorageSync("userId"),
    branchId:"",//拼团站点ID
    cloudBranchId:"",//云店站点ID
    imgUrl: app.globalData.imgUrl,
    shoppNum:0, //购物车数量
    hasStart:true,//是否已开始
    countdownTime:{//指尖云店-多人拼团 距开始时间
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    groupSaleGoods:[],//多人拼团商品列表
    pageNum:1,  //当前页数
    pageSize:12, //每页数量
    listNum:0, //数据返回长度
    noMore:false,//没有更多了
  },
  //指尖云店商品详情
  cloudGoodsDetailClick(e){
    let { goodsCode,activityCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode=' + activityCode,
    })
  },
  //跳转购物车页
  goBuyCar() {
    wx.reLaunch({
      url: `/pages/shoppingCar/index`
    })
  },
  //购物车数量
  shoppingNum(){
    service.shoppingnum({
      smallBranchesId: this.data.cloudBranchId,
      branchesId:this.data.branchId,
      userId: this.data.userId,
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          shoppNum: res.data.data.goodsNumber
        });
      }
    })
  },
  //查询指尖云店-好物预售 好货团团
  getSmallGoodsListByActivity(){
    wx.showLoading({
      title:"加载中..."
    });
    clearInterval(this.timer);
    service.getSmallGoodsListByActivity({
      branchesId:this.data.cloudBranchId,
      type:90, //80-好物预售 90-多人拼团
      pageNo: this.data.pageNum,
      pageSize: this.data.pageSize,
    }).then(res=>{
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if(res.data.result==200){
        let data = res.data.data;
        if(data&&data.length>0){
          let noMore = false;//没有更多了
          if(data.length<this.data.pageSize){
            noMore = true;
          }
          let hasStart = false;//是否已开始
          let startTime = (new Date(data[0].startTime.replace(/-/g,"/"))).getTime();
          let times = (startTime - (new Date()).getTime()) / 1000;//距开始时间
          let endTime = (new Date(data[0].endTime.replace(/-/g,"/"))).getTime();
          let times1 = (endTime - (new Date()).getTime()) / 1000;//距结束时间
          if(times<=0){
            hasStart = true;//是否已开始
            this.countdown(times1);//距结束时间
          }
          data=[...this.data.groupSaleGoods,...data];
          let modular = data.length%3;//计算数组的长度模运算 还剩下几个 那这几个的border-bottom就没有
          let hasBorderIndex = data.length - modular;//此数字代表有border-bottom的值
          data.forEach((item,index)=>{
            item.goodsPic=item.goodsPic.split(',')[0];
            if(index+1<=hasBorderIndex&&data.length>3){
              item.hasBorder = true;
            }else{
              item.hasBorder = false;
            }
          });
          this.setData({
            hasStart,//多人拼团活动是否已开始
            groupSaleGoods:data,//指尖云店-多人拼团
            listNum:data.length,
            noMore
          })
        }else{
          this.setData({
            listNum:0
          })
        }
      }else{
        this.setData({
          listNum:0
        })
      }
    })
  },
  //倒计时时间计算
  countdown(times) {
    this.timer = null;
    this.timer = setInterval(() => {
      let day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值
      if (times > 0) {
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      times--;

      this.setData({
        countdownTime: {
          day: day,
          hour: hour,
          minute: minute,
          second: second,
        },
      });
      if (times <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  },
  //更新购物车数量
  refreshShopping(){
    this.shoppingNum();//获取购物车数量
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
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      hasStart:true,//是否已开始
      countdownTime:{//指尖云店-好物预售 距开始时间
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      },
      groupSaleGoods:[],//好物预售商品列表
      pageNum:1,  //当前页数
    });
    wx.hideShareMenu();
    this.shoppingNum();//获取购物车数量
    this.getSmallGoodsListByActivity();//获取多人拼团商品列表
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
      hasStart:true,//是否已开始
      countdownTime:{//指尖云店-好物预售 距开始时间
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      },
      groupSaleGoods:[],//好物预售商品列表
      pageNum:1,  //当前页数
    });
    this.shoppingNum();//获取购物车数量
    this.getSmallGoodsListByActivity();//获取好物预售商品列表
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.listNum<12){  //加载数据小于12条不再加载
      return;
    }else{
      this.setData({
        pageNum: ++this.data.pageNum
      },()=>{
        this.getSmallGoodsListByActivity()
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})