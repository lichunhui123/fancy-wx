// pages/applicationForDrawback/index.js
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showReason:false,
    reasonId:"",//退款原因ID
    reason:"",//退款原因
    receiverName:"",//退款联系人
    receiverPhone:"",//联系电话
    submit:false,
    orderCode:'',
    orderStatus:'',//订单状态
    auditStatus:'',
    refundStatus:''
  },
  //校验提交按钮状态
  validate(){
    if(this.data.reasonId){
      this.setData({submit:true})
    }else{
      this.setData({submit:false})
    }
  },
  //点击打开退款原因弹层
  openReason(){
    this.setData({showReason:true});
  },
  //退款原因确定
  sureReason(val){
    this.setData({
      showReason:false,
      reason:val.detail.reason,
      reasonId:val.detail.reasonId
    });
    this.validate();
  },
  //申请退款
  submit(){
    if(this.hasSubmit){
      return
    }
      this.hasSubmit=true;
      let _this = this;
      wx.showLoading({
        title:"申请中..."
      });
      service.auditRefundOrder({
        orderCode:this.data.orderCode,
        refundMessage:this.data.reason
       }).then((res)=>{
        wx.hideLoading();
        if(res.data.result==200){
          let auditStatus = res.data.data.auditStatus;
          let refundStatus = res.data.data.refundStatus;
          wx.redirectTo({
            url: `/pages/applicationForDrawbackResult/index?auditStatus=${auditStatus}&refundStatus=${refundStatus}&orderResource=${this.data.orderResource}&orderStatus=${this.data.orderStatus}`,
          })
        }else{
          _this.hasSubmit = false; 
          wx.showToast({
            title: res.data.message,
            icon:'none',
          })
        }
       }).catch(()=>{
        _this.hasSubmit = false; 
        wx.hideLoading();
       })
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.receiverName&&options.receiverPhone){
      this.setData({
        receiverName:options.receiverName,//退款联系人
        receiverPhone:options.receiverPhone,//联系电话
        orderCode:options.orderCode,//
        orderResource: options.orderResource,
        orderStatus:options.orderStatus
      });
    }
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