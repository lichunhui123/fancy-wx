// pages/personalOrderDetail/index.js
const app=getApp();
const service = require("../../service/index");
const utils =require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgHttp:app.globalData.imgUrl,
    orderDetails:null,//订单详情
    timeout:'',
    zero:false,
    iphone:false, //适配iphonex
  },
  //获取订单详情
  getOrderInfo(info){
    wx.showLoading({title:"加载中..."});
    let detail = info.detail;
    let orderDetails={};
    if(info.orderType==1){//订单
      let goodsList=[];
      let goodsCount=0;//商品总数量
      //商品循环
      detail.wtOrderMes.forEach((item)=>{
        let name="";
        let goodsSpec="";
        let sequence=JSON.parse(item.sequence);
        if(sequence&&sequence.setmealJson&&sequence.setmealJson.name){
          name = sequence.setmealJson.name;
        }
        if(sequence&&sequence.productJson&&sequence.productJson.goodsSpec){
          goodsSpec = sequence.productJson.goodsSpec;
        }
        let goods={
          goodsPic:sequence&&sequence.productJson&&sequence.productJson.goodsPic?sequence.productJson.goodsPic:"",//商品图片
          goodsName:item.skuName,//商品名称
          specifications:item.pType === 1?name:goodsSpec,//规格
          goodsNum:item.num? item.num: 1,//商品数量
          goodsPrice:item.price,//商品价格 单位：分
        };
        goodsCount+=goods.goodsNum;//商品数量加
        goodsList.push(goods);
      });
      let state=0;
      if(detail.orderState==1){//待付款
        state=1;
        let nowTime = new Date().getTime();
        let newCreateTime = detail.orderTime;
        if(detail.orderTime>nowTime){//如果创建时间大于当前时间 赋值当前时间
          newCreateTime=nowTime;
        }
        let overTime=newCreateTime+30*60*1000;//超时时间
        this.formDate(overTime,nowTime);//订单超时时间
      }else if(detail.orderState==3){//已完成
        state=3;
      }else if(detail.orderState==-1){//已取消
        state=4;
      }
      orderDetails.state=state;//订单状态  1：待付款  3：已完成 4：已取消
      orderDetails.userName=detail.contacts;//用户名
      orderDetails.phone=detail.phone;//手机
      orderDetails.address=detail.province+detail.city+detail.area+detail.address;//地址
      orderDetails.appointmentTime=utils.formatHen(detail.appointmentTime);//预约时间
      orderDetails.goodsList=goodsList;//订单商品
      orderDetails.goodsCount=goodsCount;//商品总数量
      orderDetails.money=detail.money;//商品总额
      orderDetails.ticketMoney=detail.ticketMoney;//水票抵扣
      orderDetails.paymentMoney=detail.paymentMoney;//实付款
      orderDetails.orderNo=detail.orderNo;//订单编号
      orderDetails.orderTime=utils.formatHen(detail.orderTime);//下单时间
      orderDetails.paymentCode=detail.paymentCode;//支付单号
      orderDetails.userId=detail.userId;//支付时需要的userId
      orderDetails.payAddress=detail.address;//支付时需要的address
    }else{//派送单
      let goodsList=[];
      let goodsCount=0;//商品总数量
      //商品循环
      detail.wtSendMes.forEach((item)=>{
        let sequence=JSON.parse(item.sequence);
        let goods={
          goodsPic:sequence.goodsPic?sequence.goodsPic:"",//商品图片
          goodsName:sequence.goodsName,//商品名称
          specifications:sequence.goodsSpec,//规格
          goodsNum:item.num? item.num: 1,//商品数量
          goodsPrice:sequence.sellPrice,//商品价格 单位：分
        };
        goodsCount+=goods.goodsNum;//商品数量加
        goodsList.push(goods);
        let state=0;
        if(detail.status==0){//待收货
          state=2;
        }else if(detail.status==5){//已完成
          state=3;
        }else if(detail.status==-1){//已取消
          state=4;
        }
        orderDetails.state=state;//订单状态  2：待收货  3：已完成 4：已取消
        orderDetails.userName=detail.contacts;//用户名
        orderDetails.phone=detail.phone;//手机
        orderDetails.address=detail.province+detail.city+detail.area+detail.address;//地址
        orderDetails.appointmentTime=utils.formatHen(detail.appointmentTime);//预约时间
        orderDetails.goodsList=goodsList;//订单商品
        orderDetails.goodsCount=goodsCount;//商品总数量
        //orderDetails.money=detail.money;//商品总额
        //orderDetails.ticketMoney=detail.ticketMoney;//水票抵扣
        //orderDetails.paymentMoney=detail.paymentMoney;//实付款
        orderDetails.sendNo=detail.sendNo;//派送单编号
        orderDetails.orderTime=utils.formatHen(detail.createTime);//下单时间
        orderDetails.paymentCode=detail.paymentCode;//支付单号
      });
    }
    wx.hideLoading();
    this.setData({orderDetails:orderDetails});
  },
  //复制订单编号
  copy(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success: function (res) {
        wx.showToast({
          title: '已复制到粘贴板',
          icon:'none'
        });
      }
    });
  },
  //待付款倒计时
  formDate(t,nowTime){
    let that = this;
    let time=nowTime?nowTime:new Date().getTime();
    if(t>time){
      let date = new Date(t - time);
      //分
      let m = date.getMinutes();
      if (m < 10) {
        m = '0' + m
      }
      //秒
      let s = date.getSeconds();
      if (s < 10) {
        s = "0" + s
      }
      this.setData({
        timeout: m + ":" + s
      });
      let ss = setTimeout(function () {
        that.formDate(t)
      }, 1000);
      if (t - time < 0) {
        clearTimeout(ss);
        this.setData({
          timeout: "00:00",
          zero:true
        })
      }
    }else{
      this.setData({
        timeout: "00:00",
        zero:true
      });
    }
  },
  //待付款状态 取消订单
  cancelOrder(e) {
    let orderNo=e.currentTarget.dataset.orderno;
    wx.showModal({
      content: '确定取消订单？',
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
              setTimeout(function(){
                wx.switchTab({
                  url: '/pages/home/index'
                })
              },1000)
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
  //去支付
  goPay(){
    let t=this;
    if(this.onClick){
      return;
    }
    this.onClick=true;
    wx.showLoading({
      mask: true,
      title: '支付中',
    });
    let order = this.data.orderDetails;
    let param = {
      platform: "wx",
      requestCode: 12,
      params:
        "{orderNo:'" +
        order.orderNo +
        "',userId:'" +
        order.userId +
        "',contacts:'" +
        order.userName +
        "',address:'" +
        order.payAddress +
        "',openId:'" +
        wx.getStorageSync("openId") +
        "'}"
    };
    service.payWaterHistoryOrder(
        param
    ).then((res)=>{
      if(res.data.result==0){
        let data = res.data.data;
        let payData={
          timestamp:data.timeStamp,
          nonceStr:data.nonceStr,
          packageStr:data.package,
          signType:data.signType,
          sign:data.sign
        };
        service.wxPay(payData).then(() => {
          t.onClick=false;
          wx.showToast({
            title: '支付成功！',
            icon: 'none',
            duration: 1000
          });
          setTimeout(()=>{
            wx.redirectTo({
              url: '../../pages/shoppingPaySucceed/paySucceed',
            })
          },1000);
        }).catch((d) => {
          t.onClick=false;
          wx.hideLoading();
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            content: '未支付订单将在30分钟内取消，请尽快完成支付~',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          });
        })
      }else{
        t.onClick=false;
        wx.hideLoading();
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
    console.log(app.globalData.waterHistoryOrderDetail);
    this.getOrderInfo(app.globalData.waterHistoryOrderDetail);
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
    let isIPhoneX = app.globalData.isIPhoneX;
    if (isIPhoneX) {
      this.setData({
        iphone: isIPhoneX
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