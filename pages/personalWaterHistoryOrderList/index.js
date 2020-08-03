const app = getApp();
const service = require("../../service/index");
const utils =require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:"",
    state:1,//tab选中状态
    tabArr:[
      {
        state:1,
        name:"全部"
      },
      {
        state:2,
        name:"待付款"
      },
      {
        state:3,
        name:"待收货"
      },
      {
        state:4,
        name:"已完成"
      },
      {
        state:5,
        name:"已取消"
      }
    ],
    imgHttp:app.globalData.imgUrl,
    hasRequest:false,//防止点击tab时列表还没请求完
    noData:false,//没有数据
    orderList:null,//订单列表
  },
  //tab切换
  getOrderChange(e){
    if(this.data.hasRequest){
      return;
    }
    let index = e.currentTarget.dataset.index;
    this.setData({state:index,pageNum:1,orderList:null,noData:false});
    this.getOrderList(index);
  },
  //获取订单列表
  getOrderList(index){
    let t=this;
    wx.showLoading({title: '加载中'});
    this.setData({
      hasRequest:true
    });
    let param={
      userId: this.data.userId,
      state: index
    };
    service.getWaterHistoryOrderList({
      params:JSON.stringify(param)
    }).then((res)=>{
      wx.hideLoading();
      this.setData({
        hasRequest:false
      });
      //停止刷新
      t.stopPullDownRefresh();
      if(res.data.result==0){
        let orderList=[];
        let list = res.data.data.data1;//订单
        let sendList = res.data.data.data2;//派送单
        if(list){//订单
          list.forEach((item)=>{
            if(item.wtOrderMes.length>0){
              let mes = item.wtOrderMes[0];
              let sequence = JSON.parse(mes.sequence);//商品信息
              let name="";
              let goodsSpec="";
              if(sequence&&sequence.setmealJson&&sequence.setmealJson.name){
                name = sequence.setmealJson.name;
              }
              if(sequence&&sequence.productJson&&sequence.productJson.goodsSpec){
                goodsSpec = sequence.productJson.goodsSpec;
              }
              let info={
                orderType:1,//1：订单 2：派送单
                detail:item
              };
              let order={
                orderType:1,//1：订单 2：派送单
                state:item.orderState,//订单状态  1：待付款  3：已完成 -1：已取消
                orderNo:item.orderNo,//订单编号
                goodsPic:sequence&&sequence.productJson&&sequence.productJson.goodsPic?sequence.productJson.goodsPic:"",//商品图片
                goodsName:mes.skuName,//商品名称
                goodsNum:mes.num? mes.num: 1,//商品数量
                specifications:mes.pType === 1?name:goodsSpec,//商品规格
                orderTime:utils.formatHen(item.orderTime),//下单时间
                paymentMoney:item.paymentMoney,//应付金额  单位：分
                info,//详细信息
              };
              orderList.push(order);
            }

          });
        }
        if(sendList){//派送单
          sendList.forEach((item)=>{
            if(item.wtSendMes.length>0){
              let mes = item.wtSendMes[0];
              let sequence = JSON.parse(mes.sequence);//商品信息
              let info={
                orderType:2,//1：订单 2：派送单
                detail:item
              };
              let order={
                orderType:2,//1：订单 2：派送单
                type:mes.type,//类型 如果是1 需要展示“取消派送单”按钮
                state:item.status,//订单状态 0：待收货 5：已完成 -1：已取消
                sendNo:item.sendNo,//派送编号
                goodsPic:sequence.goodsPic?sequence.goodsPic:"",//商品图片
                goodsName:sequence.goodsName,//商品名称
                goodsNum:mes.num? mes.num: 1,//商品数量
                specifications:sequence.goodsSpec,//商品规格
                appointmentTime:utils.formatHen(item.appointmentTime),//预约时间
                userId:item.userId,
                contacts:item.contacts,
                id:item.id,
                remarks:item.remarks,
                waterstoreId:item.waterstoreId,
                info,//详细信息
              };
              orderList.push(order);
            }
          });
        }

        this.setData({
          orderList:orderList
        });
        if(!orderList||orderList.length==0){
          this.setData({
            noData:true
          });
        }
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //跳转详情页
  goOrderDetail(e){
    let info = e.currentTarget.dataset.info;
    app.globalData.waterHistoryOrderDetail = info;
    wx.navigateTo({
      url:"/pages/personalWaterHistoryOrderDetail/index"
    })
  },
  //取消订单
  cancelOrder(e){
    let t=this;
    let orderNo=e.currentTarget.dataset.orderno;
    wx.showModal({
      content: '确定取消派送单？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res) {
        if (res.confirm) {
          let param = {
            platform: 'wx',
            requestCode: 12,
            params: "{orderNo:'"+orderNo+"'}"
          };
          wx.showLoading({title:"加载中..."});
          service.cancelWaterHistoryOrder(param).then((res)=>{
            wx.hideLoading();
            if (res.data.result === 0) {
              wx.showToast({
                title: "订单取消成功",
                icon: 'none'
              });
              t.setData({
                orderList: [],
                noData:false,
              });
              t.getOrderList(t.data.state);
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              });
            }
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  //取消派送单
  cancelSendOrder(e){
    let t=this;
    let sendNo=e.currentTarget.dataset.sendno;
    wx.showModal({
      content: '确定取消派送单？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res) {
        if (res.confirm) {
          let param = {
            "platform": "wx",
            "requestCode": 2002,
            "params": JSON.stringify({sendNo: sendNo})
          };
          wx.showLoading({title:"加载中..."});
          service.cancelWaterHistorySendOrder(param).then((res)=>{
            wx.hideLoading();
            if (res.data.result === 0) {
              wx.showToast({
                title: "派送单取消成功",
                icon: 'none'
              });
              t.setData({
                orderList: [],
                noData:false,
              });
              t.getOrderList(t.data.state);
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              });
            }
          })
        } else if (res.cancel) {

        }
      }
    })

  },
  //一键催单进行是否催单判断
  waterReminder(e){
    let item = e.currentTarget.dataset.item;
    let reminderItem={  //当初当前催单的单号和时间戳
      'sendNo':item.sendNo,
      'reminderTime':Date.parse(new Date())
    };
    let referTime = wx.getStorageSync(item.sendNo)?wx.getStorageSync(item.sendNo) : ''; //对比的派送单号对比的时间
    if(referTime === ''){ //如果没有催单过的，进行第一次催单
      wx.setStorageSync(item.sendNo,Date.parse(new Date()));
      this.waterReminderFn(item);
    }else{ //催单过的
      let presentTime = reminderItem.reminderTime; //获取当前催单时间
      if( (presentTime - parseInt(referTime)) > 900000){ //判断是否催单超过15分钟，超过15分钟的，再次催单
        wx.setStorageSync(item.sendNo,presentTime);
        this.waterReminderFn(item);
      }else{//没有超过15分钟的，直接返回催单成功，不进行后台请求
        wx.showToast({
          title: "催单成功",
          icon: 'none'
        })
      }
    }
  },
  //一键催单
  waterReminderFn(item) {
    let param={
      platform: "wx",
      requestCode: 2002,
      params: JSON.stringify({userId: item.userId, userName:item.contacts, sendId:item.id, remarks:item.remarks,waterstoreId:item.waterstoreId})
    };
    wx.showLoading({title:"加载中..."});
    service.waterHistoryReminder(param).then((res) => {
      wx.hideLoading();
      if (res.data.result === 1) {
        wx.showToast({
          title: "催单成功",
          icon: 'none'
        })
      } else {
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
    this.setData({
      userId:wx.getStorageSync("userId")
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
    wx.hideShareMenu();
    this.setData({
       orderList:null,
       noData:false,
    });
    this.getOrderList(this.data.state);
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
      orderList: [],
      noData:false,
    });
    this.getOrderList(this.data.state);
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