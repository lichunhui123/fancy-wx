let config = require("../../config.js");
let service = require("../../service/index.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",//订单的ID
    onOff:true,
    orderInfo:null,
    wuliu:[]
  },
  //展开收起
  onOffClick(){
    let onOff = !this.data.onOff;
    this.setData({onOff})
  },
  //拨打电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.orderInfo.linkPhone //仅为示例，并非真实的电话号码
    })
  },
  //获取订单详情
  getOrderDetail(){
    wx.showLoading({title:"加载中..."});
    service.getOrderDetail({
      id:this.data.id
    }).then((res)=>{
      wx.hideLoading();
      this.stopPullDownRefresh();
      //console.log(res);
      if(res.data.result==200){

        let onOff = true;
        if(res.data.data.status==1005||res.data.data.status==1003){//已揽件 需要展示物流信息
          onOff = false;
        }
        this.setData({orderInfo:res.data.data,onOff});
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
    service.getOrderwu({
      id: this.data.id
    }).then((res)=>{
      console.log(res)
      if(res.data.result=='200'){
        let data=res.data.data
        // let arr =[]
        // for(var i=data.length-1;i>=0;i--){
        //   arr.push(data[i])
        // }
        this.setData({
          wuliu:data
        })
      }
    })
  },
  //取消订单
  cancelOrder(){
    let t=this;
    wx.showModal({
      content: "确认取消当前订单？",
      showCancel: true,
      cancelColor: "#999999",
      confirmColor: "#F2922F",
      success(res) {
        if (res.confirm) {
          t.sure();
        }
      }
    })
  },
  //订单取消确认
  sure(){
    wx.showLoading({title:""});
    service.cancelorder({
      id:this.data.id
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        wx.showToast({
          title: "取消订单成功",
          icon: 'none',
          duration: 2000
        });
        
        this.getOrderDetail();
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    });
    this.setData({showDialogs:false})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({id:options.id});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getOrderDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderDetail();
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
    this.getOrderDetail();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) { }
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